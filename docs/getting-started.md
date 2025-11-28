---
title: Getting Started
category: Guides
---

# Getting Started

This guide will walk you through setting up and using MapLayr in your React Native application.

## Installation

Install the MapLayr SDK using npm or yarn:

```bash
npm install @maplayr/react-native
# or
yarn add @maplayr/react-native
```

## Configuration

Create a file called `attractions.io.config.json` in the root directory of your React Native project:

```json
{
    "apiKey": "your_api_key",
    "mapLayr": {
        "maps": {
            "map_name_1": "map_id_1",
            "map_name_2": "map_id_2"
        },
        "android": {
            "github": {
                "username": "github_username",
                "personalAccessToken": "github_personal_access_token"
            }
        }
    }
}
```

### Bundled Maps

Maps can be bundled into your app at build time so they are available immediately to users. These are specified in the `mapLayr.maps` block. Each key/value pair specifies a friendly map name against the map ID:

```json
"mapLayr": {
    "maps": {
        "attractionsIoResort": "df98bfa3-156c-49cb-9f94-1b9ec52a08c4"
    }
}
```

The friendly map name keys are currently not used in the React Native framework.

### GitHub Personal Access Token

GitHub package registry requires authentication credentials to fetch the native Android SDK. Create a personal access token by navigating to: https://github.com/settings/tokens/new

Enable the following scope:
- `read:packages`

## iOS Setup

### Podfile Configuration

Update your `Podfile` (located at `ios/Podfile`) to include `use_frameworks!` and add the MapLayr dependency:

```ruby
target 'YourAppName' do
  use_frameworks!
  
  # MapLayr iOS SDK dependency (required)
  pod 'MapLayr', :git => 'https://github.com/attractions-io/maplayr-ios.git', :commit => 'c0af108cf44915e986cc9e775f6045952d79510a'
  
  # ... rest of your configuration
end
```

**Note:** The MapLayr iOS SDK is not available on the CocoaPods public registry, so you must specify the git source directly in your Podfile.

After making these changes, run:

```bash
cd ios && pod install
```

### Xcode Build Phase

1. In Xcode, open your project and select your target
2. Go to **Build Phases**
3. Click the **+** button and select **New Run Script Phase**
4. Drag the new phase to appear after **Copy Bundle Resources**
5. Name it "MapLayr Configuration"
6. Uncheck "Based on dependency analysis"
7. Add the following script:

```bash
xcrun --sdk macosx swift "${PODS_ROOT}/../../node_modules/@maplayr/react-native/scripts/maplayr_configuration.swift"
```

8. In the **Input Files** section, add:

```
${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}
```

## Loading and Displaying a Map

Here's a basic example of how to load and display a map:

```tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { MapView, useMap } from '@maplayr/react-native';

export default function App() {
  const mapId = "your-map-id";
  const mapLoadResult = useMap(mapId);

  switch (mapLoadResult.status) {
    case "pending":
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      );
    
    case "success":
      return (
        <View style={styles.container}>
          <MapView style={styles.map} map={mapLoadResult.map} />
        </View>
      );
    
    case "error":
      return (
        <View style={styles.container}>
          <Text>Failed to load map: {mapLoadResult.error.message}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
```

The `useMap` hook loads the map and returns a result object with three possible states:

- `pending`: The map is still loading
- `success`: The map loaded successfully and is available via `mapLoadResult.map`
- `error`: The map failed to load, with error details in `mapLoadResult.error`

## Next Steps

Now that you have a basic map displayed, you can explore additional features:

- [Adding Annotations](./annotations.md) - Display markers and points of interest on your map
- [Camera Control](./camera-control.md) - Control the map's camera position and zoom
- [User Location](./user-location.md) - Show and track the user's current location
- [Routing](./routing.md) - Display routes and directions between locations
