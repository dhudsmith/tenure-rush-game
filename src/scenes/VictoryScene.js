// VictoryScene.js - Victory scene with outdoor hiking environment
import { EventBus } from '../utils/EventBus.js';
import { GameState, ROMANTIC_ENDING_HEARTS } from '../utils/Constants.js';
import { AudioManager } from '../systems/AudioManager.js';

export class VictoryScene {
    constructor(canvas, gameStats) {
        console.log('VictoryScene constructor called with stats:', gameStats);
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext('2d');
        this.eventBus = EventBus.getInstance();
        this.audio = new AudioManager();
        
        // Game completion stats
        this.stats = gameStats;
        this.romanticEnding = this.stats.hearts >= ROMANTIC_ENDING_HEARTS;
        console.log('Romantic ending:', this.romanticEnding, 'Hearts:', this.stats.hearts);
        
        // Animation state
        this.fadePhase = 'fadeOut'; // fadeOut -> sceneTransition -> characterAnimation -> endScreen
        this.fadeOpacity = 0;
        this.animationTimer = 0;
        this.characterAnimationStarted = false;
        this.audioPlayed = false;
        
        // Scene elements
        this.setupScene();
        
        // Start fade-out from game
        this.startFadeOut();
        console.log('VictoryScene constructor completed');
    }
    
    setupScene() {
        // Mountain landscape elements - made taller to support waterfall
        this.mountains = [
            { x: 0, y: this.height * 0.25, width: this.width * 0.4, height: this.height * 0.45 },
            { x: this.width * 0.3, y: this.height * 0.15, width: this.width * 0.5, height: this.height * 0.55 },
            { x: this.width * 0.6, y: this.height * 0.2, width: this.width * 0.4, height: this.height * 0.5 }
        ];
        
        // Background trees (drawn behind trail) - smaller, higher up, on ground level only
        this.backgroundTrees = [
            // Left background area - well above trail area
            { x: this.width * 0.1, y: this.height * 0.58, size: 35 },
            { x: this.width * 0.15, y: this.height * 0.55, size: 38 },
            { x: this.width * 0.22, y: this.height * 0.6, size: 32 },
            { x: this.width * 0.08, y: this.height * 0.62, size: 40 },
            
            // Center background area - between mountains but not on them
            { x: this.width * 0.45, y: this.height * 0.58, size: 42 },
            { x: this.width * 0.52, y: this.height * 0.6, size: 36 },
            { x: this.width * 0.48, y: this.height * 0.65, size: 38 },
            
            // Right background area
            { x: this.width * 0.82, y: this.height * 0.56, size: 40 },
            { x: this.width * 0.88, y: this.height * 0.59, size: 35 },
            { x: this.width * 0.85, y: this.height * 0.63, size: 37 }
        ];
        
        // Foreground trees (drawn in front of trail) - larger, lower, creating forest depth
        this.foregroundTrees = [
            // Left foreground - well below trail path (trail ends at y=0.75, so start at 0.8+)
            { x: 50, y: this.height * 0.82, size: 65 },
            { x: 120, y: this.height * 0.85, size: 70 },
            { x: 80, y: this.height * 0.88, size: 60 },
            { x: 160, y: this.height * 0.9, size: 68 },
            { x: 25, y: this.height * 0.92, size: 55 },
            { x: 200, y: this.height * 0.94, size: 72 },
            
            // Right foreground - well below trail path
            { x: this.width - 80, y: this.height * 0.82, size: 75 },
            { x: this.width - 150, y: this.height * 0.85, size: 68 },
            { x: this.width - 40, y: this.height * 0.88, size: 65 },
            { x: this.width - 180, y: this.height * 0.9, size: 70 },
            { x: this.width - 110, y: this.height * 0.92, size: 62 },
            { x: this.width - 220, y: this.height * 0.94, size: 78 },
            { x: this.width - 60, y: this.height * 0.96, size: 55 }
        ];
        
        // Waterfall - now flows from the mountain
        this.waterfall = {
            x: this.width * 0.7,
            y: this.height * 0.35, // Start a bit lower on the mountain
            width: 30,
            height: this.height * 0.3 // Adjusted height to still reach pool
        };
        
        // Pool - adjusted position to align with waterfall
        this.pool = {
            x: this.width * 0.65,
            y: this.height * 0.65,
            width: 80,
            height: 30
        };
        
        // Trail
        this.trail = {
            startX: -20, // Start off-screen left
            startY: this.height * 0.9,
            endX: this.width + 20, // End off-screen right
            endY: this.height * 0.75,
            width: 50
        };
        
        // Pre-generate fixed positions for trail details to avoid moving particles
        this.trailTexture = [];
        this.trailRocks = [];
        
        // Generate texture spots (fixed positions)
        for (let i = 0; i < 15; i++) {
            const t = i / 14;
            this.trailTexture.push({
                x: this.trail.startX + t * (this.trail.endX - this.trail.startX) + Math.sin(t * Math.PI * 3) * 10 + (Math.random() - 0.5) * 20,
                y: this.trail.startY + t * (this.trail.endY - this.trail.startY) + Math.cos(t * Math.PI * 2) * 5 + (Math.random() - 0.5) * 15,
                radius: 3 + Math.random() * 2
            });
        }
        
        // Generate rock positions (fixed positions)
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            const x = this.trail.startX + t * (this.trail.endX - this.trail.startX);
            const y = this.trail.startY + t * (this.trail.endY - this.trail.startY);
            const halfWidth = this.trail.width / 2;
            
            this.trailRocks.push({
                x: x - halfWidth - 5,
                y: y + (Math.random() - 0.5) * 10,
                radius: 2
            });
            
            this.trailRocks.push({
                x: x + halfWidth + 5,
                y: y + (Math.random() - 0.5) * 10,
                radius: 2
            });
        }
        
