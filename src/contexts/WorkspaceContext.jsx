import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchWorkspaces,
  createWorkspace as createWorkspaceApi,
  getPersonalWorkspace,
} from '../services/workspaceService';

const WorkspaceContext = createContext({
  workspaces: [],
  activeWorkspace: null,
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
  refreshWorkspaces: async () => {},
  setActiveWorkspaceId: () => {},
  createWorkspace: async () => {},
});

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('activeWorkspaceId');
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeWorkspace = (workspace) => ({
    id: workspace.id || workspace.workspaceId,
    name: workspace.name,
    role: workspace.role,
    ownerUserId: workspace.ownerUserId,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    websiteCount: workspace.websiteCount ?? 0,
  });

  const refreshWorkspaces = useCallback(async (preserveActiveWorkspace = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchWorkspaces();
      let normalized = Array.isArray(list) ? list.map(normalizeWorkspace).filter(ws => !!ws.id) : [];
      
      // Try to get personal workspace once and cache the result
      let personalWorkspace = null;
      try {
        personalWorkspace = await getPersonalWorkspace();
        if (personalWorkspace && personalWorkspace.id) {
          const normalizedPersonal = normalizeWorkspace(personalWorkspace);
          if (!normalized.some(ws => ws.id === normalizedPersonal.id)) {
            normalized.push(normalizedPersonal);
          }
        }
      } catch (err) {
        // Personal workspace fetch failed - log but don't block
        console.warn('Failed to fetch personal workspace:', err?.message || err);
        // Continue with what we have - don't set error for personal workspace failure
      }
      
      setWorkspaces(normalized);
      
      // If preserving active workspace and it still exists in the list, keep it and return early
      if (preserveActiveWorkspace && activeWorkspaceId && normalized.some(ws => ws.id === activeWorkspaceId)) {
        setIsLoading(false);
        return;
      }
      
      // If no workspaces exist or active workspace is invalid, set a new one
      // But skip if we're preserving and the workspace ID exists (even if not in normalized list)
      if (normalized.length === 0 || (!activeWorkspaceId || !normalized.some(ws => ws.id === activeWorkspaceId))) {
        if (!preserveActiveWorkspace) {
          // Normal refresh: set active workspace if needed
          // Use the cached personalWorkspace if we already fetched it
          if (personalWorkspace && personalWorkspace.id) {
            const normalizedPersonal = normalizeWorkspace(personalWorkspace);
            if (!normalized.some(ws => ws.id === normalizedPersonal.id)) {
              normalized.push(normalizedPersonal);
              setWorkspaces(normalized);
            }
            setActiveWorkspaceId(normalizedPersonal.id);
          } else if (normalized.length > 0) {
            setActiveWorkspaceId(normalized[0].id);
          } else {
            setActiveWorkspaceId(null);
          }
        }
        // If preserveActiveWorkspace is true, we don't change activeWorkspaceId
      }
    } catch (err) {
      // Better error handling - extract meaningful error message from various error formats
      let errorMessage = 'Failed to load workspaces';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('Error refreshing workspaces:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  // Wait for authentication before fetching workspaces
  useEffect(() => {
    // Check if user is authenticated before making requests
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      refreshWorkspaces();
    }
  }, [refreshWorkspaces]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
    } else {
      localStorage.removeItem('activeWorkspaceId');
    }
  }, [activeWorkspaceId]);

  const createWorkspace = useCallback(async (name) => {
    const workspace = await createWorkspaceApi(name);
    await refreshWorkspaces();
    setActiveWorkspaceId(workspace.id);
    return workspace;
  }, [refreshWorkspaces]);

  const activeWorkspace = useMemo(
    () => workspaces.find(ws => ws.id === activeWorkspaceId) || null,
    [workspaces, activeWorkspaceId]
  );

  const value = useMemo(() => ({
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    isLoading,
    error,
    refreshWorkspaces,
    setActiveWorkspaceId,
    createWorkspace,
  }), [workspaces, activeWorkspace, activeWorkspaceId, isLoading, error, refreshWorkspaces, createWorkspace]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
