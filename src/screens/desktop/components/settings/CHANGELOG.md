# Settings Components Changelog

All notable changes to the settings components will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Settings Screen UI Overhaul**: Major updates to improve usability and navigation
  - Tabs now fixed/sticky at the top of the screen for consistent navigation access
  - Removed Advanced Settings tab - simplified interface with only General and Overlay tabs
  - Converted all accordion/collapsible sections to static, always-visible sections
  - Sections can now be scrolled into view without requiring manual expansion
  - Updated CSS with new `.settings-static-section`, `.settings-section-header`, and `.settings-section-content` classes
  - Added `.settings-tabs-sticky` class for sticky tab navigation
  - Settings sections now use consistent card-like styling with headers and content areas
  - Disabled sections now use `.disabled-section` class instead of `.disabled-panel`

### Removed
- **CombinedSettings.tsx**: Removed Advanced Settings tab import and tab pane
- **Settings.tsx**: Removed Collapse and Panel components, converted to static sections
- **OverlaySettings.tsx**: Removed Collapse and Panel components, converted to static sections
- Removed unused imports: `WindowResourceSettings` from Settings.tsx, `Switch`, `OverlayToggleSettings`, and `CardSettingsRowToggle` from OverlaySettings.tsx

### Technical Details
- Related to main CHANGELOG entry: "Settings Screen: Tabs are now fixed/sticky to the top of the screen" and "Settings Screen: Converted accordion sections to static, always-visible sections"
