import { IPhotoService, Photo, PhotoServiceResponse, PhotoServiceConfig } from './IPhotoService';

interface GooglePhotosConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  albumIds: {
    portraits?: string;
    landscape?: string;
    architecture?: string;
    abstract?: string;
    wildlife?: string;
  };
}

export class GooglePhotosService extends IPhotoService {
  name = 'GooglePhotosService';
  version = '1.0.0';
  
  private config: GooglePhotosConfig;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: GooglePhotosConfig) {
    super();
    this.config = config;
  }

  async getAllPhotos(): Promise<PhotoServiceResponse<Photo[]>> {
    console.log(`📸 ${this.name}: Fetching all photos from Google Photos`);
    
    try {
      const accessToken = await this.getAccessToken();
      const allPhotos: Photo[] = [];
      const errors: string[] = [];

      for (const [category, albumId] of Object.entries(this.config.albumIds)) {
        if (!albumId) {
          console.log(`⚠️  ${this.name}: Skipping ${category} - no album ID configured`);
          continue;
        }
        
        try {
          const items = await this.getAlbumItems(albumId, accessToken);
          const categoryPhotos = items.map((item: any) => ({
            id: item.id,
            category: category as Photo['category'],
            filename: item.filename,
            description: item.description || `${category} photo`,
            baseUrl: item.baseUrl,
            width: item.mediaMetadata?.width || 800,
            height: item.mediaMetadata?.height || 600,
            creationTime: item.mediaMetadata?.creationTime || new Date().toISOString()
          }));
          
          allPhotos.push(...categoryPhotos);
          console.log(`✅ ${this.name}: ${category} (${categoryPhotos.length} photos)`);
        } catch (error) {
          const errorMsg = `Failed to fetch ${category}: ${error}`;
          console.error(`❌ ${this.name}: ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      // Sort by creation time (newest first)
      const sortedPhotos = allPhotos.sort((a, b) => 
        new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
      );

      return this.createResponse(sortedPhotos, {
        totalCount: sortedPhotos.length,
        categories: this.getUniqueCategories(sortedPhotos),
        errors: errors.length > 0 ? errors : undefined,
        source: 'Google Photos API'
      });
      
    } catch (error) {
      console.error(`❌ ${this.name}: Failed to fetch photos:`, error);
      throw this.createError('GOOGLE_PHOTOS_ERROR', `Failed to fetch photos: ${error}`, error);
    }
  }

  async getPhotosByCategory(category: string): Promise<PhotoServiceResponse<Photo[]>> {
    console.log(`📸 ${this.name}: Fetching photos for category: ${category}`);
    
    const albumId = this.config.albumIds[category as keyof typeof this.config.albumIds];
    if (!albumId) {
      throw this.createError('ALBUM_NOT_CONFIGURED', `No album ID configured for category: ${category}`);
    }

    try {
      const accessToken = await this.getAccessToken();
      const items = await this.getAlbumItems(albumId, accessToken);
      
      const categoryPhotos = items.map((item: any) => ({
        id: item.id,
        category: category as Photo['category'],
        filename: item.filename,
        description: item.description || `${category} photo`,
        baseUrl: item.baseUrl,
        width: item.mediaMetadata?.width || 800,
        height: item.mediaMetadata?.height || 600,
        creationTime: item.mediaMetadata?.creationTime || new Date().toISOString()
      }));

      return this.createResponse(categoryPhotos, {
        category,
        albumId,
        count: categoryPhotos.length
      });
      
    } catch (error) {
      console.error(`❌ ${this.name}: Failed to fetch category ${category}:`, error);
      throw this.createError('CATEGORY_FETCH_ERROR', `Failed to fetch category ${category}: ${error}`, error);
    }
  }

  async getPhotoById(id: string): Promise<PhotoServiceResponse<Photo | null>> {
    console.log(`📸 ${this.name}: Fetching photo by ID: ${id}`);
    
    // For Google Photos, we'd need to search across all albums
    // This is a simplified implementation
    try {
      const allPhotosResponse = await this.getAllPhotos();
      const photo = allPhotosResponse.data.find(p => p.id === id) || null;
      
      return this.createResponse(photo, {
        found: photo !== null,
        searchedId: id
      });
      
    } catch (error) {
      console.error(`❌ ${this.name}: Failed to fetch photo by ID:`, error);
      throw this.createError('PHOTO_BY_ID_ERROR', `Failed to fetch photo by ID: ${error}`, error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if all required configuration is present
      if (!this.config.clientId || !this.config.clientSecret || !this.config.refreshToken) {
        return false;
      }

      // Try to get an access token
      await this.getAccessToken();
      
      // Test basic API access
      const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
        headers: {
          'Authorization': `Bearer ${this.cachedToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error(`❌ ${this.name}: Service not available:`, error);
      return false;
    }
  }

  async getConfig(): Promise<PhotoServiceConfig> {
    const isAvailable = await this.isAvailable();
    
    return {
      name: this.name,
      version: this.version,
      isAvailable,
      metadata: {
        configuredAlbums: Object.keys(this.config.albumIds).filter(
          key => this.config.albumIds[key as keyof typeof this.config.albumIds]
        ),
        hasCredentials: !!(this.config.clientId && this.config.clientSecret && this.config.refreshToken),
        tokenCached: !!this.cachedToken,
        features: ['getAllPhotos', 'getPhotosByCategory', 'getPhotoById'],
        limitations: 'Requires Google OAuth setup and album IDs'
      }
    };
  }

  // Private Google Photos API methods
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // Return cached token if valid and not expiring soon (55 minute buffer)
    if (this.cachedToken && (this.tokenExpiry - now) > 55 * 60 * 1000) {
      console.log(`${this.name}: Using cached access token`);
      return this.cachedToken;
    }

    try {
      console.log(`${this.name}: Refreshing Google Photos access token...`);
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Token refresh failed: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      this.cachedToken = data.access_token;
      this.tokenExpiry = now + (data.expires_in * 1000);
      
      console.log(`${this.name}: Token refresh successful, expires in: ${data.expires_in} seconds`);
      return this.cachedToken;
    } catch (error) {
      console.error(`${this.name}: Token refresh failed:`, error);
      throw error;
    }
  }

  private async getAlbumItems(albumId: string, accessToken: string): Promise<any[]> {
    console.log(`${this.name}: Fetching items for album: ${albumId}`);
    
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ albumId, pageSize: 100 })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Google Photos API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const items = data.mediaItems || [];
    console.log(`${this.name}: Album ${albumId} returned ${items.length} items`);
    return items;
  }

  private getUniqueCategories(photos: Photo[]): string[] {
    return [...new Set(photos.map(photo => photo.category))];
  }
}