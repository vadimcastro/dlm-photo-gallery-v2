import { IPhotoService, Photo, PhotoServiceResponse, PhotoServiceConfig, ColorProfile } from './IPhotoService';

export class MockPhotosService extends IPhotoService {
  name = 'MockPhotosService';
  version = '1.0.0';
  private photos: Photo[] = [];

  constructor() {
    super();
    this.photos = this.generateMockPhotos();
  }

  async getAllPhotos(): Promise<PhotoServiceResponse<Photo[]>> {
    console.log(`📸 ${this.name}: Fetching all photos`);
    
    // Simulate API delay
    await this.delay(300);
    
    return this.createResponse(this.photos, {
      totalCount: this.photos.length,
      categories: this.getUniqueCategories(),
      generatedAt: new Date().toISOString()
    });
  }

  async getPhotosByCategory(category: string): Promise<PhotoServiceResponse<Photo[]>> {
    console.log(`📸 ${this.name}: Fetching photos for category: ${category}`);
    
    await this.delay(200);
    
    const filteredPhotos = this.photos.filter(photo => photo.category === category);
    
    return this.createResponse(filteredPhotos, {
      category,
      count: filteredPhotos.length,
      totalPhotos: this.photos.length
    });
  }

  async getPhotoById(id: string): Promise<PhotoServiceResponse<Photo | null>> {
    console.log(`📸 ${this.name}: Fetching photo by ID: ${id}`);
    
    await this.delay(100);
    
    const photo = this.photos.find(p => p.id === id) || null;
    
    return this.createResponse(photo, {
      found: photo !== null,
      searchedId: id
    });
  }

  async searchPhotos(query: string): Promise<PhotoServiceResponse<Photo[]>> {
    console.log(`📸 ${this.name}: Searching photos with query: ${query}`);
    
    await this.delay(250);
    
    const searchResults = this.photos.filter(photo =>
      photo.description.toLowerCase().includes(query.toLowerCase()) ||
      photo.category.toLowerCase().includes(query.toLowerCase()) ||
      photo.filename.toLowerCase().includes(query.toLowerCase())
    );
    
    return this.createResponse(searchResults, {
      query,
      resultsCount: searchResults.length,
      totalPhotos: this.photos.length
    });
  }

  async isAvailable(): Promise<boolean> {
    return true; // Mock service is always available
  }

  async getConfig(): Promise<PhotoServiceConfig> {
    return {
      name: this.name,
      version: this.version,
      isAvailable: true,
      metadata: {
        totalPhotos: this.photos.length,
        categories: this.getUniqueCategories(),
        features: ['getAllPhotos', 'getPhotosByCategory', 'getPhotoById', 'searchPhotos'],
        performance: 'Simulated delays: 100-300ms'
      }
    };
  }

