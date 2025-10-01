import React from 'react';
import icons from '../Icons';
import './Tag.css';
import { TagType, TagProps } from './TagTypes';



// Choose sensible defaults for type -> color and icon mapping
const DEFAULT_TYPE_STYLES: Record<
  TagType,
  { bgVar: string; icon: React.ReactElement; borderVar?: string }
> = {
  [TagType.Neutral]: { bgVar: 'var(--tag-bg-neutral, var(--neutral-4))', icon: icons.matchHistory, borderVar: 'var(--tag-border-neutral, rgba(0,0,0,0.08))' },
  [TagType.Primary]: { bgVar: 'var(--tag-bg-primary, var(--primary-color))', icon: icons.stats, borderVar: 'var(--tag-border-primary, var(--primary-color-dark))' },
  [TagType.Success]: { bgVar: 'var(--tag-bg-success, var(--success-color))', icon: icons.kd ?? icons.kda ?? icons.stats, borderVar: 'var(--tag-border-success, var(--success-color))' },
  [TagType.Warning]: { bgVar: 'var(--tag-bg-warning, var(--secondary-color))', icon: icons.match, borderVar: 'var(--tag-border-warning, var(--secondary-color-dark))' },
  [TagType.Danger]: { bgVar: 'var(--tag-bg-danger, var(--error-color))', icon: icons.death, borderVar: 'var(--tag-border-danger, var(--error-color))' },
  [TagType.Info]: { bgVar: 'var(--tag-bg-info, var(--primary-color-light))', icon: icons.stats, borderVar: 'var(--tag-border-info, var(--primary-color-medium))' },
};

// Simple luminance check to decide on white/black label color for custom backgrounds
function pickTextColorForBackground(bg: string): string {
  // Accepts hex (#rrggbb) or rgb/rgba(...) or CSS var - fallback to white
  try {
    if (bg.startsWith('var(')) return 'var(--primary-color-text)';
    if (bg.startsWith('#')) {
      const hex = bg.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.6 ? '#111' : '#fff';
    }
    if (bg.startsWith('rgb')) {
      const nums = bg.replace(/[^0-9,]/g, '').split(',').map(Number);
      const [r, g, b] = nums;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.6 ? '#111' : '#fff';
    }
  } catch (e) {
    // fallthrough
  }
  return 'var(--primary-color-text)';
}

function toHex(r: number, g: number, b: number) {
  const rr = Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, '0');
  const gg = Math.max(0, Math.min(255, Math.round(g))).toString(16).padStart(2, '0');
  const bb = Math.max(0, Math.min(255, Math.round(b))).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`;
}

function resolveCssVarExpression(expr: string | undefined): string | null {
  if (!expr) return null;
  // expr might be like 'var(--tag-border-primary, #123456)' or a plain value
  const varMatch = expr.match(/var\(\s*([^,\s)]+)\s*(?:,\s*([^)]+)\s*)?\)/);
  if (!varMatch) return expr.trim();
  const varName = varMatch[1];
  const fallback = varMatch[2] ? varMatch[2].trim() : null;
  try {
    if (typeof window === 'undefined' || !window.getComputedStyle) return (fallback || null);
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (resolved) return resolved;
    if (fallback) return fallback;
  } catch (e) {
    // ignore
  }
  return null;
}

function parseRgbString(rgb: string): [number, number, number] | null {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map(p => Number(p.trim()));
  if (parts.length < 3) return null;
  return [parts[0], parts[1], parts[2]];
}

function computeBorderColor(bg: string | undefined, def?: { borderVar?: string }): string {
  // Try to resolve a concrete color from def.borderVar if present
  if (def?.borderVar) {
    const resolved = resolveCssVarExpression(def.borderVar);
    if (resolved) {
      // If resolved looks like a color (hex or rgb), return it
      if (resolved.startsWith('#')) return resolved;
      if (resolved.startsWith('rgb')) {
        const parsed = parseRgbString(resolved);
        if (parsed) return toHex(parsed[0], parsed[1], parsed[2]);
      }
      // If resolved is another var() or empty, fall through to compute from bg
    }
  }

  // If bg is a var() expression, try resolving it to a concrete value
  const resolvedBg = resolveCssVarExpression(bg ?? undefined) || bg;

  try {
    if (!resolvedBg) return '#111111';
    if (resolvedBg.startsWith('#')) {
      const hex = resolvedBg.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const factor = 0.5; // darken by 50% for a much darker border
      return toHex(r * factor, g * factor, b * factor);
    }
    if (resolvedBg.startsWith('rgb')) {
      const nums = parseRgbString(resolvedBg);
      if (nums) {
        const factor = 0.5;
        return toHex(nums[0] * factor, nums[1] * factor, nums[2] * factor);
      }
    }
  } catch (e) {
    // fallthrough
  }
  // Final fallback
  return '#111111';
}

const Tag: React.FC<TagProps> = ({
  children,
  size = 'medium',
  type = TagType.Neutral,
  color,
  icon,
  noIcon = false,
  disabled = false,
  onClick,
  className = '',
  variant = 'filled',
}) => {
  const def = DEFAULT_TYPE_STYLES[type];

  const background = color ?? def.bgVar;
  // label color: if a custom color is provided, compute readable text; otherwise use per-type text variable
  const textColor = color ? pickTextColorForBackground(color) : `var(--tag-text-${type}, var(--primary-color-text))`;
  const finalIcon = icon ?? def.icon;

  const borderColor = computeBorderColor(color ?? def.bgVar, def);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !onClick) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent);
    }
  };

  // Instead of setting background/color directly, set CSS custom properties.
  // For the outlined variant we prefer a transparent background and use the
  // border color as the label color so the outline reads as the primary visual.
  const styles = ({} as unknown) as React.CSSProperties;
  if (typeof variant !== 'undefined' && variant === 'outlined') {
    (styles as any)['--tag-bg'] = 'transparent';
    // Use the border color as the text color for outlined tags so the label
    // matches the outline. borderColor may be a var(...) or hex value.
    (styles as any)['--tag-text'] = borderColor;
    (styles as any)['--tag-border'] = borderColor;
  } else {
    (styles as any)['--tag-bg'] = background;
    (styles as any)['--tag-text'] = textColor;
    (styles as any)['--tag-border'] = borderColor;
  }

  const classes = ['rr-tag', `rr-tag--${size}`, `rr-tag--${type}`, disabled ? 'disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={styles}
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {/* Honor noIcon prop: allow callers to suppress icons for compact tags */}
      {!noIcon && finalIcon ? <span className="rr-tag__icon">{finalIcon}</span> : null}
      <span className="rr-tag__label">{children}</span>
    </div>
  );
};

export default Tag;
