import { IPhotoService, PhotoServiceResponse, Photo } from './IPhotoService';

export class LocalPhotosService implements IPhotoService {
  public readonly name = 'LocalPhotosService';
  private baseUrl: string;

  constructor() {
    // Use relative URL for Next.js API routes
    this.baseUrl = '/api/v1/photos/local';
  }

  async getAllPhotos(): Promise<PhotoServiceResponse<Photo[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?limit=200`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform backend response to match Photo interface
      const photos: Photo[] = data.photos.map((photo: any) => ({
        id: photo.id.toString(),
        filename: photo.filename,
        description: photo.title || photo.filename,
        category: photo.category || 'uncategorized',
        width: photo.width || 800,
        height: photo.height || 600,
        aspectRatio: photo.width && photo.height ? photo.width / photo.height : 1.33,
        url: `/api/v1/photos/image/${photo.id}?size=medium`,
        thumbnailUrl: `/api/v1/photos/image/${photo.id}?size=small`,
        largeUrl: `/api/v1/photos/image/${photo.id}?size=large`
      }));

      return {
        data: photos,
        config: {
          service: this.name,
          totalCount: data.total || photos.length,
          metadata: {
            source: 'database',
            timestamp: new Date().toISOString(),
            limit: 200,
            photosFound: photos.length
          }
        }
      };
    } catch (error) {
      console.error('LocalPhotosService: Error fetching all photos:', error);
      throw new Error(`Failed to fetch photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPhotosByCategory(category: string): Promise<PhotoServiceResponse<Photo[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?category=${encodeURIComponent(category)}&limit=200`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const photos: Photo[] = data.photos.map((photo: any) => ({
        id: photo.id,
        filename: photo.filename,
        description: photo.description,
        category: photo.category || 'uncategorized',
        width: photo.width || 800,
        height: photo.height || 600,
        aspectRatio: photo.width && photo.height ? photo.width / photo.height : 1.33,
        url: `/api/v1/photos/image/${photo.id}?size=medium`,
        thumbnailUrl: `/api/v1/photos/image/${photo.id}?size=small`,
        largeUrl: `/api/v1/photos/image/${photo.id}?size=large`
      }));

      return {
        data: photos,
        config: {
          service: this.name,
          totalCount: data.total || photos.length,
          metadata: {
            source: 'database',
            category: category,
            timestamp: new Date().toISOString(),
            limit: 200,
            photosFound: photos.length
          }
        }
      };
    } catch (error) {
      console.error(`LocalPhotosService: Error fetching photos for category '${category}':`, error);
      throw new Error(`Failed to fetch photos for category '${category}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPhotoById(id: string): Promise<PhotoServiceResponse<Photo | null>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: null,
            config: {
              service: this.name,
              totalCount: 0,
              metadata: {
                source: 'database',
                photoId: id,
                found: false,
                timestamp: new Date().toISOString()
              }
            }
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const photo = data.photo;
      
      const transformedPhoto: Photo = {
        id: photo.id,
        filename: photo.filename,
        description: photo.description,
        category: photo.category || 'uncategorized',
        width: photo.width || 800,
        height: photo.height || 600,
        aspectRatio: photo.width && photo.height ? photo.width / photo.height : 1.33,
        url: `/api/v1/photos/image/${photo.id}?size=medium`,
        thumbnailUrl: `/api/v1/photos/image/${photo.id}?size=small`,
        largeUrl: `/api/v1/photos/image/${photo.id}?size=large`
      };

      return {
        data: transformedPhoto,
        config: {
          service: this.name,
          totalCount: 1,
          metadata: {
            source: 'database',
            photoId: id,
            found: true,
            timestamp: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error(`LocalPhotosService: Error fetching photo by ID '${id}':`, error);
      throw new Error(`Failed to fetch photo by ID '${id}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchPhotos(query: string): Promise<PhotoServiceResponse<Photo[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=200`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const photos: Photo[] = data.photos.map((photo: any) => ({
        id: photo.id,
        filename: photo.filename,
        description: photo.description,
        category: photo.category || 'uncategorized',
        width: photo.width || 800,
        height: photo.height || 600,
        aspectRatio: photo.width && photo.height ? photo.width / photo.height : 1.33,
        url: `/api/v1/photos/image/${photo.id}?size=medium`,
        thumbnailUrl: `/api/v1/photos/image/${photo.id}?size=small`,
        largeUrl: `/api/v1/photos/image/${photo.id}?size=large`
      }));

      return {
        data: photos,
        config: {
          service: this.name,
          totalCount: data.total || photos.length,
          metadata: {
            source: 'database',
            searchQuery: query,
            searchMethod: 'database-fulltext',
            timestamp: new Date().toISOString(),
            limit: 200,
            photosFound: photos.length
          }
        }
      };
    } catch (error) {
      console.error(`LocalPhotosService: Error searching photos with query '${query}':`, error);
      throw new Error(`Failed to search photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('LocalPhotosService: Health check failed:', error);
      return false;
    }
  }

  async getConfig() {
    return {
      service: this.name,
      baseUrl: this.baseUrl,
      features: {
        categories: true,
        search: true,
        upload: false, // Future feature
        metadata: true,
        realtime: false
      },
      limits: {
        maxPhotosPerRequest: 200,
        supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: '10MB'
      },
      storage: {
        type: 'local-database',
        location: 'PostgreSQL + static files',
        path: '/photos/'
      }
    };
  }
}