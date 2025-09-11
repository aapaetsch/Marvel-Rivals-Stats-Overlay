# Changelog
All notable changes to this overwolf project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Recent Players [#36]: Removed border around the main Recent Players page card container.
- Recent Players [#39]: Cards maintain a consistent height to avoid row gaps during expand/collapse; content collapses inside with animation.
- Recent Players [#37]: Pagination controls/icons styled for dark themes (white icons/text).

### Added
- Recent Players [#35]: Cards now start collapsed by default.
- Recent Players [#52]: Collapsed cards display win% and W/L rows under each section label; also visible per section when the card is collapsed.
- Recent Players [#37]: Top‑bar pagination and a working "Cards per page" selector.
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
