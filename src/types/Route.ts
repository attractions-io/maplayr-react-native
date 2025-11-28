import type { Coordinate } from './Location';

/**
 * The possible strategies to use to attach a route endpoint to the path network
 */
export type EndpointSpurStrategy = 'curved' | 'straight' | 'none';

/**
 * Options that control how routes are calculated through the path network
 */
export type RouteConfiguration = {
    /**
     * The set of edge flags that the route calculation should avoid when finding paths
     */
    avoidFlags?: Set<string>;

    /**
     * Avoids attaching the endpoints to invalid sections of path.
     *
     * The path-finding algorithm takes the input coordinates and finds the closest section of path
     * to start the routing from. If this property is set to `true`, this process will ignore paths
     * which are otherwise closer if they are unsuitable according to the route options.
     * Setting this to `true` does not guarantee that a route can be found.
     *
     * @default false
     */
    attachEndpointsToAllowedPathsOnly?: boolean;

    /**
     * The mechanism to use to attach the route's origin to the path network
     * @default "curved"
     */
    originSpurStrategy?: EndpointSpurStrategy;

    /**
     * The mechanism to use to attach the route's destination to the path network
     * @default "curved"
     */
    destinationSpurStrategy?: EndpointSpurStrategy;
};

/**
 * Converts a RouteConfiguration to a JSON-serializable object for native bridge communication
 */
export function serializeRouteConfiguration(config?: RouteConfiguration): object {
    return {
        avoidFlags: config?.avoidFlags ? Array.from(config.avoidFlags) : [],
        attachEndpointsToAllowedPathsOnly: config?.attachEndpointsToAllowedPathsOnly ?? false,
        originSpurStrategy: config?.originSpurStrategy ?? 'curved',
        destinationSpurStrategy: config?.destinationSpurStrategy ?? 'curved',
    };
}

/**
 * Helper functions for creating common route configurations
 */
export const RouteOptions = {
    /**
     * Creates an empty set of route options that applies no restrictions to path finding
     */
    none: (): RouteConfiguration => ({
        avoidFlags: new Set<string>(),
    }),

    /**
     * Creates route options that avoid paths with specific flags, such as stairs or restricted access areas
     */
    avoid: (...flags: string[]): RouteConfiguration => ({
        avoidFlags: new Set(flags),
    }),

    /**
     * Creates route options that avoids paths that are flagged as having reduced accessibility
     */
    avoidReducedAccessibility: (): RouteConfiguration => ({
        avoidFlags: new Set([
            'reducedAccessibility',
            'unsuitableForDisabled',
        ]),
    }),
};

/**
 * Represents a calculated route between two points
 */
export type Route = {
    /** The total distance of the route in meters */
    distance: number;
    /** Internal identifier for the route */
    routeId: string;
};

/**
 * Parameters for the useRoute hook
 */
export type UseRouteParams = {
    /** The starting point of the route. Set to null to clear the route */
    origin: Coordinate | null;
    /** The destination(s). If an array is provided, routes to the closest destination */
    destination: Coordinate | Coordinate[];
    /** Optional configuration for route calculation */
    options?: RouteConfiguration;
};
