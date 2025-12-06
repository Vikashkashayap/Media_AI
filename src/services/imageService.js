/**
 * Image generation service
 * Handles calls to backend API for image generation with size and aspect ratio support
 */

import { post } from './api';

/**
 * Generate an image with specified prompt, size, and aspect ratio
 * @param {string} prompt - The image generation prompt
 * @param {string} aspectRatio - The aspect ratio (e.g., "16:9", "1:1", "9:16")
 * @param {string} size - The size (e.g., "Small", "Standard", "Medium", "Large", "Extra Large")
 * @returns {Promise<Object>} Response containing image URL and metadata
 */
export async function generateImage(prompt, aspectRatio = "16:9", size = "Standard") {
  try {
    const response = await post('/images/generate', {
      prompt,
      aspectRatio,
      size,
    });

    // The backend returns: { data: { imageUrl, width, height, size, aspectRatio }, message, success }
    if (response.data) {
      return {
        image: response.data.imageUrl,
        imageUrl: response.data.imageUrl,
        width: response.data.width,
        height: response.data.height,
        size: response.data.size,
        aspectRatio: response.data.aspectRatio,
        response: response.data.imageUrl,
        message: response.data.imageUrl,
        text: response.data.imageUrl,
      };
    }

    // Fallback if structure is different
    return {
      image: response.imageUrl || response.image || response.url,
      imageUrl: response.imageUrl || response.image || response.url,
      response: response.imageUrl || response.image || response.url,
      message: response.imageUrl || response.image || response.url,
      text: response.imageUrl || response.image || response.url,
      ...response,
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

export default {
  generateImage,
};

