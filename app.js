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
const performanceRoutes = require('./routes/performanceRoutes');
const logger = require('./utils/logger');
const sqsMessageStream = require('./services/sqsService');
const getSecret = require("./config/secret"); 
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();


// Middleware to parse JSON
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
// Use Routes
app.use("/companies", companyRoutes);
app.use('/calls', callRoutes);
app.use('/performance', performanceRoutes);
app.use("/s3", s3Routes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

sqsMessageStream.subscribe((message) => {
  console.log('🔔 New message received:', message.Body);
});




const startServer = async () => {
  try {
    const jwtSecret = await getSecret();
    process.env.JWT_SECRET = jwtSecret;

    app.get("/", (req, res) => {
      res.send("Server is running!");
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
