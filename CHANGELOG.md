# Changelog
All notable changes to this overwolf project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Live Match: Combined "Card View" and "Match Table" into a single "Live Match" menu item with a toggle to switch between card and table views.
- Favourites Page: New dedicated page for viewing all favourited players with aggregated stats, individual player cards showing detailed statistics, and reserved space for future ad placements.

### Fixed
- Match Stats: Preserve `map`, `gameMode`, and `gameType` when a new `match_start` event arrives so they are recorded correctly even if provided slightly before the start event.

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
