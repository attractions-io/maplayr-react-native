/**
 * Represents a geographic coordinate
 */
export type Coordinate = {
    /** The latitude coordinate */
    latitude: number;
    /** The longitude coordinate */
    longitude: number;
};

/**
 * Represents a geographic location with optional accuracy information
 */
export type Location = Coordinate & {
    /** The accuracy of the location in meters */
    horizontalAccuracy?: number;
};

