# Changelog
All notable changes to the ingame overlay will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Player Stats Overlay: Fixed settings not responding correctly to teammate cards (especially the second card and new players joining). The root cause was the local player being assigned slot 0 in the slot tracking, causing all teammate slot indices to be offset by 1. Now the local player is handled separately (slotIndex -1) and non-local teammates are assigned slots 0-4, which correctly map to settings indices 1-5.
- Player Stats Overlay: Fixed cards not being properly removed when players leave mid-match. The slot tracking now correctly releases slots for departed players and reassigns them to new players who join.

### Changed
- Player Stats Overlay: Refactored slot assignment in Screen.tsx to separate local player handling from teammate slot assignment. Local player always uses settings index 0, while teammates use slots 0-4 mapping to settings 1-5.
- Player Stats Overlay: Simplified TeammateStats.tsx by removing redundant re-sorting logic since Screen.tsx now handles player ordering correctly.
- Player Stats Types: Added optional slotIndex property to PlayerStatsProps interface to track stable roster slot assignments independently of player uid.