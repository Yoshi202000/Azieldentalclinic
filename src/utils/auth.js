// src/utils/auth.js

/**
 * Checks if the user is logged in by verifying if a token exists in localStorage.
 * @returns {boolean} True if the user is logged in, false otherwise.
 */
export const isLoggedIn = () => {
    return !!localStorage.getItem('token'); // Check if token exists
};

/**
 * Stores the authentication token in localStorage.
 * @param {string} token - The JWT token to store.
 */
export const setToken = (token) => {
    localStorage.setItem('token', token); // Store token in localStorage
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string|null} The stored token or null if not found.
 */
export const getToken = () => {
    return localStorage.getItem('token'); // Get token from localStorage
};

/**
 * Removes the authentication token from localStorage, effectively logging out the user.
 */
export const logout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
};
