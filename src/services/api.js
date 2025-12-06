/**
 * Base API service for making HTTP requests
 * Handles common request/response logic, error handling, and authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 250;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get active workspace ID from localStorage
 */
function getActiveWorkspaceId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('activeWorkspaceId');
}

/**
 * Base fetch wrapper with error handling
 */
async function request(endpoint, options = {}, attempt = 0) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get active workspace ID and add as x-workspace-id header if available
  const activeWorkspaceId = getActiveWorkspaceId();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add x-workspace-id header if we have an active workspace
  if (activeWorkspaceId) {
    headers['x-workspace-id'] = activeWorkspaceId;
  }
  
  const config = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies (httpOnly cookies)
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content responses (no body to parse)
    if (response.status === 204) {
      return { success: true, message: 'Success', data: null };
    }

    // Try to parse response body (can only read once)
    let data = {};
    const contentType = response.headers.get('content-type');
    
    try {
      const text = await response.text();
      if (text && text.trim()) {
        // Try to parse as JSON if content-type indicates JSON
        if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            // If JSON parsing fails, use text as message
            data = { message: text };
          }
        } else {
          // For non-JSON responses, use text as message
          data = { message: text };
        }
      }
    } catch (textError) {
      // If reading text fails, use empty object
      data = {};
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - clear authentication
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isAuthenticated');
          window.dispatchEvent(new Event('authStateChanged'));
        }
      }
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const isNetworkError = !(error instanceof SyntaxError);
    if (isNetworkError && attempt < MAX_RETRIES) {
      const delay = BASE_RETRY_DELAY_MS * (attempt + 1);
      await sleep(delay);
      return request(endpoint, options, attempt + 1);
    }
    if (error instanceof SyntaxError) {
      throw new ApiError(
        'Invalid JSON response from server',
        500,
        null
      );
    }
    throw new ApiError(
      'Unable to reach the server. Please make sure the backend is running.',
      0,
      null
    );
  }
}

/**
 * GET request
 */
export async function get(endpoint, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function post(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function put(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export async function patch(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function del(endpoint, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
};

