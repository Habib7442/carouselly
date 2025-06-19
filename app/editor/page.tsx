'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye, Plus, Trash2, Copy, Palette, Type, Image as ImageIcon, Smile, AlignLeft, AlignCenter, AlignRight, Move, RotateCcw } from 'lucide-react';
import { Canvas, FabricImage, Rect, Circle, FabricText, Shadow } from 'fabric';
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

// Component for rendering formatted content with hashtag styling
const FormattedContent = ({ content }: { content: string }) => {
  const formatContent = (text: string) => {
    // Split by hashtags and preserve them
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={index}
            style={{
              color: '#000000', // Black color for hashtags
              fontWeight: '700'
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div style={{ whiteSpace: 'pre-line' }}>
      {formatContent(content)}
    </div>
  );
};

function EditorPageContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDownloadingPreview, setIsDownloadingPreview] = React.useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);

  const {
    slides,
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
    addSlide,
    deleteSlide,
    duplicateSlide,
    updateSlide,
    ensureSlideColors
  } = useCarouselStore();

  // Initialize slides if they don't exist (with delay to allow store to populate)
  useEffect(() => {
    console.log('Editor: Current slides in store:', slides.length);
    if (slides.length > 0) {
      console.log('Editor: Found slides, first slide:', slides[0]);
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
        // Handle background image
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.onload = () => {
          FabricImage.fromURL(slide.backgroundImage!).then((fabricImg) => {
            fabricImg.set({
              left: 0,
              top: 0,
              scaleX: 1080 / fabricImg.width!,
              scaleY: 1080 / fabricImg.height!,
              selectable: false
            });
            
            // Apply photoshoot template filters if it's a photoshoot template
            if (slide.template === 'photoshoot') {
              fabricImg.filters = [
                new fabric.Image.filters.Brightness({ brightness: -0.4 }),
                new fabric.Image.filters.Contrast({ contrast: 0.3 }),
                new fabric.Image.filters.Saturation({ saturation: -0.2 })
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
    const padding = 80; // More generous padding for better look
    const canvasWidth = 1080;
    const canvasHeight = 1080;
    const contentWidth = canvasWidth - (padding * 2);
    
    // Calculate total content height for perfect vertical centering
    let totalContentHeight = 0;
    let emojiHeight = 0;
    let titleHeight = 0;
    let contentHeight = 0;
    let hashtagHeight = 0;
    
    const emojiSize = 80;
    const titleFontSize = 52;
    const contentFontSize = 32;
    const spacing = 40; // Consistent spacing between elements
    
    // Calculate emoji height
    if (slide.emoji) {
      emojiHeight = emojiSize + spacing;
    }
    
    // Calculate title height
    if (slide.title) {
      const titleLines = wrapText(slide.title, contentWidth, titleFontSize, slide.titleFontFamily || 'Inter');
      titleHeight = (titleLines.length * titleFontSize * 1.2) + spacing;
    }
    
    // Calculate content height
    let mainContent = '';
    let hashtagsPart = '';
    if (slide.content) {
      const { mainContent: main, hashtags } = splitContentAndHashtags(slide.content);
      mainContent = main;
      hashtagsPart = hashtags;
      
      if (mainContent) {
        const contentLines = wrapText(mainContent, contentWidth, contentFontSize, slide.contentFontFamily || 'Inter');
        contentHeight = (contentLines.length * contentFontSize * 1.3) + spacing;
      }
      
      if (hashtagsPart) {
        const hashtagLines = wrapText(hashtagsPart, contentWidth, contentFontSize, slide.contentFontFamily || 'Inter');
        hashtagHeight = hashtagLines.length * contentFontSize * 1.3;
      }
    }
    
    // Calculate total height and starting Y position for perfect centering
    totalContentHeight = emojiHeight + titleHeight + contentHeight + hashtagHeight;
    const centerY = canvasHeight / 2;
    const startY = centerY - (totalContentHeight / 2);
    
    let currentY = startY;
    
    // EMOJI - Perfectly centered at the top
    if (slide.emoji) {
      const emoji = new FabricText(slide.emoji, {
        left: canvasWidth / 2,
        top: currentY + (emojiSize / 2),
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
      currentY += emojiHeight;
    }

    // TITLE - Perfectly centered below emoji
    if (slide.title) {
      const titleLines = wrapText(slide.title, contentWidth, titleFontSize, slide.titleFontFamily || 'Inter');
      const titleLineHeight = titleFontSize * 1.2;
      
      // Center the title block
      const titleBlockHeight = titleLines.length * titleLineHeight;
      let titleY = currentY + (titleBlockHeight / 2) - (titleLineHeight / 2);
      
      titleLines.forEach((line, index) => {
        const title = new FabricText(line, {
          left: canvasWidth / 2,
          top: titleY + (index * titleLineHeight),
          fontSize: titleFontSize,
          fontFamily: slide.titleFontFamily || 'Inter',
          fill: slide.titleColor || '#FFFFFF',
          textAlign: 'center',
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
      currentY += titleHeight;
    }

    // CONTENT - Perfectly centered below title
    if (mainContent) {
      const contentLines = wrapText(mainContent, contentWidth, contentFontSize, slide.contentFontFamily || 'Inter');
      const contentLineHeight = contentFontSize * 1.3;
      
      // Center the content block
      const contentBlockHeight = contentLines.length * contentLineHeight;
      let contentY = currentY + (contentBlockHeight / 2) - (contentLineHeight / 2);
      
      contentLines.forEach((line, index) => {
        const content = new FabricText(line, {
          left: canvasWidth / 2,
          top: contentY + (index * contentLineHeight),
          fontSize: contentFontSize,
          fontFamily: slide.contentFontFamily || 'Inter',
          fill: slide.contentColor || '#FFFFFF',
          textAlign: 'center',
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
      currentY += contentHeight;
    }
    
    // HASHTAGS - Perfectly centered below content
    if (hashtagsPart) {
      const hashtagLines = wrapText(hashtagsPart, contentWidth, contentFontSize, slide.contentFontFamily || 'Inter');
      const hashtagLineHeight = contentFontSize * 1.3;
      
      // Center the hashtag block
      const hashtagBlockHeight = hashtagLines.length * hashtagLineHeight;
      let hashtagY = currentY + (hashtagBlockHeight / 2) - (hashtagLineHeight / 2);
      
      hashtagLines.forEach((line, index) => {
        const hashtagText = new FabricText(line, {
          left: canvasWidth / 2,
          top: hashtagY + (index * hashtagLineHeight),
          fontSize: contentFontSize,
          fontFamily: slide.contentFontFamily || 'Inter',
          fill: '#000000', // Black color for hashtags
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
      });
    }
  };

  const downloadCanvas = (canvas: Canvas, filename: string) => {
    const dataURL = canvas.toDataURL('image/png', 1.0);
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
        
        const dataURL = canvas.toDataURL('image/png', 1.0);
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
      // For images, set all background properties individually
      baseStyle.backgroundImage = `url(${slide.backgroundImage})`;
      baseStyle.backgroundSize = slide.imageFit || 'cover';
      baseStyle.backgroundPosition = slide.imagePosition || 'center';
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
                              onClick={() => updateSlide(currentSlideData.id, { titleAlign: value as any })}
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
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">Content</h4>
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
                              onClick={() => updateSlide(currentSlideData.id, { contentAlign: value as any })}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Slide Preview */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-100 overflow-hidden">
          <div className="relative max-w-md w-full">
            {/* Preview - Properly contained and sized */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-square max-w-sm mx-auto"
            >
              <div
                className="w-full h-full shadow-2xl relative overflow-hidden rounded-lg"
                style={getSlideStyle(currentSlideData)}
              >
                {/* Photoshoot Template Cinematic Effects */}
                {currentSlideData.template === 'photoshoot' && currentSlideData.backgroundImage && (
                  <>
                    {/* Background Image with Filter */}
                    <img 
                      src={currentSlideData.backgroundImage} 
                      alt="Background" 
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        opacity: 0.85,
                        filter: 'brightness(0.6) contrast(1.3) saturate(0.8) sepia(0.15) hue-rotate(15deg)'
                      }}
                    />
                    
                    {/* Professional Lighting System for Better Face Visibility */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        mixBlendMode: 'multiply'
                      }}
                    />
                    
                    {/* Enhanced Key Light for Face - Multiple Zones */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `
                          radial-gradient(ellipse 150px 200px at 50% 45%, rgba(255, 220, 150, 0.25) 0%, rgba(255, 200, 120, 0.15) 30%, transparent 50%),
                          radial-gradient(ellipse 125px 175px at 48% 42%, rgba(255, 240, 180, 0.2) 0%, rgba(255, 220, 140, 0.1) 25%, transparent 45%),
                          radial-gradient(circle 100px at 52% 48%, rgba(255, 235, 160, 0.18) 0%, transparent 40%)
                        `,
                        mixBlendMode: 'soft-light'
                      }}
                    />
                    
                    {/* Face Highlight Zone */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `
                          radial-gradient(ellipse 90px 110px at 50% 40%, rgba(255, 255, 220, 0.15) 0%, rgba(255, 240, 180, 0.08) 35%, transparent 55%)
                        `,
                        mixBlendMode: 'overlay'
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
                          radial-gradient(ellipse 110px 140px at 50% 43%, rgba(255, 200, 150, 0.12) 0%, rgba(240, 180, 120, 0.06) 40%, transparent 60%),
                          linear-gradient(45deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.03) 50%, rgba(0, 0, 0, 0.08) 100%)
                        `,
                        mixBlendMode: 'overlay'
                      }}
                    />
                  </>
                )}
                
                {/* Content Layer - PROPERLY CENTERED AND ALIGNED */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  {/* Container for all content with proper vertical centering */}
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {currentSlideData.emoji && (
                      <div 
                        className="text-3xl mb-4 text-center"
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {currentSlideData.emoji}
                      </div>
                    )}
                    
                    {currentSlideData.title && (
                      <h2
                        className="text-lg font-bold leading-tight mb-4 w-full"
                        style={{
                          fontFamily: currentSlideData.titleFontFamily || fontFamilies[0].value,
                          color: currentSlideData.titleColor || '#FFFFFF',
                          textAlign: 'center',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {currentSlideData.title}
                      </h2>
                    )}
                    
                    {currentSlideData.content && (() => {
                      const { mainContent, hashtags } = splitContentAndHashtags(currentSlideData.content);
                      return (
                        <div className="w-full flex flex-col items-center justify-center">
                          {/* Main Content */}
                          {mainContent && (
                            <div
                              className="text-sm leading-relaxed mb-3 w-full"
                              style={{
                                fontFamily: currentSlideData.contentFontFamily || fontFamilies[0].value,
                                color: currentSlideData.contentColor || '#FFFFFF',
                                textAlign: 'center',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                              }}
                            >
                              <div className="max-w-full">
                                {mainContent}
                              </div>
                            </div>
                          )}
                          
                          {/* Hashtags */}
                          {hashtags && (
                            <div
                              className="text-sm font-bold leading-relaxed w-full"
                              style={{
                                fontFamily: currentSlideData.contentFontFamily || fontFamilies[0].value,
                                color: '#000000',
                                textAlign: 'center',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textShadow: '0 1px 3px rgba(255,255,255,0.8)'
                              }}
                            >
                              <div className="max-w-full">
                                {hashtags}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Slide indicator */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentSlide + 1} of {slides.length}
            </div>
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