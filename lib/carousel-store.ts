import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CarouselSlide } from './gemini';

interface CarouselState {
  slides: CarouselSlide[];
  currentSlide: number;
  isPreviewMode: boolean;
  editingSlide: string | null;
  showFontPanel: boolean;
  showColorPanel: boolean;
  showBackgroundPanel: boolean;
  
  // Actions
  setSlides: (slides: CarouselSlide[]) => void;
  setCurrentSlide: (index: number) => void;
  setIsPreviewMode: (mode: boolean) => void;
  setEditingSlide: (slideId: string | null) => void;
  setShowFontPanel: (show: boolean) => void;
  setShowColorPanel: (show: boolean) => void;
  setShowBackgroundPanel: (show: boolean) => void;
  
  // Slide operations
  addSlide: () => void;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<CarouselSlide>) => void;
  updateSlideStyle: (slideId: string, property: string, value: string) => void;
  
  // Utility
  ensureSlideColors: () => void;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#FF8A80', '#82B1FF', '#B39DDB', '#A5D6A7'
];

// Helper function to estimate localStorage size
const getStorageSize = (obj: any): number => {
  return JSON.stringify(obj).length;
};

// Helper function to simplify backgrounds for storage
const simplifySlideForStorage = (slide: CarouselSlide): CarouselSlide => {
  if (slide.template === 'photoshoot' && slide.backgroundColor && slide.backgroundColor.includes('radial-gradient')) {
    // Store a simplified version for photoshoot templates
    return {
      ...slide,
      backgroundColor: '#1a1a1a', // Simple dark background as fallback
      _originalBackground: 'photoshoot-gradient' // Flag to restore complex gradient
    };
  }
  return slide;
};

// Helper function to restore complex backgrounds
const restoreSlideFromStorage = (slide: CarouselSlide): CarouselSlide => {
  if (slide._originalBackground === 'photoshoot-gradient') {
    // Restore the complex gradient based on slide ID
    const gradients: { [key: string]: string } = {
      'photoshoot-1': `
        radial-gradient(circle at 45% 35%, rgba(255, 165, 0, 0.15) 0%, transparent 35%),
        radial-gradient(ellipse at 55% 65%, rgba(218, 165, 32, 0.12) 0%, transparent 40%),
        radial-gradient(circle at center, rgba(139, 69, 19, 0.08) 20%, rgba(25, 25, 25, 0.95) 45%, rgba(0, 0, 0, 1) 100%),
        linear-gradient(45deg, rgba(0, 0, 0, 0.7) 0%, rgba(15, 10, 8, 0.9) 100%)
      `,
      'photoshoot-2': `
        radial-gradient(circle at 40% 30%, rgba(255, 140, 0, 0.18) 0%, transparent 32%),
        radial-gradient(ellipse at 60% 70%, rgba(205, 133, 63, 0.1) 0%, transparent 38%),
        radial-gradient(circle at center, rgba(160, 82, 45, 0.06) 25%, rgba(18, 18, 18, 0.96) 50%, rgba(0, 0, 0, 1) 100%),
        linear-gradient(135deg, rgba(8, 5, 3, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)
      `,
      'photoshoot-3': `
        radial-gradient(circle at 50% 40%, rgba(218, 165, 32, 0.16) 0%, transparent 30%),
        radial-gradient(ellipse at 35% 60%, rgba(255, 215, 0, 0.08) 0%, transparent 35%),
        radial-gradient(circle at center, rgba(184, 134, 11, 0.05) 22%, rgba(12, 12, 12, 0.97) 48%, rgba(0, 0, 0, 1) 100%),
        linear-gradient(60deg, rgba(5, 5, 5, 0.85) 0%, rgba(0, 0, 0, 0.98) 100%)
      `,
      'photoshoot-4': `
        radial-gradient(circle at 42% 38%, rgba(255, 192, 203, 0.12) 0%, transparent 28%),
        radial-gradient(ellipse at 58% 62%, rgba(222, 184, 135, 0.09) 0%, transparent 33%),
        radial-gradient(circle at center, rgba(139, 69, 19, 0.07) 18%, rgba(20, 15, 20, 0.96) 46%, rgba(0, 0, 0, 1) 100%),
        linear-gradient(120deg, rgba(10, 8, 10, 0.82) 0%, rgba(0, 0, 0, 0.97) 100%)
      `,
      'photoshoot-5': `
        radial-gradient(circle at 48% 32%, rgba(255, 228, 181, 0.14) 0%, transparent 29%),
        radial-gradient(ellipse at 52% 68%, rgba(205, 133, 63, 0.08) 0%, transparent 36%),
        radial-gradient(circle at center, rgba(160, 82, 45, 0.06) 20%, rgba(15, 15, 15, 0.97) 47%, rgba(0, 0, 0, 1) 100%),
        linear-gradient(75deg, rgba(6, 6, 6, 0.87) 0%, rgba(0, 0, 0, 0.96) 100%)
      `,
      'photoshoot-6': `
        radial-gradient(circle at 46% 36%, rgba(255, 160, 122, 0.13) 0%, transparent 31%),
        radial-gradient(ellipse at 54% 64%, rgba(218, 165, 32, 0.07) 0%, transparent 34%),
        radial-gradient(circle at center, rgba(139, 69, 19, 0.05) 24%, rgba(22, 18, 22, 0.96) 49%, rgba(0, 0, 0, 1) 100%),
        linear-gradient(105deg, rgba(8, 5, 8, 0.84) 0%, rgba(0, 0, 0, 0.98) 100%)
      `
    };
    
    return {
      ...slide,
      backgroundColor: gradients[slide.id] || slide.backgroundColor,
      _originalBackground: undefined
    };
  }
  return slide;
};

