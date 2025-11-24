# Changelog
All notable changes to the ingame overlay will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Player Stats Overlay: Fixed settings not responding correctly to changes after slot index implementation. The settings array index calculation now properly maps slotIndex to teammate settings (slotIndex + 1 offset for non-user players).

### Changed
- Player Stats Overlay: Implemented slot-based player tracking system in Screen.tsx to maintain stable roster positions when players leave and are replaced during a match.
- Player Stats Overlay: Updated TeammateStats.tsx to use slotIndex instead of array index for determining card settings, ensuring replacement players inherit the style of the player they replaced.
- Player Stats Types: Added optional slotIndex property to PlayerStatsProps interface to track stable roster slot assignments independently of player uid.