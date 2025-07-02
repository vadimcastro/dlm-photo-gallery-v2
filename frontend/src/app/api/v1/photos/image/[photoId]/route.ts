import { NextRequest, NextResponse } from 'next/server';

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if valid and not expiring soon (55 minute buffer)
  if (cachedToken && (tokenExpiry - now) > 55 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: GOOGLE_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = now + (data.expires_in * 1000);
      return cachedToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  throw new Error('Failed to obtain access token');
}

async function getMediaItem(photoId: string, accessToken: string) {
  const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${photoId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google Photos API error: ${response.status}`);
  }

  return response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = params;
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || 'medium';

    const accessToken = await getAccessToken();
    const mediaItem = await getMediaItem(photoId, accessToken);

    // Determine image dimensions based on size parameter
    let imageDimensions = '';
    switch (size) {
      case 'full':
        imageDimensions = '=w2048-h1536';
        break;
      case 'large':
        imageDimensions = '=w1200-h900';
        break;
      case 'medium':
      default:
        imageDimensions = '=w800-h600';
        break;
      case 'small':
        imageDimensions = '=w400-h300';
        break;
    }

    const imageUrl = mediaItem.baseUrl + imageDimensions;

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    // Get the image as a stream
    const imageBuffer = await imageResponse.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}