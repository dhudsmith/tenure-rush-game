// GameScene.js - Main gameplay scene
import { Player } from '../entities/Player.js';
import { Door } from '../entities/Door.js';
import { PowerUp } from '../entities/PowerUp.js';
import { Friend } from '../entities/Friend.js';
import CC from '../entities/CC.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { HUD } from '../ui/HUD.js';
import { EventBus } from '../utils/EventBus.js';
import { GameConfig, PowerUpType, getRandomCallout } from '../utils/Constants.js';
import { AudioManager } from '../systems/AudioManager.js';
import { Timer } from '../utils/Timer.js';

export class GameScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Core systems
        this.eventBus = EventBus.getInstance();
        this.physicsSystem = new PhysicsSystem();
        this.powerUpSystem = new PowerUpSystem();
        this.hud = new HUD();
        this.audio = new AudioManager();
        this.timer = new Timer();
        
        // Game state
        this.scrollOffset = 0;
        this.scrollSpeed = GameConfig.SCROLL_SPEED.BASE;
        this.level = 1;
        this.tenure = 0;
        this.heartsCollected = 0;
        this.doorPassesUsed = 0; // Track door passes used for stats
        this.audioInitialized = false;
        this.speedUpActive = false; // Track if speed up is active
        this.SPEED_UP_MULTIPLIER = 2.5;
        this.devMode = false; // Dev mode for 10x door experience
        
        // Entities
        this.player = new Player(this.width / 2 - 15, this.height - 80);
        this.player.reset(); // Ensure player starts with full HP and reset state
        this.doors = [];
        this.powerups = [];
        this.friends = [];
        this.hearts = [];
        this.callouts = [];
        this.ccs = []; // CC enemies
        
        // Spawning timers
        this.doorSpawnTimer = 0;
        this.doorSpawnInterval = this.getRandomDoorInterval();
        this.powerupSpawnTimer = 0;
        this.powerupSpawnInterval = this.getRandomPowerupInterval();
        this.friendSpawnTimer = 0;
        this.friendSpawnInterval = this.getRandomFriendInterval();
        this.ccSpawnTimer = 0;
        this.ccSpawnInterval = this.getRandomCCInterval();
        
        // Door sequence state
        this.currentSequence = [];
        this.sequenceIndex = 0;
        this.awaitingInput = false;
        this.currentDoor = null;
        
        this.setupEventListeners();
        
        // Initialize HUD with reset player state
        this.hud.updateAll(this.getStats());
        
        // Start the timer when the game begins
        this.timer.start();
        
        this.spawnDoor();
    }
    
    async initializeAudio() {
        if (!this.audioInitialized) {
            this.audioInitialized = await this.audio.initialize();
        }
    }

    setupEventListeners() {
        // Player events
        this.eventBus.on('player.damaged', () => {
            this.hud.updateHP(this.player.hp);
            if (this.player.hp <= 0) {
                this.eventBus.emit('game.over');
            }
        });
        
        // Player healed event (e.g. from sushi)
        this.eventBus.on('player.healed', () => {
            this.hud.updateHP(this.player.hp);
        });
        
        // Door events
        this.eventBus.on('door.sequence.start', (data) => {
            this.startDoorSequence(data.door);
        });
        
        this.eventBus.on('door.opened', (data) => {
            this.onDoorOpened(data.door, data.passUsed);
        });
        
        // Power-up events
        this.eventBus.on('powerup.collected', (data) => {
            this.powerUpSystem.activate(data.type, data.duration);
            if (!this.speedUpActive) this.updateScrollSpeed();
            this.audio.playPowerupCollection(); // Play sound on powerup
        });
        
        this.eventBus.on('powerup.expired', (data) => {
            if (data.type === PowerUpType.COFFEE && !this.speedUpActive) {
                this.updateScrollSpeed();
            }
        });
        
        // Friend events
        this.eventBus.on('friend.contacted', () => {
            this.heartsCollected++;
            this.player.doorPasses++;
            this.spawnHeartAnimation();
            this.hud.updateAll(this.getStats());
            this.audio.playFriendContact(); // Play sound on friend contact
        });
        
        // Input events
        this.eventBus.on('input.sequence', (data) => {
            this.processSequenceInput(data.key);
        });
        
        // Callout events
        this.eventBus.on('callout', (data) => {
            this.addCallout(data.text, data.x, data.y, data.color);
        });
        
        // Listen for up arrow down/up for speed up
        this.eventBus.on('input.up.down', () => {
            // Only allow speed up if coffee is active
            if (!this.isPlayerInUnlockWindow() && this.powerUpSystem.isActive && this.powerUpSystem.isActive('coffee')) {
                this.speedUpActive = true;
                this.applySpeedUp();
            }
        });
        this.eventBus.on('input.up.up', () => {
            this.speedUpActive = false;
            this.updateScrollSpeed();
        });
        this.eventBus.on('door.sequence.start', () => {
            if (this.speedUpActive) {
                this.speedUpActive = false;
                this.updateScrollSpeed();
            }
        });
        this.eventBus.on('input.sequence', () => {
            if (this.speedUpActive && this.isPlayerInUnlockWindow()) {
                this.speedUpActive = false;
                this.updateScrollSpeed();
            }
        });
        // Dev mode toggle event from InputManager
        this.eventBus.on('input.dev.toggle', () => {
            this.devMode = !this.devMode;
            this.addCallout(
                this.devMode ? 'DEV MODE ON' : 'DEV MODE OFF',
                this.player.x + 15,
                this.player.y - 30,
                this.devMode ? '#FFD700' : '#888'
            );
        });
        // Initialize audio on first interaction
        const initAudioOnce = async () => {
            await this.initializeAudio();
            document.removeEventListener('click', initAudioOnce);
            document.removeEventListener('keydown', initAudioOnce);
        };
        document.addEventListener('click', initAudioOnce);
        document.addEventListener('keydown', initAudioOnce);
    }
    
    isPlayerInUnlockWindow() {
        // True if any door is in range and aligned
        return this.doors.some(door => !door.inputTriggered && this.isDoorInRange(door) && this.playerAlignedWithDoor(door));
    }

    applySpeedUp() {
        this.scrollSpeed = GameConfig.SCROLL_SPEED.BASE * this.SPEED_UP_MULTIPLIER;
    }

    update(deltaTime) {
        // Victory cheat disabled for production
        // if (window.gameInstance && (window.gameInstance.inputManager.isKeyPressed('v') || window.gameInstance.inputManager.isKeyPressed('V'))) {
        //     console.log('V key pressed! Triggering victory scene...');
        //     this.heartsCollected = Math.random() < 0.5 ? Math.floor(Math.random() * 19) + 1 : Math.floor(Math.random() * 10) + 20;
        //     console.log('Hearts set to:', this.heartsCollected);
        //     console.log('Calling showVictory...');
        //     window.gameInstance.showVictory();
        //     console.log('showVictory called, returning from update');
        //     return; // Exit update early to prevent further processing
        // }

        // Update scroll
        this.scrollOffset += this.scrollSpeed;
        
        // Update entities
        this.player.update(deltaTime);
        this.updateDoors();
        this.updatePowerups();
        this.updateFriends();
        this.updateCCs();
        this.updateHearts();
        this.updateCallouts();
        
        // Update systems
        this.powerUpSystem.update(deltaTime);
        
        // Spawn new entities
        this.doorSpawnTimer++;
        if (this.doorSpawnTimer >= this.doorSpawnInterval) {
            this.spawnDoor();
            this.doorSpawnTimer = 0;
            this.doorSpawnInterval = this.getRandomDoorInterval();
        }

        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer >= this.powerupSpawnInterval) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
            this.powerupSpawnInterval = this.getRandomPowerupInterval();
        }

        this.friendSpawnTimer++;
        if (this.friendSpawnTimer >= this.friendSpawnInterval) {
            this.spawnFriend();
            this.friendSpawnTimer = 0;
            this.friendSpawnInterval = this.getRandomFriendInterval();
        }

        // Spawn CCs
        this.ccSpawnTimer++;
        if (this.ccSpawnTimer >= this.ccSpawnInterval) {
            this.spawnCC();
            this.ccSpawnTimer = 0;
            this.ccSpawnInterval = this.getRandomCCInterval();
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update level
        this.updateLevel();
        
        // Update HUD
        this.hud.updatePowerups(this.powerUpSystem.getActiveEffects());
        this.hud.updateItems(this.player.chopsticksCount, this.player.doorPasses);
        this.hud.updateTimer(this.timer.getCurrentFormattedTime());
        
        // Handle continuous speed up
        if (this.speedUpActive && !this.isPlayerInUnlockWindow()) {
            this.applySpeedUp();
        } else if (this.speedUpActive && this.isPlayerInUnlockWindow()) {
            this.speedUpActive = false;
            this.updateScrollSpeed();
        }
    }
    
    render(ctx) {
        // Background
        this.drawBackground(ctx);
        
        // Draw doors sorted by y (furthest first, closest last)
        const sortedDoors = [...this.doors].sort((a, b) => a.y - b.y);
        sortedDoors.forEach(door => door.render(ctx));
        
        // Other entities
        this.powerups.forEach(powerup => powerup.render(ctx));
        this.friends.forEach(friend => friend.render(ctx));
        this.ccs.forEach(cc => cc.render(ctx));
        this.player.render(ctx);
        
        // Effects
        this.hearts.forEach(heart => this.drawHeart(ctx, heart));
        this.callouts.forEach(callout => this.drawCallout(ctx, callout));
    }
    
    updateDoors() {
        for (let i = this.doors.length - 1; i >= 0; i--) {
            const door = this.doors[i];
            door.y += this.scrollSpeed;
            
            // Update door range status based on current position and alignment
            door.inRange = this.isDoorInRange(door) && this.playerAlignedWithDoor(door);
            
            // If current door goes out of range, clear the sequence
            if (this.currentDoor === door && !door.inRange) {
                this.currentDoor = null;
                this.awaitingInput = false;
            }
            
            // Check if door is ready for input (only if no sequence is currently active)
            if (!this.currentDoor && door.inRange && !door.isOpen && !door.sequenceFailed) {
                this.eventBus.emit('door.sequence.start', { door });
            }
            
            // Remove doors that are off screen
            if (door.y > this.height + 50) {
                this.doors.splice(i, 1);
            }
        }
    }
    
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += this.scrollSpeed;
            
            if (powerup.y > this.height + 50) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    updateFriends() {
        for (let i = this.friends.length - 1; i >= 0; i--) {
            const friend = this.friends[i];
            friend.update(this.scrollSpeed);
            
            if (friend.y > this.height + 50) {
                this.friends.splice(i, 1);
            }
        }
    }
    
    updateCCs() {
        for (let i = this.ccs.length - 1; i >= 0; i--) {
            const cc = this.ccs[i];
            cc.update();
            cc.y += this.scrollSpeed; // Move with scroll
            
            if (cc.y > this.height + 50) {
                this.ccs.splice(i, 1);
            }
        }
    }
    
    updateHearts() {
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];
            heart.y -= 2;
            heart.timer--;
            
            if (heart.timer <= 0) {
                this.hearts.splice(i, 1);
            }
        }
    }
    
    updateCallouts() {
        for (let i = this.callouts.length - 1; i >= 0; i--) {
            const callout = this.callouts[i];
            callout.timer--;
            callout.y -= 1;
            
            if (callout.timer <= 0) {
                this.callouts.splice(i, 1);
            }
        }
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.tenure / 10) + 1;
        if (newLevel !== this.level) {
            this.level = Math.min(newLevel, 10);
            this.hud.updateLevel(this.level);
        }
    }
    
    updateScrollSpeed() {
        // Only update scroll speed if manual speed up is not active
        if (this.speedUpActive) return;
        // Coffee should NOT affect forward speed
        this.scrollSpeed = GameConfig.SCROLL_SPEED.BASE;
    }
    
    checkCollisions() {
        // Player-Door collisions
        for (const door of this.doors) {
            if (!door.isOpen && !door.hasHitPlayer && this.physicsSystem.checkCollision(this.player, door)) {
                door.hasHitPlayer = true;
                
                if (this.player.doorPasses > 0) {
                    this.player.doorPasses--;
                    this.doorPassesUsed++; // Track door pass usage
                    door.openWithPass(); // Actually open the door when using a pass
                    this.eventBus.emit('door.opened', { door, passUsed: true });
                } else {
                    this.player.takeDamage();
                    this.addCallout(getRandomCallout('FAILURE'), this.player.x + 15, this.player.y, "#F00");
                }
            }
        }
        
        // Player-PowerUp collisions
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (this.physicsSystem.checkCollision(this.player, powerup)) {
                powerup.collect(this.player);
                this.powerups.splice(i, 1);
                break;
            }
        }
        
        // Player-Friend collisions
        for (const friend of this.friends) {
            if (!friend.contacted && this.physicsSystem.checkCollision(this.player, friend)) {
                friend.contact();
                break;
            }
        }
        
        // Player-CC collisions
        for (let i = this.ccs.length - 1; i >= 0; i--) {
            const cc = this.ccs[i];
            if (this.physicsSystem.checkCollision(this.player, cc)) {
                this.handleCCCollision(cc);
                // Don't remove CC, they persist after collision
                break;
            }
        }
    }
    
    spawnDoor() {
        const doorWidth = 60; // Fixed door width for all levels
        
        const door = new Door(
            Math.random() * (this.width - doorWidth),
            -60,
            this.level
        );
        this.doors.push(door);
    }
    
    spawnPowerup() {
        const types = [PowerUpType.COFFEE, PowerUpType.GLASSES, PowerUpType.CHEESE];
        // Only allow chopsticks if player does not have any equipped
        if (this.player.chopsticksCount === 0) {
            types.push(PowerUpType.CHOPSTICKS);
        }
        if (this.player.chopsticksCount > 0) {
            types.push(PowerUpType.SUSHI);
        }
        const type = types[Math.floor(Math.random() * types.length)];
        const powerup = new PowerUp(
            Math.random() * (this.width - 40),
            -30,
            type
        );
        
        this.powerups.push(powerup);
    }
    
    spawnFriend() {
        const friend = new Friend(
            Math.random() * (this.width - 40),
            -40
        );
        this.friends.push(friend);
    }
    
    spawnCC() {
        const cc = new CC(
            Math.random() * (GameConfig.HALLWAY_WIDTH - 40) + 50, // Spawn within hallway walls
            -80,
            null // No sprite parameter needed
        );
        this.ccs.push(cc);
    }
    
    handleCCCollision(cc) {
        // Only process if player is not in immunity frames
        if (this.player.damageImmunity > 0) return;
        
        // Clear all power-ups
        this.powerUpSystem.clear();
        
        // Clear chopsticks and door passes
        this.player.clearChopsticks();
        this.player.clearDoorPasses();
        
        // Deal 1 HP damage
        this.player.takeDamage();
        
        // Add callout
        this.addCallout(getRandomCallout('CC_CONTACT'), this.player.x + 15, this.player.y, "#FF0000");
        
        // Update HUD to reflect changes
        this.hud.updateAll(this.getStats());
        this.hud.updatePowerups(this.powerUpSystem.getActiveEffects());
    }
    
    spawnHeartAnimation() {
        // Spawn hearts above both characters
        this.hearts.push({
            x: this.player.x + 15,
            y: this.player.y - 10,
            timer: 60
        });
        
        // Find the friend that was just contacted
        const friend = this.friends.find(f => f.contacted && f.y < this.player.y + 50);
        if (friend) {
            this.hearts.push({
                x: friend.x + 15,
                y: friend.y - 10,
                timer: 60
            });
        }
    }
    
    startDoorSequence(door) {
        if (this.currentDoor === door) return;
        
        this.currentDoor = door;
        this.currentSequence = [...door.sequence];
        this.sequenceIndex = 0;
        this.awaitingInput = true;
    }
    
    onDoorOpened(door, passUsed) {
        let progress = this.powerUpSystem.isActive(PowerUpType.GLASSES) ? 2 : 1;
        if (this.devMode) progress *= 10;
        this.tenure = Math.min(this.tenure + progress, 100);
        this.hud.updateTenure(this.tenure);
        
        if (passUsed) {
            this.audio.playDoorPassUsed();
        } else {
            this.audio.playDoorOpen();
            this.audio.playSuccess();
        }
        
        this.addCallout(passUsed ? "DOOR PASS USED!" : getRandomCallout('SUCCESS'), this.player.x + 15, this.player.y, passUsed ? "#FF69B4" : "#0F0");
        
        if (this.tenure >= 100) {
            this.timer.stop();
            this.timer.saveBestTime();
            this.eventBus.emit('game.win');
        }
    }

    processSequenceInput(inputKey) {
        if (!this.currentDoor || !this.awaitingInput) return;
        
        const expectedKey = this.currentSequence[this.sequenceIndex];
        
        // Mark input as triggered on first keypress
        if (!this.currentDoor.inputTriggered) {
            this.currentDoor.inputTriggered = true;
        }
        
        if (inputKey === expectedKey) {
            this.sequenceIndex++;
            
            if (this.sequenceIndex >= this.currentSequence.length) {
                // Sequence complete
                this.currentDoor.open();
                this.awaitingInput = false;
                this.eventBus.emit('door.opened', { door: this.currentDoor, passUsed: false });
                this.currentDoor = null;
                this.audio.playSuccess();
            }
        } else {
            // Wrong input
            this.currentDoor.sequenceFailed = true;
            this.currentDoor.hasHitPlayer = true;
            this.player.takeDamage();
            this.addCallout(getRandomCallout('FAILURE'), this.player.x + 15, this.player.y, "#F00");
            this.awaitingInput = false;
            this.currentDoor = null;
            this.audio.playError();
        }
    }
    
    isDoorInRange(door) {
        return door.y > this.player.y - 160 && door.y < this.player.y + 80;
    }
    
    playerAlignedWithDoor(door) {
        const playerCenter = this.player.x + this.player.width / 2;
        const doorLeft = door.x;
        const doorRight = door.x + door.width;
        
        return playerCenter >= doorLeft && playerCenter <= doorRight;
    }
    

    
    addCallout(text, x, y, color) {
        this.callouts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            timer: 60
        });
    }
    
    drawBackground(ctx) {
        ctx.fillStyle = '#0F4C75';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Hallway/floor color by level from Constants.js
        let floorColor = '#b7b09c'; // fallback
        for (const entry of GameConfig.FLOOR_COLORS) {
            if (this.level >= entry.min && this.level <= entry.max) {
                floorColor = entry.color;
                break;
            }
        }
        ctx.fillStyle = floorColor;
        ctx.fillRect(50, 0, this.width - 100, this.height);
        
        // Walls
        ctx.strokeStyle = '#1B4F72';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(50, this.height);
        ctx.moveTo(this.width - 50, 0);
        ctx.lineTo(this.width - 50, this.height);
        ctx.stroke();
    }
    
    drawHeart(ctx, heart) {
        ctx.fillStyle = '#FF69B4';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❤️', heart.x, heart.y);
    }
    
    drawCallout(ctx, callout) {
        ctx.font = 'bold 20px Courier New';
        ctx.textAlign = 'center';
        
        const textWidth = ctx.measureText(callout.text).width;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(callout.x - textWidth/2 - 8, callout.y - 18, textWidth + 16, 25);
        
        ctx.fillStyle = '#FFF';
        ctx.fillText(callout.text, callout.x, callout.y);
    }
    
    getStats() {
        return {
            tenure: this.tenure,
            hearts: this.heartsCollected,
            level: this.level,
            hp: this.player.hp,
            doorPasses: this.player.doorPasses,
            chopsticksCount: this.player.chopsticksCount,
            doorPassesUsed: this.doorPassesUsed,
            timer: this.timer.getCurrentFormattedTime(),
            timerStats: this.timer.getCompletionStats()
        };
    }
    
    getRandomDoorInterval() {
        const [min, max] = GameConfig.SPAWNING.DOOR_INTERVAL;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomPowerupInterval() {
        const [min, max] = GameConfig.SPAWNING.POWERUP_INTERVAL;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    getRandomFriendInterval() {
        const [min, max] = GameConfig.SPAWNING.FRIEND_INTERVAL;
        // If cheese powerup is active, halve the interval (double spawn rate)
        if (this.powerUpSystem && this.powerUpSystem.isActive && this.powerUpSystem.isActive(PowerUpType.CHEESE)) {
            return Math.floor((Math.random() * (max - min + 1) + min) / 2);
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    getRandomCCInterval() {
        // Find CC spawn interval for current level
        const ccConfig = GameConfig.SPAWNING.CC_INTERVALS.find(config => config.level === this.level);
        if (!ccConfig) {
            // Default to level 10 intervals if level not found
            const defaultConfig = GameConfig.SPAWNING.CC_INTERVALS[GameConfig.SPAWNING.CC_INTERVALS.length - 1];
            const [min, max] = defaultConfig.interval;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        const [min, max] = ccConfig.interval;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}