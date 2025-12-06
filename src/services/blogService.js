import { get, post, del } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

/**
 * Convert static image URL to full URL
 * @param {string} imageUrl - Image URL path (e.g., "/static/blogs/xxx.png")
 * @returns {string} Full URL
 */
function getFullImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl;
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Convert API base URL to server base URL (remove /api/v1)
  const serverBaseUrl = API_BASE_URL.replace('/api/v1', '');
  // If imageUrl starts with /static, prepend server base URL
  if (imageUrl.startsWith('/static')) {
    return `${serverBaseUrl}${imageUrl}`;
  }
  return imageUrl;
}

/**
 * Generate a blog with image
 * @param {Object} options - Blog generation options
 * @param {string} options.prompt - Blog prompt (required)
 * @param {string} options.style - Blog style (optional)
 * @param {string} options.model - Model to use (optional)
 * @param {string} options.ratio - Image aspect ratio (optional)
 * @param {string} options.size - Image size (optional)
 * @param {string} options.conversationId - Conversation ID to attach blog to (optional)
 * @returns {Promise<Object>} Generated blog data
 */
export async function generateBlog(options) {
  const {
    prompt,
    style = "professional",
    model = "blog-pro-1",
    ratio = "16:9",
    size = "large",
    conversationId = null,
    projectId = null
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required');
  }

  const body = {
    prompt: prompt.trim(),
    style,
    model,
    ratio,
    size,
  };

  if (conversationId) {
    body.conversationId = conversationId;
  }
  if (projectId) {
    body.projectId = projectId;
  }

  const response = await post('/blog/generate', body);
  // Convert imageUrl to full URL
  if (response.data && response.data.imageUrl) {
    response.data.imageUrl = getFullImageUrl(response.data.imageUrl);
  }
  return response.data;
}

/**
 * Get all blogs for the current tenant
 * @returns {Promise<Array>} List of blogs
 */
export async function listBlogs() {
  const response = await get('/blog');
  const blogs = response.data || [];
  // Convert imageUrl to full URL for each blog
  return blogs.map(blog => ({
    ...blog,
    imageUrl: blog.imageUrl ? getFullImageUrl(blog.imageUrl) : blog.imageUrl
  }));
}

/**
 * Get a specific blog by ID
 * @param {string} blogId - Blog ID
 * @returns {Promise<Object>} Blog data
 */
export async function getBlogById(blogId) {
  const response = await get(`/blog/${blogId}`);
  // Convert imageUrl to full URL
  if (response.data && response.data.imageUrl) {
    response.data.imageUrl = getFullImageUrl(response.data.imageUrl);
  }
  return response.data;
}

/**
 * Get all blogs for a specific conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} List of blogs
 */
export async function getBlogsByConversation(conversationId) {
  const response = await get(`/blog/conversation/${conversationId}`);
  const blogs = response.data || [];
  // Convert imageUrl to full URL for each blog
  return blogs.map(blog => ({
    ...blog,
    imageUrl: blog.imageUrl ? getFullImageUrl(blog.imageUrl) : blog.imageUrl
  }));
}

/**
 * Delete a blog
 * @param {string} blogId - Blog ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteBlog(blogId) {
  const response = await del(`/blog/${blogId}`);
  return response;
}

export async function listApprovalQueue() {
  const response = await get('/blog/approvals');
  const blogs = response.data || [];
  return blogs.map(blog => ({
    ...blog,
    imageUrl: blog.imageUrl ? getFullImageUrl(blog.imageUrl) : blog.imageUrl
  }));
}

export async function approveBlog(blogId) {
  const response = await post(`/blog/${blogId}/approve`, {});
  if (response.data?.imageUrl) {
    response.data.imageUrl = getFullImageUrl(response.data.imageUrl);
  }
  return response.data;
}

export async function publishBlog(blogId, websiteId) {
  const response = await post(`/blog/${blogId}/publish`, { websiteId });
  if (response.data?.imageUrl) {
    response.data.imageUrl = getFullImageUrl(response.data.imageUrl);
  }
  return response.data;
}

export async function submitBlogForApproval(blogId) {
  const response = await post(`/blog/${blogId}/submit`, {});
  if (response.data?.imageUrl) {
    response.data.imageUrl = getFullImageUrl(response.data.imageUrl);
  }
  return response.data;
}

