// HUD.js - Manages the heads-up display
import { PowerUpType } from '../utils/Constants.js';

export class HUD {
    constructor() {
        // Cache DOM elements
        this.elements = {
            tenure: document.getElementById('tenure'),
            hearts: document.getElementById('hearts'),
            level: document.getElementById('level'),
            hp: document.getElementById('hp'),
            timer: document.getElementById('timer'),
            
            // Power-up timers
            coffeeTimer: document.getElementById('coffeeTimer'),
            coffeeTime: document.getElementById('coffeeTime'),
            glassesTimer: document.getElementById('glassesTimer'),
            glassesTime: document.getElementById('glassesTime'),
            
            // Items
            chopsticksDisplay: document.getElementById('chopsticksDisplay'),
            chopsticksCount: document.getElementById('chopsticksCount'),
            doorPassDisplay: document.getElementById('doorPassDisplay'),
            doorPassCount: document.getElementById('doorPassCount')
        };
    }
    
    updateTenure(tenure) {
        this.elements.tenure.textContent = tenure;
    }
    
    updateHearts(hearts) {
        this.elements.hearts.textContent = hearts;
    }
    
    updateLevel(level) {
        this.elements.level.textContent = level;
    }
    
    updateTimer(formattedTime) {
        this.elements.timer.textContent = formattedTime;
    }
    
    updateHP(hp) {
        let hpDisplay = '';
        for (let i = 0; i < 5; i++) {
            if (i < hp) {
                hpDisplay += '👣';
            } else {
                hpDisplay += '<span style="color: red;">✕</span>';
            }
        }
        this.elements.hp.innerHTML = hpDisplay;
    }
    
    updatePowerups(activeEffects) {
        // Coffee timer
        if (activeEffects[PowerUpType.COFFEE]) {
            this.elements.coffeeTimer.style.display = 'inline';
            this.elements.coffeeTime.textContent = activeEffects[PowerUpType.COFFEE];
        } else {
            this.elements.coffeeTimer.style.display = 'none';
        }
        
        // Glasses timer
        if (activeEffects[PowerUpType.GLASSES]) {
            this.elements.glassesTimer.style.display = 'inline';
            this.elements.glassesTime.textContent = activeEffects[PowerUpType.GLASSES];
        } else {
            this.elements.glassesTimer.style.display = 'none';
        }

        // Cheese timer
        if (activeEffects[PowerUpType.CHEESE]) {
            if (!this.elements.cheeseTimer) {
                this.elements.cheeseTimer = document.getElementById('cheeseTimer');
                this.elements.cheeseTime = document.getElementById('cheeseTime');
            }
            this.elements.cheeseTimer.style.display = 'inline';
            this.elements.cheeseTime.textContent = activeEffects[PowerUpType.CHEESE];
        } else if (this.elements.cheeseTimer) {
            this.elements.cheeseTimer.style.display = 'none';
        }
    }
    
    updateItems(chopsticksCount, doorPasses) {
        // Chopsticks
        if (chopsticksCount > 0) {
            this.elements.chopsticksDisplay.style.display = 'inline';
            this.elements.chopsticksCount.textContent = chopsticksCount;
        } else {
            this.elements.chopsticksDisplay.style.display = 'none';
        }
        
        // Door passes
        if (doorPasses > 0) {
            this.elements.doorPassDisplay.style.display = 'inline';
            this.elements.doorPassCount.textContent = doorPasses;
        } else {
            this.elements.doorPassDisplay.style.display = 'none';
        }
    }
    
    updateAll(stats) {
        this.updateTenure(stats.tenure);
        this.updateHearts(stats.hearts);
        this.updateLevel(stats.level);
        this.updateHP(stats.hp);
        this.updateItems(stats.chopsticksCount, stats.doorPasses);
        if (stats.timer) {
            this.updateTimer(stats.timer);
        }
    }
}