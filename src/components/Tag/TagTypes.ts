export enum TagType {
  Neutral = 'neutral',
  Primary = 'primary',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
  Info = 'info',
}

export type TagSize = 'small' | 'medium' | 'large';

export interface TagProps {
  children: React.ReactNode;
  size?: TagSize;
  type?: TagType;
  color?: string; // custom background color (hex, rgb, var())
  icon?: React.ReactElement;
  noIcon?: boolean; // when true, don't render an icon
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}