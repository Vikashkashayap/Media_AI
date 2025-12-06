import { get, post } from './api';

/**
 * Get all messages for a conversation
 * @param {string} conversationId - The conversation ID
 * @param {number} limit - Maximum number of messages to retrieve (default: 100)
 * @param {number} offset - Number of messages to skip (default: 0)
 */
export async function getMessages(conversationId, limit = 100, offset = 0) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const queryString = params.toString();
  const url = `/messages/${conversationId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await get(url);
  return response.data || [];
}

/**
 * Start a new conversation or send a message to an existing conversation
 * This is the primary entrypoint (ChatGPT-style) - creates conversation if needed
 * @param {Object} options - Message options
 * @param {string} options.task - Task type: "chat" or "image" (default: "chat")
 * @param {string} options.content - Message content (required for chat task)
 * @param {string} options.prompt - Image generation prompt (required for image task)
 * @param {string|string[]} options.model - Model name(s) to use
 * @param {string|null} options.projectId - Optional project ID (null for conversations without project)
 * @param {string} options.conversationId - Optional existing conversation ID
 * @param {Object} options.imageOptions - Optional image generation options (size, count)
 * @returns {Promise<Object>} Response containing conversation and message data
 */
export async function startOrSend(options) {
  const {
    task = 'chat',
    content,
    prompt,
    model,
    projectId = null,
    conversationId = null,
    imageOptions = null
  } = options;

  const body = {
    task,
    model,
  };

  // Add task-specific fields
  if (task === 'chat') {
    if (!content) {
      throw new Error('Content is required for chat task');
    }
    body.content = content;
  } else if (task === 'image') {
    if (!prompt) {
      throw new Error('Prompt is required for image task');
    }
    body.prompt = prompt;
    if (imageOptions) {
      body.imageOptions = imageOptions;
    }
  }

  // Add optional fields
  if (projectId !== null && projectId !== undefined) {
    body.projectId = projectId;
  }
  if (conversationId) {
    body.conversationId = conversationId;
  }

  const response = await post('/messages/startOrSend', body);
  return response.data;
}

/**
 * Send a message to an existing conversation
 * @param {Object} options - Message options
 * @param {string} options.conversationId - The conversation ID (required)
 * @param {string} options.content - Message content (required)
 * @param {string|string[]} options.model - Model name(s) to use (required)
 * @returns {Promise<Object>} Response containing message data
 */
export async function sendMessage(options) {
  const { conversationId, content, model } = options;

  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }
  if (!content) {
    throw new Error('Content is required');
  }
  if (!model) {
    throw new Error('Model is required');
  }

  const body = {
    conversationId,
    content,
    model,
  };

  const response = await post('/messages/send', body);
  return response.data;
}

