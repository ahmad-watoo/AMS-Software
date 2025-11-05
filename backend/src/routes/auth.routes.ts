/**
 * Authentication Routes
 * 
 * Defines all authentication-related API endpoints.
 * 
 * Routes:
 * - POST /register - Register new user (Public)
 * - POST /login - User login (Public)
 * - POST /refresh-token - Refresh access token (Public)
 * - POST /logout - User logout (Private)
 * - GET /profile - Get current user profile (Private)
 * 
 * @module routes/auth.routes
 */

import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    { email, password, firstName, lastName, ... }
 * @returns { user, accessToken, refreshToken, expiresIn }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @body    { email, password }
 * @returns { user, accessToken, refreshToken, expiresIn }
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken }
 * @returns { accessToken, expiresIn }
 * @todo    Implement refresh token logic
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private (requires authentication)
 * @headers { Authorization: Bearer <token> }
 * @returns { message: "Logout successful" }
 * @todo    Implement token blacklisting
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current authenticated user's profile
 * @access  Private (requires authentication)
 * @headers { Authorization: Bearer <token> }
 * @returns { userId, email, role }
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;
