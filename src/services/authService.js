/**
 * Authentication service
 * Handles all authentication-related API calls
 */
import { post, get, ApiError } from './api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} [userData.tenantName] - Optional tenant name
 * @returns {Promise<Object>} User data (without token, as it's in httpOnly cookie)
 */
export async function register(userData) {
  try {
    const response = await post('/auth/register', userData);
    // Set authentication flag in localStorage after successful registration
    localStorage.setItem('isAuthenticated', 'true');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific error cases
      if (error.status === 400) {
        throw new Error(error.data?.message || 'Invalid registration data');
      }
      if (error.status === 409) {
        throw new Error('Email already registered');
      }
    }
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} User data (without token, as it's in httpOnly cookie)
 */
export async function login(credentials) {
  try {
    const response = await post('/auth/login', credentials);
    // Set authentication flag in localStorage after successful login
    localStorage.setItem('isAuthenticated', 'true');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific error cases
      if (error.status === 400) {
        throw new Error(error.data?.message || 'Invalid login credentials');
      }
      if (error.status === 401) {
        throw new Error('Invalid email or password');
      }
    }
    throw error;
  }
}

/**
 * Logout user
 * Calls the backend logout endpoint and clears authentication flag from localStorage
 * Note: Since we're using httpOnly cookies, logout clears the cookie on the backend
 */
export async function logout() {
  try {
    await post('/auth/logout');
    // Clear authentication flag from localStorage
    localStorage.removeItem('isAuthenticated');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    return;
  } catch (error) {
    // Even if API call fails, clear local storage
    localStorage.removeItem('isAuthenticated');
    // Dispatch custom event even on error
    window.dispatchEvent(new Event('authStateChanged'));
    if (error instanceof ApiError) {
      // Handle specific error cases if needed
      console.error('Logout error:', error);
    }
    throw error;
  }
}

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export async function getProfile() {
  try {
    const response = await get('/auth/profile');
    return response.data || response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // Clear authentication flag if unauthorized
        localStorage.removeItem('isAuthenticated');
        window.dispatchEvent(new Event('authStateChanged'));
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.data?.message || 'Failed to fetch profile');
    }
    throw error;
  }
}

export default {
  register,
  login,
  logout,
  getProfile,
};

