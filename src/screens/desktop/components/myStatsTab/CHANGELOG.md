# Changelog
All notable changes to the My Stats Tab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- MyStatsPage Component: New page component for displaying player's ELO tracking history [ELO Tracking System]
  - Separate tables for Competitive and Quick Match game modes
  - Table columns: Match #, Rank (with icon), ELO Score, Date/Time, Change from previous match
  - Rank column displays rank icon and formatted rank text (e.g., "Grandmaster 1")
  - Color-coded ELO changes (green for gains, red for losses, gray for no change)
  - Pagination support with configurable page size
  - Empty states with descriptive messages when no data is available
  - Full localization support via i18n
  - Responsive design with CSS custom properties for theming
  - References ELO Tracking System and Rank Display System features in root CHANGELOG.md
