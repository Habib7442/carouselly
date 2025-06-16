import { create } from 'zustand';
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

export const useCarouselStore = create<CarouselState>((set, get) => ({
  slides: [],
  currentSlide: 0,
  isPreviewMode: false,
  editingSlide: null,
  showFontPanel: false,
  showColorPanel: false,
  showBackgroundPanel: true,
  
  setSlides: (slides) => {
    const slidesWithColors = slides.map((slide, index) => ({
      ...slide,
      backgroundColor: slide.backgroundColor || colors[index % colors.length],
      id: slide.id || `slide-${Date.now()}-${index}` // Ensure each slide has an ID
    }));
    set({ slides: slidesWithColors });
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
})); 