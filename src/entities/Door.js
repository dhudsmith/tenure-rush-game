import { GameConfig } from '../utils/Constants.js';

// Door.js - Door entity
export class Door {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.width = 60; // Fixed door width for all levels
        this.height = 60;
        
        // State
        this.isOpen = false;
        this.sequenceFailed = false;
        this.inputTriggered = false;
        this.hasHitPlayer = false;
        this.inRange = false;
        this.passUsed = false;
        
        // Generate sequence based on level
        this.sequence = this.generateSequence();

        // Set door color based on level (contrasting with floor)
        this.color = this.getDoorColor();
        // Set knob color based on door color/level for contrast
        this.knobColor = this.getKnobColor();
    }

    getDoorColor() {
        for (const entry of GameConfig.DOOR_COLORS) {
            if (this.level >= entry.min && this.level <= entry.max) {
                return entry.color;
            }
        }
        return '#8B4513'; // fallback
    }

    getKnobColor() {
        // Use GameConfig.DOOR_KNOB_COLORS for knob color by level range
        for (const entry of GameConfig.DOOR_KNOB_COLORS) {
            if (this.level >= entry.min && this.level <= entry.max) {
                return entry.color;
            }
        }
        return '#FFD700'; // fallback
    }
    
    generateSequence() {
        const keys = ['↑', '↓', '␣'];
        const length = Math.min(Math.floor((this.level - 1) / 3) + 1, 4);
        const sequence = [];
        
        for (let i = 0; i < length; i++) {
            sequence.push(keys[Math.floor(Math.random() * keys.length)]);
        }
        
        return sequence;
    }
    
    render(ctx) {
        if (this.isOpen) {
            // Open door - just frame
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Show "PASS USED" if opened with door pass
            if (this.passUsed) {
                ctx.fillStyle = '#FF69B4';
                ctx.font = '12px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('PASS USED', this.x + this.width/2, this.y + this.height/2);
            }
        } else if (this.sequenceFailed) {
            // Failed sequence door - broken
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1.0;
            
            // Broken handle
            ctx.fillStyle = this.knobColor;
            ctx.fillRect(this.x + this.width - 8, this.y + this.height/2 - 2, 4, 4);
            
            // "BROKEN" text
            ctx.fillStyle = '#FF0000';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('BROKEN', this.x + this.width/2, this.y + this.height/2);
        } else {
            // Closed door
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Door handle
            ctx.fillStyle = this.knobColor;
            ctx.fillRect(this.x + this.width - 8, this.y + this.height/2 - 2, 4, 4);
            
            // Green outline when in range
            if (this.inRange) {
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 4;
                ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            }
            
            // Show sequence
            if (!this.isOpen && !this.sequenceFailed) {
                const sequenceText = this.sequence.join(' ');
                
                // Background for visibility
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                const textWidth = sequenceText.length * 15 + 10;
                ctx.fillRect(this.x + this.width/2 - textWidth/2, this.y - 35, textWidth, 25);
                
                // Sequence text
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 20px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(sequenceText, this.x + this.width/2, this.y - 15);
            }
        }
    }
    
    open() {
        this.isOpen = true;
    }
    
    openWithPass() {
        this.isOpen = true;
        this.passUsed = true;
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