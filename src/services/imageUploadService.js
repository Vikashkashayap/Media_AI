/**
 * Image upload service
 * Handles uploading images to the backend
 */

import { post } from './api';

/**
 * Upload an image file to the backend
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The full URL of the uploaded image
 */
export async function uploadImage(file) {
  try {
    // Validate file size (max 8MB to stay under 10MB limit with base64 encoding overhead)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      throw new Error(`Image file is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    const response = await post('/images/upload', {
      image: base64,
      mimeType: file.type,
    });

    console.log('Upload response:', response);

    // Backend returns: { success: true, message, data: { imageUrl, path } }
    // API wrapper returns the parsed JSON directly
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    }
    
    // Fallback for different response structures
    if (response.imageUrl) {
      return response.imageUrl;
    }
    
    if (response.data && response.data.path) {
      // Construct full URL from path
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
      const serverBaseUrl = API_BASE_URL.replace('/api/v1', '');
      return `${serverBaseUrl}${response.data.path}`;
    }

    console.error('Unexpected response structure:', response);
    throw new Error('Invalid response from server: missing imageUrl');
  } catch (error) {
    console.error('Image upload error:', error);
    // Provide more user-friendly error messages
    if (error.message) {
      throw new Error(error.message);
    }
    if (error.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.status === 413 || error.message?.includes('too large')) {
      throw new Error('Image file is too large. Please use an image smaller than 8MB.');
    }
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Convert a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 encoded string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result contains the base64 string with data:image/... prefix
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default {
  uploadImage,
};

