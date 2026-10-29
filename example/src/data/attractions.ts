import type { Coordinate } from '@maplayr/react-native';

export type Attraction = {
  id: number;
  name: string;
  coordinates: Coordinate;
  color: string;
};

export const attractions: Attraction[] = [
  { id: 1, name: "Falcon's Fury", coordinates: { latitude: 52.8949, longitude: -1.8435 }, color: '#FF0000' },
  { id: 2, name: 'Skyfall Tower', coordinates: { latitude: 52.8983, longitude: -1.8463 }, color: '#00FF00' },
  { id: 3, name: "Serpent's Envy", coordinates: { latitude: 52.8983, longitude: -1.8495 }, color: '#0000FF' },
  { id: 4, name: 'The Flying Dutchman', coordinates: { latitude: 52.8971, longitude: -1.8443 }, color: '#FF00FF' },
  { id: 5, name: 'Wooden Warrior', coordinates: { latitude: 52.8949, longitude: -1.8445 }, color: '#00FFFF' },
];