        // Character positions - they will follow the curved path
        this.professor = {
            x: this.width * 0.1,
            y: this.height * 0.88,
            pathProgress: 0.1, // Progress along the curved path (0 to 1)
            targetProgress: 0.7, // Target progress on path
            width: 30,
            height: 40,
            animationPhase: 'walking', // walking -> celebration
            celebrationTimer: 0
        };
        
        if (this.romanticEnding) {
            this.friend = {
                x: this.width * 0.05,
                y: this.height * 0.89,
                pathProgress: 0.05, // Start slightly behind professor
                targetProgress: 0.65, // Target progress on path
                width: 30,
                height: 40,
                animationPhase: 'walking',
                celebrationTimer: 0
            };
        }
    }
    
    startFadeOut() {
        this.fadePhase = 'fadeOut';
        this.fadeOpacity = 0;
    }
    
    update(deltaTime) {
        this.animationTimer += deltaTime;
        
        switch (this.fadePhase) {
            case 'fadeOut':
                this.fadeOpacity += 0.02;
                if (this.fadeOpacity >= 1) {
                    this.fadePhase = 'sceneTransition';
                    this.fadeOpacity = 1;
                }
                break;
                
            case 'sceneTransition':
                if (this.animationTimer > 1000) { // 1 second pause
                    this.fadePhase = 'fadeIn';
                }
                break;
                
            case 'fadeIn':
                this.fadeOpacity -= 0.02;
                if (this.fadeOpacity <= 0) {
                    this.fadeOpacity = 0;
                    this.fadePhase = 'characterAnimation';
                    this.characterAnimationStarted = true;
                    
                    // Play victory audio when scene becomes visible
                    if (!this.audioPlayed) {
                        this.audioPlayed = true;
                        this.audio.initialize().then(() => {
                            this.audio.playVictory();
                        });
                    }
                }
                break;
                
            case 'characterAnimation':
                this.updateCharacterAnimation(deltaTime);
                break;
                
            case 'endScreen':
                // Waiting for user input
                break;
        }
    }
    
    // Helper function to get position along the curved trail
    getPositionOnTrail(progress) {
        // Clamp progress between 0 and 1
        progress = Math.max(0, Math.min(1, progress));
        
        const startX = this.trail.startX;
        const startY = this.trail.startY;
        const endX = this.trail.endX;
        const endY = this.trail.endY;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 + 20; // Same curve as trail
        
        // Calculate position using quadratic Bezier curve formula
        const t = progress;
        const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
        const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
        
        return { x, y };
    }
    
    updateCharacterAnimation(deltaTime) {
        // Move professor along the path
        if (this.professor.animationPhase === 'walking') {
            const speed = 0.0015; // Progress speed along path per frame
            this.professor.pathProgress += speed;
            
            if (this.professor.pathProgress >= this.professor.targetProgress) {
                this.professor.pathProgress = this.professor.targetProgress;
                this.professor.animationPhase = 'celebration';
                this.professor.celebrationTimer = 0;
            }
            
            // Update position based on path progress
            const pos = this.getPositionOnTrail(this.professor.pathProgress);
            this.professor.x = pos.x;
            this.professor.y = pos.y;
        }
        
        // Move friend along the path if romantic ending
        if (this.romanticEnding && this.friend.animationPhase === 'walking') {
            this.friend.pathProgress += speed;
            if (this.friend.pathProgress >= this.friend.targetProgress) {
                this.friend.pathProgress = this.friend.targetProgress;
                this.friend.animationPhase = 'celebration';
                this.friend.celebrationTimer = 0;
            }
            const pos = this.getPositionOnTrail(this.friend.pathProgress);
            this.friend.x = pos.x;
            this.friend.y = pos.y;
        }
        const friendCelebrating = !this.romanticEnding || this.friend.animationPhase === 'celebration';
        if (this.romanticEnding && friendCelebrating) {
            this.friend.celebrationTimer += deltaTime;
        }
        
        // Check if both characters are celebrating
        const professorCelebrating = this.professor.animationPhase === 'celebration';
        
        if (professorCelebrating && friendCelebrating) {
            this.professor.celebrationTimer += deltaTime;
            if (this.romanticEnding) {
                this.friend.celebrationTimer += deltaTime;
            }
            
            // After 3 seconds of celebration, show end screen
            if (this.professor.celebrationTimer > 3000) {
                this.fadePhase = 'endScreen';
            }
        }
    }
    
    render(ctx) {
        // Clear canvas
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, this.width, this.height);
        
        if (this.fadePhase === 'fadeOut' || this.fadePhase === 'sceneTransition') {
            // Show black screen during transition
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.width, this.height);
        } else {
            // Render victory scene
            this.renderBackground(ctx);
            this.renderCharacters(ctx);
            this.renderEndScreen(ctx);
        }
        
        // Render fade overlay
        if (this.fadeOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeOpacity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    renderBackground(ctx) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB'); // Light blue
        gradient.addColorStop(0.7, '#B0E0E6'); // Powder blue
        gradient.addColorStop(1, '#F0F8FF'); // Alice blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Mountains
        ctx.fillStyle = '#8B7355'; // Brown
        this.mountains.forEach(mountain => {
            this.drawMountain(ctx, mountain);
        });
        
        // Background trees (drawn behind everything else for proper depth)
        this.backgroundTrees.forEach(tree => {
            this.drawTree(ctx, tree);
        });
        
        // Waterfall
        this.drawWaterfall(ctx);
        
        // Pool
        this.drawPool(ctx);
        
        // Trail
        this.drawTrail(ctx);
    }
    
    drawMountain(ctx, mountain) {
        ctx.beginPath();
        ctx.moveTo(mountain.x, mountain.y + mountain.height);
        ctx.lineTo(mountain.x + mountain.width / 3, mountain.y);
        ctx.lineTo(mountain.x + (mountain.width * 2/3), mountain.y + mountain.height * 0.3);
        ctx.lineTo(mountain.x + mountain.width, mountain.y + mountain.height * 0.8);
        ctx.lineTo(mountain.x + mountain.width, mountain.y + mountain.height);
        ctx.closePath();
        ctx.fill();
        
        // Snow caps
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(mountain.x + mountain.width / 3 - 15, mountain.y + 20);
        ctx.lineTo(mountain.x + mountain.width / 3, mountain.y);
        ctx.lineTo(mountain.x + mountain.width / 3 + 15, mountain.y + 20);
        ctx.fill();
        
        ctx.fillStyle = '#8B7355'; // Reset color
    }
    
    drawTree(ctx, tree) {
        // Trunk
        ctx.fillStyle = '#8B4513'; // Saddle brown
        ctx.fillRect(tree.x - 8, tree.y, 16, tree.size * 0.6);
        
        // Foliage
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.beginPath();
        ctx.arc(tree.x, tree.y - tree.size * 0.2, tree.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Additional foliage layers for depth
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.beginPath();
        ctx.arc(tree.x - 10, tree.y - tree.size * 0.1, tree.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(tree.x + 10, tree.y - tree.size * 0.15, tree.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawWaterfall(ctx) {
        // Waterfall
        const gradient = ctx.createLinearGradient(this.waterfall.x, this.waterfall.y, 
                                                 this.waterfall.x, this.waterfall.y + this.waterfall.height);
        gradient.addColorStop(0, '#B0E0E6'); // Light blue
        gradient.addColorStop(1, '#4682B4'); // Steel blue
        ctx.fillStyle = gradient;
        ctx.fillRect(this.waterfall.x, this.waterfall.y, this.waterfall.width, this.waterfall.height);
        
        // Water spray effect (simple white dots)
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 20; i++) {
            const x = this.waterfall.x + Math.random() * this.waterfall.width * 2;
            const y = this.waterfall.y + Math.random() * this.waterfall.height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPool(ctx) {
        // Pool
        ctx.fillStyle = '#4682B4'; // Steel blue
        ctx.beginPath();
        ctx.ellipse(this.pool.x + this.pool.width/2, this.pool.y + this.pool.height/2, 
                   this.pool.width/2, this.pool.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pool reflection
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.ellipse(this.pool.x + this.pool.width/2, this.pool.y + this.pool.height/2, 
                   this.pool.width/3, this.pool.height/3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawTrail(ctx) {
        // Create path points for a curved trail on the ground
        const startX = this.trail.startX;
        const startY = this.trail.startY;
        const endX = this.trail.endX;
        const endY = this.trail.endY;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 + 20; // Curve downward slightly for natural look
        
        // Draw the main trail as a filled shape
        ctx.fillStyle = '#DEB887'; // Burlywood dirt path
        ctx.beginPath();
        
        // Create a curved path using quadratic curves
        const trailWidth = this.trail.width;
        const halfWidth = trailWidth / 2;
        
        // Top edge of trail
        ctx.moveTo(startX, startY - halfWidth);
        ctx.quadraticCurveTo(midX, midY - halfWidth, endX, endY - halfWidth);
        
        // Bottom edge of trail (reverse direction)
        ctx.lineTo(endX, endY + halfWidth);
        ctx.quadraticCurveTo(midX, midY + halfWidth, startX, startY + halfWidth);
        ctx.closePath();
        ctx.fill();
        
        // Add texture using pre-generated fixed positions
        ctx.fillStyle = '#CD853F'; // Peru brown for texture
        this.trailTexture.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Add rocks using pre-generated fixed positions
        ctx.fillStyle = '#696969'; // Dim gray for rocks
        this.trailRocks.forEach(rock => {
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    renderCharacters(ctx) {
        if (this.fadePhase !== 'characterAnimation' && this.fadePhase !== 'endScreen') return;
        
        // Create array of all entities that need depth sorting (foreground trees + characters)
        const entities = [];
        
        // Add foreground trees
        this.foregroundTrees.forEach(tree => {
            entities.push({
                type: 'tree',
                data: tree,
                sortY: tree.y // Use tree base position for sorting
            });
        });
        
        // Add professor character
        entities.push({
            type: 'character',
            data: this.professor,
            drawFunction: (ctx, data) => this.drawHikingProfessor(ctx, data),
            sortY: this.professor.y // Use character feet position for sorting
        });
        
        // Add friend if romantic ending
        if (this.romanticEnding) {
            entities.push({
                type: 'character',
                data: this.friend,
                drawFunction: (ctx, data) => this.drawHikingFriend(ctx, data),
                sortY: this.friend.y // Use character feet position for sorting
            });
        }
        
        // Sort entities by Y position (furthest back first, closest last)
        entities.sort((a, b) => a.sortY - b.sortY);
        
        // Draw all entities in correct depth order
        entities.forEach(entity => {
            if (entity.type === 'tree') {
                this.drawTree(ctx, entity.data);
            } else if (entity.type === 'character') {
                entity.drawFunction(ctx, entity.data);
            }
        });
    }
    
    drawHikingProfessor(ctx, character) {
        const { x, y, width, height, animationPhase, celebrationTimer } = character;
        
        // Calculate celebration offset
        let celebrationY = 0;
        if (animationPhase === 'celebration') {
            celebrationY = Math.sin(celebrationTimer * 0.01) * 5; // Gentle bounce
        }
        
        // Body (hiking outfit)
        ctx.fillStyle = '#228B22'; // Forest green hiking outfit
        ctx.fillRect(x - width/2, y - height + celebrationY, width, height * 0.6);
        
        // Backpack
        ctx.fillStyle = '#8B4513'; // Brown backpack
        ctx.fillRect(x - width/3, y - height * 0.9 + celebrationY, width/3, height * 0.4);
        
        // Head
        ctx.fillStyle = '#FDBCB4'; // Fair skin
        ctx.beginPath();
        ctx.arc(x, y - height * 0.85 + celebrationY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = '#8B4513'; // Dark brown hair
        ctx.beginPath();
        ctx.arc(x, y - height * 0.9 + celebrationY, 10, Math.PI, Math.PI * 2);
        ctx.fill();
        
        // Arms - raised if celebrating
        ctx.strokeStyle = '#FDBCB4';
        ctx.lineWidth = 4;
        if (animationPhase === 'celebration') {
            // Raised arms with trekking poles
            ctx.beginPath();
            ctx.moveTo(x - 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x - 15, y - height * 0.9 + celebrationY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x + 15, y - height * 0.9 + celebrationY);
            ctx.stroke();
            
            // Trekking poles
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 15, y - height * 0.9 + celebrationY);
            ctx.lineTo(x - 15, y - height * 0.6 + celebrationY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 15, y - height * 0.9 + celebrationY);
            ctx.lineTo(x + 15, y - height * 0.6 + celebrationY);
            ctx.stroke();
        } else {
            // Walking arms
            ctx.beginPath();
            ctx.moveTo(x - 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x - 12, y - height * 0.5 + celebrationY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x + 12, y - height * 0.5 + celebrationY);
            ctx.stroke();
        }
        
        // Legs
        ctx.fillStyle = '#000080'; // Navy blue hiking pants
        ctx.fillRect(x - 6, y - height * 0.4 + celebrationY, 5, height * 0.4);
        ctx.fillRect(x + 1, y - height * 0.4 + celebrationY, 5, height * 0.4);
        
        // Hiking boots
        ctx.fillStyle = '#8B4513'; // Brown boots
        ctx.fillRect(x - 8, y - 5 + celebrationY, 7, 8);
        ctx.fillRect(x + 1, y - 5 + celebrationY, 7, 8);
    }
    
    drawHikingFriend(ctx, character) {
        const { x, y, width, height, animationPhase, celebrationTimer } = character;
        
        // Calculate celebration offset
        let celebrationY = 0;
        if (animationPhase === 'celebration') {
            celebrationY = Math.sin(celebrationTimer * 0.01) * 5; // Gentle bounce
        }
        
        // Body (hiking outfit)
        ctx.fillStyle = '#4169E1'; // Royal blue hiking shirt
        ctx.fillRect(x - width/2, y - height + celebrationY, width, height * 0.6);
        
        // Backpack
        ctx.fillStyle = '#228B22'; // Green backpack
        ctx.fillRect(x - width/3, y - height * 0.9 + celebrationY, width/3, height * 0.4);
        
        // Head
        ctx.fillStyle = '#FDBCB4'; // Fair skin
        ctx.beginPath();
        ctx.arc(x, y - height * 0.85 + celebrationY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = '#FFD700'; // Blonde hair
        ctx.beginPath();
        ctx.arc(x, y - height * 0.9 + celebrationY, 10, Math.PI, Math.PI * 2);
        ctx.fill();
        
        // Arms - raised if celebrating
        ctx.strokeStyle = '#FDBCB4';
        ctx.lineWidth = 4;
        if (animationPhase === 'celebration') {
            // Raised arms with trekking poles
            ctx.beginPath();
            ctx.moveTo(x - 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x - 15, y - height * 0.9 + celebrationY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x + 15, y - height * 0.9 + celebrationY);
            ctx.stroke();
            
            // Trekking poles
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 15, y - height * 0.9 + celebrationY);
            ctx.lineTo(x - 15, y - height * 0.6 + celebrationY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 15, y - height * 0.9 + celebrationY);
            ctx.lineTo(x + 15, y - height * 0.6 + celebrationY);
            ctx.stroke();
        } else {
            // Walking arms
            ctx.beginPath();
            ctx.moveTo(x - 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x - 12, y - height * 0.5 + celebrationY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 8, y - height * 0.7 + celebrationY);
            ctx.lineTo(x + 12, y - height * 0.5 + celebrationY);
            ctx.stroke();
        }
        
        // Legs
        ctx.fillStyle = '#8B4513'; // Brown hiking pants
        ctx.fillRect(x - 6, y - height * 0.4 + celebrationY, 5, height * 0.4);
        ctx.fillRect(x + 1, y - height * 0.4 + celebrationY, 5, height * 0.4);
        
        // Hiking boots
        ctx.fillStyle = '#000'; // Black boots
        ctx.fillRect(x - 8, y - 5 + celebrationY, 7, 8);
        ctx.fillRect(x + 1, y - 5 + celebrationY, 7, 8);
    }
    
    renderEndScreen(ctx) {
        if (this.fadePhase !== 'endScreen') return;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Main congratulations message
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Congratulations!', this.width/2, this.height * 0.2);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 28px Courier New';
        ctx.fillText('Tenure Achieved!', this.width/2, this.height * 0.28);
        
        // Story text based on ending
        ctx.font = '18px Courier New';
        const storyText = this.romanticEnding 
            ? "A successful academic adventure - made even better with good company!"
            : "A successful academic adventure - achieved through determination and skill!";
        
        ctx.fillText(storyText, this.width/2, this.height * 0.4);
        
        // Ending message
        ctx.font = 'bold 20px Courier New';
        const endingMessage = this.romanticEnding
            ? "Time for a well-deserved sabbatical adventure together!"
            : "Time for a well-deserved solo sabbatical adventure!";
        
        ctx.fillText(endingMessage, this.width/2, this.height * 0.5);
        
        // Stats
        ctx.font = '16px Courier New';
        ctx.fillText(`Final Stats:`, this.width/2, this.height * 0.6);
        ctx.fillText(`Tenure: ${this.stats.tenure}%`, this.width/2, this.height * 0.65);
        ctx.fillText(`Hearts Collected: ${this.stats.hearts}`, this.width/2, this.height * 0.7);
        ctx.fillText(`Door Passes Used: ${this.stats.doorPassesUsed || 0}`, this.width/2, this.height * 0.75);
        
        // Timer stats
        ctx.fillText(`Completion Time: ${this.stats.timer || '00:00.00'}`, this.width/2, this.height * 0.8);
        if (this.stats.timerStats && this.stats.timerStats.isNewRecord) {
            ctx.fillStyle = '#FFD700'; // Gold for new record
            ctx.fillText(`🏆 NEW RECORD!`, this.width/2, this.height * 0.85);
            ctx.fillStyle = '#FFF'; // Reset to white
        } else if (this.stats.timerStats && this.stats.timerStats.bestTimeFormatted) {
            ctx.fillText(`Best Time: ${this.stats.timerStats.bestTimeFormatted}`, this.width/2, this.height * 0.85);
        }
        
        // Ending achieved indicator
        ctx.fillStyle = this.romanticEnding ? '#FF69B4' : '#4169E1'; // Pink for romantic, blue for solo
        ctx.fillText(`Ending: ${this.romanticEnding ? 'Romantic' : 'Solo'}`, this.width/2, this.height * 0.9);
        
        // Controls
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Courier New';
        ctx.fillText('Press R to Play Again', this.width/2, this.height * 0.95);
        ctx.fillText('Press ESC for Main Menu', this.width/2, this.height * 0.98);
    }
    
    handleInput(key) {
        if (this.fadePhase === 'endScreen') {
            if (key === 'KeyR') {
                this.eventBus.emit('game.restart');
                return true;
            } else if (key === 'Escape') {
                // Future: return to main menu
                this.eventBus.emit('game.restart');
                return true;
            }
        }
        return false;
    }
}