export const useCarouselStore = create<CarouselState>()(
  persist(
    (set, get) => ({
  slides: [],
  currentSlide: 0,
  isPreviewMode: false,
  editingSlide: null,
  showFontPanel: true,
  showColorPanel: false,
  showBackgroundPanel: false,
  
  setSlides: (slides) => {
    const slidesWithColors = slides.map((slide, index) => ({
      ...slide,
      backgroundColor: slide.backgroundColor || colors[index % colors.length],
      id: slide.id || `slide-${Date.now()}-${index}` // Ensure each slide has an ID
    }));
    
    // Restore complex backgrounds from storage if needed
    const restoredSlides = slidesWithColors.map(restoreSlideFromStorage);
    
    set({ slides: restoredSlides });
  },
  
  setCurrentSlide: (index) => set({ currentSlide: index }),
  setIsPreviewMode: (mode) => set({ isPreviewMode: mode }),
  setEditingSlide: (slideId) => set({ editingSlide: slideId }),
  setShowFontPanel: (show) => set({ 
    showFontPanel: show,
    showColorPanel: show ? false : get().showColorPanel,
    showBackgroundPanel: show ? false : get().showBackgroundPanel
  }),
  setShowColorPanel: (show) => set({ 
    showColorPanel: show,
    showFontPanel: show ? false : get().showFontPanel,
    showBackgroundPanel: show ? false : get().showBackgroundPanel
  }),
  setShowBackgroundPanel: (show) => set({ 
    showBackgroundPanel: show,
    showFontPanel: show ? false : get().showFontPanel,
    showColorPanel: show ? false : get().showColorPanel
  }),
  
  addSlide: () => {
    const { slides } = get();
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide',
      content: 'Add your content here...',
      emoji: '✨',
      backgroundColor: colors[slides.length % colors.length]
    };
    set({ slides: [...slides, newSlide] });
  },
  
  deleteSlide: (slideId) => {
    const { slides, currentSlide } = get();
    if (slides.length <= 1) return;
    
    const newSlides = slides.filter(slide => slide.id !== slideId);
    const newCurrentSlide = currentSlide >= newSlides.length ? newSlides.length - 1 : currentSlide;
    
    set({ 
      slides: newSlides,
      currentSlide: newCurrentSlide
    });
  },
  
  duplicateSlide: (slideId) => {
    const { slides } = get();
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    if (slideIndex === -1) return;
    
    const originalSlide = slides[slideIndex];
    const duplicatedSlide: CarouselSlide = {
      ...originalSlide,
      id: `slide-${Date.now()}`,
      title: `${originalSlide.title} (Copy)`
    };
    
    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide);
    set({ slides: newSlides });
  },
  
  updateSlide: (slideId, updates) => {
    const { slides } = get();
    const newSlides = slides.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    set({ slides: newSlides });
  },
  
  updateSlideStyle: (slideId, property, value) => {
    const { slides } = get();
    const newSlides = slides.map(slide => 
      slide.id === slideId 
        ? { ...slide, [property]: value }
        : slide
    );
    set({ slides: newSlides });
  },
  
  ensureSlideColors: () => {
    const { slides } = get();
    const slidesWithColors = slides.map((slide, index) => ({
      ...slide,
      backgroundColor: slide.backgroundColor || colors[index % colors.length]
    }));
    set({ slides: slidesWithColors });
  }
}),
{
  name: 'carousel-store',
  partialize: (state) => {
    const stateToStore = {
      slides: state.slides.map(simplifySlideForStorage),
      currentSlide: state.currentSlide
    };
    
    // Check if the data is too large (localStorage limit is usually ~5-10MB)
    const storageSize = getStorageSize(stateToStore);
    if (storageSize > 4 * 1024 * 1024) { // 4MB limit to be safe
      console.warn('Carousel data too large for localStorage, storing simplified version');
      // Store only the most recent 10 slides if still too large
      return {
        slides: stateToStore.slides.slice(-10),
        currentSlide: Math.min(state.currentSlide, 9)
      };
    }
    
    return stateToStore;
  },
  onRehydrateStorage: () => (state) => {
    if (state?.slides) {
      // Restore complex backgrounds when loading from storage
      state.slides = state.slides.map(restoreSlideFromStorage);
    }
  }
}
));