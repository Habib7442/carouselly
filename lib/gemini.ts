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
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateCarousel(request: CarouselRequest): Promise<CarouselSlide[]> {
    const prompt = this.buildPrompt(request);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseCarouselResponse(text);
    } catch (error) {
      console.error('Error generating carousel:', error);
      throw new Error('Failed to generate carousel content');
    }
  }

  private buildPrompt(request: CarouselRequest): string {
    const { topic, mode, slideCount, tone } = request;
    
    const modeInstructions = {
      educational: 'Create educational content that teaches something valuable',
      listicle: 'Create a list-based carousel with actionable tips or insights',
      storytelling: 'Tell a compelling story with a clear beginning, middle, and end',
      'case-study': 'Present a detailed case study with problem, solution, and results',
      motivational: 'Create inspiring and motivational content that encourages action'
    };

    return `
Create an Instagram carousel about "${topic}" in ${mode} format with exactly ${slideCount} slides.

Requirements:
- Tone: ${tone}
- Each slide should be engaging and Instagram-optimized
- Include relevant emojis for each slide
- Keep text concise (max 2-3 sentences per slide)
- Make it visually appealing and shareable
- ${modeInstructions[mode]}

Format your response as JSON with this exact structure:
{
  "slides": [
    {
      "id": "slide-1",
      "title": "Slide Title",
      "content": "Slide content here",
      "emoji": "📚",
      "backgroundColor": "#FF6B6B"
    }
  ]
}

Use these background colors in rotation: #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #98D8C8, #F7DC6F

Make sure the JSON is valid and properly formatted.
    `;
  }

  private parseCarouselResponse(response: string): CarouselSlide[] {
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      
      const parsed = JSON.parse(jsonString);
      return parsed.slides || [];
    } catch (error) {
      console.error('Error parsing carousel response:', error);
      // Fallback: create slides from plain text
      return this.createFallbackSlides(response);
    }
  }

  private createFallbackSlides(text: string): CarouselSlide[] {
    const lines = text.split('\n').filter(line => line.trim());
    const slides: CarouselSlide[] = [];
    
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      slides.push({
        id: `slide-${i + 1}`,
        title: `Slide ${i + 1}`,
        content: lines[i].trim(),
        emoji: '📝',
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5]
      });
    }
    
    return slides;
  }

  async optimizeHeadline(headline: string): Promise<string> {
    const prompt = `
Optimize this Instagram carousel headline for maximum engagement: "${headline}"

Requirements:
- Make it more compelling and click-worthy
- Keep it under 125 characters
- Use power words and emotional triggers
- Make it Instagram-friendly
- Maintain the original meaning

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
}

export const geminiGenerator = new GeminiCarouselGenerator(); 