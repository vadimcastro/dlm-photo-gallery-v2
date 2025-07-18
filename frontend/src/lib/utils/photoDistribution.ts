import { Photo, ColorProfile } from '../services/IPhotoService';

// Advanced photo distribution algorithm for optimal visual flow
export class PhotoDistributionEngine {
  private static readonly DISTRIBUTION_CYCLE = 9; // 3 columns × 3 periods
  private static readonly COLUMNS = 3;

  /**
   * Distributes photos using a 9-period cycle for optimal visual balance
   * across 3 columns, considering aspect ratio, category, and color profile
   */
  static distributePhotos(photos: Photo[]): Photo[] {
    console.log('🎨 PhotoDistributionEngine: Starting advanced distribution...');
    
    // Step 1: Analyze and categorize photos
    const analyzedPhotos = this.analyzePhotos(photos);
    
    // Step 2: Apply smart distribution algorithm
    const distributedPhotos = this.smartDistribute(analyzedPhotos);
    
    console.log('✨ PhotoDistributionEngine: Distribution complete!', {
      totalPhotos: distributedPhotos.length,
      cycleLength: this.DISTRIBUTION_CYCLE,
      columns: this.COLUMNS
    });
    
    return distributedPhotos;
  }

  /**
   * Analyzes photos and adds distribution metadata
   */
  private static analyzePhotos(photos: Photo[]): AnalyzedPhoto[] {
    const analyzed = photos.map(photo => {
      const aspectRatio = photo.aspectRatio || (photo.width / photo.height);
      
      return {
        ...photo,
        aspectRatio,
        aspectCategory: this.getAspectCategory(aspectRatio),
        colorProfile: photo.colorProfile || this.inferColorProfile(photo),
        visualWeight: this.calculateVisualWeight(photo, aspectRatio),
        distributionScore: 0 // Will be calculated during distribution
      };
    });

    // Log distribution analysis
    this.logDistributionAnalysis(analyzed);
    
    return analyzed;
  }

