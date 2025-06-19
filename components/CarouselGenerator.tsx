'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  List, 
  Heart, 
  TrendingUp, 
  Users,
  Wand2,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { geminiGenerator, CarouselRequest, CarouselSlide } from '@/lib/gemini';

interface CarouselGeneratorProps {
  onGenerate: (slides: CarouselSlide[]) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const modes = [
  {
    id: 'educational' as const,
    name: 'Educational',
    description: 'Teach something valuable',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 'listicle' as const,
    name: 'Listicle',
    description: 'List-based tips & insights',
    icon: List,
    color: 'bg-green-500'
  },
  {
    id: 'storytelling' as const,
    name: 'Storytelling',
    description: 'Compelling narrative',
    icon: Heart,
    color: 'bg-purple-500'
  },
  {
    id: 'case-study' as const,
    name: 'Case Study',
    description: 'Problem → Solution → Results',
    icon: TrendingUp,
    color: 'bg-orange-500'
  },
  {
    id: 'motivational' as const,
    name: 'Motivational',
    description: 'Inspire and encourage',
    icon: Sparkles,
    color: 'bg-pink-500'
  }
];

const tones = [
  { id: 'professional' as const, name: 'Professional', emoji: '💼' },
  { id: 'casual' as const, name: 'Casual', emoji: '😊' },
  { id: 'friendly' as const, name: 'Friendly', emoji: '🤝' },
  { id: 'authoritative' as const, name: 'Authoritative', emoji: '🎯' }
];

const quickPrompts = [
  "5 productivity hacks for entrepreneurs",
  "Why personal branding matters in 2024",
  "Common mistakes new freelancers make",
  "How to build a morning routine",
  "Social media trends to watch",
  "Tips for better work-life balance"
];

export default function CarouselGenerator({ onGenerate, isGenerating, setIsGenerating }: CarouselGeneratorProps) {
  const [formData, setFormData] = useState<CarouselRequest>({
    topic: '',
    mode: 'educational',
    slideCount: 7,
    tone: 'professional'
  });
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic for your carousel');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      console.log('Starting carousel generation...');
      const slides = await geminiGenerator.generateCarousel(formData);
      console.log('Carousel generated successfully:', slides);
      onGenerate(slides);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setError(error.message || 'Failed to generate carousel. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectQuickPrompt = (prompt: string) => {
    setFormData(prev => ({ ...prev, topic: prompt }));
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Compact Header */}
      <div className="text-center p-6 pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3">
          <Wand2 className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Carouselly AI Generator
        </h2>
        <p className="text-gray-600 text-sm">
          Create engaging Instagram and LinkedIn carousels in seconds with AI
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="px-6 pb-6">
        {/* Two Column Layout for Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Topic */}
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                What&apos;s your topic? 💭
              </label>
              <textarea
                value={formData.topic}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, topic: e.target.value }));
                  setError('');
                }}
                placeholder="Enter your topic or idea...

Examples:
• How to grow your Instagram following
• 5 productivity tips for remote workers  
• My journey from 0 to 10k followers"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none text-sm"
                rows={4}
              />
            </div>
            
            {/* Compact Quick Prompts */}
            <div>
              <p className="text-xs text-gray-500 mb-2">💡 Or try these popular topics:</p>
              <div className="grid grid-cols-1 gap-1">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => selectQuickPrompt(prompt)}
                    className="px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors text-left border border-gray-200 hover:border-purple-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-4">
            {/* Style Selection - Compact */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Choose your style
              </label>
              <div className="grid grid-cols-1 gap-2">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setFormData(prev => ({ ...prev, mode: mode.id }))}
                      className={`p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                        formData.mode === mode.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-8 h-8 ${mode.color} rounded-lg`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm">{mode.name}</h3>
                        <p className="text-xs text-gray-600">{mode.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings Row - Compact */}
            <div className="grid grid-cols-2 gap-4">
              {/* Slide Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slides: {formData.slideCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={formData.slideCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, slideCount: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {tones.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setFormData(prev => ({ ...prev, tone: tone.id }))}
                      className={`p-2 rounded-md border transition-all text-center ${
                        formData.tone === tone.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm mb-1">{tone.emoji}</div>
                      <div className="text-xs font-medium">{tone.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button - Always Visible */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <motion.button
            onClick={handleGenerate}
            disabled={!formData.topic.trim() || isGenerating}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating your carousel...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Carousel
              </div>
            )}
          </motion.button>

          {/* Compact Features */}
          <div className="flex justify-center items-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              AI-Powered
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Multi-Platform
            </div>
            <div className="flex items-center gap-1">
              <Wand2 className="h-3 w-3" />
              Fully Editable
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}