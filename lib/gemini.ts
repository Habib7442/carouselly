import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface CarouselSlide {
  id: string;
  title: string;
  content: string;
  emoji?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImageOpacity?: number;
  backgroundImageFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  backgroundImagePosition?: string;
  backgroundImageX?: string;
  backgroundImageY?: string;
  textPositionX?: string;
  textPositionY?: string;
  template?: string;
  textColor?: string;
  titleColor?: string;
  fontFamily?: string;
  titleFontFamily?: string;
  fontSize?: string;
  titleFontSize?: string;
  backgroundType?: 'color' | 'gradient' | 'pattern' | 'image';
  gradient?: string;
  textAlign?: 'left' | 'center' | 'right';
  titleAlign?: 'left' | 'center' | 'right';
  padding?: string;
  borderRadius?: string;
  shadow?: string;
  _originalBackground?: string; // Internal flag for storage optimization
  hashtags?: string[]; // Array of hashtags with different colors
  isList?: boolean; // Flag to indicate if content should be formatted as a list
  listItems?: string[]; // Array of list items
}

export interface CarouselRequest {
  topic: string;
  mode: 'educational' | 'listicle' | 'storytelling' | 'case-study' | 'motivational';
  slideCount: number;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative';
}

export class GeminiCarouselGenerator {
  private model;

