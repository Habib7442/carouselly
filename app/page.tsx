'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Sparkles, Zap, Crown, Wand2, Edit3, Brain, Palette, Camera } from 'lucide-react';
import CarouselGenerator from '@/components/CarouselGenerator';
import ManualSlideCreator from '@/components/ManualSlideCreator';
import TemplatesPage from '@/components/TemplatesPage';
import ProfessionalPage from '@/components/ProfessionalPage';
import { CarouselSlide } from '@/lib/gemini';
import { useCarouselStore } from '@/lib/carousel-store';

type CreationMode = 'ai' | 'manual' | 'edit' | 'templates' | 'professional';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [creationMode, setCreationMode] = useState<CreationMode>('ai');
  
  // Get Zustand store methods
  const { slides, setSlides } = useCarouselStore();

  const handleGenerate = (newSlides: CarouselSlide[]) => {
    console.log('Template selected:', newSlides.length, 'slides');
    console.log('First slide:', newSlides[0]);
    
    // Set slides in Zustand store so editor can access them
    setSlides(newSlides);
    
    // Use router.push instead of window.location for better state preservation
    setTimeout(() => {
      window.location.href = '/editor';
    }, 150);
  };

  const handleManualCreate = (newSlides: CarouselSlide[]) => {
    console.log('Manual slides created:', newSlides.length, 'slides');
    
    // Set slides in Zustand store so editor can access them
    setSlides(newSlides);
    
    // Use router.push instead of window.location for better state preservation
    setTimeout(() => {
      window.location.href = '/editor';
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <Instagram className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">Carouselly</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Carouselly - Instagram Carousel Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Free Plan</span>
              </div>
              
              <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm sm:text-base">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/60 rounded-full mb-4 sm:mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-xs sm:text-sm font-medium text-purple-700">Powered by Google Gemini AI</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 px-4">
            Create Viral
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {' '}Instagram{' '}
            </span>
            Carousels
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Transform your ideas into engaging Instagram carousels in seconds. 
            Choose AI-powered generation or create manually with full control.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 px-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>AI-Generated Content</span>
            </div>
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-500" />
              <span>Manual Creation</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              <span>Instagram Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-green-500" />
              <span>Fully Customizable</span>
            </div>
          </div>
        </motion.div>

        {/* Creation Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg w-full max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <button
                onClick={() => setCreationMode('templates')}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all ${
                  creationMode === 'templates'
                    ? 'bg-white text-green-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">Templates</div>
                  <div className="text-xs opacity-75 hidden sm:block">Professional designs</div>
                </div>
              </button>

              <button
                onClick={() => setCreationMode('professional')}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all ${
                  creationMode === 'professional'
                    ? 'bg-white text-purple-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">Professional</div>
                  <div className="text-xs opacity-75 hidden sm:block">Photoshoot templates</div>
                </div>
              </button>

              <button
                onClick={() => setCreationMode('ai')}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all ${
                  creationMode === 'ai'
                    ? 'bg-white text-purple-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">AI Generate</div>
                  <div className="text-xs opacity-75 hidden sm:block">Let AI create for you</div>
                </div>
              </button>
              
              <button
                onClick={() => setCreationMode('manual')}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all ${
                  creationMode === 'manual'
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">Create Manual</div>
                  <div className="text-xs opacity-75 hidden sm:block">Build from scratch</div>
                </div>
              </button>
              
              <button
                onClick={() => slides.length > 0 && (window.location.href = '/editor')}
                disabled={slides.length === 0}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  creationMode === 'edit'
                    ? 'bg-white text-orange-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">Edit Carousel</div>
                  <div className="text-xs opacity-75 hidden sm:block">{slides.length} slides</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          key={creationMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-16"
        >
          {creationMode === 'templates' && (
            <TemplatesPage
              onSelectTemplate={handleGenerate}
            />
          )}

          {creationMode === 'professional' && (
            <ProfessionalPage
              onSelectTemplate={handleGenerate}
            />
          )}

          {creationMode === 'ai' && (
            <CarouselGenerator
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          )}
          
          {creationMode === 'manual' && (
            <ManualSlideCreator
              onCreateSlides={handleManualCreate}
            />
          )}
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How to Create LinkedIn Carousels?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to create engaging carousels that drive results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Choose Your Method</h3>
              <p className="text-gray-600">
                Select AI generation for quick creation or manual mode for full control over your content.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Create & Customize</h3>
              <p className="text-gray-600">
                Add your content, choose colors, emojis, and customize each slide to match your brand.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Export & Share</h3>
              <p className="text-gray-600">
                Download your carousel as high-quality images or PDF and share on Instagram.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose CarouselAI?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of creators and businesses who trust CarouselAI to create 
              engaging content that drives results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI creates engaging, on-brand content tailored to your audience.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                <Edit3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Manual Control</h3>
              <p className="text-gray-600 text-sm">
                Create from scratch with full control over every element and design choice.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Generate professional carousels in under 30 seconds. No design skills required.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-xl mb-4">
                <Instagram className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Instagram Optimized</h3>
              <p className="text-gray-600 text-sm">
                Perfect dimensions and formatting for maximum Instagram engagement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ creators using CarouselAI to grow their Instagram presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCreationMode('ai')}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Start with AI Generation
            </button>
            <button 
              onClick={() => setCreationMode('manual')}
              className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              Create Manually
            </button>
            <button 
              onClick={() => window.location.href = '/editor'}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30"
            >
              Go to Editor
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 CarouselAI. Built with Next.js, TypeScript, and Google Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
