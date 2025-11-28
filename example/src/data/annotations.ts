const defaultIcon = require('../images/rollercoaster.png');

export const annotations = [
    // Attractions
    {
        id: 1,
        title: 'Nemesis Reborn',
        icon: defaultIcon,
        coordinates: { latitude: 52.986953084469, longitude: -1.8827529454079 },
        category: 498,
    },
    {
        id: 2,
        title: 'Wicker Man',
        icon: defaultIcon,
        coordinates: { latitude: 52.98958332042, longitude: -1.8883829021302 },
        category: 498,
    },

    // Shows
    {
        id: 3,
        title: 'Teletubbies Big Band Live Show',
        icon: defaultIcon,
        coordinates: { latitude: 52.989618841235, longitude: -1.8940021300163 },
        category: 523,
    },
    {
        id: 4,
        title: 'The Furchester Hotel Live Show',
        icon: defaultIcon,
        coordinates: { latitude: 52.990027328491, longitude: -1.894286444172 },
        category: 523,
    },

    // Food & Drink
    {
        id: 5,
        title: 'Eastern Express - Mutiny Bay',
        icon: defaultIcon,
        coordinates: { latitude: 52.989796444864, longitude: -1.8895523452607 },
        category: 499,
    },
    {
        id: 6,
        title: 'Just Chicken',
        icon: defaultIcon,
        coordinates: { latitude: 52.986851062122, longitude: -1.8952382449061 },
        category: 499,
    },

    // Facilities
    {
        id: 7,
        title: 'Toilets - Mutiny Bay',
        icon: defaultIcon,
        coordinates: { latitude: 52.989721, longitude: -1.889951 },
        category: 502,
    },
    {
        id: 8,
        title: 'First Aid - Towers Street',
        icon: defaultIcon,
        coordinates: { latitude: 52.98875, longitude: -1.8859 },
        category: 502,
    },

    // Shops
    {
        id: 9,
        title: 'Towers Trading Co.',
        icon: defaultIcon,
        coordinates: { latitude: 52.98862, longitude: -1.8863 },
        category: 500,
    },
    {
        id: 10,
        title: 'Wicker Man Shop',
        icon: defaultIcon,
        coordinates: { latitude: 52.98945, longitude: -1.88865 },
        category: 500,
    },

    // Hotels
    {
        id: 11,
        title: 'Alton Towers Hotel',
        icon: defaultIcon,
        coordinates: { latitude: 52.9859, longitude: -1.8928 },
        category: 501,
    },
    {
        id: 12,
        title: 'Splash Landings Hotel',
        icon: defaultIcon,
        coordinates: { latitude: 52.98565, longitude: -1.8939 },
        category: 501,
    },

    // Resort Activities
    {
        id: 13,
        title: 'Extraordinary Golf - East Course',
        icon: defaultIcon,
        coordinates: { latitude: 52.9858, longitude: -1.8919 },
        category: 1109,
    },
    {
        id: 14,
        title: 'Extraordinary Golf - West Course',
        icon: defaultIcon,
        coordinates: { latitude: 52.98575, longitude: -1.8924 },
        category: 1109,
    },

    // Heritage
    {
        id: 15,
        title: 'The Towers',
        icon: defaultIcon,
        coordinates: { latitude: 52.9899, longitude: -1.8928 },
        category: 1223,
    },
    {
        id: 16,
        title: 'Conservatories',
        icon: defaultIcon,
        coordinates: { latitude: 52.99025, longitude: -1.8923 },
        category: 1223,
    },
];

/**
 *     { id: 498, name: "Attractions" },
    { id: 523, name: "Shows" },
    { id: 499, name: "Food & Drink" },
    { id: 502, name: "Facilities" },
    { id: 500, name: "Shops" },
    { id: 501, name: "Hotels" },
    { id: 1109, name: "Resort Activities" },
    { id: 1223, name: "Heritage" }
 */
