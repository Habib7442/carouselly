import { NextRequest, NextResponse } from 'next/server';
import { CarouselRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CarouselRequest = await request.json();
    
    // Dynamic import to handle module loading issues
    const { GeminiCarouselGenerator } = await import('@/lib/gemini');
    const generator = new GeminiCarouselGenerator();
    const slides = await generator.generateCarousel(body);
    
    return NextResponse.json({ slides }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Check if it's a module loading error
    if (error.message?.includes('Cannot find module') || error.message?.includes('safe-buffer')) {
      return NextResponse.json(
        { 
          error: 'AI service temporarily unavailable. Module loading issue detected. Please try again later or contact support.',
          details: 'Google AI SDK dependency issue'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate carousel' },
      { status: 500 }
    );
  }
} 