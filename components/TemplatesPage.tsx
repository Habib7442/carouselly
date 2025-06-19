'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Heart, 
  Leaf, 
  Sun, 
  Droplets, 
  Activity,
  Upload,
  Image as ImageIcon,
  Play,
  ArrowRight,
  Sparkles,
  Camera,
  Star,
  Zap
} from 'lucide-react';
import { CarouselSlide } from '@/lib/gemini';

interface TemplatesPageProps {
  onSelectTemplate: (slides: CarouselSlide[]) => void;
}

const fitnessTemplate: CarouselSlide[] = [
  {
    id: 'fitness-1',
    title: 'Top 5 Tips for a Healthy Morning',
    content: 'Start your day right with these simple wellness habits',
    emoji: '🌅',
    backgroundColor: '#4ECDC4',
    backgroundType: 'color',
    template: 'fitness'
  },
  {
    id: 'fitness-2',
    title: 'Hydrate First Thing',
    content: 'Drink 16-20oz of water immediately after waking up to kickstart your metabolism',
    emoji: '💧',
    backgroundColor: '#45B7D1',
    backgroundType: 'color',
    template: 'fitness'
  },
  {
    id: 'fitness-3',
    title: '10-Minute Morning Stretch',
    content: 'Gentle stretching improves circulation and reduces morning stiffness',
    emoji: '🧘‍♀️',
    backgroundColor: '#96CEB4',
    backgroundType: 'color',
    template: 'fitness'
  },
  {
    id: 'fitness-4',
    title: 'Protein-Rich Breakfast',
    content: 'Fuel your body with 20-30g of protein to maintain energy levels all morning',
    emoji: '🥗',
    backgroundColor: '#84CC16',
    backgroundType: 'color',
    template: 'fitness'
  },
  {
    id: 'fitness-5',
    title: 'Morning Sunlight',
    content: '10-15 minutes of natural light helps regulate your circadian rhythm',
    emoji: '☀️',
    backgroundColor: '#F59E0B',
    backgroundType: 'color',
    template: 'fitness'
  },
  {
    id: 'fitness-6',
    title: 'Follow for Daily Tips!',
    content: 'Join our community for more wellness content and healthy living inspiration',
    emoji: '💪',
    backgroundColor: '#EF4444',
    backgroundType: 'color',
    template: 'fitness'
  }
];

const businessTemplate: CarouselSlide[] = [
  {
    id: 'business-1',
    title: '5 Secrets to Business Growth',
    content: 'Transform your startup into a thriving business with these proven strategies',
    emoji: '📈',
    backgroundColor: '#1E40AF',
    backgroundType: 'color',
    template: 'business'
  },
  {
    id: 'business-2',
    title: 'Know Your Customer',
    content: 'Deep customer research is the foundation of every successful business strategy',
    emoji: '🎯',
    backgroundColor: '#7C3AED',
    backgroundType: 'color',
    template: 'business'
  },
  {
    id: 'business-3',
    title: 'Focus on Value Creation',
    content: 'Always ask: How can we solve our customers problems better than anyone else?',
    emoji: '💎',
    backgroundColor: '#059669',
    backgroundType: 'color',
    template: 'business'
  },
  {
    id: 'business-4',
    title: 'Build Strong Systems',
    content: 'Scalable processes and systems allow your business to grow without chaos',
    emoji: '⚙️',
    backgroundColor: '#DC2626',
    backgroundType: 'color',
    template: 'business'
  },
  {
    id: 'business-5',
    title: 'Invest in Your Team',
    content: 'Great people build great businesses. Hire slow, fire fast, develop always',
    emoji: '👥',
    backgroundColor: '#EA580C',
    backgroundType: 'color',
    template: 'business'
  },
  {
    id: 'business-6',
    title: 'Ready to Scale?',
    content: 'Follow for more business growth tips and entrepreneurship insights',
    emoji: '🚀',
    backgroundColor: '#BE185D',
    backgroundType: 'color',
    template: 'business'
  }
];

