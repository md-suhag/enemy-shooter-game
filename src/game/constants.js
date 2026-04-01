export const GAME_WIDTH = 400; // Fixed width for mobile-friendly view
export const GAME_HEIGHT = 700;
export const PLAYER_SPEED = 5;
export const BULLET_SPEED = -8;
export const ENEMY_SPEED_X = 2; // For formations moving side to side slowly
export const ENEMY_SPEED_Y = 0.5; // Slowly moving down

// Bounding box sizes for simple AABB collision
export const PLAYER_SIZE = { width: 60, height: 60 };
export const ENEMY_SIZE = { width: 40, height: 40 };
export const BULLET_SIZE = { width: 6, height: 20 };
