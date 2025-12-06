import { get, post } from './api';

/**
 * Get all conversations with optional filters
 * @param {string|null} projectId - Project ID (null for conversations without project)
 * @param {string} status - 'all', 'active', or 'ended' (default: 'all')
 * @param {string} search - Search term for conversation titles
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 20)
 */
export async function getConversations(projectId = null, status = 'all', search = null, page = 1, pageSize = 20) {
  const params = new URLSearchParams();
  
  // Handle projectId: pass "null" as string to explicitly filter for conversations without project
  if (projectId !== undefined) {
    if (projectId === null) {
      params.append('projectId', 'null'); // Explicitly request conversations without project
    } else {
      params.append('projectId', projectId); // Filter by specific project
    }
  }
  // If projectId is undefined, don't add it to params (returns all conversations)
  
  if (status && status !== 'all') {
    params.append('status', status);
  }
  
  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  
  const queryString = params.toString();
  const url = `/conversations${queryString ? `?${queryString}` : ''}`;
  
  const response = await get(url);
  // Backend returns { items, page, pageSize, total }
  return response.data?.items || response.data || [];
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id) {
  const response = await get(`/conversations/${id}`);
  return response.data;
}

/**
 * Create a new conversation
 * @param {string} title - Conversation title
 * @param {string|null} projectId - Optional project ID (null for conversations without project)
 */
export async function createConversation(title, projectId = null) {
  const body = { title };
  if (projectId !== null && projectId !== undefined) {
    body.projectId = projectId;
  }
  const response = await post('/conversations', body);
  return response.data;
}

/**
 * End a conversation
 */
export async function endConversation(conversationId) {
  const response = await post(`/conversations/${conversationId}/end`, {});
  return response.data;
}

/**
 * Reopen a conversation
 */
export async function reopenConversation(conversationId) {
  const response = await post(`/conversations/${conversationId}/reopen`, {});
  return response.data;
}

/**
 * Get conversation summary
 */
export async function getConversationSummary(conversationId) {
  const response = await get(`/conversations/${conversationId}/summary`);
  return response.data;
}