const foodTemplate: CarouselSlide[] = [
  {
    id: 'food-1',
    title: '5-Minute Healthy Breakfast Ideas',
    content: 'Quick, nutritious meals to fuel your busy morning routine',
    emoji: '🍳',
    backgroundColor: '#F97316',
    backgroundType: 'color',
    template: 'food'
  },
  {
    id: 'food-2',
    title: 'Overnight Oats',
    content: 'Prep the night before: oats + milk + fruits + nuts. Wake up to breakfast ready!',
    emoji: '🥣',
    backgroundColor: '#A855F7',
    backgroundType: 'color',
    template: 'food'
  },
  {
    id: 'food-3',
    title: 'Avocado Toast Plus',
    content: 'Whole grain bread + mashed avocado + egg + everything seasoning = perfection',
    emoji: '🥑',
    backgroundColor: '#10B981',
    backgroundType: 'color',
    template: 'food'
  },
  {
    id: 'food-4',
    title: 'Smoothie Bowl',
    content: 'Blend frozen fruits + protein powder + liquid. Top with granola and berries',
    emoji: '🍓',
    backgroundColor: '#EC4899',
    backgroundType: 'color',
    template: 'food'
  },
  {
    id: 'food-5',
    title: 'Greek Yogurt Parfait',
    content: 'Layer yogurt + honey + granola + fresh fruits for a protein-packed start',
    emoji: '🍯',
    backgroundColor: '#F59E0B',
    backgroundType: 'color',
    template: 'food'
  },
  {
    id: 'food-6',
    title: 'More Recipes Coming!',
    content: 'Follow for daily healthy recipe inspiration and cooking tips',
    emoji: '👨‍🍳',
    backgroundColor: '#EF4444',
    backgroundType: 'color',
    template: 'food'
  }
];

const instagramUserTemplate: CarouselSlide[] = [
  {
    id: 'instagram-1',
    title: 'Spotlight Starlet',
    content: 'Bold layouts with dramatic lighting effects to highlight key moments and create stunning visual impact.',
    emoji: '✨',
    backgroundColor: '#1a1a1a',
    backgroundType: 'gradient',
    gradient: `
      radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(255, 20, 147, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(25, 25, 25, 0.9) 50%, rgba(0, 0, 0, 1) 100%)
    `,
    template: 'instagram-user'
  },
  {
    id: 'instagram-2',
    title: 'Behind the Scenes',
    content: 'Share your authentic moments with cinematic flair and professional polish.',
    emoji: '🎬',
    backgroundColor: '#1a1a1a',
    backgroundType: 'gradient',
    gradient: `
      radial-gradient(circle at 40% 30%, rgba(138, 43, 226, 0.25) 0%, transparent 50%),
      radial-gradient(circle at 60% 70%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
      linear-gradient(45deg, rgba(0, 0, 0, 0.85) 0%, rgba(20, 20, 20, 0.95) 100%)
    `,
    template: 'instagram-user'
  },
  {
    id: 'instagram-3',
    title: 'Golden Hour Magic',
    content: 'Capture the perfect lighting with warm tones and dramatic shadows.',
    emoji: '🌅',
    backgroundColor: '#1a1a1a',
    backgroundType: 'gradient',
    gradient: `
      radial-gradient(circle at 50% 30%, rgba(255, 165, 0, 0.3) 0%, transparent 60%),
      radial-gradient(circle at 30% 70%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
      linear-gradient(60deg, rgba(139, 69, 19, 0.6) 0%, rgba(0, 0, 0, 0.9) 100%)
    `,
    template: 'instagram-user'
  },
  {
    id: 'instagram-4',
    title: 'Mood & Vibes',
    content: 'Express your personality with bold colors and striking visual elements.',
    emoji: '💫',
    backgroundColor: '#1a1a1a',
    backgroundType: 'gradient',
    gradient: `
      radial-gradient(circle at 25% 25%, rgba(255, 0, 255, 0.25) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(0, 255, 255, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, rgba(75, 0, 130, 0.7) 0%, rgba(0, 0, 0, 0.95) 100%)
    `,
    template: 'instagram-user'
  },
  {
    id: 'instagram-5',
    title: 'Signature Style',
    content: 'Develop your unique aesthetic with consistent visual branding.',
    emoji: '🎨',
    backgroundColor: '#1a1a1a',
    backgroundType: 'gradient',
    gradient: `
      radial-gradient(circle at 60% 40%, rgba(255, 105, 180, 0.25) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 30, 30, 0.95) 100%)
    `,
    template: 'instagram-user'
  },
  {
    id: 'instagram-6',
    title: 'Follow My Journey',
    content: 'Join me for more stunning content and behind-the-scenes moments.',
    emoji: '⭐',
    backgroundColor: '#1a1a1a',
    backgroundType: 'gradient',
    gradient: `
      radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 60%),
      radial-gradient(circle at 20% 80%, rgba(255, 20, 147, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 1) 100%)
    `,
    template: 'instagram-user'
  }
];

