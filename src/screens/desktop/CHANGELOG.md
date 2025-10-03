# Changelog
All notable changes to the desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- LiveMatch Component: New unified component combining card view and table view with a toggle, accessible via single "Live Match" menu item.
- LiveMatch Component: Horizontal segmented control in header to switch between "Card View" and "Table View" modes.
- Card View Cover: New overlay component that appears when no live match is active, with different messaging for no match vs ended match states.
- Menu Live Indicator: Red pulsing dot on Live Match menu item when a match is currently in progress.
- Match Status Utils: Utility functions for determining live match status and card view cover visibility.

### Changed
- Menu Structure: Consolidated "Card View" and "Match Table" menu items into single "Live Match" item with internal view toggle.
- Menu Label: Updated menu item from separate entries to unified "Live Match" entry.