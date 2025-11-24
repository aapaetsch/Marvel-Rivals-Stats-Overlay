# Changelog
All notable changes to this overwolf project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Player Stats Overlay: Fixed settings not applying correctly to teammate cards after implementing slot-based tracking. Settings now properly map to the correct teammate position.

### Added
- In-House Ads System:
  - Created customizable in-house advertisement system that can be displayed alongside Overwolf ads
  - Configurable ad definitions in `lib/inHouseAds.ts` with support for horizontal, vertical, and in-game formats
  - InHouseAdComponent for rendering custom ads with dynamic content and character backgrounds
  - Auto-switching between Overwolf ads and in-house ads with configurable intervals
  - Dev Tools "Ad Manager" tab for previewing and testing in-house ads in different container sizes
  - Support for multiple ad sizes: 780x90, 728x90, 400x60, 400x300, 400x600, 300x600, 300x250, 160x600
- Ad Auto-Refresh Feature:
  - Implemented automatic ad rotation/refresh system with configurable intervals
  - Added settings for enabling/disabling ad auto-refresh in General Settings
  - Configurable refresh interval (1-30 minutes) with default set to 5 minutes
  - Ads automatically remount on the specified interval to display new advertisements
  - Settings are persisted and synchronized across all ad containers in the application
- Overwolf Ads SDK integration:
  - Implemented AdContainer component for displaying ads with proper lifecycle management
  - Horizontal ad placeholder (728x90) in desktop screen footer  
  - In-game ad container (400x60) integrated into the game overlay
  - Vertical ad placeholders (300x600) in Match History and Favourites pages
  - TypeScript types for Overwolf Ads SDK to prevent type errors
  - Window state management to properly handle ad pause/resume on minimize/restore
  - Ad containers are conditional based on user subscription status (premium users see no ads)
  - **Development house ads**: Fallback advertisements that show during development when Overwolf ads fail to load
    - Beautiful character icon backgrounds using Marvel Rivals hero images
    - Localized content with title, subtitle, and call-to-action button
    - Responsive designs for horizontal, vertical, and in-game ad formats
    - Professional styling with gradient backgrounds and hover effects
    - DEV badge indicators to distinguish from live ads

### Changed
### Added
- Recent Players: Implemented accurate character pick tracking with per-character play-time and K/D/A statistics. The system now captures timestamped roster events during matches, calculates time-spent and stat-deltas when characters change, and aggregates detailed character history into recent player records at match end.
- Live Match: Combined "Card View" and "Match Table" into a single "Live Match" menu item with a toggle to switch between card and table views.
- Favourites Page: New dedicated page for viewing all favourited players with aggregated stats, individual player cards showing detailed statistics, and reserved space for future ad placements.
- Player Stats Overlay: Implemented slot-based player tracking system to properly handle teammate replacements during matches. When a player leaves and is replaced, the new player's card appears in the same position with the same style settings (expanded/compact/ultra) as the previous player.

### Changed
- Settings Screen: Tabs are now fixed/sticky to the top of the screen for easier navigation.
- Settings Screen: Removed Advanced Settings tab to simplify the interface.
- Settings Screen: Converted accordion sections to static, always-visible sections that can be scrolled into view.
- Recent Players [#36]: Removed border around the main Recent Players page card container.
- Recent Players [#39]: Switched Recent Players to a 3-column vertical layout (round-robin distribution) so expanding a player card only affects its column. Preserves left→right by-row ordering and prevents empty whitespace under sibling cards when expanding/collapsing.
- Recent Players [#37]: Pagination controls/icons styled for dark themes (white icons/text).
– Match Cards (Front/Back): Increased player and character name font sizes by 0.25rem.
– Team Headers: Reduced vertical padding and internal spacing to make headers slightly shorter.

### Fixed
- Character Swap Bar: Deduplicated identical swaps (same player + old -> new) so a swap only displays once even if multiple events fire; refreshed duration instead of duplicating.
- Character Swap Bar: Corrected ally/enemy color assignment by normalizing team numbers and using stable team equality with local player.
- Character Swap Bar: Added gamer tag under the center swap icon to verify who the swap is registered to.
- Match Stats: Preserve `map`, `gameMode`, and `gameType` when a new `match_start` event arrives so they are recorded correctly even if provided slightly before the start event.
- Character Swap Bar: Team-scoped de-duplication using `team:uid:old:new` keys to prevent rendering a second row when the same player+previous→new combo is already in use.
- Final Hits Tracking: Completely removed throttling for kill_feed event batches to ensure every kill_feed event is processed and counted. Only duplicate kill events (same attacker-victim pair within 100ms) are filtered out, allowing accurate tracking of rapid multi-kills (double/triple kills).
- Horizontal Advertisement Placeholder: Added a persistent horizontal advertisement placeholder at the bottom of the desktop screen that appears across all screens/pages. The placeholder spans the full width with configurable height and is styled consistently with the existing vertical ad placeholders from the favorites page.

### Changed
- Recent Players [#36]: Removed border around the main Recent Players page card container.
- Recent Players [#39]: Switched Recent Players to a 3-column vertical layout (round-robin distribution) so expanding a player card only affects its column. Preserves left→right by-row ordering and prevents empty whitespace under sibling cards when expanding/collapsing.
- Recent Players [#37]: Pagination controls/icons styled for dark themes (white icons/text).
– Match Cards (Front/Back): Increased player and character name font sizes by 0.25rem.
– Team Headers: Reduced vertical padding and internal spacing to make headers slightly shorter.
- Card View: Menu label changed from "Card View" to "Live Match Cards" to better reflect functionality.

### Added
- Recent Players [#35]: Cards now start collapsed by default.
- Recent Players [#52]: Collapsed cards display win% and W/L rows under each section label; also visible per section when the card is collapsed.
- Recent Players [#37]: Top‑bar pagination and a working "Cards per page" selector.
- Card View: Cover overlay that appears when no live match is active, with different messaging for no match vs ended match.
- Menu: Live match indicator (red pulsing dot) on Card View menu item when a match is currently in progress.
- Dev Tools: Toggle control for manually overriding card view cover visibility for testing purposes.
- Live Match / Card View [#63]: Added cover overlay that appears when no live match is active (also overlays Match Table). Includes messaging for no-live-match vs ended-match, and prevents scrolling while visible.
- Menu [#63]: Renamed Card View to "Live Match" and added a live-match indicator (red pulsing dot) on the menu item when a match is in progress.
- Dev Tools [#63]: Replaced boolean toggle with a tri-state (Auto / Show / Hide) override in App Status for testing the cover behavior.
- Recent Players [#50]: Introduced `PlayerEncounterSection` reusable component for Opponent/Teammate sections.
- Dev Tools: Added Player Stats Test Widget in Overrides tab for testing player stats overlay with configurable player data and quick presets.
### Added
- Recent Players: Front-of-card updates and expanded view enhancements.

### Changed
- Recent Players: Header layout alignment (name top-aligned with avatar; last seen bottom-aligned with avatar).
- Recent Players: Reduced card body padding by half for tighter layout.
- Recent Players: Count badge text color set to white for better contrast.
- Recent Players: Win/Loss text positioned closer to gauges in collapsed view.

### Details
- Added overall W/L (opponent + teammate) under player name.
- Expanded side now shows a 3-column layout: role W/L (Vanguard/Duelist/Strategist), gauge, and side overall W/L, while keeping hero icon snapshots and making detailed lists scrollable.