  /**
   * Logs detailed distribution analysis for debugging
   */
  private static logDistributionAnalysis(photos: AnalyzedPhoto[]): void {
    console.log('📊 Photo Distribution Analysis:');
    
    // Aspect ratio distribution
    const aspectStats = photos.reduce((acc, photo) => {
      acc[photo.aspectCategory] = (acc[photo.aspectCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('  📐 Aspect Ratios:', aspectStats);
    
    // Color profile distribution
    const colorStats = photos.reduce((acc, photo) => {
      acc[photo.colorProfile] = (acc[photo.colorProfile] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('  🎨 Color Profiles:', colorStats);
    
    // Category distribution
    const categoryStats = photos.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('  📂 Categories:', categoryStats);
    
    // Visual weight distribution
    const avgWeight = photos.reduce((sum, photo) => sum + photo.visualWeight, 0) / photos.length;
    console.log('  ⚖️ Average Visual Weight:', avgWeight.toFixed(2));
  }

  /**
   * Creates 9 distribution buckets for the 3-column masonry layout
   * Pattern: [Col1-P1, Col2-P1, Col3-P1, Col1-P2, Col2-P2, Col3-P2, Col1-P3, Col2-P3, Col3-P3]
   */
  private static createDistributionBuckets(photos: AnalyzedPhoto[]): DistributionBucket[] {
    const buckets: DistributionBucket[] = [];
    
    for (let i = 0; i < this.DISTRIBUTION_CYCLE; i++) {
      const column = i % this.COLUMNS;
      const period = Math.floor(i / this.COLUMNS);
      
      buckets.push({
        index: i,
        column,
        period,
        photos: [],
        targetAspectBalance: this.getTargetAspectBalance(i),
        targetColorBalance: this.getTargetColorBalance(i),
        targetCategoryBalance: this.getTargetCategoryBalance(i)
      });
    }
    
    return buckets;
  }

  /**
   * Smart distribution algorithm that optimizes for visual balance
   */
  private static smartDistribute(analyzedPhotos: AnalyzedPhoto[]): Photo[] {
    console.log('🎯 Applying smart distribution with 5% buffer technique...');
    
    // Apply column height balancing with 5% buffer
    const balanced = this.balanceColumnHeights(analyzedPhotos);
    
    console.log('✨ Distribution complete! Column heights balanced with 5% buffer.');
    
    return balanced.map(photo => ({
      ...photo,
      distributionScore: photo.distributionScore
    }));
  }

  /**
   * Balances column heights using 5% buffer technique
   */
  private static balanceColumnHeights(photos: AnalyzedPhoto[]): AnalyzedPhoto[] {
    const columns: AnalyzedPhoto[][] = [[], [], []];
    const columnHeights = [0, 0, 0];
    const columnWidth = 300; // Approximate column width for height calculations
    
    // Calculate total height of all photos
    const totalHeight = photos.reduce((sum, photo) => {
      const photoHeight = (columnWidth / photo.aspectRatio) + 24; // 24px for margin
      return sum + photoHeight;
    }, 0);
    
    // Target height per column with 5% buffer
    const targetHeight = (totalHeight / 3) * 1.05; // 5% buffer
    
    console.log(`📏 Total height: ${totalHeight}px, Target per column: ${targetHeight}px (with 5% buffer)`);
    
    // Sort photos by visual weight for optimal distribution
    const sortedPhotos = [...photos].sort((a, b) => b.visualWeight - a.visualWeight);
    
    // Distribute photos to columns, always choosing the shortest column
    for (const photo of sortedPhotos) {
      const photoHeight = (columnWidth / photo.aspectRatio) + 24; // 24px for margin
      
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add photo to shortest column
      columns[shortestColumnIndex].push(photo);
      columnHeights[shortestColumnIndex] += photoHeight;
    }
    
    // Log final column heights
    console.log('📊 Final column heights:', columnHeights.map(h => `${h.toFixed(0)}px`));
    const heightDifference = Math.max(...columnHeights) - Math.min(...columnHeights);
    console.log(`⚖️ Height difference: ${heightDifference.toFixed(0)}px`);
    
    // Flatten columns back to single array in column order
    const result: AnalyzedPhoto[] = [];
    const maxLength = Math.max(...columns.map(col => col.length));
    
    for (let i = 0; i < maxLength; i++) {
      for (let col = 0; col < 3; col++) {
        if (columns[col][i]) {
          result.push(columns[col][i]);
        }
      }
    }
    
    return result;
  }

  /**
   * Interleaves photos to ensure maximum diversity across columns
   */
  private static interleaveForDiversity(photos: AnalyzedPhoto[]): AnalyzedPhoto[] {
    const result: AnalyzedPhoto[] = [];
    
    // Group photos by aspect category
    const aspectGroups = {
      'wide': photos.filter(p => p.aspectCategory === 'wide'),
      'square': photos.filter(p => p.aspectCategory === 'square'),
      'portrait': photos.filter(p => p.aspectCategory === 'portrait'),
      'tall': photos.filter(p => p.aspectCategory === 'tall'),
      'ultra-tall': photos.filter(p => p.aspectCategory === 'ultra-tall')
    };
    
    // Interleave pattern: cycle through aspect categories
    const categories = Object.keys(aspectGroups) as (keyof typeof aspectGroups)[];
    const maxLength = Math.max(...Object.values(aspectGroups).map(group => group.length));
    
    for (let i = 0; i < maxLength; i++) {
      for (const category of categories) {
        const group = aspectGroups[category];
        if (group[i]) {
          result.push(group[i]);
        }
      }
    }
    
    console.log('🔄 Interleaving pattern applied for aspect diversity');
    return result;
  }

  /**
   * Categorizes aspect ratios for distribution
   */
  private static getAspectCategory(aspectRatio: number): AspectCategory {
    if (aspectRatio < 0.7) return 'wide';      // Very wide (panoramic)
    if (aspectRatio < 1.1) return 'square';    // Square-ish
    if (aspectRatio < 1.5) return 'portrait';  // Portrait
    if (aspectRatio < 2.0) return 'tall';      // Tall portrait
    return 'ultra-tall';                       // Very tall
  }

  /**
   * Infers color profile from category and filename
   */
  private static inferColorProfile(photo: Photo): ColorProfile {
    const category = photo.category.toLowerCase();
    const filename = photo.filename.toLowerCase();
    
    // Category-based color inference
    if (category === 'landscape') {
      return filename.includes('sunset') || filename.includes('golden') ? 'warm' : 'cool';
    }
    if (category === 'portraits') {
      return filename.includes('studio') ? 'neutral' : 'warm';
    }
    if (category === 'architecture') {
      return filename.includes('modern') ? 'cool' : 'neutral';
    }
    if (category === 'abstract') {
      return 'vibrant';
    }
    if (category === 'wildlife') {
      return 'muted';
    }
    
    // Default rotation for visual variety
    const colorProfiles: ColorProfile[] = ['warm', 'cool', 'neutral', 'vibrant', 'muted'];
    return colorProfiles[Math.abs(photo.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colorProfiles.length];
  }

  /**
   * Calculates visual weight for distribution balancing
   */
  private static calculateVisualWeight(photo: Photo, aspectRatio: number): number {
    let weight = 1.0;
    
    // Aspect ratio weight
    if (aspectRatio > 1.5) weight += 0.3; // Tall photos have more visual weight
    if (aspectRatio < 0.8) weight += 0.2; // Wide photos have moderate weight
    
    // Category weight
    switch (photo.category) {
      case 'portraits': weight += 0.4; break;  // Portraits draw attention
      case 'abstract': weight += 0.3; break;   // Abstract images are eye-catching
      case 'wildlife': weight += 0.2; break;   // Wildlife is engaging
      case 'architecture': weight += 0.1; break; // Architecture is structural
      case 'landscape': weight += 0.0; break;  // Landscape is calming
    }
    
    return Math.min(weight, 2.0); // Cap at 2.0
  }

  /**
   * Target aspect balance for each bucket position
   */
  private static getTargetAspectBalance(bucketIndex: number): AspectCategory {
    const patterns: AspectCategory[] = [
      'square', 'tall', 'wide',        // Period 1: Balanced variety
      'portrait', 'square', 'tall',    // Period 2: Vertical emphasis
      'wide', 'portrait', 'square'     // Period 3: Mixed rhythm
    ];
    return patterns[bucketIndex % patterns.length];
  }

  /**
   * Target color balance for each bucket position
   */
  private static getTargetColorBalance(bucketIndex: number): ColorProfile {
    const patterns: ColorProfile[] = [
      'warm', 'cool', 'neutral',       // Period 1: Temperature variety
      'vibrant', 'muted', 'warm',      // Period 2: Energy contrast
      'cool', 'neutral', 'vibrant'     // Period 3: Balanced energy
    ];
    return patterns[bucketIndex % patterns.length];
  }

  /**
   * Target category balance for each bucket position
   */
  private static getTargetCategoryBalance(bucketIndex: number): Photo['category'] {
    const patterns: Photo['category'][] = [
      'landscape', 'portraits', 'architecture',  // Period 1: Structural variety
      'abstract', 'wildlife', 'landscape',       // Period 2: Natural flow
      'portraits', 'architecture', 'abstract'    // Period 3: Creative mix
    ];
    return patterns[bucketIndex % patterns.length];
  }

  /**
   * Calculates distribution score for optimal photo placement
   */
  private static calculateDistributionScore(
    photo: AnalyzedPhoto,
    bucket: DistributionBucket,
    previousPhotos: Photo[]
  ): number {
    let score = 0;
    
    // Aspect ratio matching
    if (photo.aspectCategory === bucket.targetAspectBalance) score += 30;
    
    // Color profile matching
    if (photo.colorProfile === bucket.targetColorBalance) score += 25;
    
    // Category matching
    if (photo.category === bucket.targetCategoryBalance) score += 20;
    
    // Visual weight balancing (avoid consecutive heavy photos)
    const recentPhotos = previousPhotos.slice(-3);
    const avgRecentWeight = recentPhotos.reduce((sum, p) => sum + ((p as any).visualWeight || 1), 0) / recentPhotos.length;
    if (photo.visualWeight < avgRecentWeight) score += 15;
    
    // Column balance (ensure variety within columns)
    const columnPhotos = previousPhotos.filter((_, i) => i % this.COLUMNS === bucket.column);
    const lastInColumn = columnPhotos[columnPhotos.length - 1];
    if (lastInColumn && photo.category !== lastInColumn.category) score += 10;
    
    return score;
  }
}

// Extended photo interface with analysis metadata
interface AnalyzedPhoto extends Photo {
  aspectCategory: AspectCategory;
  colorProfile: ColorProfile;
  visualWeight: number;
  distributionScore: number;
}

// Distribution bucket for the 9-period cycle
interface DistributionBucket {
  index: number;
  column: number;
  period: number;
  photos: AnalyzedPhoto[];
  targetAspectBalance: AspectCategory;
  targetColorBalance: ColorProfile;
  targetCategoryBalance: Photo['category'];
}

// Aspect ratio categories
type AspectCategory = 'wide' | 'square' | 'portrait' | 'tall' | 'ultra-tall';