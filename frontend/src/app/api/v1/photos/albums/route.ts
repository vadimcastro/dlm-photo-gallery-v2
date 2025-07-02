import { NextRequest, NextResponse } from 'next/server';

// Google OAuth2 configuration (using exact dlm1 setup)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Album IDs mapping (using exact dlm1 setup)
const ALBUM_IDS = {
  portraits: process.env.PORTRAITS_ALBUM_ID,
  landscape: process.env.LANDSCAPE_ALBUM_ID,
  architecture: process.env.ARCHITECTURE_ALBUM_ID,
  abstract: process.env.ABSTRACT_ALBUM_ID,
  wildlife: process.env.WILDLIFE_ALBUM_ID
};

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Exact same token refresh logic as dlm1
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if valid and not expiring soon (55 minute buffer)
  if (cachedToken && (tokenExpiry - now) > 55 * 60 * 1000) {
    console.log('Using cached access token');
    return cachedToken;
  }

  try {
    console.log('Refreshing access token...');
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
      const errorBody = await response.text();
      console.error('Token refresh error details:', errorBody);
      throw new Error(`Token refresh failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log('Token refresh successful, expires in:', data.expires_in, 'seconds');
    
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

// Exact same album fetching logic as dlm1
async function getAlbumItems(albumId: string, accessToken: string) {
  console.log(`Fetching items for album: ${albumId}`);
  
  const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      albumId,
      pageSize: 100
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Album ${albumId} fetch error ${response.status}:`, errorBody);
    throw new Error(`Google Photos API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const items = data.mediaItems || [];
  console.log(`Album ${albumId} returned ${items.length} items`);
  return items;
}

export async function GET() {
  try {
    console.log('=== Starting DLM Photo Gallery v2 API ===');
    console.log('Environment check:');
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
    console.log('GOOGLE_REFRESH_TOKEN:', GOOGLE_REFRESH_TOKEN ? 'SET' : 'NOT SET');
    
    const accessToken = await getAccessToken();
    console.log('Access token obtained successfully');
    
    const allPhotos = [];

    // Use exact same approach as dlm1: fetch from specific albums
    console.log('Fetching photos from configured albums...');
    
    for (const [category, albumId] of Object.entries(ALBUM_IDS)) {
      if (!albumId) {
        console.log(`⚠️  Skipping ${category} - no album ID configured`);
        continue;
      }
      
      try {
        const items = await getAlbumItems(albumId, accessToken);
        
        const categoryPhotos = items.map((item: any) => ({
          id: item.id,
          category,
          filename: item.filename,
          description: item.description || '',
          baseUrl: item.baseUrl,
          width: item.mediaMetadata?.width,
          height: item.mediaMetadata?.height,
          creationTime: item.mediaMetadata?.creationTime
        }));

        allPhotos.push(...categoryPhotos);
        console.log(`✅ ${category}: ${categoryPhotos.length} photos added`);
        
      } catch (error) {
        console.error(`❌ Error fetching ${category} album:`, error);
      }
    }

    console.log(`📸 Total photos collected: ${allPhotos.length}`);

    // If no photos were collected, return mock data for UI development
    if (allPhotos.length === 0) {
      console.log('🎭 No real photos found, returning mock data for UI development...');
      const mockPhotos = [
        {
          id: 'mock-1',
          category: 'portraits',
          filename: 'portrait1.jpg',
          description: 'Beautiful portrait',
          baseUrl: 'https://picsum.photos/400/600',
          width: 400,
          height: 600,
          creationTime: new Date().toISOString()
        },
        {
          id: 'mock-2', 
          category: 'landscape',
          filename: 'landscape1.jpg',
          description: 'Stunning landscape',
          baseUrl: 'https://picsum.photos/800/400',
          width: 800,
          height: 400,
          creationTime: new Date().toISOString()
        },
        {
          id: 'mock-3',
          category: 'architecture', 
          filename: 'building1.jpg',
          description: 'Modern architecture',
          baseUrl: 'https://picsum.photos/600/800',
          width: 600,
          height: 800,
          creationTime: new Date().toISOString()
        }
      ];
      allPhotos.push(...mockPhotos);
    }

    // Sort by creation time (newest first)
    allPhotos.sort((a, b) => 
      new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
    );

    console.log('🎉 API response ready');
    return NextResponse.json(allPhotos);

  } catch (error) {
    console.error('💥 Albums API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums', details: String(error) },
      { status: 500 }
    );
  }
}