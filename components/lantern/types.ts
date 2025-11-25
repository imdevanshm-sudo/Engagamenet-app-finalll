export interface Message {
  id: string;
  sender: string;
  text: string;
  // Depth simulates 3D space: 'far' (background), 'mid', 'near' (foreground)
  depth: 'far' | 'mid' | 'near';
  // Horizontal starting position (0-100%)
  xValues: number;
  // Animation duration in seconds (speed)
  speed: number;
  // Animation delay in seconds
  delay: number;
}

export enum ViewState {
  HOME = 'HOME',
  MESSAGES = 'MESSAGES',
  SCHEDULE = 'SCHEDULE',
  FAMILY = 'FAMILY'
}

export interface LanternProps {
  message: Message;
  onClick: (message: Message) => void;
  isRevealed?: boolean;
  variant?: 'floating' | 'grid';
  label?: string;
}