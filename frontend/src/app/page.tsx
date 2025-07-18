'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import { createPhotoServiceFactory } from '@/lib/services/PhotoServiceFactory';
import { Photo } from '@/lib/services/IPhotoService';

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

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Initialize PhotoServiceFactory
  const [photoService] = useState(() => createPhotoServiceFactory());

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'architecture', name: 'Architecture' },
    { id: 'landscape', name: 'Landscape' },
    { id: 'wildlife', name: 'Wildlife' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'portraits', name: 'Portraits' }
  ];

  // Load photos from PhotoServiceFactory
  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading photos with PhotoServiceFactory...');
      const response = await photoService.getAllPhotos();
      console.log('✅ Photos loaded:', response.data.length, 'photos');
      
      setPhotos(response.data);
      
      // Preload images after setting photos
      if (response.data.length > 0) {
        const imageSources = response.data.map((photo: Photo) => 
          photo.url || `/api/v1/photos/image/${photo.id}?size=medium`
        );
        imageCache.preloadImages(imageSources);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      console.error('❌ Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  }, [photoService]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Redirect to dashboard on successful login
      window.location.href = '/dashboard';
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // Filter photos by category
  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter((photo: Photo) => photo.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--champagne-light)' }}>
      {/* Header */}
      <header className="shadow-md" style={{ backgroundColor: 'var(--champagne)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 
            className="text-4xl font-libertinus-mono tracking-wider cursor-pointer transition-colors"
            style={{ color: 'var(--charcoal)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--brown-hover)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--charcoal)'}
            onClick={() => setSelectedCategory('all')}
          >
            D.L.M.
          </h1>
          
          {/* Category Filter */}
          <nav>
            <ul className="flex space-x-6 overflow-x-auto pb-1">
              {categories.slice(1).map(category => (
                <li 
                  key={category.id}
                  className={`font-libertinus-mono text-sm cursor-pointer py-1 px-1 border-b-2 transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? 'text-black' 
                      : 'border-transparent hover:border-current'
                  }`}
                  style={{ 
                    color: selectedCategory === category.id ? 'var(--charcoal)' : 'var(--charcoal)',
                    borderColor: selectedCategory === category.id ? 'var(--brown-hover)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      const target = e.target as HTMLElement;
                      target.style.color = 'var(--brown-hover)';
                      target.style.borderColor = 'var(--brown-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      const target = e.target as HTMLElement;
                      target.style.color = 'var(--charcoal)';
                      target.style.borderColor = 'transparent';
                    }
                  }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 pt-8 pb-2">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--sage-green)' }}></div>
              <p style={{ color: 'var(--sage-green)' }}>Loading gallery...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center" style={{ color: 'var(--sage-green-dark)' }}>
              <p>{error}</p>
              <button 
                className="mt-4 px-4 py-2 rounded transition-colors"
                style={{ 
                  backgroundColor: 'var(--sage-green)', 
                  color: 'var(--white)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--sage-green-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--sage-green)'}
                onClick={loadPhotos}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Photo Grid - CSS Columns Masonry Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {filteredPhotos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="break-inside-avoid mb-6 inline-block w-full"
                >
                  <div 
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    style={{ 
                      backgroundColor: 'var(--white)',
                      maxHeight: '80vh', // Limit height to 80% of viewport
                      maxWidth: '100%'
                    }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url || `/api/v1/photos/image/${photo.id}?size=medium`}
                      alt={photo.description || `Photo ${index + 1}`}
                      className="w-full h-auto object-cover"
                      style={{
                        aspectRatio: photo.aspectRatio ? `${photo.aspectRatio}` : `${photo.width || 800} / ${photo.height || 600}`,
                        maxHeight: '80vh',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                      onLoad={() => setLoadedImages(prev => new Set([...prev, photo.id]))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="relative max-w-full max-h-[85vh] mx-auto">
            <button 
              className="absolute -top-12 right-0 text-3xl focus:outline-none transition-colors"
              style={{ color: 'var(--champagne)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--sage-green-light)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--champagne)'}
              onClick={() => setSelectedPhoto(null)}
            >
              &times;
            </button>
            
            <img 
              src={selectedPhoto.largeUrl || `/api/v1/photos/image/${selectedPhoto.id}?size=large`}
              alt={selectedPhoto.description || 'Photo'}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
          
          <div 
            className="absolute inset-0 z-[-1]"
            onClick={() => setSelectedPhoto(null)}
          ></div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-3 font-libertinus-mono text-sm" style={{ backgroundColor: 'var(--champagne)', color: 'var(--charcoal)' }}>
        <div className="max-w-6xl mx-auto w-full px-6 flex justify-between items-center">
          <div>
            <p className="text-xs">&copy; 2024 DLM Photo Gallery. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-8">
            <button
              onClick={() => window.location.href = 'mailto:danieminnock25@gmail.com'}
              className="cursor-pointer py-1 px-1 border-b-2 transition-all duration-200 flex items-center gap-2"
              style={{ 
                color: 'var(--charcoal)',
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.color = 'var(--brown-hover)';
                target.style.borderColor = 'var(--brown-hover)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.color = 'var(--charcoal)';
                target.style.borderColor = 'transparent';
              }}
            >
              <Mail size={16} />
              Contact Dan
            </button>
            
            <button
              onClick={() => setShowLoginModal(true)}
              className="cursor-pointer p-2 border rounded transition-all duration-200 mr-1"
              style={{ 
                borderColor: '#000000',
                borderWidth: '1px',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.borderColor = '#ffffff';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.borderColor = '#000000';
              }}
            >
              <img src="/favicon.ico" alt="Admin Login" className="w-4 h-4" />
            </button>
          </div>
          
          <div 
            className="absolute inset-0 z-[-1]"
            onClick={() => setSelectedPhoto(null)}
          ></div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setLoginError(null);
        }}
        onLogin={handleLogin}
        isLoading={loginLoading}
        error={loginError}
      />
    </div>
  );
}