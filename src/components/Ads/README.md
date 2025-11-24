# Ad Container Component

## Description
The AdContainer component is a reusable React component for displaying both Overwolf advertisements and custom in-house ads. It handles Ad SDK initialization, event listening, cleanup, automatic ad refresh, and ad type switching.

## Features
- **Automatic Ad Refresh**: Ads automatically refresh at configurable intervals (default: 5 minutes)
- **In-House Ads**: Display custom in-house advertisements alongside Overwolf ads
- **Auto-Switching**: Automatically alternate between Overwolf and in-house ads
- **User Configurable**: Enable/disable auto-refresh and set custom intervals in app settings
- **Redux Integration**: Settings are synchronized across all ad containers
- **Lifecycle Management**: Proper cleanup of ad instances on unmount and refresh
- **Event Handling**: Callbacks for ad load success and errors
- **Dev Tools**: Preview and test in-house ads in the Dev Window Ad Manager tab

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
| enableAutoSwitch | boolean | No | Enable automatic switching between Overwolf and in-house ads (default: false) |
| inHouseAdOnly | boolean | No | Only display in-house ads, skip Overwolf ads (default: false, useful for dev/testing) |

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
- **Ad Auto-Refresh**: Ads will automatically refresh based on user settings (enabled by default, 5-minute intervals)
  - Configure in Settings > General Settings > Advertisement Settings
  - Interval range: 1-30 minutes
  - Can be disabled entirely if desired
  - Each refresh completely shuts down the old ad instance and creates a new one

## Ad Auto-Refresh Configuration

The ad auto-refresh feature is controlled through Redux app settings:

- **enableAdAutoRefresh** (boolean): Enable or disable automatic ad refreshing (default: true)
- **adRefreshIntervalMinutes** (number): Interval in minutes between ad refreshes (default: 5, range: 1-30)

Users can configure these settings in the desktop app under Settings > General Settings > Advertisement Settings.

### How It Works

1. When auto-refresh is enabled, the component sets up an interval timer based on the configured minutes
2. When the timer fires, a refresh counter increments, triggering React's useEffect dependency
3. If `enableAutoSwitch` is true, the ad type alternates between 'overwolf' and 'in-house'
4. The useEffect hook shuts down the current ad instance and creates a new one
5. For in-house ads, a random ad matching the container size is selected and displayed
6. Console logs track each refresh cycle for debugging purposes

## In-House Ads

In-house ads are custom advertisements defined in `src/lib/inHouseAds.ts`. They provide an alternative to Overwolf ads and can be used for:
- Promoting app features
- Community engagement (Discord, social media)
- User tips and tutorials
- Premium/upgrade messaging

### Adding New In-House Ads

Edit `src/lib/inHouseAds.ts` and add new entries to the `IN_HOUSE_ADS` array:

```typescript
{
  id: 'my-custom-ad',
  name: 'My Custom Ad',
  width: 780,
  height: 90,
  type: 'horizontal',
  title: 'Check Out This Feature!',
  subtitle: 'Learn more about our amazing features',
  buttonText: 'Learn More',
  buttonUrl: 'https://example.com',
}
```

### Testing In-House Ads

Use the **Dev Window > Ad Manager** tab to preview and test in-house ads:
1. Open the Dev Window (Settings > General > Show Dev Window)
2. Navigate to the "Ad Manager" tab
3. Select a container size
4. Choose an in-house ad to preview
5. The ad will be displayed with live styling

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