// PhysicsSystem.js - Collision detection
export class PhysicsSystem {
    constructor() {
        // Could implement spatial hashing for optimization later
    }
    
    checkCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        return this.rectanglesOverlap(bounds1, bounds2);
    }
    
    rectanglesOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}