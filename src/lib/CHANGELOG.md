# Changelog
All notable changes to files in the lib folder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- ELO Tracking Service (`eloTrackingService.ts`):
  - New service for tracking and storing player ELO ratings across game modes
  - Maintains separate tracking for Competitive and Quick Match modes
  - Recent match history storage (last 100 matches per mode)
  - Automatic data compression for long-term storage (daily aggregation)
  - Functions for recording ELO, retrieving history, and managing stored data
  - Local storage integration for persistent tracking across sessions
  - References overall ELO Tracking System feature in root CHANGELOG.md
- Rank Conversion Utilities (`rankIcons.ts`):
  - ELO to rank conversion with 9-rank system (Bronze through One Above All)
  - Each rank has 3 steps with 100 ELO per step
  - `getEloRankInfo()` - Converts ELO to complete rank information (rank, step, range, icon path)
  - `getRankIconPath()` - Returns rank icon path for given ELO
  - `getFormattedRank()` - Returns formatted rank string (e.g., "Grandmaster 1")
  - `getShortFormattedRank()` - Returns abbreviated rank string (e.g., "GM 1")
  - References overall Rank Display System feature in root CHANGELOG.md
- In-House Ads Configuration (`inHouseAds.ts`):
  - Registry system for defining custom in-house advertisements
  - Support for horizontal, vertical, and in-game ad types
  - Helper functions for filtering ads by size, type, and ID
  - Random ad selection for dynamic rotation
- Match Status Utils: New utility file with functions for determining match live status and card view cover visibility.