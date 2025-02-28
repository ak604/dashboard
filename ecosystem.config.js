module.exports = {
    apps: [{
        name: 'audio-processing-app',
        script: 'app.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production'
        },
        // Ensure the app restarts if it uses too much memory or crashes
        max_restarts: 10,
        restart_delay: 5000,
        // Add error logs
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        // Merge logs
        merge_logs: true,
        // Time between automatic restarts
        min_uptime: '20s'
    }]
}; 