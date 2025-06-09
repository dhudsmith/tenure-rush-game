// Game.js - Main game controller
import { GameScene } from '../scenes/GameScene.js';
import { VictoryScene } from '../scenes/VictoryScene.js';
import { InputManager } from '../systems/InputManager.js';
import { EventBus } from '../utils/EventBus.js';
import { GameState } from '../utils/Constants.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentScene = null;
        this.inputManager = new InputManager();
        this.eventBus = EventBus.getInstance();
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Global game events
        this.eventBus.on('game.over', () => {
            this.showGameOver();
        });
        
        this.eventBus.on('game.win', () => {
            this.showVictory();
        });
        
        this.eventBus.on('game.restart', () => {
            this.restart();
        });
        
        this.eventBus.on('game.pause', () => {
            this.togglePause();
        });
        
        this.eventBus.on('game.victory.test', () => {
            this.testVictoryScene();
        });
        
        this.eventBus.on('game.victory.normal', () => {
            this.testNormalVictoryScene();
        });
    }
    
    start() {
        // For Phase 1, jump straight into gameplay
        this.currentScene = new GameScene(this.canvas);
        this.state = GameState.PLAYING;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Fixed timestep with accumulator for consistent physics
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.state !== GameState.PLAYING && this.state !== GameState.VICTORY || !this.currentScene) return;
        
        // Update input
        this.inputManager.update();
        
        // Update current scene
        this.currentScene.update(deltaTime);
        
        // Handle victory scene input
        if (this.state === GameState.VICTORY && this.currentScene.handleInput) {
            const keys = this.inputManager.getActiveKeys();
            keys.forEach(key => {
                if (this.currentScene.handleInput(key)) {
                    // Input was handled by victory scene
                }
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render current scene
        if (this.currentScene) {
            this.currentScene.render(this.ctx);
        }
        
        // Render pause overlay if paused (but not during victory)
        if (this.state === GameState.PAUSED) {
            this.renderPauseOverlay();
        }
    }
    
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = 'bold 24px Courier New';
        this.ctx.fillText('Press P to continue', this.canvas.width/2, this.canvas.height/2 + 60);
    }
    
    togglePause() {
        // Don't allow pausing during victory scene
        if (this.state === GameState.VICTORY) return;
        
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
        }
    }
    
    showGameOver() {
        this.state = GameState.GAME_OVER;
        document.getElementById('gameOver').style.display = 'block';
        
        // Update final stats
        const stats = this.currentScene.getStats();
        document.getElementById('finalTenure').textContent = stats.tenure;
        document.getElementById('finalHearts').textContent = stats.hearts;
    }
    
    showVictory() {
        console.log('showVictory called');
        this.state = GameState.VICTORY;
        console.log('State set to VICTORY');
        
        // Get final stats from the current game scene
        const stats = this.currentScene.getStats();
        console.log('Stats retrieved:', stats);
        
        // Add door passes used to stats
        stats.doorPassesUsed = stats.doorPassesUsed || 0;
        
        console.log('Creating VictoryScene...');
        // Transition to victory scene with stats
        this.currentScene = new VictoryScene(this.canvas, stats);
        console.log('VictoryScene created and set as current scene');
    }
    
    testVictoryScene() {
        console.log('Testing victory scene with E+V combo shortcut');
        this.state = GameState.VICTORY;
        
        // Create test stats for romantic ending (50+ hearts)
        const testStats = {
            tenure: 85,
            hearts: 55, // This will trigger romantic ending
            level: 5,
            time: '05:32.15',
            doorPassesUsed: 3
        };
        
        console.log('Creating VictoryScene with test stats:', testStats);
        this.currentScene = new VictoryScene(this.canvas, testStats);
        console.log('Victory scene test complete');
    }
    
    testNormalVictoryScene() {
        console.log('Testing normal victory scene with E+N combo shortcut');
        this.state = GameState.VICTORY;
        
        // Create test stats for normal ending (less than 50 hearts)
        const testStats = {
            tenure: 75,
            hearts: 35, // This will trigger normal ending
            level: 4,
            time: '06:15.89',
            doorPassesUsed: 2
        };
        
        console.log('Creating VictoryScene with normal stats:', testStats);
        this.currentScene = new VictoryScene(this.canvas, testStats);
        console.log('Normal victory scene test complete');
    }
    
    restart() {
        document.getElementById('gameOver').style.display = 'none';
        // Clear the EventBus to remove old listeners from previous game instances
        this.eventBus.clear();
        // Re-setup game-level event listeners after clearing
        this.setupEventListeners();
        this.currentScene = new GameScene(this.canvas);
        this.state = GameState.PLAYING;
    }
}