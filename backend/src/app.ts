import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import { ApiError } from "./utility/ApiError";
import userRouter from "./router/user.router";
import applicationRouter from "./router/application.router";
import path from "path";
const app = express();

// CORS middleware
const frontendUrl = process.env.FRONTEND_URL
const allowedOrigins = frontendUrl ? frontendUrl.split(',').map(origin => origin.trim()) : [];

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Add Json body parser middleware
app.use(express.json());
// Add URL encoded body parser middleware
app.use(express.urlencoded({ extended: true }));

// API routes - must come before static file serving
app.use("/api/v1/users", userRouter);
app.use("/api/v1/applications", applicationRouter);

// Serve static files from React build
const buildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(buildPath));

app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});


// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  
  // Handle ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
    return;
  }
  
  // Handle other errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
};
app.use(errorHandler);

export { app };