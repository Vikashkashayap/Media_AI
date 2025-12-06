import { get, post, put, del } from './api';

/**
 * Get active workspace ID from localStorage
 */
function getActiveWorkspaceId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('activeWorkspaceId');
}

/**
 * Initiate OAuth flow for a platform
 * @param {string} platform - Platform name (facebook, instagram, twitter, linkedin, youtube)
 * @returns {Promise<Object>} OAuth URL and state
 */
export async function initiateOAuthFlow(platform) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  const response = await get(`/social-media/oauth/initiate/${workspaceId}/${platform.toLowerCase()}`);
  return response.data;
}

/**
 * Connect a social media account (for manual entry like Personal Website)
 * @param {Object} connectionData - Connection data
 * @param {string} connectionData.platform - Platform name (PERSONAL_WEBSITE, etc.)
 * @param {Object} connectionData.credentials - Platform-specific credentials
 * @param {Object} connectionData.metadata - Optional metadata (accountName, profileUrl, etc.)
 * @returns {Promise<Object>} Created connection
 */
export async function connectSocialMediaAccount(connectionData) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  const response = await post(`/social-media/${workspaceId}/connections`, connectionData);
  return response.data;
}

/**
 * List all social media connections for the current workspace
 * @returns {Promise<Array>} List of connections
 */
export async function listSocialMediaConnections() {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  const response = await get(`/social-media/${workspaceId}/connections`);
  return response.data || [];
}

/**
 * Get a specific social media connection
 * @param {string} connectionId - Connection ID
 * @returns {Promise<Object>} Connection details
 */
export async function getSocialMediaConnection(connectionId) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  const response = await get(`/social-media/${workspaceId}/connections/${connectionId}`);
  return response.data;
}

/**
 * Update a social media connection
 * @param {string} connectionId - Connection ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated connection
 */
export async function updateSocialMediaConnection(connectionId, updateData) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  const response = await put(`/social-media/${workspaceId}/connections/${connectionId}`, updateData);
  return response.data;
}

/**
 * Disconnect a social media account
 * @param {string} connectionId - Connection ID
 * @returns {Promise<void>}
 */
export async function disconnectSocialMediaAccount(connectionId) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  await del(`/social-media/${workspaceId}/connections/${connectionId}`);
}

/**
 * Post an image to selected social media accounts
 * @param {Object} postData - Post data
 * @param {string} postData.imageUrl - URL of the image to post
 * @param {string} postData.prompt - Original prompt used to generate the image
 * @param {string[]} postData.connectionIds - Array of connection IDs to post to (optional, posts to all if not provided)
 * @returns {Promise<Object>} Result with success status and posted accounts
 */
export async function postImageToSocialMedia(postData) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    throw new Error('No active workspace selected');
  }
  
  const response = await post(`/social-media/${workspaceId}/post-image`, postData);
  return response.data;
}

