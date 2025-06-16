'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera,
  Upload,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import { CarouselSlide } from '@/lib/gemini';

interface ProfessionalPageProps {
  onSelectTemplate: (slides: CarouselSlide[]) => void;
}

const photoshootTemplate: CarouselSlide[] = [
  {
    id: 'photoshoot-1',
    title: '',
    content: '',
    emoji: '',
    backgroundColor: `
      radial-gradient(circle at 45% 35%, rgba(255, 165, 0, 0.15) 0%, transparent 35%),
      radial-gradient(ellipse at 55% 65%, rgba(218, 165, 32, 0.12) 0%, transparent 40%),
      radial-gradient(circle at center, rgba(139, 69, 19, 0.08) 20%, rgba(25, 25, 25, 0.95) 45%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(45deg, rgba(0, 0, 0, 0.7) 0%, rgba(15, 10, 8, 0.9) 100%)
    `,
    backgroundType: 'gradient',
    template: 'photoshoot'
  },
  {
    id: 'photoshoot-2',
    title: '',
    content: '',
    emoji: '',
    backgroundColor: `
      radial-gradient(circle at 40% 30%, rgba(255, 140, 0, 0.18) 0%, transparent 32%),
      radial-gradient(ellipse at 60% 70%, rgba(205, 133, 63, 0.1) 0%, transparent 38%),
      radial-gradient(circle at center, rgba(160, 82, 45, 0.06) 25%, rgba(18, 18, 18, 0.96) 50%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(135deg, rgba(8, 5, 3, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)
    `,
    backgroundType: 'gradient',
    template: 'photoshoot'
  },
  {
    id: 'photoshoot-3',
    title: '',
    content: '',
    emoji: '',
    backgroundColor: `
      radial-gradient(circle at 50% 40%, rgba(218, 165, 32, 0.16) 0%, transparent 30%),
      radial-gradient(ellipse at 35% 60%, rgba(255, 215, 0, 0.08) 0%, transparent 35%),
      radial-gradient(circle at center, rgba(184, 134, 11, 0.05) 22%, rgba(12, 12, 12, 0.97) 48%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(60deg, rgba(5, 5, 5, 0.85) 0%, rgba(0, 0, 0, 0.98) 100%)
    `,
    backgroundType: 'gradient',
    template: 'photoshoot'
  },
  {
    id: 'photoshoot-4',
    title: '',
    content: '',
    emoji: '',
    backgroundColor: `
      radial-gradient(circle at 42% 38%, rgba(255, 192, 203, 0.12) 0%, transparent 28%),
      radial-gradient(ellipse at 58% 62%, rgba(222, 184, 135, 0.09) 0%, transparent 33%),
      radial-gradient(circle at center, rgba(139, 69, 19, 0.07) 18%, rgba(20, 15, 20, 0.96) 46%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(120deg, rgba(10, 8, 10, 0.82) 0%, rgba(0, 0, 0, 0.97) 100%)
    `,
    backgroundType: 'gradient',
    template: 'photoshoot'
  },
  {
    id: 'photoshoot-5',
    title: '',
    content: '',
    emoji: '',
    backgroundColor: `
      radial-gradient(circle at 48% 32%, rgba(255, 228, 181, 0.14) 0%, transparent 29%),
      radial-gradient(ellipse at 52% 68%, rgba(205, 133, 63, 0.08) 0%, transparent 36%),
      radial-gradient(circle at center, rgba(160, 82, 45, 0.06) 20%, rgba(15, 15, 15, 0.97) 47%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(75deg, rgba(6, 6, 6, 0.87) 0%, rgba(0, 0, 0, 0.96) 100%)
    `,
    backgroundType: 'gradient',
    template: 'photoshoot'
  },
  {
    id: 'photoshoot-6',
    title: '',
    content: '',
    emoji: '',
    backgroundColor: `
      radial-gradient(circle at 46% 36%, rgba(255, 160, 122, 0.13) 0%, transparent 31%),
      radial-gradient(ellipse at 54% 64%, rgba(218, 165, 32, 0.07) 0%, transparent 34%),
      radial-gradient(circle at center, rgba(139, 69, 19, 0.05) 24%, rgba(22, 18, 22, 0.96) 49%, rgba(0, 0, 0, 1) 100%),
      linear-gradient(105deg, rgba(8, 5, 8, 0.84) 0%, rgba(0, 0, 0, 0.98) 100%)
    `,
    backgroundType: 'gradient',
    template: 'photoshoot'
  }
];