  // Private utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getUniqueCategories(): string[] {
    return [...new Set(this.photos.map(photo => photo.category))];
  }

  private generateMockPhotos(photosPerCategory: number = 8): Photo[] {
    const photos: Photo[] = [];
    const categories = ['portraits', 'landscape', 'architecture', 'abstract', 'wildlife'] as const;
    
    // Using real Unsplash photo IDs with reasonable dimensions for masonry flow
    const stockSources = {
      portraits: [
        { w: 300, h: 450, id: 'rDEOVtE7vOs' },   // Portrait by Ayo Ogunseinde
        { w: 400, h: 300, id: 'sibVwORYqs0' },   // Portrait by Sasha Freemind
        { w: 350, h: 350, id: 'mEZ3PoFGs_k' },   // Portrait by Ivana Cajina
        { w: 280, h: 420, id: 'IF9TK5Uy-KI' },   // Portrait by Carly Rae Hobbins
        { w: 450, h: 300, id: 'WNoLnJo7tS8' },   // Portrait by Krakenimages
        { w: 320, h: 480, id: 'YI_9SivVt_s' },   // Portrait by Leiada Krozjhen
        { w: 400, h: 250, id: '2EGNqazbAMk' },   // Portrait by Harsh Dani
        { w: 300, h: 500, id: 'pAtA8xe_iVM' },   // Portrait by Andrea Piacquadio
      ],
      landscape: [
        { w: 500, h: 300, id: '6ArTTluciuA' },   // Landscape by Casey Horner
        { w: 300, h: 450, id: 'Q1p7bh3SHj8' },   // Landscape by Nathan Anderson
        { w: 400, h: 400, id: 'OKLqGsCT8qs' },   // Landscape by Sergey Shmidt
        { w: 350, h: 525, id: 'lHGeqh3XhRY' },   // Landscape by Kalen Emsley
        { w: 450, h: 300, id: '4dpAqfTbvKA' },   // Landscape by Casey Horner
        { w: 320, h: 480, id: 'tAKXap853rY' },   // Landscape by Alejandro Escamilla
        { w: 500, h: 250, id: 'yC-Yzbqy7PY' },   // Landscape by Alejandro Escamilla
        { w: 300, h: 400, id: 'LNRyGwIJr5c' },   // Landscape by Alejandro Escamilla
      ],
      architecture: [
        { w: 280, h: 420, id: 'Dl6jeyfihLk' },   // Architecture by Alejandro Escamilla
        { w: 450, h: 300, id: 'y83Je1OC6Wc' },   // Architecture by Alejandro Escamilla
        { w: 350, h: 350, id: 'LF8gK8-HGSg' },   // Architecture by Alejandro Escamilla
        { w: 320, h: 480, id: 'tAKXap853rY' },   // Architecture by Alejandro Escamilla
        { w: 400, h: 250, id: 'BbQLHCpVUqA' },   // Architecture by Alejandro Escamilla
        { w: 300, h: 450, id: 'xII7efH1G6o' },   // Architecture by Alejandro Escamilla
        { w: 400, h: 400, id: 'ABDTiLqDhJA' },   // Architecture by Alejandro Escamilla
        { w: 450, h: 300, id: '1bgV8vGG_vw' },   // Architecture by Alejandro Escamilla
      ],
      abstract: [
        { w: 350, h: 350, id: '_h7aBovKia4' },   // Abstract by Gradienta
        { w: 500, h: 250, id: 'LeG68PrXA6Y' },   // Abstract by Pawel Czerwinski
        { w: 280, h: 420, id: 'tMI2_-r5Nfo' },   // Abstract by Pawel Czerwinski
        { w: 400, h: 400, id: 'qwtCeJ5cLYs' },   // Abstract by Gradienta
        { w: 300, h: 450, id: 'uhjiu8FjnsQ' },   // Abstract by Gradienta
        { w: 450, h: 300, id: 'XJXWbfSo2f0' },   // Abstract by Gradienta
        { w: 320, h: 320, id: 'jr4My9LVtzw' },   // Abstract by Gradienta
        { w: 300, h: 400, id: 'nP-E_TuSDVo' },   // Abstract by Gradienta
      ],
      wildlife: [
        { w: 450, h: 300, id: 'YozNeHM8MaA' },   // Wildlife by Cara Fuller
        { w: 300, h: 450, id: '5nNmUzXcmjI' },   // Wildlife by Greyson Joralemon
        { w: 400, h: 300, id: 'rTZW4f02zY8' },   // Wildlife by Zdeněk Macháček
        { w: 320, h: 480, id: 'ZO9b9QXrjqY' },   // Wildlife by Zdeněk Macháček
        { w: 450, h: 300, id: 'lEjqyllqaGk' },   // Wildlife by Jeremy Hynes
        { w: 350, h: 350, id: 'fX_8gVQWlHo' },   // Wildlife by Ray Hennessy
        { w: 300, h: 400, id: 'FE7kNUlEGfw' },   // Wildlife by Gary Bendig
        { w: 400, h: 250, id: 'cPccYbPrF-A' },   // Wildlife by Marko Blažević
      ],
    };

    categories.forEach(category => {
      const categoryData = stockSources[category];
      
      for (let i = 0; i < photosPerCategory; i++) {
        const sourceData = categoryData[i % categoryData.length];
        const daysBack = Math.floor(Math.random() * 730); // 2 years
        const creationTime = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${category}-${i}`;
        
        const baseUrl = `https://loremflickr.com/${sourceData.w}/${sourceData.h}/${category}?t=${Date.now()}${i}`;
        
        photos.push({
          id: `mock-${category}-${i + 1}`,
          category,
          filename: `${category}_${sourceData.id}.jpg`,
          description: `${category} photo`,
          baseUrl,
          url: baseUrl,
          thumbnailUrl: baseUrl,
          largeUrl: baseUrl,
          width: sourceData.w,
          height: sourceData.h,
          aspectRatio: sourceData.w / sourceData.h,
          colorProfile: 'neutral',
          creationTime,
        });
      }
    });
    
    // Sort for optimal masonry layout - interleave different aspect ratios
    return photos.sort((a, b) => {
      // Calculate aspect ratios
      const aspectA = a.height / a.width;
      const aspectB = b.height / b.width;
      
      // Group by aspect ratio categories
      const getAspectCategory = (aspect: number) => {
        if (aspect < 0.7) return 'wide';      // Very wide photos
        if (aspect < 1.2) return 'square';    // Square-ish photos
        if (aspect < 2.5) return 'portrait';  // Portrait photos
        return 'tall';                        // Very tall photos
      };
      
      const catA = getAspectCategory(aspectA);
      const catB = getAspectCategory(aspectB);
      
      // If same aspect category, sort by creation time
      if (catA === catB) {
        return new Date(b.creationTime || 0).getTime() - new Date(a.creationTime || 0).getTime();
      }
      
      // Interleave different aspect ratios for better masonry flow
      const categoryOrder = ['wide', 'tall', 'square', 'portrait'];
      return categoryOrder.indexOf(catA) - categoryOrder.indexOf(catB);
    });
  }
}