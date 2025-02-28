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

// Start the worker manager
workerManager.start();

// Graceful shutdown handling
const gracefulShutdown = async () => {
    console.log('Received shutdown signal');
    
    // Stop accepting new requests
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
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
    });

    // Store the server instance for graceful shutdown
    server.on('close', () => {
        console.log('Server closed');
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

