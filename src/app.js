import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import cookieParser from 'cookie-parser';
import swaggerSpec from "./swagger.js";
import swaggerUi from "swagger-ui-express";
dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
   'http://localhost:3000',
   'http://localhost:3001' 
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request Origin:', origin); // Debug origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('CORS error: Origin not allowed:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
import AuhtRoutes from './routes/auth.routes.js';
import serviceRoutes from "./routes/services.routes.js";
import categoryRoutes from './routes/category.route.js';
import subCategoryRoutes from './routes/subCategory.route.js';
import addressRoutes from './routes/address.route.js';
import cartRoutes from './routes/cart.route.js';
import orderRoutes from './routes/order.route.js';
import doctorRoutes from './routes/doctor.route.js';

app.use('/api/auth', AuhtRoutes);
app.use("/api/services", serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/doctor", doctorRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

export default app; 