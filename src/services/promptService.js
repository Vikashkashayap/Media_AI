import { post } from './api';

/**
 * Enhance a prompt using the backend prompt enhancement API
 * @param {string} prompt - The original prompt text
 * @returns {Promise<Object>} Enhanced prompt data
 */
export async function enhancePrompt(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required to enhance');
  }

  const response = await post('/chat/enhance', { prompt: prompt.trim() });
  return response.data || response;
}


