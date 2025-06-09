// main.js - Entry point for Tenure Dash
import { Game } from './core/Game.js';

// Prevent arrow keys and spacebar from scrolling the page
document.addEventListener('keydown', function(e) {
    // Prevent arrow keys and spacebar from scrolling the page
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Initialize and start the game
    const game = new Game(canvas);
    game.start();
    
    // Make game instance globally accessible for debugging
    window.gameInstance = game;
});