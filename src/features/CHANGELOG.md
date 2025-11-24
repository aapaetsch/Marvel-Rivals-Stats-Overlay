# Changelog
All notable changes to the features in this folder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Recent Players (desktop): Implemented front-of-card UX updates and expanded state 3-column role summary, referencing root CHANGELOG [Unreleased] entry.
- Recent Players (desktop) [#36][#39][#37]: Styling and layout refinements for container border removal, stable card height during collapse, and dark-mode pagination visibility.

### Added
## [Unreleased]
### Added
- App Settings: Added ad auto-refresh configuration settings:
  - `enableAdAutoRefresh` (boolean, default: true) - Enable/disable automatic ad refreshing
  - `adRefreshIntervalMinutes` (number, default: 5) - Refresh interval in minutes (1-30)
  - Settings UI in General Settings tab with tooltips explaining functionality
  - Localization strings for all new settings labels and tooltips
- Recent Players (desktop) [#35][#52]: Cards default to collapsed; collapsed view shows win% and W/L under section labels.
- Recent Players (desktop) [#50]: Extracted Opponent/Teammate section into `PlayerEncounterSection` reusable component.
- App Settings: Added `forceShowCardViewCover` setting for development testing of card view cover functionality.
