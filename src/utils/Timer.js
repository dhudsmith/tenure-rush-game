// Timer.js - Utility for tracking game completion times
export class Timer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.bestTime = this.loadBestTime();
    }
    
    start() {
        this.startTime = Date.now();
        this.endTime = null;
        this.isRunning = true;
    }
    
    stop() {
        if (this.isRunning) {
            this.endTime = Date.now();
            this.isRunning = false;
        }
    }
    
    reset() {
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
    }
    
    getCurrentTime() {
        if (!this.startTime) return 0;
        const endTime = this.isRunning ? Date.now() : this.endTime;
        return endTime - this.startTime;
    }
    
    getFormattedTime(milliseconds = null) {
        const time = milliseconds !== null ? milliseconds : this.getCurrentTime();
        const totalSeconds = Math.floor(time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((time % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    getCurrentFormattedTime() {
        return this.getFormattedTime();
    }
    
    isNewRecord(completionTime = null) {
        const time = completionTime !== null ? completionTime : this.getCurrentTime();
        return !this.bestTime || time < this.bestTime;
    }
    
    saveBestTime(completionTime = null) {
        const time = completionTime !== null ? completionTime : this.getCurrentTime();
        if (this.isNewRecord(time)) {
            this.bestTime = time;
            localStorage.setItem('tenureRush_bestTime', time.toString());
            return true;
        }
        return false;
    }
    
    loadBestTime() {
        const saved = localStorage.getItem('tenureRush_bestTime');
        return saved ? parseInt(saved, 10) : null;
    }
    
    getBestTimeFormatted() {
        return this.bestTime ? this.getFormattedTime(this.bestTime) : '--:--:--';
    }
    
    getCompletionStats() {
        const currentTime = this.getCurrentTime();
        const isNewRecord = this.isNewRecord(currentTime);
        
        return {
            currentTime: currentTime,
            currentTimeFormatted: this.getFormattedTime(currentTime),
            bestTime: this.bestTime,
            bestTimeFormatted: this.getBestTimeFormatted(),
            isNewRecord: isNewRecord
        };
    }
}