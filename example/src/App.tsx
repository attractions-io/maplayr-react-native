import React, { useCallback, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CoordinateAnnotationLayer, UserLocationMarker, UserLocation, useMap, useRoute, Shape, MapView } from '@maplayr/react-native';
import type { AnnotationRenderInfo, MapLoadResult, MapViewHandle } from '@maplayr/react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import { attractions, type Attraction } from './data/attractions';
import { LabeledAnnotationIcon, LABELED_ANNOTATION_ICON_ANCHOR } from './components/LabeledAnnotationIcon';

export default function App() : React.JSX.Element {

  const mapId = 'c1b9f54d-6645-4433-8908-89ea914e70c7';

  const mapViewRef = useRef<MapViewHandle | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);

  const followUserLocation = async () => {
    const result = await request(
      Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      })!
    );
    if (result !== RESULTS.GRANTED) {
      console.warn('Location permission not granted:', result);
      return;
    }
    mapViewRef.current?.moveCamera({
      followUserLocation: true,
      span: 200,
      animated: true,
    });
  };

  const mapLoadResult : MapLoadResult = useMap(mapId);

  // Get the selected attraction for routing
  const selectedAttraction = selectedIndex !== null ? attractions.find(attraction =>
    attraction.id === selectedIndex
  ) : null;

  // Create route from user location to selected annotation
  // Pass null as origin when no annotation is selected, so useRoute stays idle
  const routeResult = useRoute(mapLoadResult, {
    origin: selectedAttraction ? UserLocation : null,
    destinations: [selectedAttraction?.coordinates ?? attractions[0]!.coordinates],
  });

  const keyExtractor = useCallback(
    (attraction: Attraction) => {
      return String(attraction.id);
    },
    []
  );

  const coordinates = useCallback(
    (attraction: Attraction) => {
      return attraction.coordinates;
    },
    []
  );

  const renderAnnotation = useCallback(
    ({ item, isSelected }: AnnotationRenderInfo<Attraction>) => {
      return (
        <LabeledAnnotationIcon
          icon={require('./images/rollercoaster.png')}
          label={isSelected ? item.name : undefined}
          labelColor={item.color}
        />
      );
    },
    []
  );

  switch (mapLoadResult.status) {
    case 'pending':
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      );
    case 'success':
      return (
        <View style={styles.fullScreenContainer}>
          <MapView
            ref={mapViewRef}
            style={styles.map}
            map={mapLoadResult.map}
            onCameraTargetChange={({ tracking }) =>
              setIsFollowingUser(tracking === 'userLocation')
            }
          >
            {/* User location marker */}
            <UserLocationMarker
              tintColor="blue"
            />

            {/* Attraction annotations */}
            <CoordinateAnnotationLayer
              data={attractions}
              keyExtractor={keyExtractor}
              coordinates={coordinates}
              anchor={LABELED_ANNOTATION_ICON_ANCHOR}
              selectedKeys={selectedIndex !== null ? [String(selectedIndex)] : []}
              onSelect={(attraction) => {
                setSelectedIndex(attraction.id);
                mapViewRef.current?.moveCamera({
                  location: attraction.coordinates,
                  span: 300,
                  animated: true,
                });
              }}
              onDeselect={(attraction) => {
                setSelectedIndex((current) =>
                  current === attraction.id ? null : current
                );
              }}
              renderAnnotation={renderAnnotation}
            />

            {/* Route from user location to selected annotation */}
            {routeResult.status === 'success' && (
              <>
                {/* Outer shape - wider, light blue */}
                <Shape
                  route={routeResult.route}
                  strokeWidth={10}
                  strokeColor="#E8FCFF"
                />
                {/* Inner shape - narrower, blue */}
                <Shape
                  route={routeResult.route}
                  strokeWidth={5}
                  strokeColor="#007AFF"
                />
              </>
            )}
          </MapView>

          {/* Control buttons overlay */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={followUserLocation}
            >
              <Text style={styles.buttonText}>{isFollowingUser ? '📍 Following' : '📍 My Location'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                mapViewRef.current?.moveCamera({
                  location: attractions.map(attraction =>
                    attraction.coordinates
                  ),
                  animated: true,
                });
              }}
            >
              <Text style={styles.buttonText}>🗺️ Show All</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    case 'error':
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>
            Failed to load map
          </Text>
          <Text style={styles.errorDetails}>
            {mapLoadResult.error.message}
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    gap: 10,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
