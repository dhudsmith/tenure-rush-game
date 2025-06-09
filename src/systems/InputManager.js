// InputManager.js - Centralized input handling
import { EventBus } from '../utils/EventBus.js';

export class InputManager {
    constructor() {
        this.keys = {};
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        if (this.keys[e.key]) return; // Prevent key repeat
        
        this.keys[e.key] = true;
        
        // Check for two-button combos first (E + other key)
        if (this.isKeyPressed('e') || this.isKeyPressed('E')) {
            switch(e.key.toLowerCase()) {
                case 'd':
                    this.eventBus.emit('input.dev.toggle');
                    return; // Don't process further
                case 'v':
                    this.eventBus.emit('game.victory.test');
                    return; // Don't process further
                case 'n':
                    this.eventBus.emit('game.victory.normal');
                    return; // Don't process further
            }
        }
        
        // Regular single key events
        switch(e.key) {
            case 'ArrowLeft':
                this.eventBus.emit('input.left.down');
                break;
            case 'ArrowRight':
                this.eventBus.emit('input.right.down');
                break;
            case 'ArrowUp':
                this.eventBus.emit('input.up.down');
                this.eventBus.emit('input.sequence', { key: '↑' });
                break;
            case 'ArrowDown':
                this.eventBus.emit('input.sequence', { key: '↓' });
                break;
            case ' ':
                this.eventBus.emit('input.sequence', { key: '␣' });
                e.preventDefault();
                break;
            case 'p':
            case 'P':
                this.eventBus.emit('game.pause');
                break;
            case 'r':
            case 'R':
                this.eventBus.emit('game.restart');
                break;
        }
        
        // Play button press sound for relevant keys, but skip ArrowUp and ArrowDown
        if (["p", "P", "r", "R"].includes(e.key)) {
            if (window.gameInstance && window.gameInstance.currentScene && window.gameInstance.currentScene.audio) {
                window.gameInstance.currentScene.audio.playButtonPress();
            }
        }
        
        // Play sound for combo keys too
        if ((this.isKeyPressed('e') || this.isKeyPressed('E')) && ['d', 'v', 'n'].includes(e.key.toLowerCase())) {
            if (window.gameInstance && window.gameInstance.currentScene && window.gameInstance.currentScene.audio) {
                window.gameInstance.currentScene.audio.playButtonPress();
            }
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key] = false;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.eventBus.emit('input.left.up');
                break;
            case 'ArrowRight':
                this.eventBus.emit('input.right.up');
                break;
            case 'ArrowUp':
                this.eventBus.emit('input.up.up');
                break;
        }
    }
    
    update() {
        // Could be used for continuous input checking if needed
    }
    
    isKeyPressed(key) {
        return !!this.keys[key];
    }
    
    getActiveKeys() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
}