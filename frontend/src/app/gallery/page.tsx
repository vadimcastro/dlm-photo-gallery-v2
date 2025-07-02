'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail } from 'lucide-react';

// Enhanced Image Cache utility with better error handling and retry logic
const imageCache = {
  images: new Map(),
  promises: new Map(),
  errors: new Set(), // Track failed images to avoid endless retries
  
  // Reset error status for an image URL to allow retrying
  clearError(src: string) {
    this.errors.delete(src);
  },
  
  // Load and cache an image with retry logic
  loadImage(src: string, retries = 2, retryDelay = 1000): Promise<HTMLImageElement> {
    // Return from cache if available
    if (this.images.has(src)) {
      return Promise.resolve(this.images.get(src));
    }
    
    // Return in-flight promise if we're already loading this image
    if (this.promises.has(src)) {
      return this.promises.get(src);
    }
    
    // Skip if we've already determined this image fails to load
    if (this.errors.has(src)) {
      return Promise.reject(new Error('Image previously failed to load'));
    }
    
    // Create new promise for this image with retry logic
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const attemptLoad = (attemptsLeft: number) => {
        const img = new Image();
        
        const timeoutId = setTimeout(() => {
          img.src = ''; // Cancel the current request
          
          if (attemptsLeft > 0) {
            console.log(`Retrying image load for ${src}, ${attemptsLeft} attempts left`);
            setTimeout(() => attemptLoad(attemptsLeft - 1), retryDelay);
          } else {
            this.errors.add(src);
            this.promises.delete(src);
            reject(new Error('Image load timed out after multiple attempts'));
          }
        }, 15000); // 15 second timeout per attempt
        
        img.onload = () => {
          clearTimeout(timeoutId);
          this.images.set(src, img);
          this.promises.delete(src);
          resolve(img);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          if (attemptsLeft > 0) {
            console.log(`Image load failed for ${src}, retrying in ${retryDelay}ms`);
            setTimeout(() => attemptLoad(attemptsLeft - 1), retryDelay);
          } else {
            this.errors.add(src);
            this.promises.delete(src);
            reject(new Error('Image failed to load after multiple attempts'));
          }
        };
        
        img.src = src;
      };
      
      attemptLoad(retries);
    });
    
    this.promises.set(src, promise);
    return promise;
  },
  
  // Preload images in the background
  preloadImages(sources: string[], batchSize = 3) {
    const loadBatch = (batch: string[]) => {
      return Promise.allSettled(
        batch.map(src => this.loadImage(src))
      );
    };
    
    // Process images in batches to avoid overwhelming the browser
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      setTimeout(() => loadBatch(batch), i * 100); // Stagger batches
    }
  }
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'portraits', name: 'Portraits' },
    { id: 'landscape', name: 'Landscape' },
    { id: 'architecture', name: 'Architecture' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'wildlife', name: 'Wildlife' }
  ];

  // Load photos from API
  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/photos/albums');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPhotos(data);
      
      // Preload images after setting photos
      if (data.length > 0) {
        const imageSources = data.map((photo: any) => 
          `/api/v1/photos/image/${photo.id}?size=medium`
        );
        imageCache.preloadImages(imageSources);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Filter photos by category
  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">DLM Photo Gallery</h1>
            
            {/* Category Filter */}
            <div className="flex space-x-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading photos</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadPhotos}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredPhotos.length} photos
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>

            {/* Photo Grid */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={`/api/v1/photos/image/${photo.id}?size=medium`}
                    alt={photo.description || `Photo ${index + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    onLoad={() => setLoadedImages(prev => new Set([...prev, photo.id]))}
                  />
                  {photo.description && (
                    <div className="p-3">
                      <p className="text-sm text-gray-600">{photo.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={`/api/v1/photos/image/${selectedPhoto.id}?size=full`}
              alt={selectedPhoto.description || 'Photo'}
              className="max-w-full max-h-full object-contain"
            />
            {selectedPhoto.description && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
                <p>{selectedPhoto.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2024 DLM Photo Gallery. Built with modern web technology.
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <a
                href="mailto:dan@example.com"
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Dan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}