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
  Lightbulb
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
    color: 'bg-blue-500',
    example: 'How to improve productivity'
  },
  {
    id: 'listicle' as const,
    name: 'Listicle',
    description: 'List-based tips & insights',
    icon: List,
    color: 'bg-green-500',
    example: '10 marketing strategies that work'
  },
  {
    id: 'storytelling' as const,
    name: 'Storytelling',
    description: 'Compelling narrative',
    icon: Heart,
    color: 'bg-purple-500',
    example: 'My journey from zero to success'
  },
  {
    id: 'case-study' as const,
    name: 'Case Study',
    description: 'Problem → Solution → Results',
    icon: TrendingUp,
    color: 'bg-orange-500',
    example: 'How we increased sales by 300%'
  },
  {
    id: 'motivational' as const,
    name: 'Motivational',
    description: 'Inspire and encourage',
    icon: Sparkles,
    color: 'bg-pink-500',
    example: 'Why you should never give up'
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
  "Tips for better work-life balance",
  "Building confidence as a creator",
  "Email marketing best practices",
  "Instagram growth strategies that work",
  "Content creation tips for beginners",
  "How to overcome imposter syndrome",
  "Building a successful online business"
];

export default function CarouselGenerator({ onGenerate, isGenerating, setIsGenerating }: CarouselGeneratorProps) {
  const [formData, setFormData] = useState<CarouselRequest>({
    topic: '',
    mode: 'educational',
    slideCount: 7,
    tone: 'professional'
  });

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const slides = await geminiGenerator.generateCarousel(formData);
      onGenerate(slides);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate carousel. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectQuickPrompt = (prompt: string) => {
    setFormData(prev => ({ ...prev, topic: prompt }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Wand2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Carouselly AI Generator
        </h2>
        <p className="text-gray-600">
          Create engaging Instagram carousels in seconds with AI
        </p>
      </div>

      <div className="space-y-8">
        {/* Topic Input */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            What&apos;s your topic? 💭
          </label>
          <textarea
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="Enter your topic, idea, blog post content, or even paste a URL...

Examples:
• How to grow your Instagram following
• 5 productivity tips for remote workers  
• My journey from 0 to 10k followers
• Why you should start a side hustle"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
            rows={6}
          />
          
          {/* Quick Prompts */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-3">💡 Or try these popular topics:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => selectQuickPrompt(prompt)}
                  className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors text-left border border-gray-200 hover:border-purple-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            Choose your style
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => setFormData(prev => ({ ...prev, mode: mode.id }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.mode === mode.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 ${mode.color} rounded-lg mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{mode.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{mode.description}</p>
                  <p className="text-xs text-gray-500 italic">&quot;{mode.example}&quot;</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slide Count */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Number of slides
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="10"
                value={formData.slideCount}
                onChange={(e) => setFormData(prev => ({ ...prev, slideCount: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-2xl font-bold text-purple-600 min-w-[3rem] text-center">
                {formData.slideCount}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Tone of voice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setFormData(prev => ({ ...prev, tone: tone.id }))}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.tone === tone.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{tone.emoji}</div>
                  <div className="text-sm font-medium">{tone.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={!formData.topic.trim() || isGenerating}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating your carousel...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Carousel
            </div>
          )}
        </motion.button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">AI-Powered</h4>
            <p className="text-sm text-gray-600">Smart content generation with Google Gemini</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Instagram Ready</h4>
            <p className="text-sm text-gray-600">Perfect 1080x1080 format for maximum engagement</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Fully Editable</h4>
            <p className="text-sm text-gray-600">Customize colors, text, and emojis to match your brand</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 