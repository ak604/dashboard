// app.js
const dotenv = require('dotenv');
dotenv.config();
const environment = process.env.APP_ENV || 'local';  
dotenv.config({ path: `.env.${environment}` });
const cors = require("cors");
const s3Routes = require("./routes/s3Routes");
const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const companyRoutes = require('./routes/companyRoutes');
const callRoutes = require('./routes/callRoutes');
const logger = require('./utils/logger');
const getSecret = require("./config/secret"); 
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const workerManager = require('./services/workerManager');
const app = express();
const appRoutes = require('./routes/appRoutes');
const templateRoutes = require('./routes/templateRoutes');
const adminRoutes = require('./routes/adminRoutes');
const appLoadRoutes = require('./routes/appLoadRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const walletTransactionRoutes = require('./routes/walletTransactionRoutes');

// Middleware to parse JSON
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());

// Use Routes
app.use("/companies", companyRoutes);
app.use('/calls', callRoutes);
app.use("/s3", s3Routes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use('/apps', appRoutes);
app.use('/templates', templateRoutes);
app.use('/admin', adminRoutes);
app.use('/app', appLoadRoutes);
app.use('/rewards', rewardRoutes);
app.use('/wallet-transactions', walletTransactionRoutes);

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Create HTTP server instance at the top-level scope
let server;

// Graceful shutdown handling
const gracefulShutdown = async () => {
    console.log('Received shutdown signal');
    
    // Stop accepting new requests
    if (server) {
        server.close(() => {
            console.log('Server closed');
            
            // Stop worker processes
            workerManager.stop()
                .then(() => {
                    console.log('Workers stopped');
                    process.exit(0);
                })
                .catch(error => {
                    console.error('Error stopping workers:', error);
                    process.exit(1);
                });
        });
    } else {
        console.log('Server not started, stopping workers');
        workerManager.stop()
            .then(() => {
                console.log('Workers stopped');
                process.exit(0);
            })
            .catch(error => {
                console.error('Error stopping workers:', error);
                process.exit(1);
            });
    }
};

process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());

const startServer = async () => {
  try {
    const jwtSecret = await getSecret();
    process.env.JWT_SECRET = jwtSecret;

    app.get("/", (req, res) => {
      res.send("Server is running!");
    });

    const PORT = process.env.PORT || 3000;
    // Assign to the top-level server variable
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
    });

    const requiredEnvVars = [
        'APP_ENV',,
        'AWS_REGION',
        'SQS_AUDIO_QUEUE_URL',
        // ... other required variables
    ];

    const checkEnvVars = () => {
        const missing = requiredEnvVars.filter(key => !process.env[key]);
        if (missing.length > 0) {
            console.error('Missing required environment variables:', missing);
            process.exit(1);
        }
    };

    checkEnvVars();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

