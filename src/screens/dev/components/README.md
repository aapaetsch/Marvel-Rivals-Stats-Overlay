# Dev Components

## Ad Manager Tab

The Ad Manager tab in the Dev Window provides a comprehensive interface for testing and previewing in-house advertisements using the same styling patterns as other development tools.

### Features

- **Consistent Design**: Uses status cards and grid layout matching other dev tools
- **Theme-Aware**: Fully supports all application themes (Dark, Light, Minimalistic-Black)
- **Container Size Selection**: Choose from all supported ad dimensions
- **Live Preview**: Real-time rendering of in-house ads with proper styling
- **Ad Library Management**: View detailed information about all in-house ads
- **Statistics Dashboard**: Overview of ads by type and total count
- **Responsive Layout**: Adapts to different screen sizes with collapsible columns

### Layout Structure

The Ad Manager uses a modified development tool layout:

```
┌───────────────────────────┬─────────────┐
│   Controls Panel            │   Ad Info    │
│   - Size Selector           │   - Details   │
│   - Ad Selection            │   - Properties│
│   - Refresh                 │               │
├───────────────────────────┤               │
│   Ad Preview Panel          │               │
│   - Live Rendering          │ Statistics     │
│   - Dev Badge              │ - Type counts │
│                           │ - Total count │
└───────────────────────────┴─────────────┘
```

### Theme Support

The Ad Manager follows the same theme-aware patterns as other dev components:

#### **Status Card Styling**
- Consistent with OverridesTab and other dev tools
- Uses `.status-card`, `.status-card-header`, `.status-card-body` classes
- Automatic theme switching based on application settings

#### **Grid Layout**
- Two-column layout matching existing dev tools
- Responsive design with single-column on smaller screens
- Uses established CSS grid utilities from AppStatus.css

### File Structure

```
src/screens/dev/components/
├── AdManagerTab.tsx              # Main component with grid layout
├── styles/
│   ├── AdManager.css             # Minimal theme-aware additions
│   └── README.md                 # This file
└── README.md                     # Component documentation
```

### Styling Architecture

#### **Inherited Styling**
- Uses `appStatus/styles/AppStatus.css` for grid utilities and card styling
- Inherits dev window theming patterns from `dev-screen.css`
- Consistent with other dev tools like OverridesTab and PayloadsTab

#### **Ad Manager Specific**
- `ad-stats-grid`: Statistics layout component
- `ad-stat-item`: Individual stat display elements
- Theme-aware adjustments for color contrast

### Usage Guide

1. **Open Dev Window**: Settings > General > Show Dev Window
2. **Navigate to Ad Manager**: Click "Ad Manager" in dev window
3. **Select Container Size**: Use dropdown to choose ad dimensions
4. **Preview Ads**: Click ad buttons to see live rendering
5. **View Details**: Ad information shows automatically when selected

### Development Notes

- Follows established dev tool patterns for consistency
- Uses semantic HTML structure with proper accessibility
- Responsive design ensures functionality on different screen sizes
- Theme-aware styling ensures visibility across all supported themes
- Maintains component reusability and maintainability

### Dependencies

- React with TypeScript
- Ant Design components (no Card - uses status cards)
- InHouseAdComponent for ad rendering
- lib/inHouseAds for ad definitions
- Shared styling with other dev components