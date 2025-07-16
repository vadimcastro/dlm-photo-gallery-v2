export interface MockPhoto {
  id: string;
  category: 'portraits' | 'landscape' | 'architecture' | 'abstract' | 'wildlife';
  filename: string;
  description: string;
  baseUrl: string;
  width: number;
  height: number;
  creationTime: string;
}

const stockSources = {
  portraits: [
    { w: 400, h: 600, seed: 'portrait1' },
    { w: 500, h: 750, seed: 'portrait2' },
    { w: 450, h: 600, seed: 'portrait3' },
    { w: 600, h: 800, seed: 'portrait4' },
    { w: 400, h: 500, seed: 'portrait5' },
    { w: 350, h: 450, seed: 'portrait6' },
  ],
  landscape: [
    { w: 800, h: 400, seed: 'landscape1' },
    { w: 1200, h: 600, seed: 'landscape2' },
    { w: 900, h: 500, seed: 'landscape3' },
    { w: 1000, h: 600, seed: 'landscape4' },
    { w: 800, h: 500, seed: 'landscape5' },
    { w: 1100, h: 700, seed: 'landscape6' },
  ],
  architecture: [
    { w: 600, h: 800, seed: 'architecture1' },
    { w: 500, h: 700, seed: 'architecture2' },
    { w: 400, h: 600, seed: 'architecture3' },
    { w: 700, h: 900, seed: 'architecture4' },
    { w: 600, h: 750, seed: 'architecture5' },
    { w: 550, h: 800, seed: 'architecture6' },
  ],
  abstract: [
    { w: 600, h: 600, seed: 'abstract1' },
    { w: 500, h: 500, seed: 'abstract2' },
    { w: 700, h: 700, seed: 'abstract3' },
    { w: 800, h: 600, seed: 'abstract4' },
    { w: 400, h: 600, seed: 'abstract5' },
    { w: 650, h: 650, seed: 'abstract6' },
  ],
  wildlife: [
    { w: 700, h: 500, seed: 'wildlife1' },
    { w: 600, h: 400, seed: 'wildlife2' },
    { w: 800, h: 600, seed: 'wildlife3' },
    { w: 500, h: 700, seed: 'wildlife4' },
    { w: 900, h: 600, seed: 'wildlife5' },
    { w: 750, h: 500, seed: 'wildlife6' },
  ],
};

export const generateMockPhotos = (count: number = 6): MockPhoto[] => {
  const photos: MockPhoto[] = [];
  const categories = Object.keys(stockSources) as (keyof typeof stockSources)[];
  
  categories.forEach(category => {
    const categoryData = stockSources[category];
    
    for (let i = 0; i < count; i++) {
      const sourceData = categoryData[i % categoryData.length];
      const daysBack = Math.floor(Math.random() * 730);
      const creationTime = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      
      photos.push({
        id: `mock-${category}-${i + 1}`,
        category,
        filename: `${category}_${sourceData.seed}.jpg`,
        description: `${category} photo`,
        baseUrl: `https://picsum.photos/seed/${sourceData.seed}/${sourceData.w}/${sourceData.h}`,
        width: sourceData.w,
        height: sourceData.h,
        creationTime,
      });
    }
  });
  
  return photos.sort((a, b) => 
    new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
  );
};

export const mockPhotoData: MockPhoto[] = generateMockPhotos(8);

export const mockApiResponses = {
  getAllPhotos: () => mockPhotoData,
  getPhotosByCategory: (category: string) => 
    mockPhotoData.filter(photo => photo.category === category),
  getPhotoById: (id: string) => 
    mockPhotoData.find(photo => photo.id === id),
};

export const withDelay = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};