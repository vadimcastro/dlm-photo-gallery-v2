import { IPhotoService, PhotoServiceResponse, Photo } from './IPhotoService';
import { MockPhotosService } from './MockPhotosService';
import { GooglePhotosService } from './GooglePhotosService';

export interface PhotoServiceFactoryConfig {
  // Service selection
  primaryService: 'google' | 'mock';
  enableFallback: boolean;
  
  // Google Photos configuration
  googlePhotos?: {
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
  };
  
  // General options
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class PhotoServiceFactory {
  private config: PhotoServiceFactoryConfig;
  private primaryService: IPhotoService | null = null;
  private fallbackService: IPhotoService | null = null;
  private lastServiceUsed: string = '';

  constructor(config: PhotoServiceFactoryConfig) {
    this.config = config;
    this.initializeServices();
  }

  // Main API methods that handle fallback logic
  async getAllPhotos(): Promise<PhotoServiceResponse<Photo[]>> {
    return this.executeWithFallback(
      async (service) => service.getAllPhotos(),
      'getAllPhotos'
    );
  }

  async getPhotosByCategory(category: string): Promise<PhotoServiceResponse<Photo[]>> {
    return this.executeWithFallback(
      async (service) => service.getPhotosByCategory(category),
      'getPhotosByCategory',
      { category }
    );
  }

  async getPhotoById(id: string): Promise<PhotoServiceResponse<Photo | null>> {
    return this.executeWithFallback(
      async (service) => service.getPhotoById(id),
      'getPhotoById',
      { id }
    );
  }

  async searchPhotos(query: string): Promise<PhotoServiceResponse<Photo[]>> {
    return this.executeWithFallback(
      async (service) => {
        if (service.searchPhotos) {
          return service.searchPhotos(query);
        } else {
          // Fallback: filter all photos
          const allPhotos = await service.getAllPhotos();
          const filtered = allPhotos.data.filter(photo =>
            photo.description.toLowerCase().includes(query.toLowerCase()) ||
            photo.category.toLowerCase().includes(query.toLowerCase()) ||
            photo.filename.toLowerCase().includes(query.toLowerCase())
          );
          return {
            ...allPhotos,
            data: filtered,
            config: {
              ...allPhotos.config,
              metadata: {
                ...allPhotos.config.metadata,
                searchQuery: query,
                searchMethod: 'client-side-filter'
              }
            }
          };
        }
      },
      'searchPhotos',
      { query }
    );
  }

  // Service management
  async getServiceStatus() {
    const status = {
      primary: {
        name: this.primaryService?.name || 'None',
        available: this.primaryService ? await this.primaryService.isAvailable() : false,
        config: this.primaryService ? await this.primaryService.getConfig() : null
      },
      fallback: {
        name: this.fallbackService?.name || 'None',
        available: this.fallbackService ? await this.fallbackService.isAvailable() : false,
        config: this.fallbackService ? await this.fallbackService.getConfig() : null
      },
      lastUsed: this.lastServiceUsed,
      factoryConfig: {
        primaryService: this.config.primaryService,
        enableFallback: this.config.enableFallback,
        logLevel: this.config.logLevel
      }
    };

    this.log('info', 'Service status retrieved', status);
    return status;
  }

  async switchPrimaryService(serviceName: 'google' | 'mock') {
    this.log('info', `Switching primary service to: ${serviceName}`);
    this.config.primaryService = serviceName;
    this.initializeServices();
  }

  // Private methods
  private initializeServices() {
    this.log('info', `Initializing services - Primary: ${this.config.primaryService}`);

    // Initialize primary service
    if (this.config.primaryService === 'google' && this.config.googlePhotos) {
      this.primaryService = new GooglePhotosService(this.config.googlePhotos);
      this.fallbackService = this.config.enableFallback ? new MockPhotosService() : null;
    } else {
      this.primaryService = new MockPhotosService();
      this.fallbackService = this.config.enableFallback && this.config.googlePhotos 
        ? new GooglePhotosService(this.config.googlePhotos) 
        : null;
    }

    this.log('info', 'Services initialized', {
      primary: this.primaryService?.name,
      fallback: this.fallbackService?.name
    });
  }

  private async executeWithFallback<T>(
    operation: (service: IPhotoService) => Promise<T>,
    operationName: string,
    params?: Record<string, any>
  ): Promise<T> {
    this.log('debug', `Executing ${operationName}`, params);

    // Try primary service
    if (this.primaryService) {
      try {
        this.log('debug', `Attempting ${operationName} with primary service: ${this.primaryService.name}`);
        const result = await operation(this.primaryService);
        this.lastServiceUsed = this.primaryService.name;
        this.log('info', `✅ ${operationName} successful with ${this.primaryService.name}`);
        return result;
      } catch (error) {
        this.log('warn', `❌ Primary service (${this.primaryService.name}) failed for ${operationName}:`, error);
        
        if (!this.config.enableFallback || !this.fallbackService) {
          this.log('error', 'No fallback available, throwing error');
          throw error;
        }
      }
    }

    // Try fallback service
    if (this.fallbackService) {
      try {
        this.log('info', `Attempting ${operationName} with fallback service: ${this.fallbackService.name}`);
        const result = await operation(this.fallbackService);
        this.lastServiceUsed = `${this.fallbackService.name} (fallback)`;
        this.log('info', `✅ ${operationName} successful with fallback ${this.fallbackService.name}`);
        return result;
      } catch (error) {
        this.log('error', `❌ Fallback service (${this.fallbackService.name}) also failed for ${operationName}:`, error);
        throw error;
      }
    }

    throw new Error(`No available services for ${operationName}`);
  }

  private log(level: string, message: string, data?: any) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel];
    const messageLevel = levels[level as keyof typeof levels];

    if (messageLevel >= configLevel) {
      const prefix = `🏭 PhotoServiceFactory`;
      if (data) {
        console.log(`${prefix}: ${message}`, data);
      } else {
        console.log(`${prefix}: ${message}`);
      }
    }
  }
}

// Factory function to create configured instance
export function createPhotoServiceFactory(): PhotoServiceFactory {
  const config: PhotoServiceFactoryConfig = {
    primaryService: (process.env.USE_MOCK_DATA !== 'false') ? 'mock' : 'google',
    enableFallback: true,
    logLevel: (process.env.NODE_ENV === 'development') ? 'debug' : 'info',
    
    googlePhotos: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
      albumIds: {
        portraits: process.env.PORTRAITS_ALBUM_ID,
        landscape: process.env.LANDSCAPE_ALBUM_ID,
        architecture: process.env.ARCHITECTURE_ALBUM_ID,
        abstract: process.env.ABSTRACT_ALBUM_ID,
        wildlife: process.env.WILDLIFE_ALBUM_ID,
      }
    }
  };

  return new PhotoServiceFactory(config);
}