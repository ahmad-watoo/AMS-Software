/**
 * Main Express Application Configuration
 * 
 * This module sets up the Express application with all middleware, routes, and error handling.
 * 
 * @module app
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';

const app: Express = express();

// ============================================================================
// Security Middleware
// ============================================================================

/**
 * Helmet.js - Sets various HTTP headers for security
 * Helps protect against common vulnerabilities like XSS, clickjacking, etc.
 */
app.use(helmet());

/**
 * CORS Configuration
 * Allows cross-origin requests from specified origins
 * Credentials are enabled to allow cookies/auth headers
 */
app.use(
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
);

/**
 * Rate Limiting
 * Prevents abuse by limiting the number of requests from a single IP
 * Configuration: max requests per window (defined in env config)
 */
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ============================================================================
// Body Parsing Middleware
// ============================================================================

/**
 * JSON Body Parser
 * Parses incoming JSON payloads up to 10MB
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL-encoded Body Parser
 * Parses incoming form data up to 10MB
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Request Logging Middleware
// ============================================================================

/**
 * Request Logger
 * Logs all incoming requests for debugging and monitoring
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// Health Check Endpoint
// ============================================================================

/**
 * Health Check Route
 * Used by load balancers and monitoring tools to check service status
 * 
 * @route GET /health
 * @returns {Object} Service status and timestamp
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// ============================================================================
// API Routes
// ============================================================================

// Import all route modules
import authRoutes from '@/routes/auth.routes';
import rbacRoutes from '@/routes/rbac.routes';
import userRoutes from '@/routes/user.routes';
import studentRoutes from '@/routes/student.routes';
import admissionRoutes from '@/routes/admission.routes';
import academicRoutes from '@/routes/academic.routes';
import timetableRoutes from '@/routes/timetable.routes';
import examinationRoutes from '@/routes/examination.routes';
import attendanceRoutes from '@/routes/attendance.routes';
import financeRoutes from '@/routes/finance.routes';
import learningRoutes from '@/routes/learning.routes';
import libraryRoutes from '@/routes/library.routes';
import hrRoutes from '@/routes/hr.routes';
import payrollRoutes from '@/routes/payroll.routes';
import administrationRoutes from '@/routes/administration.routes';
import certificationRoutes from '@/routes/certification.routes';
import multicampusRoutes from '@/routes/multicampus.routes';
import dashboardRoutes from '@/routes/dashboard.routes';

// Register all API routes with version prefix
app.use(`/api/${env.apiVersion}/auth`, authRoutes);
app.use(`/api/${env.apiVersion}/rbac`, rbacRoutes);
app.use(`/api/${env.apiVersion}/users`, userRoutes);
app.use(`/api/${env.apiVersion}/students`, studentRoutes);
app.use(`/api/${env.apiVersion}/admission`, admissionRoutes);
app.use(`/api/${env.apiVersion}/academic`, academicRoutes);
app.use(`/api/${env.apiVersion}/timetable`, timetableRoutes);
app.use(`/api/${env.apiVersion}/examination`, examinationRoutes);
app.use(`/api/${env.apiVersion}/attendance`, attendanceRoutes);
app.use(`/api/${env.apiVersion}/finance`, financeRoutes);
app.use(`/api/${env.apiVersion}/learning`, learningRoutes);
app.use(`/api/${env.apiVersion}/library`, libraryRoutes);
app.use(`/api/${env.apiVersion}/hr`, hrRoutes);
app.use(`/api/${env.apiVersion}/payroll`, payrollRoutes);
app.use(`/api/${env.apiVersion}/administration`, administrationRoutes);
app.use(`/api/${env.apiVersion}/certification`, certificationRoutes);
app.use(`/api/${env.apiVersion}/multicampus`, multicampusRoutes);
app.use(`/api/${env.apiVersion}/dashboard`, dashboardRoutes);

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Error handling middleware must be registered last
 * This ensures all errors are caught and handled consistently
 */

// 404 Handler - Catch all unmatched routes
app.use(notFoundHandler);

// Global Error Handler - Handle all errors
app.use(errorHandler);

export default app;
