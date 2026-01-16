export interface JourneyNode {
  id: string;
  title: string;
  company?: string;
  date: string; // Format: "YYYY-MM"
  yOffset: number; // -100 to 100, 0 is baseline
  description?: string;
  isEditable?: boolean;
  isEmpty?: boolean;
}

export interface Tag {
  id: string;
  label: string;
  type: 'help' | 'need';
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  currentTitle: string;
  currentIndustry: string;
  dreamTitle: string;
  dreamIndustry: string;
  bio: string;
  journey: JourneyNode[];
  tags: Tag[];
}