  constructor() {
    // Use the stable gemini-pro model instead of experimental version
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateCarousel(request: CarouselRequest): Promise<CarouselSlide[]> {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
    }

    const prompt = this.buildPrompt(request);
    
    try {
      console.log('Generating carousel with Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      return this.parseCarouselResponse(text);
    } catch (error: any) {
      console.error('Detailed Gemini API error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Google Gemini API key configuration.');
      } else if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Google Cloud billing and quotas.');
      } else if (error.message?.includes('403')) {
        throw new Error('API access denied. Please ensure your API key has the correct permissions and billing is enabled.');
      } else if (error.message?.includes('404')) {
        throw new Error('Model not found. The Gemini model may not be available in your region.');
      } else {
        throw new Error(`Failed to generate carousel content: ${error.message || 'Unknown error'}`);
      }
    }
  }

  private buildPrompt(request: CarouselRequest): string {
    const { topic, mode, slideCount, tone } = request;
    
    const modeInstructions = {
      educational: 'Create educational content that teaches valuable concepts step-by-step. Use clear explanations and actionable insights.',
      listicle: 'Create a numbered list with actionable tips or insights. Each slide should have a clear list item with practical value.',
      storytelling: 'Tell a compelling narrative with emotional hooks, relatable characters, and a satisfying conclusion.',
      'case-study': 'Present a detailed real-world example with clear problem identification, solution implementation, and measurable results.',
      motivational: 'Create inspiring content that sparks action. Use powerful language, success stories, and empowering calls-to-action.'
    };

    const toneInstructions = {
      professional: 'Use sophisticated language, industry terminology, and authoritative voice. Focus on credibility and expertise.',
      casual: 'Use conversational language, contractions, and friendly tone. Make it feel like talking to a friend.',
      friendly: 'Use warm, approachable language with positive energy. Include encouraging words and supportive messaging.',
      authoritative: 'Use confident, decisive language with strong statements. Position as an expert with definitive guidance.'
    };

    const listFormatting = mode === 'listicle' ? `
- For listicle format, use "isList": true and provide "listItems" array
- Each list item should be concise and actionable (max 1-2 sentences)
- Number or bullet the items naturally in the content` : '';

    return `
Create a high-engagement Instagram and LinkedIn carousel about "${topic}" in ${mode} format with exactly ${slideCount} slides.

TONE REQUIREMENTS:
${toneInstructions[tone]}

CONTENT REQUIREMENTS:
- ${modeInstructions[mode]}
- Each slide should be highly engaging and social media optimized
- Include relevant, eye-catching emojis for each slide
- Keep text concise but impactful (max 3-4 sentences per slide)
- Use power words and emotional triggers
- Make it visually appealing and highly shareable
- Include relevant hashtags where appropriate${listFormatting}

FORMATTING REQUIREMENTS:
- For regular content: use "content" field with full text
- For listicle: use "isList": true and "listItems" array with individual points
- Include "hashtags" array with 3-5 relevant hashtags per slide (use different categories: niche, broad, trending)
- Hashtags should be strategic mix of: niche-specific, broad reach, and trending tags

Format your response as JSON with this exact structure:
{
  "slides": [
    {
      "id": "slide-1",
      "title": "Compelling Hook Title",
      "content": "Engaging content here...",
      "emoji": "🚀",
      "backgroundColor": "#FF6B6B",
      "hashtags": ["#specificniche", "#broaderreach", "#trending"],
      "isList": false
    },
    {
      "id": "slide-2",
      "title": "List Title (if applicable)",
      "content": "Brief intro to the list...",
      "listItems": ["First actionable tip", "Second valuable insight", "Third practical advice"],
      "emoji": "📝",
      "backgroundColor": "#4ECDC4",
      "hashtags": ["#tips", "#howto", "#productivity"],
      "isList": true
    }
  ]
}

BACKGROUND COLORS (use in rotation): #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #98D8C8, #F7DC6F, #FFB6C1, #87CEEB

IMPORTANT: Make sure the JSON is valid and properly formatted. Focus on creating viral-worthy content that stops the scroll!
    `;
  }

  private parseCarouselResponse(response: string): CarouselSlide[] {
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      
      const parsed = JSON.parse(jsonString);
      const slides = parsed.slides || [];
      
      // Process each slide to enhance formatting
      return slides.map((slide: any) => this.enhanceSlideFormatting(slide));
    } catch (error) {
      console.error('Error parsing carousel response:', error);
      console.log('Raw response:', response);
      // Fallback: create slides from plain text
      return this.createFallbackSlides(response);
    }
  }

  private enhanceSlideFormatting(slide: any): CarouselSlide {
    let enhancedContent = slide.content || '';

    // If it's a list slide, format the content with list items
    if (slide.isList && slide.listItems && Array.isArray(slide.listItems)) {
      const listContent = slide.listItems
        .map((item: string, index: number) => `${index + 1}. ${item}`)
        .join('\n\n');
      enhancedContent = slide.content ? `${slide.content}\n\n${listContent}` : listContent;
    }

    // Add hashtags to content if they exist
    if (slide.hashtags && Array.isArray(slide.hashtags) && slide.hashtags.length > 0) {
      const hashtagString = slide.hashtags.join(' ');
      enhancedContent = `${enhancedContent}\n\n${hashtagString}`;
    }

    return {
      id: slide.id || `slide-${Date.now()}`,
      title: slide.title || '',
      content: enhancedContent,
      emoji: slide.emoji || '✨',
      backgroundColor: slide.backgroundColor || '#FF6B6B',
      hashtags: slide.hashtags || [],
      isList: slide.isList || false,
      listItems: slide.listItems || [],
      textAlign: slide.isList ? 'left' : 'center',
      titleAlign: 'center'
    };
  }

  private createFallbackSlides(text: string): CarouselSlide[] {
    const lines = text.split('\n').filter(line => line.trim());
    const slides: CarouselSlide[] = [];
    
    // Create a basic carousel if API response parsing fails
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const emojis = ['🚀', '💡', '📈', '✨', '🎯'];
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      slides.push({
        id: `slide-${i + 1}`,
        title: `Slide ${i + 1}`,
        content: lines[i].trim() || 'Add your content here...',
        emoji: emojis[i % emojis.length],
        backgroundColor: colors[i % colors.length]
      });
    }
    
    // If no content, create a default slide
    if (slides.length === 0) {
      slides.push({
        id: 'slide-1',
        title: 'Welcome to Your Carousel',
        content: 'Start editing to create amazing content!',
        emoji: '✨',
        backgroundColor: '#FF6B6B'
      });
    }
    
    return slides;
  }

  async optimizeHeadline(headline: string): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return headline;
    }

    const prompt = `
Optimize this social media carousel headline for maximum engagement: "${headline}"

Requirements:
- Make it more compelling and click-worthy
- Keep it under 125 characters
- Use power words and emotional triggers (Transform, Discover, Master, Unlock, Proven, Secret, Ultimate)
- Add emotional hooks (urgency, curiosity, benefit)
- Make it social media friendly with emojis where appropriate
- Maintain the original meaning
- Focus on benefits and outcomes

Return only the optimized headline, nothing else.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error optimizing headline:', error);
      return headline;
    }
  }

  async enhanceSlideContent(content: string, tone: string): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return content;
    }

    const prompt = `
Enhance this slide content for maximum social media engagement: "${content}"

Tone: ${tone}
Requirements:
- Make it more engaging and action-oriented
- Keep it concise but impactful (max 3-4 sentences)
- Add relevant emojis naturally
- Use power words and emotional triggers
- Include a subtle call-to-action if appropriate
- Make it shareable and relatable
- Maintain the core message

Return only the enhanced content, nothing else.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error enhancing content:', error);
      return content;
    }
  }
}

export const geminiGenerator = new GeminiCarouselGenerator();