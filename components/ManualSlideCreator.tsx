'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Type, Palette, Smile, Edit3 } from 'lucide-react';
import { CarouselSlide } from '@/lib/gemini';

interface ManualSlideCreatorProps {
  onCreateSlides: (slides: CarouselSlide[]) => void;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#FF8A80', '#82B1FF', '#B39DDB', '#A5D6A7'
];

const emojiCategories = {
  'Business': ['💼', '📊', '💰', '🎯', '📈', '🚀', '💡', '⚡'],
  'Education': ['📚', '🎓', '✏️', '📝', '🧠', '💭', '🔍', '📖'],
  'Lifestyle': ['☕', '🏠', '🌱', '🧘', '💪', '🎨', '🍃', '✨'],
  'Technology': ['💻', '📱', '⚙️', '🔧', '🌐', '🔒', '📡', '🤖'],
  'Health': ['❤️', '🏃', '🥗', '💊', '🧘‍♀️', '🏥', '🩺', '💚'],
  'Social': ['👥', '🤝', '💬', '📢', '🌟', '🎉', '👏', '🔥']
};

export default function ManualSlideCreator({ onCreateSlides }: ManualSlideCreatorProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([
    {
      id: 'slide-1',
      title: 'Your Title Here',
      content: 'Add your content here...',
      emoji: '✨',
      backgroundColor: colors[0]
    }
  ]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Business');

  const addSlide = () => {
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide Title',
      content: 'Add your content here...',
      emoji: '📝',
      backgroundColor: colors[slides.length % colors.length]
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
  };

  const updateSlide = (index: number, updates: Partial<CarouselSlide>) => {
    const newSlides = slides.map((slide, i) => 
      i === index ? { ...slide, ...updates } : slide
    );
    setSlides(newSlides);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (activeSlide >= newSlides.length) {
      setActiveSlide(newSlides.length - 1);
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index];
    const duplicatedSlide: CarouselSlide = {
      ...slideToClone,
      id: `slide-${Date.now()}`,
      title: `${slideToClone.title} (Copy)`
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicatedSlide);
    setSlides(newSlides);
  };

  const handleCreateCarousel = () => {
    onCreateSlides(slides);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <Type className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Create Your Own Carousel
        </h2>
        <p className="text-gray-600">
          Build your carousel slide by slide with full control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Slide Preview - Fixed on Left */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="relative">
            <div
              className="w-full aspect-square max-w-lg mx-auto relative overflow-hidden rounded-2xl shadow-lg"
              style={{ backgroundColor: slides[activeSlide]?.backgroundColor }}
            >
              <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
                <div className="text-6xl mb-6">
                  {slides[activeSlide]?.emoji}
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-4 leading-tight">
                    {slides[activeSlide]?.title}
                  </h2>
                  <p className="text-lg leading-relaxed">
                    {slides[activeSlide]?.content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Thumbnails - Below Preview */}
          <div className="mt-6">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all ${
                    activeSlide === index
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: slide.backgroundColor }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs p-1">
                    <div className="text-sm">{slide.emoji}</div>
                    <div className="text-[8px] leading-tight text-center truncate w-full">
                      {slide.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Panel - Scrollable on Right */}
        <div className="space-y-6 lg:max-h-[80vh] lg:overflow-y-auto lg:pr-4">
          {/* Slide Info Header */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Slide {activeSlide + 1} of {slides.length}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={addSlide}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Plus className="h-3 w-3" />
                  Add Slide
                </button>
                <button
                  onClick={() => duplicateSlide(activeSlide)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
                <button
                  onClick={() => deleteSlide(activeSlide)}
                  disabled={slides.length <= 1}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Create your slide content manually with full control
            </p>
          </div>

          {/* Editor Controls */}
          <div className="space-y-6">
            {/* Title Editor */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Type className="h-4 w-4 inline mr-2" />
                Slide Title
              </label>
              <input
                type="text"
                value={slides[activeSlide]?.title || ''}
                onChange={(e) => updateSlide(activeSlide, { title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter slide title..."
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Edit3 className="h-4 w-4 inline mr-2" />
                Slide Content
              </label>
              <textarea
                value={slides[activeSlide]?.content || ''}
                onChange={(e) => updateSlide(activeSlide, { content: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter slide content..."
              />
              <div className="mt-2 text-xs text-gray-500">
                {slides[activeSlide]?.content?.length || 0} characters
              </div>
            </div>

            {/* Emoji Picker */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Smile className="h-4 w-4 inline mr-2" />
                Emoji
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center gap-3 hover:border-gray-400 transition-colors"
                >
                  <span className="text-2xl">{slides[activeSlide]?.emoji}</span>
                  <span className="text-gray-600">Click to change emoji</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                      {Object.keys(emojiCategories).map((category) => (
                        <button
                          key={category}
                          onClick={() => setActiveEmojiCategory(category)}
                          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                            activeEmojiCategory === category
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {emojiCategories[activeEmojiCategory as keyof typeof emojiCategories].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            updateSlide(activeSlide, { emoji });
                            setShowEmojiPicker(false);
                          }}
                          className="p-2 text-2xl hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Background Color */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Palette className="h-4 w-4 inline mr-2" />
                Background Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSlide(activeSlide, { backgroundColor: color })}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      slides[activeSlide]?.backgroundColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mt-8 text-center">
        <motion.button
          onClick={handleCreateCarousel}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Create Carousel ({slides.length} slides)
        </motion.button>
      </div>
    </div>
  );
} 