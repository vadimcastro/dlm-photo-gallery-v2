import { NextRequest, NextResponse } from 'next/server';
import { createPhotoServiceFactory } from '@/lib/services/PhotoServiceFactory';

// Initialize the photo service factory
const photoService = createPhotoServiceFactory();

// Size configurations for different image sizes
const SIZE_CONFIGS = {
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  original: null // No resizing
};

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = params;
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || 'medium';
    
    console.log(`🖼️  Image Proxy: Fetching ${photoId} (size: ${size})`);

    // Get photo details from service
    const photoResponse = await photoService.getPhotoById(photoId);
    const photo = photoResponse.data;

    if (!photo) {
      console.error(`❌ Photo not found: ${photoId}`);
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Get size configuration
    const sizeConfig = SIZE_CONFIGS[size as keyof typeof SIZE_CONFIGS];
    
    // Build the image URL with size parameters
    let imageUrl = photo.baseUrl;
    
    if (sizeConfig && photo.baseUrl.includes('loremflickr.com')) {
      // For Lorem Flickr, maintain aspect ratio when resizing
      const aspectRatio = photo.height / photo.width;
      let newWidth = sizeConfig.width;
      let newHeight = Math.round(sizeConfig.width * aspectRatio);
      
      // If height exceeds max, adjust width to maintain aspect ratio
      if (newHeight > sizeConfig.height) {
        newHeight = sizeConfig.height;
        newWidth = Math.round(sizeConfig.height / aspectRatio);
      }
      
      // Replace dimensions in Lorem Flickr URL
      imageUrl = photo.baseUrl.replace(/\/(\d+)\/(\d+)\//, `/${newWidth}/${newHeight}/`);
    } else if (sizeConfig && photo.baseUrl.includes('lh3.googleusercontent.com')) {
      // For Google Photos, add size parameters
      imageUrl = `${photo.baseUrl}=w${sizeConfig.width}-h${sizeConfig.height}`;
    }

    console.log(`🖼️  Image Proxy: Proxying ${imageUrl}`);

    // Fetch the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'DLM-Photo-Gallery/2.0',
      },
    });

    if (!imageResponse.ok) {
      console.error(`❌ Failed to fetch image: ${imageResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: imageResponse.status }
      );
    }

    // Get image data and content type
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log(`✅ Image Proxy: Successfully served ${photoId} (${imageBuffer.byteLength} bytes)`);

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'X-Photo-Id': photoId,
        'X-Photo-Size': size,
        'X-Image-Source': photo.baseUrl.includes('picsum.photos') ? 'picsum' : 'other',
      },
    });

  } catch (error) {
    console.error('❌ Image Proxy error:', error);
    return NextResponse.json(
      { error: 'Image proxy failed', details: String(error) },
      { status: 500 }
    );
  }
}