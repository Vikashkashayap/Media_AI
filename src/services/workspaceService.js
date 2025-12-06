import { get, post, put, del } from './api';

export async function fetchWorkspaces() {
  const response = await get('/workspaces');
  return response.data || [];
}

export async function createWorkspace(name) {
  const response = await post('/workspaces', { name });
  return response.data;
}

export async function getPersonalWorkspace() {
  const response = await get('/workspaces/personal');
  return response.data;
}

export async function fetchWorkspaceWebsites(workspaceId) {
  const response = await get(`/workspaces/${workspaceId}/websites`);
  return response.data || [];
}

export async function connectWebsite(workspaceId, payload) {
  const response = await post(`/workspaces/${workspaceId}/websites`, payload);
  return response.data;
}

export async function connectWebsiteToPersonalWorkspace(payload) {
  const response = await post('/workspaces/personal/websites', payload);
  return response.data;
}

export async function updateWebsite(workspaceId, websiteId, payload) {
  const response = await put(`/workspaces/${workspaceId}/websites/${websiteId}`, payload);
  return response.data;
}

export async function deleteWebsite(workspaceId, websiteId) {
  const response = await del(`/workspaces/${workspaceId}/websites/${websiteId}`);
  return response.data;
}

export default {
  fetchWorkspaces,
  createWorkspace,
  fetchWorkspaceWebsites,
  connectWebsite,
  updateWebsite,
  deleteWebsite,
};
