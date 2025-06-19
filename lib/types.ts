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
  titlePositionX?: string;
  titlePositionY?: string;
  contentPositionX?: string;
  contentPositionY?: string;
  emojiPositionX?: string;
  emojiPositionY?: string;
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
  contentColor?: string;
  contentFontFamily?: string;
  contentAlign?: 'left' | 'center' | 'right';
  imageFit?: 'cover' | 'contain' | 'fill';
  imagePosition?: string;
}

export interface CarouselRequest {
  topic: string;
  mode: 'educational' | 'listicle' | 'storytelling' | 'case-study' | 'motivational';
  slideCount: number;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative';
} 