export default function TemplatesPage({ onSelectTemplate }: TemplatesPageProps) {
  const [selectedImages, setSelectedImages] = useState<{[key: string]: string}>({});
  const [selectedTemplate, setSelectedTemplate] = useState<'fitness' | 'business' | 'food' | 'instagram-user'>('instagram-user');
  const [previewSlide, setPreviewSlide] = useState<CarouselSlide>(instagramUserTemplate[0]);

  const templates = {
    'instagram-user': instagramUserTemplate,
    fitness: fitnessTemplate,
    business: businessTemplate,
    food: foodTemplate
  };

  const currentTemplate = templates[selectedTemplate];

  // Ensure preview slide updates when template changes
  useEffect(() => {
    const templateMap = {
      'instagram-user': instagramUserTemplate,
      fitness: fitnessTemplate,
      business: businessTemplate,
      food: foodTemplate
    };
    
    const newTemplate = templateMap[selectedTemplate];
    if (newTemplate && newTemplate.length > 0) {
      const firstSlide = newTemplate[0];
      setPreviewSlide({
        ...firstSlide,
        backgroundImage: selectedImages[firstSlide.id] || undefined
      });
    }
  }, [selectedTemplate, selectedImages]);

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
        
        // Update preview if this is the current preview slide
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

  const applyTemplate = (template: CarouselSlide[]) => {
    // Apply any uploaded images to the template and ensure all properties are preserved
    const updatedTemplate = template.map(slide => ({
      ...slide,
      backgroundImage: selectedImages[slide.id] || undefined,
      // Ensure gradient and backgroundType are preserved
      backgroundType: slide.backgroundType || 'color',
      gradient: slide.gradient || undefined,
      // Set default colors for text
      titleColor: slide.titleColor || '#FFFFFF',
      contentColor: slide.contentColor || '#FFFFFF',
      titleAlign: slide.titleAlign || 'center',
      contentAlign: slide.contentAlign || 'center'
    }));
    
    console.log('Applying template:', updatedTemplate);
    onSelectTemplate(updatedTemplate);
  };

  const getSlideStyle = (slide: CarouselSlide) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: slide.backgroundColor || '#1a1a1a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };

    if (slide.backgroundType === 'gradient' && slide.gradient) {
      baseStyle.background = slide.gradient;
    } else if (slide.backgroundType === 'image' && slide.backgroundImage) {
      baseStyle.backgroundImage = `url(${slide.backgroundImage})`;
      baseStyle.backgroundSize = slide.imageFit || 'cover';
      baseStyle.backgroundPosition = slide.imagePosition || 'center';
    }

    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Professional Templates
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose from our collection of beautifully designed templates or customize them with your own images
            </p>
            
            {/* Template Category Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-lg">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate('instagram-user');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedTemplate === 'instagram-user'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    Instagram User
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate('fitness');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedTemplate === 'fitness'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Dumbbell className="h-4 w-4" />
                    Fitness & Wellness
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate('business');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedTemplate === 'business'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    📈
                    Business Growth
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate('food');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedTemplate === 'food'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    🍳
                    Food & Recipe
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Template Section */}
        <motion.div
          key={selectedTemplate}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${
                selectedTemplate === 'instagram-user' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                selectedTemplate === 'fitness' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                selectedTemplate === 'business' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                selectedTemplate === 'food' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {selectedTemplate === 'instagram-user' && <Star className="h-8 w-8 text-white" />}
                {selectedTemplate === 'fitness' && <Dumbbell className="h-8 w-8 text-white" />}
                {selectedTemplate === 'business' && <span className="text-2xl">📈</span>}
                {selectedTemplate === 'food' && <span className="text-2xl">🍳</span>}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {selectedTemplate === 'instagram-user' && 'Instagram User'}
                  {selectedTemplate === 'fitness' && 'Fitness & Wellness'}
                  {selectedTemplate === 'business' && 'Business Growth'}
                  {selectedTemplate === 'food' && 'Food & Recipe'}
                </h2>
                <p className="text-gray-600">
                  {selectedTemplate === 'instagram-user' && 'Perfect for influencers, content creators, and personal brands with dramatic lighting effects'}
                  {selectedTemplate === 'fitness' && 'Perfect for health coaches, fitness influencers, and wellness brands'}
                  {selectedTemplate === 'business' && 'Ideal for entrepreneurs, business coaches, and growth marketers'}
                  {selectedTemplate === 'food' && 'Great for food bloggers, chefs, and healthy eating advocates'}
                </p>
              </div>
            </div>

            {/* Template Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Slides Preview */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Template Preview</h3>
                
                {/* Large Preview */}
                <div className="mb-6">
                  <div className="relative">
                    <div 
                      className="w-full aspect-square max-w-sm mx-auto relative overflow-hidden rounded-2xl shadow-lg"
                      style={getSlideStyle(previewSlide)}
                    >
                      {selectedImages[previewSlide.id] && (
                        <>
                          {/* Base Image with Instagram User Filters */}
                          <img 
                            src={selectedImages[previewSlide.id]} 
                            alt="Background" 
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                              opacity: selectedTemplate === 'instagram-user' ? 0.7 : 0.4,
                              filter: selectedTemplate === 'instagram-user' 
                                ? 'brightness(0.8) contrast(1.2) saturate(1.1)' 
                                : 'none'
                            }}
                          />
                          
                          {/* Instagram User Dramatic Lighting Effects */}
                          {selectedTemplate === 'instagram-user' && (
                            <>
                              {/* Key Light */}
                              <div 
                                className="absolute inset-0"
                                style={{
                                  background: `
                                    radial-gradient(ellipse 200px 300px at 50% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                                    radial-gradient(circle 150px at 30% 70%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)
                                  `,
                                  mixBlendMode: 'overlay'
                                }}
                              />
                              
                              {/* Dramatic Shadows */}
                              <div 
                                className="absolute inset-0"
                                style={{
                                  background: `
                                    radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)
                                  `,
                                  mixBlendMode: 'multiply'
                                }}
                              />
                            </>
                          )}
                        </>
                      )}
                      
                      {/* Content overlay with proper positioning */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                        <div className="text-4xl mb-4">{previewSlide.emoji}</div>
                        <h3 className="text-xl font-bold text-center mb-3 leading-tight">
                          {previewSlide.title}
                        </h3>
                        <p className="text-sm text-center leading-relaxed opacity-90">
                          {previewSlide.content}
                        </p>
                      </div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={() => {
                        const currentIndex = currentTemplate.findIndex(s => s.id === previewSlide.id);
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentTemplate.length - 1;
                        const prevSlide = currentTemplate[prevIndex];
                        setPreviewSlide({
                          ...prevSlide,
                          backgroundImage: selectedImages[prevSlide.id]
                        });
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => {
                        const currentIndex = currentTemplate.findIndex(s => s.id === previewSlide.id);
                        const nextIndex = currentIndex < currentTemplate.length - 1 ? currentIndex + 1 : 0;
                        const nextSlide = currentTemplate[nextIndex];
                        setPreviewSlide({
                          ...nextSlide,
                          backgroundImage: selectedImages[nextSlide.id]
                        });
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Slide Counter */}
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600">
                      Slide {currentTemplate.findIndex(s => s.id === previewSlide.id) + 1} of {currentTemplate.length}
                    </span>
                  </div>
                </div>

                {/* Template Info */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {currentTemplate.length} professionally designed slides for {
                      selectedTemplate === 'instagram-user' ? 'Instagram content creators and influencers' :
                      selectedTemplate === 'fitness' ? 'fitness and wellness content' :
                      selectedTemplate === 'business' ? 'business growth and entrepreneurship' :
                      selectedTemplate === 'food' ? 'food and recipe content' :
                      'professional content'
                    }
                  </p>
                  <div className="flex justify-center gap-2 text-xs text-gray-500">
                    {selectedTemplate === 'instagram-user' && (
                      <>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Spotlight</span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">Dramatic</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Cinematic</span>
                      </>
                    )}
                    {selectedTemplate === 'fitness' && (
                      <>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Health Tips</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Morning Routine</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Wellness</span>
                      </>
                    )}
                    {selectedTemplate === 'business' && (
                      <>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Growth Tips</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Strategy</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Success</span>
                      </>
                    )}
                    {selectedTemplate === 'food' && (
                      <>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Quick Recipes</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Healthy</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Breakfast</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Customization Options */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Customize with Your Images</h3>
                <p className="text-sm text-gray-600 mb-4">Click on a slide thumbnail to preview it, then upload an image to customize it.</p>
                <div className="space-y-4">
                  {currentTemplate.slice(0, 4).map((slide, index) => (
                    <div 
                      key={slide.id} 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        previewSlide.id === slide.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                      }`}
                      onClick={() => setPreviewSlide({
                        ...slide,
                        backgroundImage: selectedImages[slide.id]
                      })}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={getSlideStyle(slide)}
                      >
                        {slide.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">
                          {slide.title || `Slide ${index + 1}`}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {selectedTemplate === 'instagram-user' ? 'Dramatic lighting effects' : `Slide ${index + 1}`} {previewSlide.id === slide.id && '• Currently Previewing'}
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(slide.id, e)}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
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

            {/* Template Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {selectedTemplate === 'instagram-user' && (
                <>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-800">Spotlight</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl">
                    <Zap className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-pink-800">Dramatic</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <Camera className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-yellow-800">Cinematic</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <Sparkles className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-indigo-800">Professional</p>
                  </div>
                </>
              )}
              {selectedTemplate === 'fitness' && (
                <>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">Health Focus</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-800">Fitness Ready</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <Sun className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-yellow-800">Energizing</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <Leaf className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-800">Wellness</p>
                  </div>
                </>
              )}
              {selectedTemplate === 'business' && (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">📈</span>
                    <p className="text-sm font-medium text-blue-800">Growth Focus</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">🎯</span>
                    <p className="text-sm font-medium text-purple-800">Strategic</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">💎</span>
                    <p className="text-sm font-medium text-green-800">Value-Driven</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">🚀</span>
                    <p className="text-sm font-medium text-orange-800">Scalable</p>
                  </div>
                </>
              )}
              {selectedTemplate === 'food' && (
                <>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">🍳</span>
                    <p className="text-sm font-medium text-orange-800">Quick & Easy</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">🥑</span>
                    <p className="text-sm font-medium text-green-800">Healthy</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">🍓</span>
                    <p className="text-sm font-medium text-red-800">Nutritious</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <span className="text-2xl mx-auto mb-2 block">🍯</span>
                    <p className="text-sm font-medium text-yellow-800">Delicious</p>
                  </div>
                </>
              )}
            </div>

            {/* Use Template Button */}
            <div className="text-center">
              <motion.button
                onClick={() => applyTemplate(currentTemplate)}
                className={`inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-xl transition-all shadow-lg ${
                  selectedTemplate === 'instagram-user' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' :
                  selectedTemplate === 'fitness' ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' :
                  selectedTemplate === 'business' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' :
                  selectedTemplate === 'food' ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' :
                  'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Use This Template</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Create Amazing Carousels?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose any template above, customize it with your own images and content, then export as high-quality images or PDF for Instagram.
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Professional Design</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Instagram Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Fully Customizable</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}