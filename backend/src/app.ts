import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import { ApiError } from "./utility/ApiError";
import userRouter from "./router/user.router";
import applicationRouter from "./router/application.router";
import path from "path";
const app = express();

const frontendUrlRaw = process.env.FRONTEND_URL || '';
const frontendUrlClean = frontendUrlRaw.replace(/['"]+/g, '').trim();
const allowedOrigins = frontendUrlClean
  ? frontendUrlClean.split(/\s*(?:,|\|\||;|\|)\s*/).map(o => o.trim()).filter(Boolean)
  : [];

if (allowedOrigins.length === 0) {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // otherwise reject - browser will block the request
      return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    credentials: true
  }));
}

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