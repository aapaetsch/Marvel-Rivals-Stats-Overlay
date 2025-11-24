# Changelog
All notable changes to the components in this folder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- In-House Ads Components:
  - InHouseAdComponent for rendering custom in-house advertisements
  - Support for dynamic content, character backgrounds, and custom styling
  - Integration with ad auto-switching system
- Ad Auto-Refresh and Switching (AdContainer component):
  - Support for displaying both Overwolf ads and in-house ads
  - Auto-switching between ad types with configurable intervals
  - `enableAutoSwitch` prop to enable/disable ad type switching
  - `inHouseAdOnly` prop for testing in-house ads exclusively
  - Integrated with Redux app settings to enable/disable auto-refresh globally
  - Configurable refresh interval (1-30 minutes) from app settings
  - Automatic ad remounting using refreshKey state that increments on interval
  - Console logging for debugging ad refresh and switching cycles
  - Full cleanup of previous ad instance before creating new one
- Overwolf Ads SDK integration:
  - Created AdContainer component for displaying ads with proper event handling and lifecycle management
  - TypeScript types for Overwolf Ads SDK to prevent type errors
  - Component exports in index.ts for easy import
  - Vertical ad placeholder components (300x600) for Match History and Favourites pages