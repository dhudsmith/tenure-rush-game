// Constants.js - Game configuration and constants
export const GameConfig = {
    SCROLL_SPEED: {
        BASE: 2.0
    },
    
    PLAYER: {
        BASE_HP: 5,
        MOVEMENT_SPEED: 2.5,
        IMMUNITY_DURATION: 80 
    },
    
    PROGRESSION: {
        GLASSES_MULTIPLIER: 2
    },
    
    SPAWNING: {
        DOOR_INTERVAL: [40, 150], 
        POWERUP_INTERVAL: [100, 200], 
        FRIEND_INTERVAL: [200, 300],
        CC_INTERVALS: [
            { level: 1, interval: [600, 800] },   // Level 1: 10-13 seconds
            { level: 2, interval: [500, 700] },   // Level 2: 8-12 seconds
            { level: 3, interval: [400, 600] },   // Level 3: 7-10 seconds
            { level: 4, interval: [350, 550] },   // Level 4: 6-9 seconds
            { level: 5, interval: [300, 500] },   // Level 5: 5-8 seconds
            { level: 6, interval: [250, 450] },   // Level 6: 4-7 seconds
            { level: 7, interval: [200, 400] },   // Level 7: 3-7 seconds
            { level: 8, interval: [180, 350] },   // Level 8: 3-6 seconds
            { level: 9, interval: [150, 300] },   // Level 9: 2.5-5 seconds
            { level: 10, interval: [120, 250] }   // Level 10: 2-4 seconds
        ]
    },
    
    CC: {
        SPEED_RANGE: [1.5, 3.5] // min and max speed for CC
    },
    
    HALLWAY_WIDTH: 668, // Width between walls (768 - 50*2)

    // Floor colors by level range (GDD: linoleum, tile, marble, carpet)
    FLOOR_COLORS: [
        { min: 1, max: 3, color: '#b7b09c' },    // Worn linoleum (tan/gray)
        { min: 4, max: 6, color: '#a0522d' },    // Hardwood (wood brown)
        { min: 7, max: 9, color: '#c7f5d9' },    // Marble (pale green)
        { min: 10, max: 10, color: '#c62828' }   // Carpet (red)
    ],
    // Door colors by level range (contrasting with floor)
    DOOR_COLORS: [
        { min: 1, max: 3, color: '#4b3f2a' },    // Dark brown for linoleum
        { min: 4, max: 6, color: '#e6d8ad' },    // Light tan for hardwood
        { min: 7, max: 9, color: '#2e5d43' },    // Deep green for marble
        { min: 10, max: 10, color: '#f7e9a0' }   // Pale yellow for red carpet
    ],
    // Door knob colors by level range (contrasting with door color)
    DOOR_KNOB_COLORS: [
        { min: 1, max: 3, color: '#FFD700' },    // Gold on dark brown
        { min: 4, max: 6, color: '#4b3f2a' },   // Dark brown on light tan
        { min: 7, max: 9, color: '#f7e9a0' },   // Pale yellow on deep green
        { min: 10, max: 10, color: '#2e5d43' }  // Deep green on pale yellow
    ]
};

// Callout message arrays for random selection
export const CalloutMessages = {
    SUCCESS: [
        "Alright!",
        ":)",
        "Great",
        "Yeah!",
        "Perfect!",
    ],
    FAILURE: [
        "Ouch!!",
        "Yeah, no",
        "Watch those toes!!",
        "Grrr! Grrr! Grrr!",
        "Watch it!",
    ],
    CC_CONTACT: [
        "Break the silos!",
        "Let's collaborate!",
        "Glad we could network!",
        "Teamwork makes the dream work!",
        "Update your LinkedIn!",
        "I submitted 10 grants last week!",
        "Multidisciplinary research is so important!",
    ],
    MALE_FRIEND: [
        "Have a good day!",
        "Need a hug?",
        "Need some coffee?",
        "Good to see you!",
        "You've got this!",
        "Hi there.",
    ]
};

// Utility function to get random callout messages
export const getRandomCallout = (type) => {
    const messages = CalloutMessages[type];
    if (!messages || messages.length === 0) return "...";
    return messages[Math.floor(Math.random() * messages.length)];
};

export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

export const PowerUpType = {
    COFFEE: 'coffee',
    GLASSES: 'glasses',
    CHOPSTICKS: 'chopsticks',
    SUSHI: 'sushi',
    CHEESE: 'cheese' 
};

export const PowerUpConfig = {
    [PowerUpType.COFFEE]: {
        duration: 1200, 
        callout: "2x speed!",
        color: "#8B4513",
        multiplier: 0.5 
    },
    [PowerUpType.GLASSES]: {
        duration: 900, // 15 seconds
        callout: "2x experience!",
        color: "#4169E1"
    },
    [PowerUpType.CHOPSTICKS]: {
        callout: "Sushi time!",
        color: "#8B4513"
    },
    [PowerUpType.SUSHI]: {
        callout: "Yummy! +1 HP",
        color: "#FF6347"
    },
    [PowerUpType.CHEESE]: {
        duration: 900, // 15 seconds
        callout: "Cheese! 2x Friends!",
        color: "#FFD700"
    }
};

// Romantic ending threshold (number of hearts required)
export const ROMANTIC_ENDING_HEARTS = 50;

// Control instructions for the UI
export const CONTROL_INSTRUCTIONS = [
    "TENURE RUSH!",
    "Unlock enough doors to earn tenure, but make sure you don't jam all your toes!",
    "",
    "CONTROLS:",
    "Use \u2190 and \u2192 to move",
    "Use \u2191 to speed forward (only with Coffee)",
    "Use \u2191, \u2193, and \u2423 (Spacebar) for door sequences",
    "P to pause",
    "R to restart"
];