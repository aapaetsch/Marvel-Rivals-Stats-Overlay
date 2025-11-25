# Changelog
All notable changes to the desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- My Stats Page (myStatsTab): New page for displaying player's ELO tracking history with separate tables for Competitive and Quick Match modes [ELO Tracking System]. Enhanced with rank display showing rank icons and rank/step information for each match. See also root CHANGELOG.md and lib/CHANGELOG.md.
- Menu Item: Added "My Stats" menu item under Players section for accessing ELO tracking page.
- Rank Display Integration [Rank Display System]:
  - Favourites page: Large rank icons with text overlays and exact ELO scores
  - Recent Players cards: Contextual rank icons (small in collapsed, detailed in expanded view)
  - My Stats tables: Rank column with icons and formatted rank text
- LiveMatch Component: New unified component combining card view and table view with a toggle, accessible via single "Live Match" menu item.
- LiveMatch Component: Horizontal segmented control in header to switch between "Card View" and "Table View" modes.
- Card View Cover: New overlay component that appears when no live match is active, with different messaging for no match vs ended match states.
- Menu Live Indicator: Red pulsing dot on Live Match menu item when a match is currently in progress.
- Match Status Utils: Utility functions for determining live match status and card view cover visibility.
- Favourites Page: New comprehensive page for viewing all favourited players [Favourites Page: New dedicated page]. See detailed changes in `favouritesTab/CHANGELOG.md`.

### Changed
- Menu Structure: Consolidated "Card View" and "Match Table" menu items into single "Live Match" item with internal view toggle.
- Menu Label: Updated menu item from separate entries to unified "Live Match" entry.