# Changelog - Favourites Tab
All notable changes to the Favourites Tab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- FavouritesPage Component: Main page component displaying all favourited players with a sticky header, aggregated statistics section, and scrollable content area [Favourites Page: New dedicated page].
- FavouritePlayerCard Component: Reusable card component for displaying individual favourited players with their avatar (most used character), name, and detailed statistics [Favourites Page: New dedicated page].
- Aggregate Stats Display: Overview section at the top showing total encounters, teammate/opponent encounters, and wins with teammates across all favourited players [Favourites Page: New dedicated page].
- Empty State: User-friendly empty state message when no players are favourited, with instructions on how to add favourites [Favourites Page: New dedicated page].
- Ad Placement Areas: Reserved spaces on the right sidebar and bottom of the page for future advertisement implementation [Favourites Page: New dedicated page].
- Player Statistics: Individual cards show overall win rate, total encounters, teammate win rate with games breakdown, and opponent win rate with games breakdown [Favourites Page: New dedicated page].
- Character Avatar: Each player card displays the avatar of their most played character [Favourites Page: New dedicated page].
- Unfavourite Action: Quick unfavourite button on each player card with confirmation message [Favourites Page: New dedicated page].
- Responsive Design: Grid layout adapts to different screen sizes, hiding right ad space on smaller screens [Favourites Page: New dedicated page].

### Styling
- Theme Compatibility: All components use CSS variables for colors ensuring compatibility with dark and light themes [Favourites Page: New dedicated page].
- Tailwind CSS: Utilized Tailwind classes for spacing, layout, and responsive design where applicable [Favourites Page: New dedicated page].
- Custom Styles: FavouritesPage.css provides custom styling for card layouts, sticky headers, and ad placeholders [Favourites Page: New dedicated page].
- Visual Hierarchy: Clear distinction between header, stats section, and player cards with appropriate spacing [Favourites Page: New dedicated page].
- Hover Effects: Subtle animations on player cards and unfavourite buttons for better user feedback [Favourites Page: New dedicated page].

### Localization
- Translation Strings: Added comprehensive localization strings for all UI elements including title, stats labels, empty state messages, and action confirmations [Favourites Page: New dedicated page].
- i18n Support: All user-facing text uses translation keys for multi-language support [Favourites Page: New dedicated page].

### Integration
- Redux Integration: Connected to recentPlayersReducer to access and filter favourited players [Favourites Page: New dedicated page].
- Menu Routing: Integrated with MenuKeys.FAVORITES in Screen.tsx for navigation [Favourites Page: New dedicated page].
- Character Icons: Utilizes existing characterIcons library for avatar display [Favourites Page: New dedicated page].
- Time Formatting: Uses formatRelativeTime utility for last seen timestamps [Favourites Page: New dedicated page].
