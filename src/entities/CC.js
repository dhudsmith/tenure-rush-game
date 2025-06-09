// CC.js - Enemy character: "CC"
import { GameConfig } from '../utils/Constants.js';

export default class CC {
    constructor(x, y, sprite) {
        this.x = x;
        this.y = y;
        this.sprite = sprite; // Should be loaded elsewhere and passed in
        this.width = 40;
        this.height = 80;
        this.direction = Math.random() < 0.5 ? -1 : 1; // -1: left, 1: right
        const [min, max] = GameConfig.CC.SPEED_RANGE;
        this.speed = Math.random() * (max - min) + min;
        this.active = true;
    }

    update() {
        // Wander left/right, bounce off hallway edges
        this.x += this.speed * this.direction;
        if (this.x < 0 || this.x > GameConfig.HALLWAY_WIDTH - this.width) {
            this.direction *= -1;
        }
    }

    render(ctx) {
        // Draw a simple sprite: fair skin, black hair, white shirt, black pants, "CC" centered on shirt
        // Head
        ctx.fillStyle = '#fce5cd'; // fair skin
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 16, 16, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x + this.width / 2 - 16, this.y + 4, 32, 10);
        // Body (shirt)
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + this.width / 2 - 14, this.y + 32, 28, 28);
        // "CC" on shirt, centered
        ctx.fillStyle = '#111';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CC', this.x + this.width / 2, this.y + 50);
        // Arms
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 - 14, this.y + 38);
        ctx.lineTo(this.x + this.width / 2 - 24, this.y + 60);
        ctx.moveTo(this.x + this.width / 2 + 14, this.y + 38);
        ctx.lineTo(this.x + this.width / 2 + 24, this.y + 60);
        ctx.stroke();
        // Pants
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x + this.width / 2 - 10, this.y + 60, 8, 20);
        ctx.fillRect(this.x + this.width / 2 + 2, this.y + 60, 8, 20);
    }

    checkCollision(player) {
        // Simple AABB collision
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
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
