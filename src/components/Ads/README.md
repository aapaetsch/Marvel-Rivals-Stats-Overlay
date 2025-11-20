# Ad Container Component

## Description
The AdContainer component is a reusable React component for displaying Overwolf advertisements in your application. It handles Ad SDK initialization, event listening, and cleanup.

## Usage

### Basic Usage
```tsx
import { AdContainer } from "components/Ads";

const MyComponent = () => {
  return (
    <AdContainer
      containerId="myApp_300x250_window_top"
      width={300}
      height={250}
      onAdLoaded={() => console.log('Ad loaded successfully')}
      onAdError={(err) => console.error('Ad failed to load:', err)}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| containerId | string | Yes | Unique HTML id for the ad container. Must follow format: `<appname>_<width>x<height>_<windowName>_<position>` |
| width | number | Yes | Width of the ad container in pixels. Must match one of the supported sizes. |
| height | number | Yes | Height of the ad container in pixels. Must match one of the supported sizes. |
| adUnitId | string | No | Optional ad unit ID for the ad container |
| onAdLoaded | function | No | Callback function called when an ad successfully loads |
| onAdError | function | No | Callback function called when an ad fails to load |

## Supported Ad Sizes
The following ad sizes are supported by Overwolf:
- 728×90 (leaderboard)
- 400×300 (medium rectangle)
- 400×600 (large rectangle)
- 300×250 (medium rectangle)
- 160×600 (wide skyscraper)
- 400×60 (banner)

## Container ID Format
Container IDs must follow this specific format:
`<appname>_<width>x<height>_<windowName>_<position>`

Example: `rivalsOverlay_728x90_desktop_bottom`

## Integration Notes
- Ad containers should remain visible and not be overlapped by other UI elements
- Containers should maintain their minimum width and height
- Do not mount/unmount ads within the same window when navigating between views
- Properly handle window state changes (minimize/restore) with the adWindowManager hook

## Examples

### In-Game Overlay Ad
```tsx
import { AdContainer } from "components/Ads";

export const GameAdContainer = () => {
  return (
    <div className="game-ad-container">
      <AdContainer
        containerId="rivalsOverlay_400x60_ingame_top"
        width={400}
        height={60}
        onAdLoaded={() => console.log('In-game ad loaded')}
        onAdError={(err) => console.error('In-game ad failed:', err)}
      />
    </div>
  );
};
```

### Desktop Footer Ad
```tsx
import { AdContainer } from "components/Ads";

export const HorizontalAdPlaceholder = () => {
  return (
    <div className="ad-container-horizontal">
      <AdContainer
        containerId="rivalsOverlay_728x90_desktop_bottom"
        width={728}
        height={90}
        onAdLoaded={() => console.log('Desktop ad loaded')}
        onAdError={(err) => console.error('Desktop ad failed:', err)}
      />
    </div>
  );
};
```