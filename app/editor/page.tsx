'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye, Plus, Trash2, Copy, Palette, Type, Image as ImageIcon, Smile } from 'lucide-react';
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
      canvas.backgroundColor = slide.backgroundColor || colors[currentSlide % colors.length];
      
      if (slide.backgroundImage) {
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
      } else {
        addTextToCanvas(canvas, slide);
        downloadCanvas(canvas, slide.title || 'slide');
      }
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
    const padding = 60; // Professional padding for 1080px canvas
    const canvasWidth = 1080;
    const canvasHeight = 1080;
    const contentWidth = canvasWidth - (padding * 2);

    // EMOJI - Top center position
    if (slide.emoji) {
      const emoji = new FabricText(slide.emoji, {
        left: canvasWidth / 2,
        top: 120, // Professional top spacing
        fontSize: 72, // Slightly smaller for better proportion
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: false
      });
      canvas.add(emoji);
    }

    // TITLE - Below emoji with proper spacing
    if (slide.title) {
      const titleFontSize = 48; // Larger, more impactful title
      const titleLines = wrapText(slide.title, contentWidth, titleFontSize, slide.titleFontFamily || 'Inter');
      const titleLineHeight = titleFontSize * 1.15; // Tighter line height for titles
      const titleStartY = 220; // Professional spacing from emoji

      titleLines.forEach((line, index) => {
        const title = new FabricText(line, {
          left: canvasWidth / 2,
          top: titleStartY + (index * titleLineHeight),
          fontSize: titleFontSize,
          fontFamily: slide.titleFontFamily || 'Inter',
          fill: slide.titleColor || '#FFFFFF',
          textAlign: slide.titleAlign || 'center',
          originX: 'center',
          originY: 'center',
          fontWeight: 'bold',
          selectable: false
        });
        canvas.add(title);
      });
    }

    // CONTENT - Professional spacing and layout
    if (slide.content) {
      // Split content into main content and hashtags
      const contentParts = slide.content.split(/(\s*#\w+(?:\s+#\w+)*\s*)$/);
      const mainContent = contentParts[0]?.trim() || '';
      const hashtagsPart = contentParts[1]?.trim() || '';

      const contentFontSize = 32; // Larger, more readable content
      const contentLineHeight = contentFontSize * 1.4;
      const contentStartY = 420; // Professional spacing from title

      // Add main content
      if (mainContent) {
        const contentLines = wrapText(mainContent, contentWidth, contentFontSize, slide.contentFontFamily || 'Inter');
        
        contentLines.forEach((line, index) => {
          const content = new FabricText(line, {
            left: canvasWidth / 2,
            top: contentStartY + (index * contentLineHeight),
            fontSize: contentFontSize,
            fontFamily: slide.contentFontFamily || 'Inter',
            fill: slide.contentColor || '#FFFFFF',
            textAlign: slide.contentAlign || 'center',
            originX: 'center',
            originY: 'center',
            selectable: false
          });
          canvas.add(content);
        });

        // Add hashtags with professional spacing
        if (hashtagsPart) {
          const hashtagStartY = contentStartY + (contentLines.length * contentLineHeight) + 60; // Extra spacing before hashtags
          const hashtags = hashtagsPart.split(/\s+/).filter(tag => tag.startsWith('#'));
          
          // Group hashtags into lines that fit
          const hashtagLines: string[] = [];
          let currentHashtagLine = '';
          
          hashtags.forEach(hashtag => {
            const testLine = currentHashtagLine + (currentHashtagLine ? ' ' : '') + hashtag;
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
              ctx.font = `bold ${contentFontSize}px ${slide.contentFontFamily || 'Inter'}`;
              const testWidth = ctx.measureText(testLine).width;
              
              if (testWidth > contentWidth && currentHashtagLine) {
                hashtagLines.push(currentHashtagLine);
                currentHashtagLine = hashtag;
              } else {
                currentHashtagLine = testLine;
              }
            }
          });
          
          if (currentHashtagLine) {
            hashtagLines.push(currentHashtagLine);
          }

          // Render hashtag lines with black color
          hashtagLines.forEach((line, index) => {
            const hashtagText = new FabricText(line, {
              left: canvasWidth / 2,
              top: hashtagStartY + (index * contentLineHeight),
              fontSize: contentFontSize,
              fontFamily: slide.contentFontFamily || 'Inter',
              fill: '#000000', // Black color for hashtags
              fontWeight: 'bold',
              textAlign: 'center',
              originX: 'center',
              originY: 'center',
              selectable: false
            });
            canvas.add(hashtagText);
          });
        }
      }
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
        canvas.backgroundColor = slide.backgroundColor || colors[i % colors.length];
        
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
    const baseStyle: React.CSSProperties = {
      backgroundColor: slide.backgroundColor || colors[currentSlide % colors.length],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };

    if (slide.backgroundType === 'gradient' && slide.gradient) {
      baseStyle.backgroundImage = slide.gradient;
      baseStyle.backgroundColor = undefined;
    } else if (slide.backgroundType === 'image' && slide.backgroundImage) {
      baseStyle.backgroundImage = `url(${slide.backgroundImage})`;
      baseStyle.backgroundColor = undefined;
      baseStyle.backgroundSize = slide.imageFit || 'cover';
      baseStyle.backgroundPosition = slide.imagePosition || 'center';
    }

    return baseStyle;
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
                    <span className="font-medium text-gray-700">Content</span>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={currentSlideData.title || ''}
                        onChange={(e) => updateSlide(currentSlideData.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Enter slide title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={currentSlideData.titleFontFamily || fontFamilies[0].value}
                        onChange={(e) => updateSlide(currentSlideData.id, { 
                          titleFontFamily: e.target.value,
                          contentFontFamily: e.target.value 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.name} value={font.value}>
                            {font.name} - {font.preview}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {textColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateSlide(currentSlideData.id, { 
                              titleColor: color,
                              contentColor: color 
                            })}
                            className={`w-8 h-8 rounded-md border-2 ${
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
                  <div className="p-3 border-t border-gray-200">
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
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div className="relative">
            {/* Preview - 540x540 (scaled down from 1080x1080 for display) */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
              style={{
                width: '540px',
                height: '540px',
              }}
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
                
                {/* Content Layer - EXACT POSITIONING TO MATCH CANVAS */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  {currentSlideData.emoji && (
                    <div 
                      className="absolute text-4xl"
                      style={{ top: '60px' }} // Scaled for 540px preview (120px / 2)
                    >
                      {currentSlideData.emoji}
                    </div>
                  )}
                  
                  {currentSlideData.title && (
                    <h2
                      className="absolute text-2xl font-bold text-center w-full px-6 leading-tight"
                      style={{
                        top: '110px', // Scaled for 540px preview (220px / 2)
                        fontFamily: currentSlideData.titleFontFamily || fontFamilies[0].value,
                        color: currentSlideData.titleColor || '#FFFFFF',
                        textAlign: currentSlideData.titleAlign || 'center',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto'
                      }}
                    >
                      {currentSlideData.title}
                    </h2>
                  )}
                  
                  {currentSlideData.content && (
                    <div
                      className="absolute text-base w-full px-6 leading-relaxed"
                      style={{
                        top: '210px', // Scaled for 540px preview (420px / 2)
                        fontFamily: currentSlideData.contentFontFamily || fontFamilies[0].value,
                        color: currentSlideData.contentColor || '#FFFFFF',
                        textAlign: currentSlideData.contentAlign || 'center',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        maxHeight: '200px',
                        overflow: 'hidden'
                      }}
                    >
                      <FormattedContent content={currentSlideData.content} />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Slide indicator */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
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