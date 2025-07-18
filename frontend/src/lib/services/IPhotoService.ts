// Color profile for advanced photo distribution
export type ColorProfile = 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted';

// Standardized Photo Service Interface
export interface Photo {
  id: string;
  category: 'portraits' | 'landscape' | 'architecture' | 'abstract' | 'wildlife';
  filename: string;
  description: string;
  baseUrl: string;
  url: string;
  thumbnailUrl?: string;
  largeUrl?: string;
  width: number;
  height: number;
  aspectRatio?: number;
  colorProfile?: ColorProfile;
  creationTime?: string;
}

export interface PhotoServiceConfig {
  name: string;
  version: string;
  isAvailable: boolean;
  metadata?: Record<string, any>;
}

export interface PhotoServiceResponse<T> {
  data: T;
  config: {
    service: string;
    totalCount?: number;
    metadata?: Record<string, any>;
  };
}

export interface PhotoServiceError {
  code: string;
  message: string;
  source: string;
  details?: any;
}

export abstract class IPhotoService {
  abstract name: string;
  abstract version: string;

  // Core photo retrieval methods
  abstract getAllPhotos(): Promise<PhotoServiceResponse<Photo[]>>;
  abstract getPhotosByCategory(category: string): Promise<PhotoServiceResponse<Photo[]>>;
  abstract getPhotoById(id: string): Promise<PhotoServiceResponse<Photo | null>>;

  // Service health and configuration
  abstract isAvailable(): Promise<boolean>;
  abstract getConfig(): Promise<PhotoServiceConfig>;

  // Optional search functionality
  searchPhotos?(query: string): Promise<PhotoServiceResponse<Photo[]>>;

  // Service lifecycle
  async initialize?(): Promise<void>;
  async cleanup?(): Promise<void>;

  // Utility methods
  protected createResponse<T>(data: T, metadata?: Record<string, any>): PhotoServiceResponse<T> {
    return {
      data,
      config: {
        service: this.name,
        totalCount: Array.isArray(data) ? data.length : (data ? 1 : 0),
        metadata: {
          timestamp: new Date().toISOString(),
          version: this.version,
          ...metadata
        }
      }
    };
  }

  protected createError(code: string, message: string, details?: any): PhotoServiceError {
    return {
      code,
      message,
      source: this.name,
      details
    };
  }
}