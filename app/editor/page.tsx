'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye, Plus, Trash2, Copy, Palette, Type, Image as ImageIcon, Smile, AlignLeft, AlignCenter, AlignRight, Move, RotateCcw, AlertCircle } from 'lucide-react';
import { Canvas, FabricImage, FabricText, Shadow, filters } from 'fabric';
import { zip } from 'fflate';
import { saveAs } from 'file-saver';
import { useCarouselStore } from '@/lib/carousel-store';
import { CarouselSlide } from '@/lib/gemini';
import { Button } from '@/components/ui/button';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#FF8A80', '#82B1FF', '#B39DDB', '#A5D6A7'
];

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

const emojis = [
  '🎯', '🚀', '💪', '📈', '⚡', '💡', '🔥', '✨',
  '🎪', '🌟', '💎', '🎨', '📱', '💰', '🏆', '🎉',
  '👑', '🌈', '⭐', '🎭', '🤝', '🔔', '🌍', '⚙️'
];



function EditorPageContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDownloadingPreview, setIsDownloadingPreview] = React.useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);
  const [showPositionPanel, setShowPositionPanel] = React.useState(false);

  const {
    slides,
    currentSlide,
    isPreviewMode,
    showFontPanel,
    showColorPanel,
    showBackgroundPanel,
    setSlides,
    setCurrentSlide,
    setIsPreviewMode,
    setShowFontPanel,
    setShowColorPanel,
    setShowBackgroundPanel,
    addSlide,
    deleteSlide,
    duplicateSlide,
    updateSlide
  } = useCarouselStore();

  // Initialize slides if they don't exist (with delay to allow store to populate)
  useEffect(() => {
    console.log('Editor: Current slides in store:', slides.length);
    if (slides.length > 0) {
      console.log('Editor: Found slides, first slide:', slides[0]);
      
      // Auto-check for content overflow in all slides and suggest splits
      slides.forEach((slide, index) => {
        const overflowCheck = checkContentOverflow(slide);
        if (overflowCheck.isOverflowing) {
          console.log(`Slide ${index + 1} has content overflow:`, overflowCheck.suggestion);
        }
      });
    }
    
    const timer = setTimeout(() => {
      if (slides.length === 0) {
        console.log('Editor: No slides found, creating default slide');
        // Create default slide only if no slides are available after delay
        const defaultSlide: CarouselSlide = {
          id: `slide-${Date.now()}`,
          title: 'Welcome to Editor',
          content: 'Start creating your amazing carousel!',
          emoji: '✨',
          backgroundColor: colors[0]
        };
        setSlides([defaultSlide]);
      }
    }, 300); // Wait 300ms for store to populate

    return () => clearTimeout(timer);
  }, [slides.length, setSlides]);

  const currentSlideData = slides[currentSlide];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateSlide(currentSlideData.id, {
          backgroundImage: imageUrl,
          backgroundType: 'image',
          gradient: undefined,
          template: 'regular'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCurrentSlide = async () => {
    setIsDownloadingPreview(true);
    try {
      const slide = currentSlideData;
      
      // Use Instagram standard size 1080x1080
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 1080;
      canvasElement.height = 1080;
      
      const canvas = new Canvas(canvasElement);
      canvas.setWidth(1080);
      canvas.setHeight(1080);
      
      // Debug: Log slide background data
      console.log('Download Debug - Slide data:', {
        backgroundType: slide.backgroundType,
        backgroundColor: slide.backgroundColor,
        gradient: slide.gradient,
        backgroundImage: slide.backgroundImage
      });
      
      // Handle different background types properly
      // Auto-detect background type if not set
      const actualBackgroundType = slide.backgroundType || 
        (slide.gradient ? 'gradient' : 
         slide.backgroundImage ? 'image' : 'color');
      
      console.log('Download Debug - Using background type:', actualBackgroundType);
      
      if (actualBackgroundType === 'gradient' && slide.gradient) {
        // Create gradient background
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
                    // Parse gradient string and create canvas gradient
          const tempDiv = document.createElement('div');
          tempDiv.style.background = slide.gradient;
          tempDiv.style.width = '1080px';
          tempDiv.style.height = '1080px';
          document.body.appendChild(tempDiv);
          
          // Create a more robust gradient parser
          const gradientMatch = slide.gradient.match(/linear-gradient\(([^)]+)\)/);
          if (gradientMatch) {
            const gradientString = gradientMatch[1];
            
            // Better parsing that handles rgba() colors properly
            const angleMatch = gradientString.match(/^(\d+deg)/);
            const angle = angleMatch ? parseInt(angleMatch[1]) : 135;
            
            // Remove the angle part first
            const withoutAngle = gradientString.replace(/^\d+deg,?\s*/, '');
            
            // Extract color stops using regex that handles rgba() properly
            const colorStopPattern = /((?:rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-fA-F0-9]{3,6}|(?:red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)))\s*(\d+%)?/g;
            const colorStops: Array<{color: string, position?: number}> = [];
            let match;
            
            while ((match = colorStopPattern.exec(withoutAngle)) !== null) {
              const color = match[1].trim();
              const position = match[2] ? parseInt(match[2]) / 100 : undefined;
              colorStops.push({ color, position });
            }
              
              // If no explicit positions, distribute evenly
              if (colorStops.length > 0) {
                // Calculate gradient coordinates based on angle
                const angleRad = (angle - 90) * Math.PI / 180;
                const x1 = 540 + Math.cos(angleRad) * 540;
                const y1 = 540 + Math.sin(angleRad) * 540;
                const x2 = 540 - Math.cos(angleRad) * 540;
                const y2 = 540 - Math.sin(angleRad) * 540;
                
                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                
                colorStops.forEach((stop, index) => {
                  const position = stop.position !== undefined ? stop.position : (index / (colorStops.length - 1));
                  gradient.addColorStop(position, stop.color);
                });
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1080, 1080);
              }
            } else {
            // Fallback to solid color
            canvas.backgroundColor = slide.backgroundColor || colors[currentSlide % colors.length];
          }
          
          document.body.removeChild(tempDiv);
        }
      } else if (actualBackgroundType === 'image' && slide.backgroundImage) {
        // Handle background image with new positioning and fit controls
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.onload = () => {
          FabricImage.fromURL(slide.backgroundImage!).then((fabricImg) => {
            const canvasSize = 1080;
            const imgWidth = fabricImg.width!;
            const imgHeight = fabricImg.height!;
            
            // Use the new fit controls, defaulting to 'cover' to prevent stretching
            const fitValue = slide.imageFit || slide.backgroundImageFit || 'cover';
            
            let scaleX, scaleY, left, top;
            
            if (fitValue === 'cover') {
              // Cover: Fill the entire canvas, may crop
              const scale = Math.max(canvasSize / imgWidth, canvasSize / imgHeight);
              scaleX = scaleY = scale;
              
              // Use position sliders for offset (default to center)
              const bgX = (parseFloat(slide.backgroundImageX || '50') - 50) / 100;
              const bgY = (parseFloat(slide.backgroundImageY || '50') - 50) / 100;
              
              left = (canvasSize - imgWidth * scale) / 2 + (bgX * imgWidth * scale * 0.5);
              top = (canvasSize - imgHeight * scale) / 2 + (bgY * imgHeight * scale * 0.5);
            } else if (fitValue === 'contain') {
              // Contain: Fit entirely within canvas, may have empty space
              const scale = Math.min(canvasSize / imgWidth, canvasSize / imgHeight);
              scaleX = scaleY = scale;
              
              left = (canvasSize - imgWidth * scale) / 2;
              top = (canvasSize - imgHeight * scale) / 2;
            } else if (fitValue === 'fill') {
              // Fill: Stretch to fill exact canvas dimensions
              scaleX = canvasSize / imgWidth;
              scaleY = canvasSize / imgHeight;
              left = 0;
              top = 0;
            } else {
              // Default to cover
              const scale = Math.max(canvasSize / imgWidth, canvasSize / imgHeight);
              scaleX = scaleY = scale;
              left = (canvasSize - imgWidth * scale) / 2;
              top = (canvasSize - imgHeight * scale) / 2;
            }
            
            fabricImg.set({
              left,
              top,
              scaleX,
              scaleY,
              selectable: false
            });
            
            // Apply template filters for cinematic templates
            if (slide.template === 'photoshoot' || slide.template === 'cinema-chic' || slide.template === 'instagram-user') {
              fabricImg.filters = [
                new filters.Brightness({ brightness: -0.4 }),
                new filters.Contrast({ contrast: 0.3 }),
                new filters.Saturation({ saturation: -0.2 })
              ];
              fabricImg.applyFilters();
            }
            
            canvas.add(fabricImg);
            addTextToCanvas(canvas, slide);
            downloadCanvas(canvas, slide.title || 'slide');
          });
        };
        imgElement.src = slide.backgroundImage;
        return; // Exit early since we're handling async image loading
      } else {
        // Handle solid color background
        const bgColor = slide.backgroundColor || colors[currentSlide % colors.length];
        console.log('Download Debug - Setting solid background color:', bgColor);
        
        // Set canvas background using both methods to ensure it works
        canvas.backgroundColor = bgColor;
        
        // Also draw a background rectangle as fallback
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, 1080, 1080);
        }
      }
      
      // Add text content and download (for non-image backgrounds)
      addTextToCanvas(canvas, slide);
      downloadCanvas(canvas, slide.title || 'slide');
      
    } catch (error) {
      console.error('Error downloading slide:', error);
    } finally {
      setIsDownloadingPreview(false);
    }
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number, fontFamily: string = 'Inter'): string[] => {
    // Create a temporary canvas to measure text width
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return [text];
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const addTextToCanvas = (canvas: Canvas, slide: CarouselSlide) => {
    const canvasWidth = 1080;
    const canvasHeight = 1080;
    
    const emojiSize = 80;
    const titleFontSize = 52;
    const contentFontSize = 32;
    
    // Split content and hashtags
    const { mainContent, hashtags } = splitContentAndHashtags(slide.content || '');
    
    // EMOJI - Use position controls or default
    if (slide.emoji) {
      const emojiX = (parseFloat(slide.emojiPositionX || '50') / 100) * canvasWidth;
      const emojiY = (parseFloat(slide.emojiPositionY || '20') / 100) * canvasHeight;
      
      const emoji = new FabricText(slide.emoji, {
        left: emojiX,
        top: emojiY,
        fontSize: emojiSize,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: false,
        shadow: new Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 10,
          offsetX: 0,
          offsetY: 2
        })
      });
      canvas.add(emoji);
    }

    // TITLE - Use position controls or default
    if (slide.title) {
      const titleX = (parseFloat(slide.titlePositionX || '50') / 100) * canvasWidth;
      const titleY = (parseFloat(slide.titlePositionY || '40') / 100) * canvasHeight;
      
      const titleLines = wrapText(slide.title, 900, titleFontSize, slide.titleFontFamily || 'Inter');
      const titleLineHeight = titleFontSize * 1.2;
      
      titleLines.forEach((line, index) => {
        const title = new FabricText(line, {
          left: titleX,
          top: titleY + (index * titleLineHeight),
          fontSize: titleFontSize,
          fontFamily: slide.titleFontFamily || 'Inter',
          fill: slide.titleColor || '#FFFFFF',
          textAlign: slide.titleAlign || 'center',
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          selectable: false,
          shadow: new Shadow({
            color: 'rgba(0,0,0,0.4)',
            blur: 8,
            offsetX: 0,
            offsetY: 2
          })
        });
        canvas.add(title);
      });
    }

    // CONTENT - Use position controls or default
    if (mainContent) {
      const contentX = (parseFloat(slide.contentPositionX || '50') / 100) * canvasWidth;
      const contentY = (parseFloat(slide.contentPositionY || '60') / 100) * canvasHeight;
      
      const contentLines = wrapText(mainContent, 900, contentFontSize, slide.contentFontFamily || 'Inter');
      const contentLineHeight = contentFontSize * 1.3;
      
      contentLines.forEach((line, index) => {
        const content = new FabricText(line, {
          left: contentX,
          top: contentY + (index * contentLineHeight),
          fontSize: contentFontSize,
          fontFamily: slide.contentFontFamily || 'Inter',
          fill: slide.contentColor || '#FFFFFF',
          textAlign: slide.contentAlign || 'center',
          originX: 'center',
          originY: 'center',
          selectable: false,
          shadow: new Shadow({
            color: 'rgba(0,0,0,0.3)',
            blur: 6,
            offsetX: 0,
            offsetY: 1
          })
        });
        canvas.add(content);
      });
    }
    
    // HASHTAGS - Always at bottom center
    if (hashtags) {
      const hashtagText = new FabricText(hashtags, {
        left: canvasWidth / 2,
        top: canvasHeight - 80,
        fontSize: 24,
        fontFamily: slide.contentFontFamily || 'Inter',
        fill: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: false,
        shadow: new Shadow({
          color: 'rgba(255,255,255,0.8)',
          blur: 4,
          offsetX: 0,
          offsetY: 1
        })
      });
      canvas.add(hashtagText);
    }
  };

  const downloadCanvas = (canvas: Canvas, filename: string) => {
    const dataURL = canvas.toDataURL({ 
      format: 'png', 
      multiplier: 2, // 2x resolution for HD quality
      quality: 1 
    });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataURL;
    link.click();
  };

  const downloadAllAsZip = async () => {
    setIsDownloadingZip(true);
    try {
      const files: Record<string, Uint8Array> = {};
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Use Instagram standard size 1080x1080
        const canvasElement = document.createElement('canvas');
        canvasElement.width = 1080;
        canvasElement.height = 1080;
        
        const canvas = new Canvas(canvasElement);
        canvas.setWidth(1080);
        canvas.setHeight(1080);
        
        // Handle different background types properly
        if (slide.backgroundType === 'gradient' && slide.gradient) {
          // Create gradient background
          const ctx = canvasElement.getContext('2d');
          if (ctx) {
            // Parse gradient string and create canvas gradient
            const gradientMatch = slide.gradient.match(/linear-gradient\(([^)]+)\)/);
            if (gradientMatch) {
              const gradientString = gradientMatch[1];
              
              // Better parsing that handles rgba() colors properly
              const angleMatch = gradientString.match(/^(\d+deg)/);
              const angle = angleMatch ? parseInt(angleMatch[1]) : 135;
              
              // Remove the angle part first
              const withoutAngle = gradientString.replace(/^\d+deg,?\s*/, '');
              
              // Extract color stops using regex that handles rgba() properly
              const colorStopPattern = /((?:rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-fA-F0-9]{3,6}|(?:red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)))\s*(\d+%)?/g;
              const colorStops: Array<{color: string, position?: number}> = [];
              let match;
              
              while ((match = colorStopPattern.exec(withoutAngle)) !== null) {
                const color = match[1].trim();
                const position = match[2] ? parseInt(match[2]) / 100 : undefined;
                colorStops.push({ color, position });
              }
              
              // If no explicit positions, distribute evenly
              if (colorStops.length > 0) {
                // Calculate gradient coordinates based on angle
                const angleRad = (angle - 90) * Math.PI / 180;
                const x1 = 540 + Math.cos(angleRad) * 540;
                const y1 = 540 + Math.sin(angleRad) * 540;
                const x2 = 540 - Math.cos(angleRad) * 540;
                const y2 = 540 - Math.sin(angleRad) * 540;
                
                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                
                colorStops.forEach((stop, index) => {
                  const position = stop.position !== undefined ? stop.position : (index / (colorStops.length - 1));
                  gradient.addColorStop(position, stop.color);
                });
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1080, 1080);
              }
            } else {
              // Fallback to solid color
              canvas.backgroundColor = slide.backgroundColor || colors[i % colors.length];
            }
          }
        } else if (slide.backgroundType === 'image' && slide.backgroundImage) {
          // For batch processing, we'll skip images for now or handle them synchronously
          // This could be enhanced to handle images properly in batch
          canvas.backgroundColor = slide.backgroundColor || colors[i % colors.length];
        } else {
          // Handle solid color background
          const bgColor = slide.backgroundColor || colors[i % colors.length];
          console.log('Zip Download Debug - Setting solid background color:', bgColor);
          
          // Set canvas background using both methods to ensure it works
          canvas.backgroundColor = bgColor;
          
          // Also draw a background rectangle as fallback
          const ctx = canvasElement.getContext('2d');
          if (ctx) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, 1080, 1080);
          }
        }
        
        addTextToCanvas(canvas, slide);
        
        const dataURL = canvas.toDataURL({ 
          format: 'png', 
          multiplier: 2, // 2x resolution for HD quality
          quality: 1 
        });
        const base64Data = dataURL.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        
        for (let j = 0; j < binaryData.length; j++) {
          bytes[j] = binaryData.charCodeAt(j);
        }
        
        files[`slide-${i + 1}-${slide.title || 'untitled'}.png`] = bytes;
        canvas.dispose();
      }
      
      zip(files, (err, data) => {
        if (err) throw err;
        saveAs(new Blob([data], { type: 'application/zip' }), 'carousel-slides.zip');
      });
    } catch (error) {
      console.error('Error creating zip:', error);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const getSlideStyle = (slide: CarouselSlide) => {
    // Determine the actual background type
    const actualBackgroundType = slide.backgroundType || 
      (slide.gradient ? 'gradient' : 
       slide.backgroundImage ? 'image' : 'color');
    
    const baseStyle: React.CSSProperties = {
      backgroundRepeat: 'no-repeat'
    };

    if (actualBackgroundType === 'gradient' && slide.gradient) {
      // For gradients, only set the background image
      baseStyle.backgroundImage = slide.gradient;
    } else if (actualBackgroundType === 'image' && slide.backgroundImage) {
      // For images, set all background properties individually with new controls
      baseStyle.backgroundImage = `url(${slide.backgroundImage})`;
      
      // Use the new fit controls (imageFit or backgroundImageFit)
      const fitValue = slide.imageFit || slide.backgroundImageFit || 'cover';
      baseStyle.backgroundSize = fitValue;
      
      // Use the new position sliders for background positioning
      const bgX = slide.backgroundImageX || '50';
      const bgY = slide.backgroundImageY || '50';
      baseStyle.backgroundPosition = `${bgX}% ${bgY}%`;
    } else {
      // For solid colors, only set background color
      baseStyle.backgroundColor = slide.backgroundColor || colors[currentSlide % colors.length];
      baseStyle.backgroundSize = 'cover';
      baseStyle.backgroundPosition = 'center';
    }

    return baseStyle;
  };

  // Helper function to split content and hashtags for preview
  const splitContentAndHashtags = (content: string) => {
    const hashtagMatches = content.match(/#\w+/g);
    let mainContent = content;
    let hashtags = '';
    
    if (hashtagMatches) {
      hashtagMatches.forEach(hashtag => {
        mainContent = mainContent.replace(hashtag, '').trim();
      });
      hashtags = hashtagMatches.join(' ');
    }
    
    return { mainContent: mainContent.trim(), hashtags };
  };



  // Check if content is too long and suggest splitting
  const checkContentOverflow = (slide: CarouselSlide) => {
    if (!slide.content) return { isOverflowing: false, suggestion: '' };
    
    const contentLength = slide.content.length;
    const titleLength = slide.title?.length || 0;
    const totalLength = contentLength + titleLength;
    
    // Thresholds for different content lengths
    if (totalLength > 400) {
      return {
        isOverflowing: true,
        suggestion: 'Content is too long for optimal display. Consider splitting into multiple slides.'
      };
    }
    
    if (contentLength > 250) {
      return {
        isOverflowing: true,
        suggestion: 'Content might be better split across 2 slides for readability.'
      };
    }
    
    return { isOverflowing: false, suggestion: '' };
  };

  // Auto-split content function
  const autoSplitContent = (longContent: string, maxCharsPerSlide: number = 200) => {
    const sentences = longContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const slides = [];
    let currentSlideContent = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentSlideContent.length + trimmedSentence.length + 1 <= maxCharsPerSlide) {
        currentSlideContent += (currentSlideContent ? '. ' : '') + trimmedSentence;
      } else {
        if (currentSlideContent) {
          slides.push(currentSlideContent + '.');
        }
        currentSlideContent = trimmedSentence;
      }
    }
    
    if (currentSlideContent) {
      slides.push(currentSlideContent + '.');
    }
    
    return slides;
  };

  // Helper function to render text on canvas
  const renderTextOnCanvas = React.useCallback((ctx: CanvasRenderingContext2D, slide: CarouselSlide) => {
    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Render emoji
    if (slide.emoji) {
      ctx.font = '72px Arial';
      const emojiX = (parseFloat(slide.emojiPositionX || '50') / 100) * 1080;
      const emojiY = (parseFloat(slide.emojiPositionY || '10') / 100) * 1080;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(slide.emoji, emojiX, emojiY);
    }
    
    // Render title
    if (slide.title) {
      const titleX = (parseFloat(slide.titlePositionX || '50') / 100) * 1080;
      const titleY = (parseFloat(slide.titlePositionY || '40') / 100) * 1080;
      
      ctx.font = `bold 48px ${slide.titleFontFamily || 'Inter'}`;
      ctx.fillStyle = slide.titleColor || '#FFFFFF';
      ctx.textAlign = slide.titleAlign || 'center';
      
      // Add text shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      // Wrap text if needed
      const maxWidth = 900;
      const words = slide.title.split(' ');
      let line = '';
      const lines = [];
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      lines.forEach((line, index) => {
        ctx.fillText(line, titleX, titleY + (index * 60));
      });
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Render content
    if (slide.content) {
      const { mainContent, hashtags } = splitContentAndHashtags(slide.content);
      
      if (mainContent) {
        const contentX = (parseFloat(slide.contentPositionX || '50') / 100) * 1080;
        const contentY = (parseFloat(slide.contentPositionY || '60') / 100) * 1080;
        
        ctx.font = `32px ${slide.contentFontFamily || 'Inter'}`;
        ctx.fillStyle = slide.contentColor || '#FFFFFF';
        ctx.textAlign = slide.contentAlign || 'center';
        
        // Add subtle text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        // Wrap content text
        const maxWidth = 900;
        const words = mainContent.split(' ');
        let line = '';
        let lines = [];
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Limit to 8 lines
        lines = lines.slice(0, 8);
        
        lines.forEach((line, index) => {
          ctx.fillText(line, contentX, contentY + (index * 40));
        });
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Render hashtags at bottom
      if (hashtags) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = slide.contentAlign || 'center';
        
        // Add white shadow for hashtags
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(hashtags, 540, 1000);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
  }, [splitContentAndHashtags]);

  // Canvas preview rendering function
  const renderCanvasPreview = React.useCallback(async () => {
    if (!canvasRef.current) return;
    
    const slide = currentSlideData;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, 1080, 1080);
    
    // Auto-detect background type if not set
    const actualBackgroundType = slide.backgroundType || 
      (slide.gradient ? 'gradient' : 
       slide.backgroundImage ? 'image' : 'color');
    
    // Handle different background types
    if (actualBackgroundType === 'gradient' && slide.gradient) {
      // Parse and render gradient
      const gradientMatch = slide.gradient.match(/linear-gradient\(([^)]+)\)/);
      if (gradientMatch) {
        const gradientString = gradientMatch[1];
        const angleMatch = gradientString.match(/^(\d+deg)/);
        const angle = angleMatch ? parseInt(angleMatch[1]) : 135;
        const withoutAngle = gradientString.replace(/^\d+deg,?\s*/, '');
        
        const colorStopPattern = /((?:rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-fA-F0-9]{3,6}|(?:red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)))\s*(\d+%)?/g;
        const colorStops: Array<{color: string, position?: number}> = [];
        let match;
        
        while ((match = colorStopPattern.exec(withoutAngle)) !== null) {
          const color = match[1].trim();
          const position = match[2] ? parseInt(match[2]) / 100 : undefined;
          colorStops.push({ color, position });
        }
        
        if (colorStops.length > 0) {
          const angleRad = (angle - 90) * Math.PI / 180;
          const x1 = 540 + Math.cos(angleRad) * 540;
          const y1 = 540 + Math.sin(angleRad) * 540;
          const x2 = 540 - Math.cos(angleRad) * 540;
          const y2 = 540 - Math.sin(angleRad) * 540;
          
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          colorStops.forEach((stop, index) => {
            const position = stop.position !== undefined ? stop.position : (index / (colorStops.length - 1));
            gradient.addColorStop(position, stop.color);
          });
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1080, 1080);
        }
      }
    } else if (actualBackgroundType === 'image' && slide.backgroundImage) {
      // Handle background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const fitValue = slide.imageFit || slide.backgroundImageFit || 'cover';
        const sx = 0;
        const sy = 0;
        const sw = img.width;
        const sh = img.height;
        let dx = 0, dy = 0, dw = 1080, dh = 1080;
        
        if (fitValue === 'cover') {
          const scale = Math.max(1080 / img.width, 1080 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          
          const bgX = (parseFloat(slide.backgroundImageX || '50') - 50) / 100;
          const bgY = (parseFloat(slide.backgroundImageY || '50') - 50) / 100;
          
          dx = (1080 - scaledWidth) / 2 + (bgX * scaledWidth * 0.5);
          dy = (1080 - scaledHeight) / 2 + (bgY * scaledHeight * 0.5);
          dw = scaledWidth;
          dh = scaledHeight;
        } else if (fitValue === 'contain') {
          const scale = Math.min(1080 / img.width, 1080 / img.height);
          dw = img.width * scale;
          dh = img.height * scale;
          dx = (1080 - dw) / 2;
          dy = (1080 - dh) / 2;
        }
        
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        
        // Apply template effects for cinematic templates
        if (slide.template === 'photoshoot' || slide.template === 'cinema-chic' || slide.template === 'instagram-user') {
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, 1080, 1080);
          ctx.globalCompositeOperation = 'source-over';
        }
        
        // Render text content after image loads
        renderTextOnCanvas(ctx, slide);
      };
      img.src = slide.backgroundImage;
      return; // Exit early for async image loading
    } else {
      // Handle solid color background
      const bgColor = slide.backgroundColor || colors[currentSlide % colors.length];
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1080, 1080);
    }
    
    // Render text content for non-image backgrounds
    renderTextOnCanvas(ctx, slide);
  }, [currentSlideData, currentSlide, colors, renderTextOnCanvas]);

  // Update canvas when slide changes
  React.useEffect(() => {
    renderCanvasPreview();
  }, [renderCanvasPreview]);

  if (!currentSlideData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-800">Carousel Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCurrentSlide}
              disabled={isDownloadingPreview}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloadingPreview ? 'Downloading...' : 'Download Current'}
            </Button>
            
            <Button
              onClick={downloadAllAsZip}
              disabled={isDownloadingZip}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloadingZip ? 'Creating Zip...' : 'Download All'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Editor Controls */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Slide Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Slides ({slides.length})</h3>
                <Button
                  size="sm"
                  onClick={addSlide}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all ${
                      currentSlide === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <div
                      className="w-full h-full rounded-md text-white text-xs flex flex-col items-center justify-center p-2"
                      style={getSlideStyle(slide)}
                    >
                      {slide.emoji && (
                        <div className="text-lg mb-1">{slide.emoji}</div>
                      )}
                      <div className="font-medium text-center truncate w-full">
                        {slide.title}
                      </div>
                    </div>
                    
                    {slides.length > 1 && (
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSlide(slide.id);
                          }}
                          className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(slide.id);
                          }}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Panels */}
            <div className="space-y-4">
              {/* Content Editor */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowFontPanel(!showFontPanel)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Content & Typography</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showFontPanel ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.div>
                </button>
                
                {showFontPanel && (
                  <div className="p-3 border-t border-gray-200 space-y-4">
                    {/* Title Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Title</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title Text
                        </label>
                        <input
                          type="text"
                          value={currentSlideData.title || ''}
                          onChange={(e) => updateSlide(currentSlideData.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Enter slide title"
                        />
                      </div>
                      
                      {/* Title Alignment */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Title Alignment
                        </label>
                        <div className="flex gap-1">
                          {[
                            { value: 'left', icon: AlignLeft, label: 'Left' },
                            { value: 'center', icon: AlignCenter, label: 'Center' },
                            { value: 'right', icon: AlignRight, label: 'Right' }
                          ].map(({ value, icon: Icon, label }) => (
                            <button
                              key={value}
                              onClick={() => updateSlide(currentSlideData.id, { titleAlign: value as 'left' | 'center' | 'right' })}
                              className={`flex-1 p-2 rounded border text-xs flex items-center justify-center gap-1 ${
                                (currentSlideData.titleAlign || 'center') === value
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                              title={label}
                            >
                              <Icon className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title Font Family */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title Font
                        </label>
                        <select
                          value={currentSlideData.titleFontFamily || fontFamilies[0].value}
                          onChange={(e) => updateSlide(currentSlideData.id, { titleFontFamily: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          {fontFamilies.map((font) => (
                            <option key={font.name} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Title Color */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Title Color
                        </label>
                        <div className="space-y-2">
                          {/* Color Grid */}
                          <div className="grid grid-cols-6 gap-1">
                            {textColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateSlide(currentSlideData.id, { titleColor: color })}
                                className={`w-6 h-6 rounded border-2 ${
                                  (currentSlideData.titleColor || '#FFFFFF') === color
                                    ? 'border-gray-800'
                                    : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          
                          {/* Color Picker */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentSlideData.titleColor || '#FFFFFF'}
                              onChange={(e) => updateSlide(currentSlideData.id, { titleColor: e.target.value })}
                              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                              title="Custom color picker"
                            />
                            <input
                              type="text"
                              value={currentSlideData.titleColor || '#FFFFFF'}
                              onChange={(e) => updateSlide(currentSlideData.id, { titleColor: e.target.value })}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Content</h4>
                      
                      {/* Content Overflow Warning */}
                      {(() => {
                        const overflowCheck = checkContentOverflow(currentSlideData);
                        if (overflowCheck.isOverflowing) {
                          return (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm text-amber-800 font-medium">Content Too Long</p>
                                  <p className="text-xs text-amber-700 mt-1">{overflowCheck.suggestion}</p>
                                  <button
                                    onClick={() => {
                                      const splitSlides = autoSplitContent(currentSlideData.content);
                                      if (splitSlides.length > 1) {
                                        // Update current slide with first part
                                        updateSlide(currentSlideData.id, { content: splitSlides[0] });
                                        
                                        // Create new slides for remaining content
                                        splitSlides.slice(1).forEach((content, index) => {
                                          const newSlide: CarouselSlide = {
                                            id: `slide-${Date.now()}-${index}`,
                                            title: index === 0 ? currentSlideData.title : `${currentSlideData.title} (Cont.)`,
                                            content: content,
                                            emoji: currentSlideData.emoji,
                                            backgroundColor: currentSlideData.backgroundColor,
                                            backgroundType: currentSlideData.backgroundType,
                                            gradient: currentSlideData.gradient,
                                            backgroundImage: currentSlideData.backgroundImage
                                          };
                                          
                                          // Insert new slide after current one
                                          const newSlides = [...slides];
                                          newSlides.splice(currentSlide + 1 + index, 0, newSlide);
                                          setSlides(newSlides);
                                        });
                                      }
                                    }}
                                    className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-md hover:bg-amber-200 transition-colors"
                                  >
                                    Auto-Split Content
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content Text
                        </label>
                        <textarea
                          value={currentSlideData.content || ''}
                          onChange={(e) => updateSlide(currentSlideData.id, { content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
                          placeholder="Enter slide content. Add hashtags at the end for proper formatting."
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {(currentSlideData.content || '').length} characters
                          {(currentSlideData.content || '').length > 250 && (
                            <span className="text-amber-600 ml-2">⚠ Content might be too long</span>
                          )}
                          <br />
                          💡 Tip: Add hashtags at the end of your content for proper line breaks
                        </div>
                      </div>

                      {/* Content Alignment */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Content Alignment
                        </label>
                        <div className="flex gap-1">
                          {[
                            { value: 'left', icon: AlignLeft, label: 'Left' },
                            { value: 'center', icon: AlignCenter, label: 'Center' },
                            { value: 'right', icon: AlignRight, label: 'Right' }
                          ].map(({ value, icon: Icon, label }) => (
                            <button
                              key={value}
                              onClick={() => updateSlide(currentSlideData.id, { contentAlign: value as 'left' | 'center' | 'right' })}
                              className={`flex-1 p-2 rounded border text-xs flex items-center justify-center gap-1 ${
                                (currentSlideData.contentAlign || 'center') === value
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                              title={label}
                            >
                              <Icon className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Font Family */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content Font
                        </label>
                        <select
                          value={currentSlideData.contentFontFamily || fontFamilies[0].value}
                          onChange={(e) => updateSlide(currentSlideData.id, { contentFontFamily: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          {fontFamilies.map((font) => (
                            <option key={font.name} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Content Color */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Content Color
                        </label>
                        <div className="space-y-2">
                          {/* Color Grid */}
                          <div className="grid grid-cols-6 gap-1">
                            {textColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateSlide(currentSlideData.id, { contentColor: color })}
                                className={`w-6 h-6 rounded border-2 ${
                                  (currentSlideData.contentColor || '#FFFFFF') === color
                                    ? 'border-gray-800'
                                    : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          
                          {/* Color Picker */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentSlideData.contentColor || '#FFFFFF'}
                              onChange={(e) => updateSlide(currentSlideData.id, { contentColor: e.target.value })}
                              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                              title="Custom color picker"
                            />
                            <input
                              type="text"
                              value={currentSlideData.contentColor || '#FFFFFF'}
                              onChange={(e) => updateSlide(currentSlideData.id, { contentColor: e.target.value })}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => updateSlide(currentSlideData.id, {
                          titleAlign: 'center',
                          contentAlign: 'center',
                          titleFontFamily: fontFamilies[0].value,
                          contentFontFamily: fontFamilies[0].value,
                          titleColor: '#FFFFFF',
                          contentColor: '#FFFFFF'
                        })}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Typography
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Position Controls */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowPositionPanel(!showPositionPanel)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Move className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Position Controls</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showPositionPanel ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.div>
                </button>
                
                {showPositionPanel && (
                  <div className="p-3 border-t border-gray-200 space-y-4">
                    {/* Title Position */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Title Position</h4>
                      
                      {/* Title Horizontal Position */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Horizontal Position: {currentSlideData.titlePositionX || '50'}%
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentSlideData.titlePositionX || '50'}
                            onChange={(e) => updateSlide(currentSlideData.id, { titlePositionX: e.target.value })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${currentSlideData.titlePositionX || 50}%, #e5e7eb ${currentSlideData.titlePositionX || 50}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSlideData.titlePositionX || '50'}
                            onChange={(e) => updateSlide(currentSlideData.id, { titlePositionX: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                      
                      {/* Title Vertical Position */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Vertical Position: {currentSlideData.titlePositionY || '40'}%
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentSlideData.titlePositionY || '40'}
                            onChange={(e) => updateSlide(currentSlideData.id, { titlePositionY: e.target.value })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${currentSlideData.titlePositionY || 40}%, #e5e7eb ${currentSlideData.titlePositionY || 40}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSlideData.titlePositionY || '40'}
                            onChange={(e) => updateSlide(currentSlideData.id, { titlePositionY: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Position */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Content Position</h4>
                      
                      {/* Content Horizontal Position */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Horizontal Position: {currentSlideData.contentPositionX || '50'}%
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentSlideData.contentPositionX || '50'}
                            onChange={(e) => updateSlide(currentSlideData.id, { contentPositionX: e.target.value })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${currentSlideData.contentPositionX || 50}%, #e5e7eb ${currentSlideData.contentPositionX || 50}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSlideData.contentPositionX || '50'}
                            onChange={(e) => updateSlide(currentSlideData.id, { contentPositionX: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                      
                      {/* Content Vertical Position */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Vertical Position: {currentSlideData.contentPositionY || '60'}%
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentSlideData.contentPositionY || '60'}
                            onChange={(e) => updateSlide(currentSlideData.id, { contentPositionY: e.target.value })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${currentSlideData.contentPositionY || 60}%, #e5e7eb ${currentSlideData.contentPositionY || 60}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSlideData.contentPositionY || '60'}
                            onChange={(e) => updateSlide(currentSlideData.id, { contentPositionY: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Emoji Position */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Emoji Position</h4>
                      
                      {/* Emoji Horizontal Position */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Horizontal Position: {currentSlideData.emojiPositionX || '50'}%
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentSlideData.emojiPositionX || '50'}
                            onChange={(e) => updateSlide(currentSlideData.id, { emojiPositionX: e.target.value })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${currentSlideData.emojiPositionX || 50}%, #e5e7eb ${currentSlideData.emojiPositionX || 50}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSlideData.emojiPositionX || '50'}
                            onChange={(e) => updateSlide(currentSlideData.id, { emojiPositionX: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                      
                      {/* Emoji Vertical Position */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Vertical Position: {currentSlideData.emojiPositionY || '10'}%
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentSlideData.emojiPositionY || '10'}
                            onChange={(e) => updateSlide(currentSlideData.id, { emojiPositionY: e.target.value })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${currentSlideData.emojiPositionY || 10}%, #e5e7eb ${currentSlideData.emojiPositionY || 10}%, #e5e7eb 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSlideData.emojiPositionY || '10'}
                            onChange={(e) => updateSlide(currentSlideData.id, { emojiPositionY: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Reset Positions Button */}
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => updateSlide(currentSlideData.id, {
                          titlePositionX: '50',
                          titlePositionY: '40',
                          contentPositionX: '50',
                          contentPositionY: '60',
                          emojiPositionX: '50',
                          emojiPositionY: '10'
                        })}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Positions
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Editor */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Background</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showBackgroundPanel ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.div>
                </button>
                
                {showBackgroundPanel && (
                  <div className="p-3 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solid Colors
                      </label>
                      <div className="space-y-2">
                        {/* Color Grid */}
                        <div className="grid grid-cols-6 gap-2">
                          {colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateSlide(currentSlideData.id, { 
                                backgroundColor: color,
                                backgroundType: 'color',
                                gradient: undefined,
                                backgroundImage: undefined
                              })}
                              className={`w-8 h-8 rounded-md border-2 ${
                                currentSlideData.backgroundColor === color
                                  ? 'border-gray-800'
                                  : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        
                        {/* Color Picker */}
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentSlideData.backgroundColor || colors[0]}
                            onChange={(e) => updateSlide(currentSlideData.id, { 
                              backgroundColor: e.target.value,
                              backgroundType: 'color',
                              gradient: undefined,
                              backgroundImage: undefined
                            })}
                            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                            title="Custom background color picker"
                          />
                          <input
                            type="text"
                            value={currentSlideData.backgroundColor || colors[0]}
                            onChange={(e) => updateSlide(currentSlideData.id, { 
                              backgroundColor: e.target.value,
                              backgroundType: 'color',
                              gradient: undefined,
                              backgroundImage: undefined
                            })}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="#FF6B6B"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gradients
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {gradients.map((gradient, index) => (
                          <button
                            key={index}
                            onClick={() => updateSlide(currentSlideData.id, { 
                              gradient,
                              backgroundType: 'gradient',
                              backgroundColor: undefined,
                              backgroundImage: undefined
                            })}
                            className={`h-12 rounded-md border-2 ${
                              currentSlideData.gradient === gradient
                                ? 'border-gray-800'
                                : 'border-gray-300'
                            }`}
                            style={{ background: gradient }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Upload Background Image
                      </Button>
                    </div>

                    {/* Background Image Controls - Only show when image is uploaded */}
                    {currentSlideData.backgroundImage && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Image Controls</h4>
                        
                        {/* Image Fit Options */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Fit
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { name: 'Cover', value: 'cover', desc: 'Fill container' },
                              { name: 'Contain', value: 'contain', desc: 'Fit completely' },
                              { name: 'Fill', value: 'fill', desc: 'Stretch to fit' }
                            ].map(({ name, value, desc }) => (
                              <button
                                key={value}
                                onClick={() => updateSlide(currentSlideData.id, { 
                                  imageFit: value as 'cover' | 'contain' | 'fill',
                                  backgroundImageFit: value as 'cover' | 'contain' | 'fill'
                                })}
                                className={`p-2 rounded border text-xs ${
                                  (currentSlideData.imageFit || currentSlideData.backgroundImageFit || 'cover') === value
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                title={desc}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Background Image Position Sliders */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-medium text-gray-700">Image Position</h5>
                          
                          {/* Image Horizontal Position */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Horizontal: {currentSlideData.backgroundImageX || '50'}%
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={currentSlideData.backgroundImageX || '50'}
                                onChange={(e) => updateSlide(currentSlideData.id, { backgroundImageX: e.target.value })}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${currentSlideData.backgroundImageX || 50}%, #e5e7eb ${currentSlideData.backgroundImageX || 50}%, #e5e7eb 100%)`
                                }}
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentSlideData.backgroundImageX || '50'}
                                onChange={(e) => updateSlide(currentSlideData.id, { backgroundImageX: e.target.value })}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                          </div>
                          
                          {/* Image Vertical Position */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Vertical: {currentSlideData.backgroundImageY || '50'}%
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={currentSlideData.backgroundImageY || '50'}
                                onChange={(e) => updateSlide(currentSlideData.id, { backgroundImageY: e.target.value })}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${currentSlideData.backgroundImageY || 50}%, #e5e7eb ${currentSlideData.backgroundImageY || 50}%, #e5e7eb 100%)`
                                }}
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentSlideData.backgroundImageY || '50'}
                                onChange={(e) => updateSlide(currentSlideData.id, { backgroundImageY: e.target.value })}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                          </div>
                        </div>

                        {/* Reset Image Settings */}
                        <div className="pt-2 border-t">
                          <button
                            onClick={() => updateSlide(currentSlideData.id, {
                              imageFit: 'cover',
                              backgroundImageFit: 'cover',
                              backgroundImageX: '50',
                              backgroundImageY: '50'
                            })}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reset Image Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emoji Picker */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowColorPanel(!showColorPanel)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Emoji</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showColorPanel ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.div>
                </button>
                
                {showColorPanel && (
                  <div className="p-3 border-t border-gray-200 space-y-3">
                    {/* Current Emoji with Delete Option */}
                    {currentSlideData.emoji && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{currentSlideData.emoji}</span>
                          <span className="text-sm text-gray-600">Current emoji</span>
                        </div>
                        <button
                          onClick={() => updateSlide(currentSlideData.id, { emoji: undefined })}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove emoji"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    {/* Emoji Grid */}
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => updateSlide(currentSlideData.id, { emoji })}
                          className={`w-8 h-8 text-lg hover:bg-gray-100 rounded-md flex items-center justify-center ${
                            currentSlideData.emoji === emoji ? 'bg-blue-100' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Note about position controls */}
                    {currentSlideData.emoji && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          💡 Use the Position Controls panel to adjust emoji placement
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Canvas Preview */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-100 overflow-hidden">
          <div className="relative">
            {/* Canvas Preview - Shows actual 1080x1080 dimensions */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative group transition-all duration-300 hover:scale-[1.02]"
            >
              <canvas
                ref={canvasRef}
                width={1080}
                height={1080}
                className="border border-gray-300 rounded-lg shadow-lg bg-white max-w-full h-auto"
                style={{ 
                  aspectRatio: '1/1',
                  maxHeight: '70vh',
                  width: 'auto'
                }}
              />
              
              {/* Canvas overlay showing dimensions */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                1080×1080px
              </div>
              
              {/* Slide counter */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentSlide + 1} of {slides.length}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function EditorLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading editor...</p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorPageContent />
    </Suspense>
  );
}