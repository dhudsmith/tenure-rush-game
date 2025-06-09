// Player.js - Player entity
import { EventBus } from '../utils/EventBus.js';
import { GameConfig } from '../utils/Constants.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.speed = GameConfig.PLAYER.MOVEMENT_SPEED;
        
        // Stats
        this.hp = GameConfig.PLAYER.BASE_HP;
        this.doorPasses = 0;
        this.chopsticksCount = 0;
        
        // State
        this.damageImmunity = 0;
        this.movingLeft = false;
        this.movingRight = false;
        
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.eventBus.on('input.left.down', () => this.movingLeft = true);
        this.eventBus.on('input.left.up', () => this.movingLeft = false);
        this.eventBus.on('input.right.down', () => this.movingRight = true);
        this.eventBus.on('input.right.up', () => this.movingRight = false);
    }
    
    update(deltaTime) {
        // Update damage immunity
        if (this.damageImmunity > 0) {
            this.damageImmunity--;
        }
        
        // Determine movement speed (coffee doubles lateral speed)
        let moveSpeed = this.speed;
        if (window.gameInstance && window.gameInstance.currentScene &&
            window.gameInstance.currentScene.powerUpSystem &&
            window.gameInstance.currentScene.powerUpSystem.isActive &&
            window.gameInstance.currentScene.powerUpSystem.isActive('coffee')) {
            moveSpeed *= 2;
        }
        // Movement
        if (this.movingLeft && this.x > 0) {
            this.x -= moveSpeed;
        }
        if (this.movingRight && this.x < 768 - this.width) {
            this.x += moveSpeed;
        }
    }
    
    render(ctx) {
        // Blink red when immune to damage
        if (this.damageImmunity > 0) {
            // Alternate between red and normal every 5 frames
            if (Math.floor(this.damageImmunity / 5) % 2 === 0) {
                ctx.fillStyle = '#FF2222'; // Red body
            } else {
                ctx.fillStyle = '#228B22'; // Normal green dress
            }
        } else {
            ctx.fillStyle = '#228B22'; // Normal green dress
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Head
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 5, this.y - 15, 20, 15);

        // Hair
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 3, this.y - 20, 24, 10);
    }
    
    takeDamage() {
        if (this.damageImmunity > 0) return;
        
        this.hp--;
        this.damageImmunity = GameConfig.PLAYER.IMMUNITY_DURATION;
        this.eventBus.emit('player.damaged', { hp: this.hp });
    }
    
    heal(amount) {
        this.hp = Math.min(this.hp + amount, GameConfig.PLAYER.BASE_HP);
        this.eventBus.emit('player.healed', { hp: this.hp });
    }
    
    addChopsticks(amount) {
        this.chopsticksCount += amount;
    }
    
    useChopsticks() {
        if (this.chopsticksCount > 0) {
            this.chopsticksCount--;
            return true;
        }
        return false;
    }
    
    clearChopsticks() {
        this.chopsticksCount = 0;
    }
    
    clearDoorPasses() {
        this.doorPasses = 0;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    reset() {
        this.hp = GameConfig.PLAYER.BASE_HP;
        this.doorPasses = 0;
        this.chopsticksCount = 0;
        this.damageImmunity = 0;
        this.movingLeft = false;
        this.movingRight = false;
    }
}