import { useCallback, useEffect, useState } from 'react';
import { fetchWorkspaceWebsites } from '../services/workspaceService';

export function useWorkspaceWebsites(workspaceId) {
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWebsites = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchWorkspaceWebsites(workspaceId);
      setWebsites(list);
    } catch (err) {
      setError(err.message || 'Failed to load websites');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  return { websites, isLoading, error, refresh: loadWebsites };
}
