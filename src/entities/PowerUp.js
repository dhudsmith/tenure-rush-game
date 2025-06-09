// PowerUp.js - Power-up entity
import { EventBus } from '../utils/EventBus.js';
import { PowerUpType, PowerUpConfig } from '../utils/Constants.js';

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.eventBus = EventBus.getInstance();
    }
    
    render(ctx) {
        // Background circle
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Power-up icon
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        
        const icon = this.getIcon();
        ctx.fillText(icon, this.x + 15, this.y + 20);
    }
    
    getIcon() {
        switch (this.type) {
            case PowerUpType.COFFEE: return '☕';
            case PowerUpType.GLASSES: return '👓';
            case PowerUpType.CHOPSTICKS: return '🥢';
            case PowerUpType.SUSHI: return '🍣';
            case PowerUpType.CHEESE: return '🧀'; 
            default: return '?';
        }
    }
    
    collect(player) {
        const config = PowerUpConfig[this.type];
        
        switch (this.type) {
            case PowerUpType.COFFEE:
            case PowerUpType.GLASSES:
            case PowerUpType.CHEESE: 
                this.eventBus.emit('powerup.collected', { 
                    type: this.type, 
                    duration: config.duration 
                });
                this.eventBus.emit('callout', {
                    text: config.callout,
                    x: player.x + 15,
                    y: player.y,
                    color: config.color
                });
                break;
                
            case PowerUpType.CHOPSTICKS:
                player.addChopsticks(5);
                this.eventBus.emit('callout', {
                    text: config.callout,
                    x: player.x + 15,
                    y: player.y,
                    color: config.color
                });
                break;
                
            case PowerUpType.SUSHI:
                if (player.useChopsticks()) {
                    player.heal(1);
                    this.eventBus.emit('callout', {
                        text: config.callout,
                        x: player.x + 15,
                        y: player.y,
                        color: config.color
                    });
                }
                break;
        }
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}