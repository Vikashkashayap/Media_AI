/**
 * Image-to-image service
 * Handles image-to-image generation through backend
 */

import { post, get, del } from './api';

// Helper function to convert static image URL to full URL
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return imageUrl;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  const serverBaseUrl = API_BASE_URL.replace('/api/v1', '');
  if (imageUrl.startsWith('/static')) {
    return `${serverBaseUrl}${imageUrl}`;
  }
  return imageUrl;
};

/**
 * Generate image-to-image transformation
 * Sends image URL and prompt to backend, which calls n8n webhook and saves to DB
 * @param {Object} options - Image-to-image options
 * @param {string} options.prompt - The transformation prompt
 * @param {string} options.imageUrl - The URL of the source image
 * @param {string} options.conversationId - Optional conversation ID
 * @param {string} options.projectId - Optional project ID
 * @param {string} options.aspectRatio - Aspect ratio (default: "16:9")
 * @param {string} options.size - Size (default: "medium")
 * @param {Object} options.style - Style options
 * @param {Object} options.params - Additional parameters
 * @returns {Promise<Object>} Result containing imageUrl, conversationId, messageId, etc.
 */
export async function generateImageToImage(options) {
  try {
    const {
      prompt,
      imageUrl,
      conversationId = null,
      projectId = null,
      aspectRatio = "16:9",
      size = "medium",
      style = {
        preset: "realistic",
        mood: "neutral",
        lighting: "natural",
        extra: "high quality, detailed"
      },
      params = {
        steps: 30,
        guidance: 7.5,
        strength: 0.6,
        seed: null,
        upscale: false,
        enhanceFace: true
      }
    } = options;

    const response = await post('/images/image-to-image', {
      prompt,
      imageUrl,
      conversationId,
      projectId,
      aspectRatio,
      size,
      style,
      params,
    });

    // Backend returns: { success: true, message, data: { imageUrl, conversationId, messageId, ... } }
    return response.data || response;
  } catch (error) {
    console.error('Error generating image-to-image:', error);
    throw error;
  }
}

/**
 * Get image-to-image record by ID
 * @param {string} id - Image-to-image ID
 * @returns {Promise<Object>} Image-to-image record
 */
export async function getImageToImageById(id) {
  const response = await get(`/images/image-to-image/${id}`);
  const imageToImage = response.data || response;
  // Convert image URLs to full URLs
  if (imageToImage.imageUrl) {
    imageToImage.imageUrl = getFullImageUrl(imageToImage.imageUrl);
  }
  if (imageToImage.originalImageUrl) {
    imageToImage.originalImageUrl = getFullImageUrl(imageToImage.originalImageUrl);
  }
  return imageToImage;
}

/**
 * Get all image-to-image records for a specific conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} List of image-to-image records
 */
export async function getImageToImageByConversation(conversationId) {
  const response = await get(`/images/image-to-image/conversation/${conversationId}`);
  const images = response.data || [];
  // Convert image URLs to full URLs for each record
  return images.map(img => ({
    ...img,
    imageUrl: img.imageUrl ? getFullImageUrl(img.imageUrl) : img.imageUrl,
    originalImageUrl: img.originalImageUrl ? getFullImageUrl(img.originalImageUrl) : img.originalImageUrl,
  }));
}

/**
 * Delete an image-to-image record
 * @param {string} id - Image-to-image ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteImageToImage(id) {
  const response = await del(`/images/image-to-image/${id}`);
  return response.data || response;
}

/**
 * List all image-to-image records for the workspace
 * @returns {Promise<Array>} List of image-to-image records
 */
export async function listImageToImage() {
  const response = await get('/images/image-to-image');
  const images = response.data || [];
  // Convert image URLs to full URLs for each record
  return images.map(img => ({
    ...img,
    imageUrl: img.imageUrl ? getFullImageUrl(img.imageUrl) : img.imageUrl,
    originalImageUrl: img.originalImageUrl ? getFullImageUrl(img.originalImageUrl) : img.originalImageUrl,
  }));
}

export default {
  generateImageToImage,
  getImageToImageById,
  getImageToImageByConversation,
  deleteImageToImage,
  listImageToImage,
};

