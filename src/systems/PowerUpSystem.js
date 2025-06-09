// PowerUpSystem.js - Manages active power-up effects
import { EventBus } from '../utils/EventBus.js';
import { PowerUpType } from '../utils/Constants.js';

export class PowerUpSystem {
    constructor() {
        this.activeEffects = new Map();
        this.eventBus = EventBus.getInstance();
    }
    
    activate(type, duration) {
        // Set or reset timer
        this.activeEffects.set(type, {
            duration: duration,
            remainingTime: duration
        });
    }
    
    update(deltaTime) {
        // Update all active effects
        for (const [type, effect] of this.activeEffects.entries()) {
            effect.remainingTime--;
            
            if (effect.remainingTime <= 0) {
                this.activeEffects.delete(type);
                this.eventBus.emit('powerup.expired', { type });
            }
        }
    }
    
    isActive(type) {
        return this.activeEffects.has(type);
    }
    
    getRemainingTime(type) {
        const effect = this.activeEffects.get(type);
        return effect ? effect.remainingTime : 0;
    }
    
    getActiveEffects() {
        const effects = {};
        
        for (const [type, effect] of this.activeEffects.entries()) {
            effects[type] = Math.ceil(effect.remainingTime / 60); // Convert to seconds
        }
        
        return effects;
    }
    
    clear() {
        this.activeEffects.clear();
    }
}