const { parentPort, workerData } = require('worker_threads');
const audioProcessingService = require('../services/audioProcessingService');

// Handle worker shutdown
let shuttingDown = false;

async function startWorker() {
    try {
        console.log('Audio Processing Worker Starting...');
        await audioProcessingService.start();
    } catch (error) {
        console.error('Fatal error in audio processing worker:', error);
        // Notify parent thread of failure
        if (parentPort) {
            parentPort.postMessage({ type: 'error', error: error.message });
        }
        process.exit(1);
    }
}

// Handle worker messages
if (parentPort) {
    parentPort.on('message', async (message) => {
        if (message === 'shutdown') {
            shuttingDown = true;
            await audioProcessingService.stop();
            process.exit(0);
        }
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    if (!shuttingDown) {
        // Notify parent thread
        if (parentPort) {
            parentPort.postMessage({ type: 'error', error: error.message });
        }
        // Attempt to restart the service
        try {
            await audioProcessingService.stop();
            await startWorker();
        } catch (e) {
            console.error('Failed to restart service:', e);
            process.exit(1);
        }
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (!shuttingDown) {
        // Notify parent thread
        if (parentPort) {
            parentPort.postMessage({ type: 'error', error: reason.message });
        }
        // Attempt to restart the service
        try {
            await audioProcessingService.stop();
            await startWorker();
        } catch (e) {
            console.error('Failed to restart service:', e);
            process.exit(1);
        }
    }
});

startWorker(); 