# Match Tab New - Card View Component

This component provides an alternative card-based view for displaying match statistics with interactive flip animations.

## Features

- **Card-based Layout**: 2 rows of 6 cards displaying team and player information
- **Interactive Flip Animation**: Click cards to see detailed final hits breakdown
- **Team Differentiation**: Visual distinction between friendly and enemy teams
- **Responsive Design**: Adapts to different screen sizes
- **Accessible**: Keyboard navigation and screen reader support

## Components

### Main Components
- `MatchTabNew.tsx` - Main container component
- `MatchCardGrid.tsx` - Grid layout manager
- `TeamSection.tsx` - Team grouping and header
- `PlayerCard.tsx` - Individual player card with flip functionality

### Content Components
- `PlayerCardFront.tsx` - Main stats display
- `PlayerCardBack.tsx` - Final hits breakdown
- `CharacterAvatar.tsx` - Character icon display
- `KDADisplay.tsx` - Kills/Deaths/Assists formatting
- `PlayerStats.tsx` - Damage, healing, blocked stats
- `StatRow.tsx` - Individual stat row component

### Utilities
- `useCardFlip.ts` - Hook for managing card flip state
- `MatchCardTypes.ts` - TypeScript interfaces
- CSS files for styling and animations

## Usage

The component automatically integrates with the existing Redux store and displays:
- Real match data when available
- Dummy data for testing/preview when no match is active

## Styling

- Respects existing theme system (dark/light/minimalistic)
- Team-based color coding (green for friendly, red for enemy)
- Smooth 3D flip animations
- Hover effects and focus states

## Translation Support

Supports internationalization with keys under `components.desktop.match-tab-new` namespace.