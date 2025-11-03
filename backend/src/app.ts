import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// API routes
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

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

