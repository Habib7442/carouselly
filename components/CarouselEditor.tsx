'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, FabricImage, Rect, Circle, FabricText, Shadow } from 'fabric';
import { 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  Edit3, 
  Copy, 
  Palette,
  Sparkles,
  Type,
  Smile,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Archive
} from 'lucide-react';
import { zip } from 'fflate';
import { saveAs } from 'file-saver';
import { CarouselSlide } from '@/lib/gemini';
import { useCarouselStore } from '@/lib/carousel-store';

interface CarouselEditorProps {
  slides: CarouselSlide[];
  onSlidesChange: (slides: CarouselSlide[]) => void;
  isGenerating?: boolean;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#FF8A80', '#82B1FF', '#B39DDB', '#A5D6A7'
];

export default function CarouselEditor({ slides, onSlidesChange, isGenerating }: CarouselEditorProps) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loading states for downloads
  const [isDownloadingPreview, setIsDownloadingPreview] = React.useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);
  
  const {
    slides: storeSlides,
    currentSlide,
    isPreviewMode,
    editingSlide,
    showFontPanel,
    showColorPanel,
    showBackgroundPanel,
    setSlides,
    setCurrentSlide,
    setIsPreviewMode,
    setEditingSlide,
    setShowFontPanel,
    setShowColorPanel,
    setShowBackgroundPanel,
    addSlide: addSlideToStore,
    deleteSlide: deleteSlideFromStore,
    duplicateSlide: duplicateSlideInStore,
    updateSlide: updateSlideInStore,
    ensureSlideColors
  } = useCarouselStore();

  React.useEffect(() => {
    if (slides.length > 0 && storeSlides.length === 0) {
      const slidesWithColors = slides.map((slide, index) => ({
        ...slide,
        backgroundColor: slide.backgroundColor || colors[index % colors.length],
        template: slide.template || 'regular' // Ensure template is preserved
      }));

      setSlides(slidesWithColors);
    }
  }, [slides, storeSlides.length, setSlides]);

  React.useEffect(() => {
    if (storeSlides.length > 0) {
      onSlidesChange(storeSlides);
    }
  }, [storeSlides, onSlidesChange]);

  React.useEffect(() => {
    const currentSlides = storeSlides.length > 0 ? storeSlides : slides;
    if (currentSlides.length > 0) {
      const needsColorUpdate = currentSlides.some(slide => !slide.backgroundColor);
      if (needsColorUpdate) {
        ensureSlideColors();
      }
    }
  }, [storeSlides, slides, ensureSlideColors]);

  const textColors = [
    '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', 
    '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#FF8A80', '#82B1FF'
  ];

  const fontFamilies = [
    { name: 'Inter', value: 'var(--font-inter), Inter, Arial, sans-serif', preview: 'Modern & Clean' },
    { name: 'Poppins', value: 'var(--font-poppins), Poppins, Arial, sans-serif', preview: 'Friendly & Round' },
    { name: 'Montserrat', value: 'var(--font-montserrat), Montserrat, Arial, sans-serif', preview: 'Professional' },
    { name: 'Playfair Display', value: 'var(--font-playfair), "Playfair Display", Georgia, serif', preview: 'Elegant & Serif' },
    { name: 'Roboto', value: 'var(--font-roboto), Roboto, Arial, sans-serif', preview: 'Google Default' },
    { name: 'Open Sans', value: 'var(--font-open-sans), "Open Sans", Arial, sans-serif', preview: 'Readable' },
    { name: 'Lato', value: 'var(--font-lato), Lato, Arial, sans-serif', preview: 'Humanist' },
    { name: 'Oswald', value: 'var(--font-oswald), Oswald, Arial, sans-serif', preview: 'Bold & Strong' }
  ];

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ];

  const imageFitOptions = [
    { name: 'Cover', value: 'cover' as const },
    { name: 'Contain', value: 'contain' as const },
    { name: 'Fill', value: 'fill' as const }
  ];

  const imagePositions = [
    { name: 'Center', value: 'center' },
    { name: 'Top', value: 'top' },
    { name: 'Bottom', value: 'bottom' },
    { name: 'Left', value: 'left' },
    { name: 'Right', value: 'right' },
    { name: 'Top Left', value: 'top left' },
    { name: 'Top Right', value: 'top right' },
    { name: 'Bottom Left', value: 'bottom left' },
    { name: 'Bottom Right', value: 'bottom right' }
  ];

  const fontSizes = [
    { name: 'Small', value: '0.875rem' },
    { name: 'Medium', value: '1.1rem' },
    { name: 'Large', value: '1.5rem' },
    { name: 'Extra Large', value: '2rem' }
  ];

  const textAlignments = [
    { name: 'Left', value: 'left' as const },
    { name: 'Center', value: 'center' as const },
    { name: 'Right', value: 'right' as const }
  ];

  const emojis = [
    '🎯', '🚀', '💪', '📈', '⚡', '💡', '🔥', '✨',
    '🎪', '🌟', '💎', '🎨', '📱', '💰', '🏆', '🎉',
    '👑', '🌈', '⭐', '🎭', '🎪', '🎨', '🎯', '🌟'
  ];

  const slidesWithColors = storeSlides.length > 0 ? storeSlides : slides;

  const addSlide = () => addSlideToStore();
  const deleteSlide = (slideId: string) => deleteSlideFromStore(slideId);
  const duplicateSlide = (slideId: string) => duplicateSlideInStore(slideId);
  const updateSlide = (slideId: string, updates: Partial<CarouselSlide>) => updateSlideInStore(slideId, updates);

  // Helper functions to get position values with defaults
  const getTitlePositionX = (slide: CarouselSlide) => {
    return slide.textPositionX ? parseInt(slide.textPositionX) : 50;
  };

  const getTitlePositionY = (slide: CarouselSlide) => {
    return slide.textPositionY ? parseInt(slide.textPositionY) : 50;
  };

  const getImagePositionX = (slide: CarouselSlide) => {
    return slide.backgroundImageX ? parseInt(slide.backgroundImageX) : 50;
  };

  const getImagePositionY = (slide: CarouselSlide) => {
    return slide.backgroundImageY ? parseInt(slide.backgroundImageY) : 50;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Preserve existing template or determine based on current slide
        const currentTemplate = slidesWithColors[currentSlide]?.template || 'regular';

        updateSlide(slidesWithColors[currentSlide].id, {
          backgroundImage: imageUrl,
          backgroundType: 'image',
          gradient: undefined,
          template: currentTemplate // Preserve the existing template
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCurrentSlide = async () => {
    setIsDownloadingPreview(true);
    try {
      const slide = slidesWithColors[currentSlide];
      
      // Create a temporary canvas element
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 1080;
      canvasElement.height = 1080;
      
      // Create Fabric.js canvas
      const canvas = new Canvas(canvasElement);
      canvas.setWidth(1080);
      canvas.setHeight(1080);
      canvas.backgroundColor = slide.backgroundColor || colors[currentSlide % colors.length];
      
      try {
        // Handle background image
        if (slide.backgroundImage && slide.backgroundType === 'image') {
          await new Promise<void>((resolve, reject) => {
            FabricImage.fromURL(slide.backgroundImage!, {
              crossOrigin: 'anonymous'
            }).then((img) => {
              if (!img) {
                reject(new Error('Failed to load image'));
                return;
              }
              
              // Configure image to fill canvas properly based on selected fit mode
              const scaleX = 1080 / (img.width || 1);
              const scaleY = 1080 / (img.height || 1);
              
              // Use the appropriate scaling based on the selected fit mode
              let scale;
              if (slide.backgroundImageFit === 'contain') {
                // Contain: Ensure the entire image is visible within the canvas
                scale = Math.min(scaleX, scaleY);
              } else if (slide.backgroundImageFit === 'fill') {
                // Fill: Stretch the image to fill the canvas completely
                img.set({
                  width: 1080,
                  height: 1080,
                  scaleX: 1,
                  scaleY: 1
                });
                scale = 1;
              } else {
                // Cover: Ensure the canvas is completely covered by the image
                scale = Math.max(scaleX, scaleY);
              }
              
              img.set({
                left: 540,
                top: 540,
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                opacity: slide.template === 'photoshoot' ? 0.95 : (slide.backgroundImageOpacity || 0.6),
                selectable: false
              });
              
              canvas.add(img);
              
              // Add photoshoot lighting if template is photoshoot
              if (slide.template === 'photoshoot') {
                // Less aggressive dark base layer
                const darkOverlay = new Rect({
                  left: 0,
                  top: 0,
                  width: 1080,
                  height: 1080,
                  fill: 'rgba(0, 0, 0, 0.15)',
                  selectable: false
                });
                canvas.add(darkOverlay);
                
                // Multiple key lights for better face illumination
                const keyLight1 = new Circle({
                  left: 540,
                  top: 200,
                  radius: 450,
                  fill: 'rgba(255, 255, 240, 0.8)',
                  opacity: 0.7,
                  selectable: false
                });
                canvas.add(keyLight1);
                
                const keyLight2 = new Circle({
                  left: 520,
                  top: 250,
                  radius: 350,
                  fill: 'rgba(255, 240, 200, 0.7)',
                  opacity: 0.8,
                  selectable: false
                });
                canvas.add(keyLight2);
                
                const keyLight3 = new Circle({
                  left: 560,
                  top: 280,
                  radius: 250,
                  fill: 'rgba(255, 220, 150, 0.6)',
                  opacity: 0.9,
                  selectable: false
                });
                canvas.add(keyLight3);
                
                // Enhanced face spotlight - brighter and larger
                const faceLight = new Circle({
                  left: 540,
                  top: 320,
                  radius: 300,
                  fill: 'rgba(255, 255, 255, 0.8)',
                  opacity: 0.6,
                  selectable: false
                });
                canvas.add(faceLight);
                
                // Secondary face light
                const faceLight2 = new Circle({
                  left: 540,
                  top: 350,
                  radius: 200,
                  fill: 'rgba(255, 250, 230, 0.9)',
                  opacity: 0.7,
                  selectable: false
                });
                canvas.add(faceLight2);
                
                // Warm skin tone enhancement - more prominent
                const warmTone = new Circle({
                  left: 540,
                  top: 380,
                  radius: 320,
                  fill: 'rgba(255, 200, 150, 0.5)',
                  opacity: 0.4,
                  selectable: false
                });
                canvas.add(warmTone);
                
                // Additional warm highlights
                const warmHighlight = new Circle({
                  left: 540,
                  top: 360,
                  radius: 180,
                  fill: 'rgba(255, 235, 160, 0.8)',
                  opacity: 0.5,
                  selectable: false
                });
                canvas.add(warmHighlight);
              } else {
                // For non-photoshoot templates, add user-selected overlay
                const overlayColor = slide.gradient || slide.backgroundColor || 'rgba(0, 0, 0, 0.3)';
                const overlay = new Rect({
                  left: 0,
                  top: 0,
                  width: 1080,
                  height: 1080,
                  fill: overlayColor,
                  opacity: 0.6,
                  selectable: false
                });
                canvas.add(overlay);
              }
              
              resolve();
            }).catch(reject);
          });
        }
        
        // Use user's position settings for download
        const titlePosX = slide.titlePositionX ? parseInt(slide.titlePositionX) : getTitlePositionX(slide);
        const titlePosY = slide.titlePositionY ? parseInt(slide.titlePositionY) : getTitlePositionY(slide);
        const contentPosX = slide.contentPositionX ? parseInt(slide.contentPositionX) : getTitlePositionX(slide);
        const contentPosY = slide.contentPositionY ? parseInt(slide.contentPositionY) : getTitlePositionY(slide);
        const maxTextWidth = 650; // Leave 215px padding on each side to better match preview spacing
        
        // Calculate responsive font sizes based on content length
        const titleLength = (slide.title || '').length;
        const contentLength = (slide.content || '').length;
        
        // More conservative dynamic font sizing for better fit
        const titleFontSize = titleLength > 60 ? 40 : titleLength > 40 ? 46 : titleLength > 25 ? 52 : 58;
        const contentFontSize = contentLength > 150 ? 18 : contentLength > 100 ? 22 : contentLength > 80 ? 24 : 26;
        const emojiSize = 65;
        
        // Convert percentage to pixel positions for 1080x1080 canvas
        const positionX = (titlePosX * 1080) / 100;
        const positionY = (titlePosY * 1080) / 100;
        
        // Add emoji with user positioning
        if (slide.emoji) {
          const emojiX = ((titlePosX - 10) * 1080) / 100; // Emoji offset
          const emojiY = ((titlePosY - 10) * 1080) / 100;
          
          const emoji = new FabricText(slide.emoji, {
            left: emojiX,
            top: emojiY,
            fontSize: emojiSize,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            selectable: false,
            fontFamily: 'Arial'
          });
          canvas.add(emoji);
        }
        
        // Add title with user positioning
        if (slide.title) {
          const cleanTitle = slide.title.replace(/\s*[🎯🚀💪📈⚡💡🔥✨🎪🌟]+\s*$/, '');
          
          // Truncate title if too long
          const truncatedTitle = cleanTitle.length > 80 ? cleanTitle.substring(0, 77) + '...' : cleanTitle;
          
          // Create title with text wrapping
          const titleText = new FabricText(truncatedTitle, {
            left: positionX,
            top: positionY,
            fontSize: titleFontSize,
            fontWeight: 'bold',
            fill: slide.titleColor || '#FFFFFF',
            fontFamily: 'Arial',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: maxTextWidth,
            splitByGrapheme: false,
            shadow: new Shadow({
              color: 'rgba(0,0,0,0.8)',
              blur: 6,
              offsetX: 0,
              offsetY: 3
            }),
            selectable: false
          });
          
          canvas.add(titleText);
        }
        
        // Add content with user positioning
        if (slide.content) {
          // Truncate content if too long to ensure it fits
          const truncatedContent = slide.content.length > 200 ? slide.content.substring(0, 197) + '...' : slide.content;
          
          // Convert percentage to pixel positions for 1080x1080 canvas
          const contentPositionX = (contentPosX * 1080) / 100;
          const contentPositionY = (contentPosY * 1080) / 100;
          
          const contentText = new FabricText(truncatedContent, {
            left: contentPositionX,
            top: contentPositionY,
            fontSize: contentFontSize,
            fill: slide.textColor || '#FFFFFF',
            fontFamily: 'Arial',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            width: maxTextWidth,
            splitByGrapheme: false,
            lineHeight: 1.3,
            shadow: new Shadow({
              color: 'rgba(0,0,0,0.7)',
              blur: 4,
              offsetX: 0,
              offsetY: 2
            }),
            selectable: false
          });
          
          canvas.add(contentText);
        }
        
        // Render and wait for completion
        canvas.renderAll();
        await new Promise(resolve => setTimeout(resolve, 800)); // Longer wait for text rendering
        
        // Get the data URL from the canvas element
        const dataURL = canvasElement.toDataURL('image/png', 1.0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `slide-${currentSlide + 1}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } finally {
        // Clean up
        canvas.dispose();
      }
      
    } catch (error) {
      console.error('Error downloading slide:', error);
      alert('Failed to download slide. Please try again.');
    } finally {
      setIsDownloadingPreview(false);
    }
  };

  const downloadAllAsZip = async () => {
    setIsDownloadingZip(true);
    try {
      const imagePromises: Promise<{ filename: string; data: Uint8Array }>[] = [];

      for (let i = 0; i < slidesWithColors.length; i++) {
        const imagePromise = (async (): Promise<{ filename: string; data: Uint8Array }> => {
          const slide = slidesWithColors[i];
          
          // Create a temporary canvas element
          const canvasElement = document.createElement('canvas');
          canvasElement.width = 1080;
          canvasElement.height = 1080;
          
          // Create Fabric.js canvas
          const canvas = new Canvas(canvasElement);
          canvas.setWidth(1080);
          canvas.setHeight(1080);
          canvas.backgroundColor = slide.backgroundColor || colors[i % colors.length];
          
          try {
            // Handle background image
            if (slide.backgroundImage && slide.backgroundType === 'image') {
              await new Promise<void>((resolve, reject) => {
                FabricImage.fromURL(slide.backgroundImage!, {
                  crossOrigin: 'anonymous'
                }).then((img) => {
                  if (!img) {
                    reject(new Error('Failed to load image'));
                    return;
                  }
                  
                  // Configure image to fill canvas based on selected fit mode
                  const scaleX = 1080 / (img.width || 1);
                  const scaleY = 1080 / (img.height || 1);
                  
                  // Use the appropriate scaling based on the selected fit mode
                  let scale;
                  if (slide.backgroundImageFit === 'contain') {
                    // Contain: Ensure the entire image is visible within the canvas
                    scale = Math.min(scaleX, scaleY);
                  } else if (slide.backgroundImageFit === 'fill') {
                    // Fill: Stretch the image to fill the canvas completely
                    img.set({
                      width: 1080,
                      height: 1080,
                      scaleX: 1,
                      scaleY: 1
                    });
                    scale = 1;
                  } else {
                    // Cover: Ensure the canvas is completely covered by the image
                    scale = Math.max(scaleX, scaleY);
                  }
                  
                  img.set({
                    left: 540,
                    top: 540,
                    scaleX: scale,
                    scaleY: scale,
                    originX: 'center',
                    originY: 'center',
                    opacity: slide.template === 'photoshoot' ? 0.95 : (slide.backgroundImageOpacity || 0.6),
                    selectable: false
                  });
                  
                  canvas.add(img);
                  
                  // Add photoshoot lighting if template is photoshoot
                  if (slide.template === 'photoshoot') {
                    const darkOverlay = new Rect({
                      left: 0,
                      top: 0,
                      width: 1080,
                      height: 1080,
                      fill: 'rgba(0, 0, 0, 0.15)',
                      selectable: false
                    });
                    canvas.add(darkOverlay);
                    
                    const keyLight1 = new Circle({
                      left: 540,
                      top: 200,
                      radius: 450,
                      fill: 'rgba(255, 255, 240, 0.8)',
                      opacity: 0.7,
                      selectable: false
                    });
                    canvas.add(keyLight1);
                    
                    const keyLight2 = new Circle({
                      left: 520,
                      top: 250,
                      radius: 350,
                      fill: 'rgba(255, 240, 200, 0.7)',
                      opacity: 0.8,
                      selectable: false
                    });
                    canvas.add(keyLight2);
                    
                    const keyLight3 = new Circle({
                      left: 560,
                      top: 280,
                      radius: 250,
                      fill: 'rgba(255, 220, 150, 0.6)',
                      opacity: 0.9,
                      selectable: false
                    });
                    canvas.add(keyLight3);
                    
                    const faceLight = new Circle({
                      left: 540,
                      top: 320,
                      radius: 300,
                      fill: 'rgba(255, 255, 255, 0.8)',
                      opacity: 0.6,
                      selectable: false
                    });
                    canvas.add(faceLight);
                    
                    const faceLight2 = new Circle({
                      left: 540,
                      top: 350,
                      radius: 200,
                      fill: 'rgba(255, 250, 230, 0.9)',
                      opacity: 0.7,
                      selectable: false
                    });
                    canvas.add(faceLight2);
                    
                    const warmTone = new Circle({
                      left: 540,
                      top: 380,
                      radius: 320,
                      fill: 'rgba(255, 200, 150, 0.5)',
                      opacity: 0.4,
                      selectable: false
                    });
                    canvas.add(warmTone);
                    
                    const warmHighlight = new Circle({
                      left: 540,
                      top: 360,
                      radius: 180,
                      fill: 'rgba(255, 235, 160, 0.8)',
                      opacity: 0.5,
                      selectable: false
                    });
                    canvas.add(warmHighlight);
                  } else {
                    // For non-photoshoot templates, add user-selected overlay
                    const overlayColor = slide.gradient || slide.backgroundColor || 'rgba(0, 0, 0, 0.3)';
                    const overlay = new Rect({
                      left: 0,
                      top: 0,
                      width: 1080,
                      height: 1080,
                      fill: overlayColor,
                      opacity: 0.6,
                      selectable: false
                    });
                    canvas.add(overlay);
                  }
                  
                  resolve();
                }).catch(reject);
              });
            }
            
            // Use user's position settings for download
            const titlePosX = getTitlePositionX(slide);
            const titlePosY = getTitlePositionY(slide);
            const maxTextWidth = 650; // Leave 215px padding on each side to better match preview spacing
            
            // Calculate responsive font sizes based on content length
            const titleLength = (slide.title || '').length;
            const contentLength = (slide.content || '').length;
            
            // Dynamic font sizing for better fit
            const titleFontSize = titleLength > 60 ? 40 : titleLength > 40 ? 46 : titleLength > 25 ? 52 : 58;
            const contentFontSize = contentLength > 150 ? 18 : contentLength > 100 ? 22 : contentLength > 80 ? 24 : 26;
            const emojiSize = 80;
            
            // Convert percentage to pixel positions for 1080x1080 canvas
            const positionX = (titlePosX * 1080) / 100;
            const positionY = (titlePosY * 1080) / 100;
            
            // Add emoji with user positioning
            if (slide.emoji) {
              const emojiX = ((titlePosX - 10) * 1080) / 100; // Emoji offset
              const emojiY = ((titlePosY - 10) * 1080) / 100;
              
              const emoji = new FabricText(slide.emoji, {
                left: emojiX,
                top: emojiY,
                fontSize: emojiSize,
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                selectable: false,
                fontFamily: 'Arial'
              });
              canvas.add(emoji);
            }
            
            // Add title with user positioning
            if (slide.title) {
              const cleanTitle = slide.title.replace(/\s*[🎯🚀💪📈⚡💡🔥✨🎪🌟]+\s*$/, '');
              
              // Truncate title if too long
              const truncatedTitle = cleanTitle.length > 80 ? cleanTitle.substring(0, 77) + '...' : cleanTitle;
              
              // Create title with text wrapping
              const titleText = new FabricText(truncatedTitle, {
                left: positionX,
                top: positionY,
                fontSize: titleFontSize,
                fontWeight: 'bold',
                fill: slide.titleColor || '#FFFFFF',
                fontFamily: 'Arial',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                width: maxTextWidth,
                splitByGrapheme: false,
                shadow: new Shadow({
                  color: 'rgba(0,0,0,0.8)',
                  blur: 6,
                  offsetX: 0,
                  offsetY: 3
                }),
                selectable: false
              });
              
              canvas.add(titleText);
            }
            
            // Add content with user positioning (below title)
            if (slide.content) {
              // Truncate content if too long to ensure it fits
              const truncatedContent = slide.content.length > 200 ? slide.content.substring(0, 197) + '...' : slide.content;
              
              const contentY = positionY + (titleFontSize * 1.5); // Content below title
              
              const contentText = new FabricText(truncatedContent, {
                left: positionX,
                top: contentY,
                fontSize: contentFontSize,
                fill: slide.textColor || '#FFFFFF',
                fontFamily: 'Arial',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                width: maxTextWidth,
                splitByGrapheme: false,
                lineHeight: 1.4,
                shadow: new Shadow({
                  color: 'rgba(0,0,0,0.7)',
                  blur: 4,
                  offsetX: 0,
                  offsetY: 2
                }),
                selectable: false
              });
              
              canvas.add(contentText);
            }
            
            // Render and wait for completion
            canvas.renderAll();
            await new Promise(resolve => setTimeout(resolve, 800)); // Longer wait for text rendering
            
            // Get the data URL from the canvas element
            const dataURL = canvasElement.toDataURL('image/png', 1.0);
            const base64Data = dataURL.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }
            
            return { filename: `slide-${i + 1}.png`, data: bytes };
            
          } finally {
            canvas.dispose();
          }
        })();
        
        imagePromises.push(imagePromise);
      }

      const imageFiles = await Promise.all(imagePromises);
      
      const zipFiles: Record<string, Uint8Array> = {};
      imageFiles.forEach(file => {
        zipFiles[file.filename] = file.data;
      });

      zip(zipFiles, (err, data) => {
        if (err) {
          console.error('Error creating ZIP:', err);
          alert('Failed to create ZIP file. Please try again.');
          return;
        }
        
        const blob = new Blob([data], { type: 'application/zip' });
        saveAs(blob, 'instagram-carousel-slides.zip');
      });
      
    } catch (error) {
      console.error('Error in ZIP export process:', error);
      alert('Failed to export slides. Please check the console for details.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const getSlideStyle = (slide: CarouselSlide) => {
    const currentSlides = storeSlides.length > 0 ? storeSlides : slides;
    const slideIndex = currentSlides.findIndex(s => s.id === slide.id);
    const fallbackColor = colors[slideIndex >= 0 ? slideIndex % colors.length : 0];
    const backgroundColor = slide.backgroundColor || fallbackColor;
    
    let backgroundStyle = {};
    
    if (slide.backgroundType === 'gradient' && slide.gradient) {
      backgroundStyle = { 
        background: slide.gradient
      };
    } else if (slide.backgroundType === 'image' && slide.backgroundImage) {
      // For image backgrounds, only set background color, image is handled separately
      backgroundStyle = { 
        background: backgroundColor
      };
    } else {
      // Solid color background
      backgroundStyle = { 
        background: backgroundColor
      };
    }

    return {
      ...backgroundStyle,
      borderRadius: slide.borderRadius || '12px',
      boxShadow: slide.shadow || '0 4px 20px rgba(0,0,0,0.1)',
      padding: slide.padding || '2rem'
    };
  };

  const getTitleStyle = (slide: CarouselSlide) => ({
    color: slide.titleColor || '#FFFFFF',
    fontFamily: slide.titleFontFamily || 'var(--font-inter), Inter, Arial, sans-serif',
    fontSize: slide.titleFontSize || '2rem',
    textAlign: slide.titleAlign || 'center' as const,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    position: 'absolute' as const,
    left: `${getTitlePositionX(slide)}%`,
    top: `${getTitlePositionY(slide)}%`,
    transform: 'translate(-50%, -50%)',
    width: '80%',
    zIndex: 20
  });

  const getContentStyle = (slide: CarouselSlide) => ({
    color: slide.textColor || '#FFFFFF',
    fontFamily: slide.fontFamily || 'var(--font-inter), Inter, Arial, sans-serif',
    fontSize: slide.fontSize || '1.1rem',
    textAlign: slide.textAlign || 'center' as const,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    position: 'absolute' as const,
    left: `${getTitlePositionX(slide)}%`,
    top: `${getTitlePositionY(slide) + 15}%`, // Content below title
    transform: 'translate(-50%, -50%)',
    width: '80%',
    zIndex: 19
  });



  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your carousel...</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No slides yet</h3>
        <p className="text-gray-500 mb-6">Generate your first carousel to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isPreviewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </button>
          
          <button
            onClick={addSlide}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadCurrentSlide}
            disabled={isDownloadingPreview || isDownloadingZip}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download current slide with perfect lighting"
          >
            {isDownloadingPreview ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Preview
              </>
            )}
          </button>
          
          <button
            onClick={downloadAllAsZip}
            disabled={isDownloadingPreview || isDownloadingZip}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download all slides as ZIP file"
          >
            {isDownloadingZip ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating ZIP...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Download ZIP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Slide Preview - Sticky on Mobile and Desktop */}
        <div className="sticky top-4 lg:top-8 h-fit z-10">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-0 lg:bg-transparent lg:backdrop-blur-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={slidesWithColors[currentSlide]?.id || currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  key={`slide-container-${slidesWithColors[currentSlide]?.id}`}
                  ref={el => { slideRefs.current[currentSlide] = el; }}
                  className="w-full aspect-square max-w-xs lg:max-w-md mx-auto relative overflow-hidden rounded-2xl shadow-lg"
                  style={getSlideStyle(slidesWithColors[currentSlide])}
                >
                  {slidesWithColors[currentSlide]?.backgroundImage && slidesWithColors[currentSlide]?.backgroundType === 'image' && (
                    <>
                      <div 
                        key={`bg-${slidesWithColors[currentSlide]?.id}`}
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${slidesWithColors[currentSlide].backgroundImage})`,
                          backgroundSize: slidesWithColors[currentSlide]?.backgroundImageFit || 'cover',
                          backgroundPosition: slidesWithColors[currentSlide]?.backgroundImageX && slidesWithColors[currentSlide]?.backgroundImageY
                            ? `${slidesWithColors[currentSlide].backgroundImageX} ${slidesWithColors[currentSlide].backgroundImageY}`
                            : slidesWithColors[currentSlide]?.backgroundImagePosition || 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: slidesWithColors[currentSlide]?.template === 'photoshoot' ? 0.85 : 
                                  slidesWithColors[currentSlide]?.template === 'instagram-user' ? 0.75 :
                                  slidesWithColors[currentSlide]?.template === 'cinema-chic' ? 0.7 :
                                  (slidesWithColors[currentSlide]?.backgroundImageOpacity || 0.6),
                          filter: slidesWithColors[currentSlide]?.template === 'photoshoot' 
                            ? 'brightness(0.6) contrast(1.3) saturate(0.8) sepia(0.15) hue-rotate(15deg)' 
                            : slidesWithColors[currentSlide]?.template === 'instagram-user'
                            ? 'brightness(0.7) contrast(1.3) saturate(1.2) sepia(0.1) hue-rotate(10deg)'
                            : slidesWithColors[currentSlide]?.template === 'cinema-chic'
                            ? 'brightness(0.6) contrast(1.4) saturate(0.9) sepia(0.2) hue-rotate(10deg) grayscale(0.1)'
                            : 'none'
                        }}
                      />
                      
                      {/* Professional Lighting System for Photoshoot Templates */}
                      {slidesWithColors[currentSlide]?.template === 'photoshoot' && (
                        <>
                          {/* Dark Base Layer */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              mixBlendMode: 'multiply'
                            }}
                          />
                          
                          {/* Top-Down Key Light for Face */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse 400px 300px at 50% 25%, rgba(255, 255, 240, 0.4) 0%, rgba(255, 240, 200, 0.3) 20%, rgba(255, 220, 150, 0.2) 40%, transparent 70%),
                                radial-gradient(ellipse 350px 250px at 50% 30%, rgba(255, 250, 220, 0.35) 0%, rgba(255, 235, 180, 0.25) 25%, rgba(255, 200, 120, 0.15) 45%, transparent 65%)
                              `,
                              mixBlendMode: 'soft-light'
                            }}
                          />
                          
                          {/* Focused Face Spotlight from Top */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse 250px 200px at 50% 35%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 250, 230, 0.2) 30%, rgba(255, 240, 180, 0.1) 50%, transparent 70%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                          
                          {/* Additional Top Light Fill */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                linear-gradient(to bottom, rgba(255, 255, 240, 0.15) 0%, rgba(255, 240, 200, 0.1) 40%, transparent 70%)
                              `,
                              mixBlendMode: 'screen'
                            }}
                          />
                          
                          {/* Controlled Shadow Enhancement */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.3) 45%, rgba(0, 0, 0, 0.8) 100%)
                              `,
                              mixBlendMode: 'multiply'
                            }}
                          />
                          
                          {/* Cinematic Edge Vignette */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, transparent 25%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.9) 100%)
                              `,
                              mixBlendMode: 'darken'
                            }}
                          />
                          
                          {/* Warm Skin Tone Enhancement */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse 220px 280px at 50% 43%, rgba(255, 200, 150, 0.12) 0%, rgba(240, 180, 120, 0.06) 40%, transparent 60%),
                                linear-gradient(45deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.03) 50%, rgba(0, 0, 0, 0.08) 100%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                        </>
                      )}

                      {/* Instagram User Enhanced Dramatic Lighting Effects */}
                      {slidesWithColors[currentSlide]?.template === 'instagram-user' && (
                        <>
                          {/* Primary Spotlight */}
                        <div 
                          className="absolute inset-0"
                          style={{
                              background: `
                                radial-gradient(ellipse 250px 400px at 50% 25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 215, 0, 0.1) 30%, transparent 70%),
                                radial-gradient(circle 200px at 30% 70%, rgba(255, 20, 147, 0.15) 0%, transparent 60%),
                                radial-gradient(circle 150px at 70% 30%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                          
                          {/* Film Grain Texture */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                repeating-linear-gradient(
                                  90deg,
                                  transparent,
                                  transparent 2px,
                                  rgba(255, 255, 255, 0.03) 2px,
                                  rgba(255, 255, 255, 0.03) 4px
                                ),
                                repeating-linear-gradient(
                                  0deg,
                                  transparent,
                                  transparent 2px,
                                  rgba(0, 0, 0, 0.03) 2px,
                                  rgba(0, 0, 0, 0.03) 4px
                                )
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                          
                          {/* Enhanced Vignette and Shadows */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.6) 90%, rgba(0, 0, 0, 0.9) 100%),
                                linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.3) 100%)
                              `,
                              mixBlendMode: 'multiply'
                            }}
                          />
                          
                          {/* Color Grading Overlay */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                linear-gradient(45deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 20, 147, 0.05) 50%, rgba(138, 43, 226, 0.05) 100%)
                              `,
                              mixBlendMode: 'soft-light'
                            }}
                          />
                        </>
                      )}

                      {/* Cinema Chic Vintage Hollywood Effects */}
                      {slidesWithColors[currentSlide]?.template === 'cinema-chic' && (
                        <>
                          {/* Classic Hollywood Key Light */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse 300px 400px at 50% 30%, rgba(255, 215, 0, 0.15) 0%, rgba(218, 165, 32, 0.1) 40%, transparent 70%),
                                radial-gradient(circle 180px at 35% 60%, rgba(184, 134, 11, 0.08) 0%, transparent 50%),
                                radial-gradient(circle 120px at 65% 40%, rgba(255, 228, 181, 0.12) 0%, transparent 60%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                          
                          {/* Film Noir Shadows and Contrast */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, transparent 25%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.8) 95%),
                                linear-gradient(45deg, rgba(0, 0, 0, 0.3) 0%, transparent 40%, transparent 60%, rgba(0, 0, 0, 0.4) 100%)
                              `,
                              mixBlendMode: 'multiply'
                            }}
                          />
                          
                          {/* Vintage Golden Glow */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(circle at 50% 40%, rgba(218, 165, 32, 0.1) 0%, rgba(184, 134, 11, 0.05) 30%, transparent 60%),
                                linear-gradient(60deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.03) 50%, transparent 100%)
                              `,
                              mixBlendMode: 'soft-light'
                            }}
                          />
                          
                          {/* Classic Cinema Texture */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                repeating-linear-gradient(
                                  90deg,
                                  transparent,
                                  transparent 3px,
                                  rgba(255, 215, 0, 0.02) 3px,
                                  rgba(255, 215, 0, 0.02) 6px
                                ),
                                repeating-linear-gradient(
                                  0deg,
                                  transparent,
                                  transparent 3px,
                                  rgba(0, 0, 0, 0.04) 3px,
                                  rgba(0, 0, 0, 0.04) 6px
                                )
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                    </>
                  )}

                      {/* User-Selected Overlay - For NON-Photoshoot, NON-Instagram-User, and NON-Cinema-Chic Templates */}
                      {slidesWithColors[currentSlide]?.template !== 'photoshoot' && slidesWithColors[currentSlide]?.template !== 'instagram-user' && slidesWithColors[currentSlide]?.template !== 'cinema-chic' && (
                  <div 
                          className="absolute inset-0"
                    style={{
                            background: slidesWithColors[currentSlide]?.gradient || slidesWithColors[currentSlide]?.backgroundColor || 'rgba(0, 0, 0, 0.3)',
                            opacity: 0.6
                          }}
                        />
                      )}
                    </>
                  )}
                  <div className="absolute inset-0 p-3 sm:p-6 lg:p-8">
                    {/* Emoji positioned absolutely */}
                    <div 
                      className="absolute text-2xl sm:text-3xl lg:text-4xl"
                      style={{
                        left: `${getTitlePositionX(slidesWithColors[currentSlide]) - 10}%`,
                        top: `${getTitlePositionY(slidesWithColors[currentSlide]) - 10}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 21
                      }}
                    >
                      {slidesWithColors[currentSlide]?.emoji}
                    </div>
                    
                    {editingSlide === slidesWithColors[currentSlide]?.id ? (
                      <div className="w-full space-y-3 sm:space-y-4">
                        <input
                          type="text"
                          value={slidesWithColors[currentSlide]?.title || ''}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { title: e.target.value })}
                          className="w-full text-base sm:text-lg lg:text-xl font-bold text-center bg-transparent border-2 border-white/30 rounded-lg p-2 text-white placeholder-white/70"
                          placeholder="Slide title..."
                        />
                        <textarea
                          value={slidesWithColors[currentSlide]?.content || ''}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { content: e.target.value })}
                          className="w-full text-xs sm:text-sm lg:text-base text-center bg-transparent border-2 border-white/30 rounded-lg p-2 sm:p-3 text-white placeholder-white/70 resize-none"
                          rows={3}
                          placeholder="Slide content..."
                        />
                        <button
                          onClick={() => setEditingSlide(null)}
                          className="px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-sm sm:text-lg lg:text-xl font-bold leading-tight" style={getTitleStyle(slidesWithColors[currentSlide])}>
                          {slidesWithColors[currentSlide]?.title?.replace(/\s*[🎯🚀💪📈⚡💡🔥✨🎪🌟]+\s*$/, '')}
                        </h2>
                        <p className="text-xs sm:text-sm lg:text-base leading-relaxed" style={getContentStyle(slidesWithColors[currentSlide])}>
                          {slidesWithColors[currentSlide]?.content}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {!isPreviewMode && !isDownloadingPreview && !isDownloadingZip && (
                    <button
                      onClick={() => setEditingSlide(slidesWithColors[currentSlide]?.id)}
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Thumbnails - Below Preview */}
          <div className="mt-4 sm:mt-6">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {slidesWithColors.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 transition-all overflow-hidden relative ${
                    currentSlide === index
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={getSlideStyle(slide)}
                >
                  {slide.backgroundImage && slide.backgroundType === 'image' && (
                    <>
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${slide.backgroundImage})`,
                          backgroundSize: slide.backgroundImageFit || 'cover',
                          backgroundPosition: slide.backgroundImageX && slide.backgroundImageY
                            ? `${slide.backgroundImageX} ${slide.backgroundImageY}`
                            : slide.backgroundImagePosition || 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: slide.template === 'photoshoot' ? 0.85 : 
                                  slide.template === 'instagram-user' ? 0.75 :
                                  slide.template === 'cinema-chic' ? 0.7 :
                                  (slide.backgroundImageOpacity || 0.6),
                          filter: slide.template === 'photoshoot' 
                            ? 'brightness(0.6) contrast(1.3) saturate(0.8) sepia(0.15) hue-rotate(15deg)' 
                            : slide.template === 'instagram-user'
                            ? 'brightness(0.7) contrast(1.3) saturate(1.2) sepia(0.1) hue-rotate(10deg)'
                            : slide.template === 'cinema-chic'
                            ? 'brightness(0.6) contrast(1.4) saturate(0.9) sepia(0.2) hue-rotate(10deg) grayscale(0.1)'
                            : 'none'
                        }}
                      />
                      
                      {/* Professional Lighting System for Photoshoot Templates */}
                      {slide.template === 'photoshoot' && (
                        <>
                          {/* Dark Base Layer */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              mixBlendMode: 'multiply'
                            }}
                          />
                          
                          {/* Simplified Enhanced Key Light for Thumbnails */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at 50% 45%, rgba(255, 220, 150, 0.2) 0%, rgba(255, 200, 120, 0.1) 30%, transparent 50%)
                              `,
                              mixBlendMode: 'soft-light'
                            }}
                          />
                          
                          {/* Simplified Shadows for Thumbnails */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.3) 45%, rgba(0, 0, 0, 0.8) 100%)
                              `,
                              mixBlendMode: 'multiply'
                            }}
                          />
                          
                          {/* Cinematic Edge Vignette */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, transparent 25%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.9) 100%)
                              `,
                              mixBlendMode: 'darken'
                            }}
                          />
                          
                          {/* Warm Skin Tone Enhancement */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse 220px 280px at 50% 43%, rgba(255, 200, 150, 0.12) 0%, rgba(240, 180, 120, 0.06) 40%, transparent 60%),
                                linear-gradient(45deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.03) 50%, rgba(0, 0, 0, 0.08) 100%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                        </>
                      )}

                      {/* Instagram User Effects for Thumbnails */}
                      {slide.template === 'instagram-user' && (
                        <>
                          {/* Simplified Instagram User Effects for Thumbnails */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, rgba(255, 20, 147, 0.05) 50%, transparent 80%),
                                radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                        </>
                      )}

                      {/* Cinema Chic Effects for Thumbnails */}
                      {slide.template === 'cinema-chic' && (
                        <>
                          {/* Simplified Cinema Chic Effects for Thumbnails */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse at center, rgba(255, 215, 0, 0.08) 0%, rgba(218, 165, 32, 0.05) 40%, transparent 70%),
                                radial-gradient(ellipse at center, transparent 25%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.8) 100%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                        </>
                      )}

                      {/* User-Selected Overlay - For NON-Photoshoot, NON-Instagram-User, and NON-Cinema-Chic Templates */}
                      {slide.template !== 'photoshoot' && slide.template !== 'instagram-user' && slide.template !== 'cinema-chic' && (
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: slide.gradient || slide.backgroundColor || 'rgba(0, 0, 0, 0.3)',
                            opacity: 0.6
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  {/* Thumbnail Content */}
                  <div className="absolute inset-0 p-1 flex flex-col justify-center items-center text-center">
                    <div className="text-xs sm:text-sm mb-1">
                      {slide.emoji}
                    </div>
                    <div className="text-xs font-semibold text-white text-center leading-tight">
                      {slide.title?.substring(0, 15)}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="space-y-6">
          {/* Slide Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Slide {currentSlide + 1} of {slidesWithColors.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide(Math.min(slidesWithColors.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slidesWithColors.length - 1}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => duplicateSlide(slidesWithColors[currentSlide].id)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              {slidesWithColors.length > 1 && (
                <button
                  onClick={() => deleteSlide(slidesWithColors[currentSlide].id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Editing Controls */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowColorPanel(!showColorPanel)}
              className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                showColorPanel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Palette className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Colors</span>
            </button>

            <button
              onClick={() => setShowFontPanel(!showFontPanel)}
              className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                showFontPanel ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Type className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Text</span>
            </button>

            <button
              onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
              className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                showBackgroundPanel ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ImageIcon className="h-5 w-5 text-green-600" />
              <span className="font-medium">Background</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Upload className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Upload</span>
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Color Panel */}
          {showColorPanel && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                Colors
              </h3>
              <div className="space-y-4">


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {textColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { titleColor: color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          slidesWithColors[currentSlide]?.titleColor === color ? 'border-gray-800' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="#FF0000"
                      value={slidesWithColors[currentSlide]?.titleColor?.startsWith('#') ? slidesWithColors[currentSlide].titleColor : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          updateSlide(slidesWithColors[currentSlide].id, { titleColor: value });
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="color"
                      value={slidesWithColors[currentSlide]?.titleColor || '#FFFFFF'}
                      onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { titleColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {textColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { textColor: color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          slidesWithColors[currentSlide]?.textColor === color ? 'border-gray-800' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="#FFFFFF"
                      value={slidesWithColors[currentSlide]?.textColor?.startsWith('#') ? slidesWithColors[currentSlide].textColor : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          updateSlide(slidesWithColors[currentSlide].id, { textColor: value });
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="color"
                      value={slidesWithColors[currentSlide]?.textColor || '#FFFFFF'}
                      onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { textColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { 
                          backgroundColor: color,
                          backgroundType: 'color',
                          backgroundImage: undefined,
                          gradient: undefined
                        })}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          slidesWithColors[currentSlide]?.backgroundColor === color ? 'border-gray-800' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="#4ECDC4"
                      value={slidesWithColors[currentSlide]?.backgroundColor?.startsWith('#') ? slidesWithColors[currentSlide].backgroundColor : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          updateSlide(slidesWithColors[currentSlide].id, { 
                            backgroundColor: value,
                            backgroundType: 'color',
                            backgroundImage: undefined,
                            gradient: undefined
                          });
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="color"
                      value={slidesWithColors[currentSlide]?.backgroundColor || '#4ECDC4'}
                      onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                        backgroundColor: e.target.value,
                        backgroundType: 'color',
                        backgroundImage: undefined,
                        gradient: undefined
                      })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Font Panel */}
          {showFontPanel && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-600" />
                Typography
              </h3>
              <div className="space-y-6">
                {/* Title Position Control */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    📍 Title Position Control
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">Horizontal Position</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((slidesWithColors[currentSlide]?.titlePositionX || slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            titlePositionX: `${e.target.value}%`,
                            titlePositionY: slidesWithColors[currentSlide]?.titlePositionY || slidesWithColors[currentSlide]?.textPositionY || '50%'
                          })}
                          className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${parseInt((slidesWithColors[currentSlide]?.titlePositionX || slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.titlePositionX || slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="text-sm font-medium text-purple-700 min-w-[3rem] text-center bg-purple-100 px-2 py-1 rounded">
                          {slidesWithColors[currentSlide]?.titlePositionX || slidesWithColors[currentSlide]?.textPositionX || '50%'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">Vertical Position</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((slidesWithColors[currentSlide]?.titlePositionY || slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            titlePositionY: `${e.target.value}%`,
                            titlePositionX: slidesWithColors[currentSlide]?.titlePositionX || slidesWithColors[currentSlide]?.textPositionX || '50%'
                          })}
                          className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${parseInt((slidesWithColors[currentSlide]?.titlePositionY || slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.titlePositionY || slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="text-sm font-medium text-purple-700 min-w-[3rem] text-center bg-purple-100 px-2 py-1 rounded">
                          {slidesWithColors[currentSlide]?.titlePositionY || slidesWithColors[currentSlide]?.textPositionY || '50%'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { 
                        titlePositionX: '50%',
                        titlePositionY: '50%'
                      })}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Reset Title to Center
                    </button>
                  </div>
                </div>

                {/* Content Position Control */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    📍 Content Position Control
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">Horizontal Position</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((slidesWithColors[currentSlide]?.contentPositionX || slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            contentPositionX: `${e.target.value}%`,
                            contentPositionY: slidesWithColors[currentSlide]?.contentPositionY || slidesWithColors[currentSlide]?.textPositionY || '50%'
                          })}
                          className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${parseInt((slidesWithColors[currentSlide]?.contentPositionX || slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.contentPositionX || slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="text-sm font-medium text-purple-700 min-w-[3rem] text-center bg-purple-100 px-2 py-1 rounded">
                          {slidesWithColors[currentSlide]?.contentPositionX || slidesWithColors[currentSlide]?.textPositionX || '50%'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">Vertical Position</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((slidesWithColors[currentSlide]?.contentPositionY || slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            contentPositionY: `${e.target.value}%`,
                            contentPositionX: slidesWithColors[currentSlide]?.contentPositionX || slidesWithColors[currentSlide]?.textPositionX || '50%'
                          })}
                          className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${parseInt((slidesWithColors[currentSlide]?.contentPositionY || slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.contentPositionY || slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="text-sm font-medium text-purple-700 min-w-[3rem] text-center bg-purple-100 px-2 py-1 rounded">
                          {slidesWithColors[currentSlide]?.contentPositionY || slidesWithColors[currentSlide]?.textPositionY || '50%'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { 
                        contentPositionX: '50%',
                        contentPositionY: '50%'
                      })}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Reset Content to Center
                    </button>
                  </div>
                </div>

                {/* Title Typography */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Title Formatting</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title Font Family</label>
                      <select
                        value={slidesWithColors[currentSlide]?.titleFontFamily || fontFamilies[0].value}
                        onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { titleFontFamily: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title Font Size: {slidesWithColors[currentSlide]?.titleFontSize || '2rem'}
                      </label>
                      <select
                        value={slidesWithColors[currentSlide]?.titleFontSize || '2rem'}
                        onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { titleFontSize: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="1.5rem">Small Title</option>
                        <option value="2rem">Medium Title</option>
                        <option value="2.5rem">Large Title</option>
                        <option value="3rem">Extra Large Title</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
                      <div className="grid grid-cols-3 gap-2">
                        {textAlignments.map((alignment) => (
                          <button
                            key={alignment.value}
                            onClick={() => updateSlide(slidesWithColors[currentSlide].id, { titleAlign: alignment.value })}
                            className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                              slidesWithColors[currentSlide]?.titleAlign === alignment.value
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {alignment.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Typography */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Content Formatting</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content Font Family</label>
                      <select
                        value={slidesWithColors[currentSlide]?.fontFamily || fontFamilies[0].value}
                        onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { fontFamily: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Font Size: {slidesWithColors[currentSlide]?.fontSize || '1.1rem'}
                      </label>
                      <select
                        value={slidesWithColors[currentSlide]?.fontSize || '1.1rem'}
                        onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { fontSize: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {fontSizes.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
                      <div className="grid grid-cols-3 gap-2">
                        {textAlignments.map((alignment) => (
                          <button
                            key={alignment.value}
                            onClick={() => updateSlide(slidesWithColors[currentSlide].id, { textAlign: alignment.value })}
                            className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                              slidesWithColors[currentSlide]?.textAlign === alignment.value
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {alignment.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* Background Panel */}
          {showBackgroundPanel && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-600" />
                Background
              </h3>
              <div className="space-y-4">
                {slidesWithColors[currentSlide]?.backgroundImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Opacity: {Math.round((slidesWithColors[currentSlide]?.backgroundImageOpacity || 0.6) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={slidesWithColors[currentSlide]?.backgroundImageOpacity || 0.6}
                      onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { backgroundImageOpacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {slidesWithColors[currentSlide]?.backgroundImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Fit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {imageFitOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateSlide(slidesWithColors[currentSlide].id, { backgroundImageFit: option.value })}
                          className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                            slidesWithColors[currentSlide]?.backgroundImageFit === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {slidesWithColors[currentSlide]?.backgroundImage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      🖼️ Background Image Position
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">Horizontal Position</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt((slidesWithColors[currentSlide]?.backgroundImageX || '50').replace('%', ''))}
                            onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                              backgroundImageX: `${e.target.value}%`,
                              backgroundImageY: slidesWithColors[currentSlide]?.backgroundImageY || '50%',
                              backgroundImagePosition: undefined
                            })}
                            className="flex-1 h-3 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${parseInt((slidesWithColors[currentSlide]?.backgroundImageX || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.backgroundImageX || '50').replace('%', ''))}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="text-sm font-medium text-green-700 min-w-[3rem] text-center bg-green-100 px-2 py-1 rounded">
                            {slidesWithColors[currentSlide]?.backgroundImageX || '50%'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">Vertical Position</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt((slidesWithColors[currentSlide]?.backgroundImageY || '50').replace('%', ''))}
                            onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                              backgroundImageY: `${e.target.value}%`,
                              backgroundImageX: slidesWithColors[currentSlide]?.backgroundImageX || '50%',
                              backgroundImagePosition: undefined
                            })}
                            className="flex-1 h-3 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${parseInt((slidesWithColors[currentSlide]?.backgroundImageY || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.backgroundImageY || '50').replace('%', ''))}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="text-sm font-medium text-green-700 min-w-[3rem] text-center bg-green-100 px-2 py-1 rounded">
                            {slidesWithColors[currentSlide]?.backgroundImageY || '50%'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { 
                          backgroundImageX: '50%',
                          backgroundImageY: '50%',
                          backgroundImagePosition: 'center'
                        })}
                        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Reset to Center
                      </button>
                    </div>
                  </div>
                )}

                {slidesWithColors[currentSlide]?.backgroundImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePositions.map((position) => (
                        <button
                          key={position.value}
                          onClick={() => updateSlide(slidesWithColors[currentSlide].id, { backgroundImagePosition: position.value })}
                          className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                            (slidesWithColors[currentSlide]?.backgroundImagePosition || 'center') === position.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {position.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {slidesWithColors[currentSlide]?.backgroundImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fine Position Control</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Horizontal (%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((slidesWithColors[currentSlide]?.backgroundImageX || '50').replace('%', ''))}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            backgroundImageX: `${e.target.value}%`,
                            backgroundImageY: slidesWithColors[currentSlide]?.backgroundImageY || '50%',
                            backgroundImagePosition: undefined
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {slidesWithColors[currentSlide]?.backgroundImageX || '50%'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Vertical (%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((slidesWithColors[currentSlide]?.backgroundImageY || '50').replace('%', ''))}
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            backgroundImageY: `${e.target.value}%`,
                            backgroundImageX: slidesWithColors[currentSlide]?.backgroundImageX || '50%',
                            backgroundImagePosition: undefined
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {slidesWithColors[currentSlide]?.backgroundImageY || '50%'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Gradients</label>
                  <div className="grid grid-cols-2 gap-2">
                    {gradients.map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { 
                          backgroundType: 'gradient',
                          gradient: gradient
                        })}
                        className="h-12 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                        style={{ background: gradient }}
                      />
                    ))}
                  </div>
                </div>

                {/* Template Selection - Only show if there's a background image */}
                {slidesWithColors[currentSlide]?.backgroundImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Template</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { template: 'regular' })}
                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                          (slidesWithColors[currentSlide]?.template || 'regular') === 'regular'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Regular</div>
                        <div className="text-xs text-gray-500">Simple overlay</div>
                      </button>
                      <button
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { template: 'photoshoot' })}
                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                          slidesWithColors[currentSlide]?.template === 'photoshoot'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Photoshoot</div>
                        <div className="text-xs text-gray-500">Pro lighting</div>
                      </button>
                      <button
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { template: 'instagram-user' })}
                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                          slidesWithColors[currentSlide]?.template === 'instagram-user'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Instagram User</div>
                        <div className="text-xs text-gray-500">Social effects</div>
                      </button>
                      <button
                        onClick={() => updateSlide(slidesWithColors[currentSlide].id, { template: 'cinema-chic' })}
                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                          slidesWithColors[currentSlide]?.template === 'cinema-chic'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Cinema Chic</div>
                        <div className="text-xs text-gray-500">Hollywood style</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smile className="h-5 w-5 text-yellow-600" />
              Emoji
            </h3>
            <div className="space-y-4">
              {/* Remove Emoji Button */}
              {slidesWithColors[currentSlide]?.emoji && (
                <button
                  onClick={() => updateSlide(slidesWithColors[currentSlide].id, { emoji: '' })}
                  className="w-full p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Remove Emoji
                </button>
              )}
              
              {/* Emoji Position Controls */}
              {slidesWithColors[currentSlide]?.emoji && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    😊 Emoji Position
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">Horizontal Position</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={getTitlePositionX(slidesWithColors[currentSlide]) - 10} // Emoji offset
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            textPositionX: `${parseInt(e.target.value) + 10}%`,
                            textPositionY: slidesWithColors[currentSlide]?.textPositionY || '50%'
                          })}
                          className="flex-1 h-3 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #eab308 0%, #eab308 ${getTitlePositionX(slidesWithColors[currentSlide]) - 10}%, #e5e7eb ${getTitlePositionX(slidesWithColors[currentSlide]) - 10}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="text-sm font-medium text-yellow-700 min-w-[3rem] text-center bg-yellow-100 px-2 py-1 rounded">
                          {getTitlePositionX(slidesWithColors[currentSlide]) - 10}%
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">Vertical Position</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={getTitlePositionY(slidesWithColors[currentSlide]) - 10} // Emoji offset
                          onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                            textPositionY: `${parseInt(e.target.value) + 10}%`,
                            textPositionX: slidesWithColors[currentSlide]?.textPositionX || '50%'
                          })}
                          className="flex-1 h-3 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #eab308 0%, #eab308 ${getTitlePositionY(slidesWithColors[currentSlide]) - 10}%, #e5e7eb ${getTitlePositionY(slidesWithColors[currentSlide]) - 10}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="text-sm font-medium text-yellow-700 min-w-[3rem] text-center bg-yellow-100 px-2 py-1 rounded">
                          {getTitlePositionY(slidesWithColors[currentSlide]) - 10}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Emoji Grid */}
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => updateSlide(slidesWithColors[currentSlide].id, { emoji })}
                    className={`p-2 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                      slidesWithColors[currentSlide]?.emoji === emoji
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Content Editor */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              Content & Typography
            </h3>
            <div className="space-y-6">
              {/* Text Position Control */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  📍 Text Position Control
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">Horizontal Position</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={parseInt((slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}
                        onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                          textPositionX: `${e.target.value}%`,
                          textPositionY: slidesWithColors[currentSlide]?.textPositionY || '50%'
                        })}
                        className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${parseInt((slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.textPositionX || '50').replace('%', ''))}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="text-sm font-medium text-purple-700 min-w-[3rem] text-center bg-purple-100 px-2 py-1 rounded">
                        {slidesWithColors[currentSlide]?.textPositionX || '50%'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">Vertical Position</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={parseInt((slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}
                        onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { 
                          textPositionY: `${e.target.value}%`,
                          textPositionX: slidesWithColors[currentSlide]?.textPositionX || '50%'
                        })}
                        className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${parseInt((slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}%, #e5e7eb ${parseInt((slidesWithColors[currentSlide]?.textPositionY || '50').replace('%', ''))}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="text-sm font-medium text-purple-700 min-w-[3rem] text-center bg-purple-100 px-2 py-1 rounded">
                        {slidesWithColors[currentSlide]?.textPositionY || '50%'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => updateSlide(slidesWithColors[currentSlide].id, { 
                      textPositionX: '50%',
                      textPositionY: '50%'
                    })}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Reset to Center
                  </button>
                </div>
              </div>

              {/* Content Text Editing */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={slidesWithColors[currentSlide]?.title || ''}
                    onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter slide title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={slidesWithColors[currentSlide]?.content || ''}
                    onChange={(e) => updateSlide(slidesWithColors[currentSlide].id, { content: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Enter slide content..."
                  />
                </div>
              </div>

              {/* Text Alignment Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { titleAlign: 'left' })}
                      className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                        slidesWithColors[currentSlide]?.titleAlign === 'left'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { titleAlign: 'center' })}
                      className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                        (slidesWithColors[currentSlide]?.titleAlign || 'center') === 'center'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Center
                    </button>
                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { titleAlign: 'right' })}
                      className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                        slidesWithColors[currentSlide]?.titleAlign === 'right'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Right
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { textAlign: 'left' })}
                      className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                        slidesWithColors[currentSlide]?.textAlign === 'left'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { textAlign: 'center' })}
                      className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                        (slidesWithColors[currentSlide]?.textAlign || 'center') === 'center'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Center
                    </button>
                    <button
                      onClick={() => updateSlide(slidesWithColors[currentSlide].id, { textAlign: 'right' })}
                      className={`p-2 rounded-lg border-2 transition-colors text-sm ${
                        slidesWithColors[currentSlide]?.textAlign === 'right'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Right
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