export default function ProfessionalPage({ onSelectTemplate }: ProfessionalPageProps) {
  const [selectedImages, setSelectedImages] = useState<{[key: string]: string}>({});
  const [previewSlide, setPreviewSlide] = useState<CarouselSlide>(photoshootTemplate[0]);

  useEffect(() => {
    setPreviewSlide({
      ...photoshootTemplate[0],
      backgroundImage: selectedImages[photoshootTemplate[0].id] || undefined
    });
  }, [selectedImages]);

  const handleImageUpload = (slideId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImages(prev => ({
          ...prev,
          [slideId]: imageUrl
        }));
        
        if (previewSlide.id === slideId) {
          setPreviewSlide(prev => ({
            ...prev,
            backgroundImage: imageUrl
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = () => {
    const updatedTemplate = photoshootTemplate.map(slide => ({
      ...slide,
      backgroundImage: selectedImages[slide.id] || undefined,
      template: 'photoshoot' // Ensure photoshoot template is applied
    }));
    onSelectTemplate(updatedTemplate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Professional Photoshoot Templates
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              World-class cinematic lighting effects for Instagram influencers, actresses, and professional photographers
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Live Preview</h3>
                <div className="mb-6">
                  <div className="relative">
                    <div 
                      className="w-full aspect-square max-w-sm mx-auto relative overflow-hidden rounded-2xl shadow-2xl border border-purple-500/30"
                      style={{ background: previewSlide.backgroundColor }}
                    >
                      {selectedImages[previewSlide.id] && (
                        <>
                          <img 
                            src={selectedImages[previewSlide.id]} 
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
                                radial-gradient(ellipse 300px 400px at 50% 45%, rgba(255, 220, 150, 0.25) 0%, rgba(255, 200, 120, 0.15) 30%, transparent 50%),
                                radial-gradient(ellipse 250px 350px at 48% 42%, rgba(255, 240, 180, 0.2) 0%, rgba(255, 220, 140, 0.1) 25%, transparent 45%),
                                radial-gradient(circle 200px at 52% 48%, rgba(255, 235, 160, 0.18) 0%, transparent 40%)
                              `,
                              mixBlendMode: 'soft-light'
                            }}
                          />
                          
                          {/* Face Highlight Zone */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(ellipse 180px 220px at 50% 40%, rgba(255, 255, 220, 0.15) 0%, rgba(255, 240, 180, 0.08) 35%, transparent 55%)
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
                                radial-gradient(ellipse 220px 280px at 50% 43%, rgba(255, 200, 150, 0.12) 0%, rgba(240, 180, 120, 0.06) 40%, transparent 60%),
                                linear-gradient(45deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.03) 50%, rgba(0, 0, 0, 0.08) 100%)
                              `,
                              mixBlendMode: 'overlay'
                            }}
                          />
                        </>
                      )}
                      
                      {!selectedImages[previewSlide.id] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white/60">
                            <Camera className="h-16 w-16 mx-auto mb-4" />
                            <p className="text-lg font-medium">Upload Professional Photo</p>
                            <p className="text-sm">Experience cinematic lighting</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Upload Professional Photos</h3>
                <div className="space-y-4">
                  {photoshootTemplate.slice(0, 4).map((slide, index) => (
                    <div 
                      key={slide.id} 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        previewSlide.id === slide.id 
                          ? 'bg-purple-900/30 border-purple-500/50' 
                          : 'bg-black/20 border-gray-700/50 hover:bg-gray-900/30'
                      }`}
                      onClick={() => setPreviewSlide({
                        ...slide,
                        backgroundImage: selectedImages[slide.id]
                      })}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center border border-purple-500/30"
                        style={{ background: slide.backgroundColor }}
                      >
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">
                          Frame {index + 1} - Cinematic Lighting
                        </p>
                        <p className="text-gray-400 text-xs">
                          Professional photoshoot frame
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(slide.id, e)}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-600/80 text-white rounded-lg hover:bg-purple-600 transition-colors">
                          {selectedImages[slide.id] ? (
                            <>
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-sm">Change</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">Upload</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={applyTemplate}
                className="inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Use Professional Template</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 