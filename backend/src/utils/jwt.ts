/**
 * JWT Token Utilities
 * 
 * This module provides functions for generating and verifying JWT tokens.
 * It handles both access tokens (short-lived) and refresh tokens (long-lived).
 * 
 * @module utils/jwt
 */

import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

/**
 * Token Payload Interface
 * 
 * Defines the structure of data stored in JWT tokens.
 * 
 * @interface TokenPayload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Token Pair Interface
 * 
 * Contains both access and refresh tokens returned after authentication.
 * 
 * @interface TokenPair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate Access Token
 * 
 * Creates a short-lived JWT access token for API authentication.
 * Access tokens typically expire in 15 minutes to 1 hour.
 * 
 * @param {TokenPayload} payload - User data to encode in the token
 * @returns {string} Signed JWT access token
 * 
 * @example
 * const token = generateAccessToken({ userId: '123', email: 'user@example.com', role: 'student' });
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn, // Typically 15m-1h
  });
};

/**
 * Generate Refresh Token
 * 
 * Creates a long-lived JWT refresh token for obtaining new access tokens.
 * Refresh tokens typically expire in 7-30 days.
 * 
 * @param {TokenPayload} payload - User data to encode in the token
 * @returns {string} Signed JWT refresh token
 * 
 * @example
 * const refreshToken = generateRefreshToken({ userId: '123', email: 'user@example.com' });
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn, // Typically 7-30 days
  });
};

/**
 * Generate Token Pair
 * 
 * Convenience function to generate both access and refresh tokens at once.
 * Used during login and token refresh operations.
 * 
 * @param {TokenPayload} payload - User data to encode in the tokens
 * @returns {TokenPair} Object containing both access and refresh tokens
 * 
 * @example
 * const { accessToken, refreshToken } = generateTokenPair({ userId: '123', email: 'user@example.com' });
 */
export const generateTokenPair = (payload: TokenPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify Access Token
 * 
 * Validates and decodes an access token.
 * Throws an error if the token is invalid, expired, or tampered with.
 * 
 * @param {string} token - JWT access token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid, expired, or tampered with
 * 
 * @example
 * try {
 *   const payload = verifyAccessToken(token);
 *   console.log(payload.userId); // '123'
 * } catch (error) {
 *   // Handle invalid token
 * }
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwt.secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify Refresh Token
 * 
 * Validates and decodes a refresh token.
 * Throws an error if the token is invalid, expired, or tampered with.
 * 
 * @param {string} token - JWT refresh token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid, expired, or tampered with
 * 
 * @example
 * try {
 *   const payload = verifyRefreshToken(refreshToken);
 *   // Use payload to generate new access token
 * } catch (error) {
 *   // Handle invalid refresh token - user must login again
 * }
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
