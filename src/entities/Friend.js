// Friend.js - Friend entity
import { EventBus } from '../utils/EventBus.js';
import { getRandomCallout } from '../utils/Constants.js';

export class Friend {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.contacted = false;
        this.waveTimer = 0;
        this.eventBus = EventBus.getInstance();
    }
    
    update(scrollSpeed) {
        this.y += scrollSpeed;
        this.waveTimer++;
    }
    
    render(ctx) {
        // Body (blue if contacted)
        ctx.fillStyle = this.contacted ? '#87CEEB' : '#4169E1';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Head
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 5, this.y - 15, 20, 15);
        
        // Blonde hair
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 3, this.y - 20, 24, 20);
        
        // Waving animation
        if (Math.floor(this.waveTimer / 30) % 2 === 0) {
            ctx.fillStyle = '#FDBCB4';
            ctx.fillRect(this.x + this.width, this.y + 5, 8, 2);
        }
    }
    
    contact() {
        if (this.contacted) return;
        
        this.contacted = true;
        this.eventBus.emit('friend.contacted');
        this.eventBus.emit('callout', {
            text: getRandomCallout('FRIEND'),
            x: this.x + 15,
            y: this.y,
            color: "#FF69B4"
        });
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