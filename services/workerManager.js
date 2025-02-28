const { Worker } = require('worker_threads');
const path = require('path');

class WorkerManager {
    constructor() {
        this.worker = null;
        this.isShuttingDown = false;
        this.restartAttempts = 0;
        this.maxRestartAttempts = 5;
        this.restartDelay = 5000; // 5 seconds
    }

    async start() {
        if (this.worker) {
            console.log('Worker is already running');
            return;
        }

        try {
            this.worker = new Worker(
                path.join(__dirname, '../workers/audioProcessingWorker.js')
            );

            this.worker.on('message', this.handleWorkerMessage.bind(this));
            this.worker.on('error', this.handleWorkerError.bind(this));
            this.worker.on('exit', this.handleWorkerExit.bind(this));

            console.log('Audio Processing Worker Manager Started');
        } catch (error) {
            console.error('Failed to start worker:', error);
            this.handleWorkerError(error);
        }
    }

    async stop() {
        if (!this.worker) {
            return;
        }

        this.isShuttingDown = true;
        console.log('Stopping Audio Processing Worker...');
        
        try {
            // Send shutdown signal to worker
            this.worker.postMessage('shutdown');
            
            // Wait for worker to exit gracefully
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log('Worker shutdown timed out, forcing termination');
                    this.worker.terminate();
                    resolve();
                }, 30000); // 30 second timeout

                this.worker.once('exit', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        } catch (error) {
            console.error('Error stopping worker:', error);
        } finally {
            this.worker = null;
        }
    }

    handleWorkerMessage(message) {
        if (message.type === 'error') {
            console.error('Worker reported error:', message.error);
            this.restartWorker();
        }
    }

    handleWorkerError(error) {
        console.error('Worker error:', error);
        this.restartWorker();
    }

    handleWorkerExit(code) {
        console.log(`Worker exited with code ${code}`);
        if (!this.isShuttingDown) {
            this.restartWorker();
        }
    }

    async restartWorker() {
        if (this.isShuttingDown) return;

        if (this.restartAttempts >= this.maxRestartAttempts) {
            console.error(`Failed to restart worker after ${this.maxRestartAttempts} attempts`);
            process.exit(1);
        }

        this.restartAttempts++;
        console.log(`Attempting to restart worker (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`);

        // Wait before restarting
        await new Promise(resolve => setTimeout(resolve, this.restartDelay));

        try {
            await this.stop();
            await this.start();
            // Reset restart attempts on successful restart
            this.restartAttempts = 0;
        } catch (error) {
            console.error('Error restarting worker:', error);
            this.restartWorker();
        }
    }

    // Health check method
    isHealthy() {
        return this.worker !== null && !this.isShuttingDown;
    }
}

// Create and export singleton instance
const workerManager = new WorkerManager();
module.exports = workerManager; 