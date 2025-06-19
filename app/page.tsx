'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Sparkles, Zap, Crown, Wand2, Edit3, Brain, Palette, TrendingUp, Users, Target, BarChart3, Rocket, Star, CheckCircle, ArrowRight } from 'lucide-react';
import CarouselGenerator from '@/components/CarouselGenerator';
import ManualSlideCreator from '@/components/ManualSlideCreator';
import TemplatesPage from '@/components/TemplatesPage';
import { CarouselSlide } from '@/lib/gemini';
import { useCarouselStore } from '@/lib/carousel-store';

type CreationMode = 'ai' | 'manual' | 'edit' | 'templates';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [creationMode, setCreationMode] = useState<CreationMode>('ai');
  
  // Get Zustand store methods
  const { slides, setSlides } = useCarouselStore();

  const handleGenerate = (newSlides: CarouselSlide[]) => {
    console.log('Template selected:', newSlides.length, 'slides');
    console.log('Slides with templates:', newSlides.map(s => ({ id: s.id, template: s.template, title: s.title })));
    
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
                <div className="flex items-center gap-1">
                  <Instagram className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">Carouselly</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Instagram & LinkedIn Carousel Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Free Plan</span>
              </div>
              
              <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm sm:text-base">
                Upgrade Pro
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
              {' '}Social Media{' '}
            </span>
            Carousels
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Transform your ideas into engaging Instagram and LinkedIn carousels in seconds. 
            AI-powered content generation meets professional design templates.
          </p>

          {/* Platform Support */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Instagram Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
              <Linkedin className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">LinkedIn Optimized</span>
            </div>
          </div>

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
              <Target className="h-4 w-4 text-green-500" />
              <span>Multi-Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-orange-500" />
              <span>Fully Customizable</span>
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">10,000+</div>
              <div className="text-sm text-gray-600">Carousels Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">50M+</div>
              <div className="text-sm text-gray-600">Views Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">5,000+</div>
              <div className="text-sm text-gray-600">Happy Creators</div>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-sm text-gray-600">4.9/5 from 2,000+ reviews</span>
          </div>
        </motion.div>

        {/* Creation Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg w-full max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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

        {/* Platform Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Perfect for Both Platforms
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create content that works seamlessly across Instagram and LinkedIn with platform-specific optimizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-200">
              <div className="flex items-center gap-3 mb-6">
                <Instagram className="h-8 w-8 text-pink-600" />
                <h3 className="text-2xl font-bold text-gray-800">Instagram</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Perfect 1080×1080 square format</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Visual-first design templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Hashtag optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Story-friendly content</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <Linkedin className="h-8 w-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">LinkedIn</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Professional business content</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Thought leadership templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Industry-specific insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">B2B engagement focus</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How to Create Viral Carousels?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to create engaging carousels that drive results on both platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Choose Your Method</h3>
              <p className="text-gray-600">
                Select AI generation for quick creation, professional templates, or manual mode for full control.
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
                Download your carousel as high-quality images and share on Instagram or LinkedIn.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose Carouselly?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of creators, entrepreneurs, and businesses who trust Carouselly to create 
              engaging content that drives real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI creates engaging, on-brand content tailored to your audience and platform.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Multi-Platform</h3>
              <p className="text-gray-600 text-sm">
                Optimized for both Instagram and LinkedIn with platform-specific best practices.
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Results Driven</h3>
              <p className="text-gray-600 text-sm">
                Templates and AI prompts optimized for maximum engagement and reach.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Loved by Creators Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Carouselly transformed my LinkedIn presence. My engagement increased by 300% in just one month!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Sarah Chen</div>
                  <div className="text-sm text-gray-600">Marketing Director</div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The AI content generation is incredible. It saves me hours every week and the results are amazing."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Mike Rodriguez</div>
                  <div className="text-sm text-gray-600">Content Creator</div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Perfect for both Instagram and LinkedIn. The templates are professional and the customization is endless."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Alex Thompson</div>
                  <div className="text-sm text-gray-600">Entrepreneur</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ creators using Carouselly to grow their Instagram and LinkedIn presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCreationMode('ai')}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Rocket className="h-5 w-5" />
              Start with AI Generation
            </button>
            <button 
              onClick={() => setCreationMode('templates')}
              className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Browse Templates
            </button>
            <button 
              onClick={() => window.location.href = '/editor'}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30 flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              Go to Editor
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Carouselly. Built with Next.js, TypeScript, and Google Gemini AI.</p>
            <p className="mt-2 text-sm">Create viral content for Instagram and LinkedIn with AI-powered carousel generation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}