import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LabeledAnnotationIcon, CoordinateAnnotationLayer, UserLocationMarker, useMap, useRoute, useLocation, Shape, MapView } from '@maplayr/react-native';
import type { MapLoadResult, MapViewHandle } from '@maplayr/react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

const rides = [
  { id: 1, name: 'Daeva', coordinates: { latitude: 52.8952, longitude: -1.8431 }, labelStyle: { color: '#FF0000', textStrokeColor: '#FFFFFF' } },
  { id: 2, name: "Eagle's Nest", coordinates: { latitude: 52.8982, longitude: -1.8463 }, labelStyle: { color: '#00FF00', textStrokeColor: '#000000' } },
  { id: 3, name: 'Tarragon', coordinates: { latitude: 52.8983, longitude: -1.8494 }, labelStyle: { color: '#0000FF', textStrokeColor: '#FFFF00' } },
  { id: 4, name: 'The Flying Dutchman', coordinates: { latitude: 52.8971, longitude: -1.8443 }, labelStyle: { color: '#FF00FF', textStrokeColor: '#FFFFFF' } },
  { id: 5, name: 'Wooden Warrior', coordinates: { latitude: 52.8949, longitude: -1.8445 }, labelStyle: { color: '#00FFFF', textStrokeColor: '#000000' } },
];

export default function App() : React.JSX.Element {

  const mapId = '5a1400cf-db2b-4dec-90f2-8f603cab4e72';

  const mapViewRef = useRef<MapViewHandle | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Request location permission on mount
    (async () => {
      try {
        const result = await request(
          Platform.select({
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
            android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          })!
        );
        if (result !== RESULTS.GRANTED) {
          console.warn('Location permission not granted:', result);
        }
      } catch (e) {
        console.warn('Location permission request failed:', e);
      }
    })();
  }, []);

  const mapLoadResult : MapLoadResult = useMap(mapId);
  const currentLocation = useLocation();

  // Get the selected ride for routing
  const selectedRide = selectedIndex !== null ? rides.find(r => r.id === selectedIndex) : null;

  // Create route from user location to selected annotation
  // Pass null as origin when no annotation is selected, so useRoute returns null
  const route = useRoute(mapLoadResult, {
    origin: selectedRide && currentLocation ? currentLocation : null,
    destination: selectedRide?.coordinates ?? rides[0]!.coordinates,
  });

  // Only show route when we have a valid route (will be null when origin is null)
  const shouldShowRoute = !!route;

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
          <MapView ref={mapViewRef} style={styles.map} map={mapLoadResult.map}>
            {/* User location marker */}
            {currentLocation && (
              <UserLocationMarker
                tintColor="blue"
              />
            )}

            {/* Ride annotations */}
            <CoordinateAnnotationLayer>
              {rides.map((ride) => (
                <LabeledAnnotationIcon
                  key={ride.id}
                  isSelected={selectedIndex === ride.id}
                  title={selectedIndex === ride.id ? ride.name : ''}
                  icon={require('./images/rollercoaster.png')}
                  coordinates={ride.coordinates}
                  labelStyle={ride.labelStyle}
                  onSelected={() => {
                    setSelectedIndex(ride.id);
                    mapViewRef.current?.moveCamera({
                      location: ride.coordinates,
                      span: 300,
                      animated: true,
                    });
                  }}
                  onDeselected={() => {
                    setSelectedIndex(null);
                  }}
                />
              ))}
            </CoordinateAnnotationLayer>

            {/* Route from user location to selected annotation */}
            {shouldShowRoute && (
              <>
                {/* Outer shape - wider, light blue */}
                <Shape
                  route={route!}
                  strokeWidth={10}
                  strokeColor="#E8FCFF"
                />
                {/* Inner shape - narrower, blue */}
                <Shape
                  route={route!}
                  strokeWidth={5}
                  strokeColor="#007AFF"
                />
              </>
            )}
          </MapView>

          {/* Control buttons overlay */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[styles.button, !currentLocation && styles.buttonDisabled]}
              onPress={() => {
                if (currentLocation) {
                  mapViewRef.current?.moveCamera({
                    location: currentLocation,
                    span: 200,
                    animated: true,
                  });
                }
              }}
              disabled={!currentLocation}
            >
              <Text style={styles.buttonText}>📍 My Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                mapViewRef.current?.moveCamera({
                  location: rides.map(r => r.coordinates),
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
  buttonDisabled: {
    opacity: 0.5,
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
