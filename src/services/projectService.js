import { get, post, patch, del } from './api';

/**
 * Get all projects for the current user
 */
export async function getProjects() {
  const response = await get('/conversations/projects');
  return response.data || [];
}

/**
 * Get a single project by ID
 */
export async function getProject(id) {
  const response = await get(`/conversations/projects/${id}`);
  return response.data;
}

/**
 * Create a new project
 * @param {string} name - Project name
 * @param {string|null} workspaceId - Optional workspace ID (null to create outside workspace)
 */
export async function createProject(name, workspaceId = null) {
  const body = { name };
  if (workspaceId !== undefined) {
    body.workspaceId = workspaceId;
  }
  const response = await post('/conversations/projects', body);
  return response.data;
}

/**
 * Update a project
 */
export async function updateProject(id, name) {
  const response = await patch(`/conversations/projects/${id}`, { name });
  return response.data;
}

/**
 * Delete a project
 */
export async function deleteProject(id) {
  await del(`/conversations/projects/${id}`);
}

