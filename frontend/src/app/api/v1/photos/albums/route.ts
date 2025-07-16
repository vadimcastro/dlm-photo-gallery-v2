import { NextResponse } from 'next/server';
import { createPhotoServiceFactory } from '@/lib/services/PhotoServiceFactory';

// Initialize the photo service factory
const photoService = createPhotoServiceFactory();

export async function GET() {
  try {
    console.log('📸 DLM Photo Gallery v2 API - Using Standardized Service Architecture');
    
    // Get all photos using the service factory
    const response = await photoService.getAllPhotos();
    
    console.log(`✅ Successfully retrieved ${response.data.length} photos from ${response.source}`);
    
    // Return the photos data (maintaining compatibility with frontend)
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('❌ Photo service error:', error);
    
    // Final emergency fallback - return empty array with error info
    return NextResponse.json(
      { 
        error: 'All photo services failed', 
        details: String(error),
        fallbackMessage: 'Please check service configuration'
      },
      { status: 500 }
    );
  }
}

// Additional endpoints for service management (useful for debugging)
export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();
    
    switch (action) {
      case 'getServiceStatus':
        const status = await photoService.getServiceStatus();
        return NextResponse.json(status);
        
      case 'switchService':
        if (params.serviceName) {
          await photoService.switchPrimaryService(params.serviceName);
          return NextResponse.json({ success: true, newPrimaryService: params.serviceName });
        }
        return NextResponse.json({ error: 'serviceName required' }, { status: 400 });
        
      case 'searchPhotos':
        if (params.query) {
          const searchResponse = await photoService.searchPhotos(params.query);
          return NextResponse.json(searchResponse.data);
        }
        return NextResponse.json({ error: 'query required' }, { status: 400 });
        
      case 'getPhotosByCategory':
        if (params.category) {
          const categoryResponse = await photoService.getPhotosByCategory(params.category);
          return NextResponse.json(categoryResponse.data);
        }
        return NextResponse.json({ error: 'category required' }, { status: 400 });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Photo service POST error:', error);
    return NextResponse.json(
      { error: 'Service action failed', details: String(error) },
      { status: 500 }
    );
  }
}