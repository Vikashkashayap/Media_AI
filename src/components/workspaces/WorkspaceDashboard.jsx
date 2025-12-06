import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useWorkspaceWebsites } from '../../hooks/useWorkspaceWebsites';
import { connectWebsite, updateWebsite, deleteWebsite } from '../../services/workspaceService';
import { listApprovalQueue, approveBlog, publishBlog, getBlogById } from '../../services/blogService';
import BlogPreviewModal from './BlogPreviewModal';
import WebsiteConnectionsList from './WebsiteConnectionsList';
import ConnectWebsiteModal from './ConnectWebsiteModal';
import EditWebsiteModal from './EditWebsiteModal';

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const {
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    refreshWorkspaces,
    workspaces,
  } = useWorkspace();
  const { websites, isLoading, error, refresh } = useWorkspaceWebsites(workspaceId);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingWebsiteId, setDeletingWebsiteId] = useState(null);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [publishingId, setPublishingId] = useState(null);
  const [selectedWebsiteByBlog, setSelectedWebsiteByBlog] = useState({});
  const [previewBlog, setPreviewBlog] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (workspaceId && workspaceId !== activeWorkspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
    refreshWorkspaces();
  }, [workspaceId, activeWorkspaceId, setActiveWorkspaceId, refreshWorkspaces]);

  useEffect(() => {
    if (!workspaces || workspaces.length === 0) return;
    const exists = workspaces.some((ws) => ws.id === workspaceId);
    if (!exists) {
      navigate('/');
    }
  }, [workspaces, workspaceId, navigate]);

  const loadApprovalQueue = async () => {
    setQueueLoading(true);
    setQueueError('');
    try {
      const blogs = await listApprovalQueue();
      setApprovalQueue(blogs);
      // preselect first website if not already chosen
      if (blogs && blogs.length > 0 && websites && websites.length > 0) {
        setSelectedWebsiteByBlog((prev) => {
          const next = { ...prev };
          blogs.forEach((b) => {
            if (!next[b.id]) {
              next[b.id] = websites[0]?.id;
            }
          });
          return next;
        });
      }
    } catch (err) {
      setQueueError(err.message || 'Failed to load approval queue');
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    loadApprovalQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (!approvalQueue || approvalQueue.length === 0) return;
    if (!websites || websites.length === 0) return;
    setSelectedWebsiteByBlog((prev) => {
      const next = { ...prev };
      approvalQueue.forEach((b) => {
        if (!next[b.id]) {
          next[b.id] = websites[0].id;
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websites]);

  const handleConnectWebsite = async (payload) => {
    setIsSubmitting(true);
    try {
      await connectWebsite(workspaceId, payload);
      await refresh();
      await refreshWorkspaces();
      await loadApprovalQueue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWebsite = (website) => {
    setEditingWebsite(website);
    setIsEditModalOpen(true);
  };

  const handleUpdateWebsite = async (payload) => {
    if (!editingWebsite) return;
    setIsUpdating(true);
    try {
      await updateWebsite(workspaceId, editingWebsite.id, payload);
      await refresh();
      setIsEditModalOpen(false);
      setEditingWebsite(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteWebsite = async (website) => {
    if (!window.confirm(`Are you sure you want to delete "${website.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingWebsiteId(website.id);
    try {
      await deleteWebsite(workspaceId, website.id);
      await refresh();
      await loadApprovalQueue();
    } catch (err) {
      setQueueError(err.message || 'Failed to delete website');
    } finally {
      setDeletingWebsiteId(null);
    }
  };

  const handleWebsiteSelection = (blogId, websiteId) => {
    setSelectedWebsiteByBlog((prev) => ({ ...prev, [blogId]: websiteId }));
  };

  const handleApproveAndPublish = async (blogId) => {
    const websiteId = selectedWebsiteByBlog[blogId] || websites?.[0]?.id;
    if (!websiteId) {
      setQueueError('Please connect and select a website before publishing');
      return;
    }

    setPublishingId(blogId);
    setQueueError('');
    try {
      await approveBlog(blogId);
      await publishBlog(blogId, websiteId);
      await loadApprovalQueue();
    } catch (err) {
      setQueueError(err.message || 'Failed to publish blog');
    } finally {
      setPublishingId(null);
    }
  };

  const handlePreviewBlog = async (blogId) => {
    setIsPreviewLoading(true);
    try {
      const fullBlog = await getBlogById(blogId);
      setPreviewBlog(fullBlog);
    } catch (err) {
      setQueueError(err.message || 'Failed to load blog preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">Workspace</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{activeWorkspace?.name || 'Workspace'}</h1>
            <p className="text-sm text-gray-500 mt-1">Manage connected websites and publish destinations.</p>
          </div>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow"
          >
            Connect Website
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Connected Websites</h2>
            <button
              onClick={() => refresh()}
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Refresh
            </button>
          </div>
          <WebsiteConnectionsList 
            websites={websites} 
            isLoading={isLoading} 
            error={error}
            onEdit={handleEditWebsite}
            onDelete={handleDeleteWebsite}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Social Media Accounts</h2>
              <p className="text-sm text-gray-500">Connect your social media accounts to publish content everywhere instantly.</p>
            </div>
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}/connect-accounts`)}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Manage Connections
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Approval Queue</h2>
              <p className="text-sm text-gray-500">Blogs must be approved before publishing to MERN or WordPress.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadApprovalQueue()}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>

          {queueError && <p className="text-sm text-red-600">{queueError}</p>}
          {queueLoading ? (
            <p className="text-sm text-gray-500">Loading approval queue...</p>
          ) : approvalQueue.length === 0 ? (
            <p className="text-sm text-gray-500">No blogs awaiting approval.</p>
          ) : (
            <div className="space-y-3">
              {approvalQueue.map((blog) => (
                <div key={blog.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{blog.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{blog.metaDescription}</p>
                      <p className="text-xs text-gray-500 mt-1">Created: {new Date(blog.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="w-56 space-y-2">
                      <label className="text-xs font-medium text-gray-600">Publish to</label>
                      <select
                        value={selectedWebsiteByBlog[blog.id] || ''}
                        onChange={(e) => handleWebsiteSelection(blog.id, e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="" disabled>
                          Select destination
                        </option>
                        {websites?.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.name} ({site.platform})
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handlePreviewBlog(blog.id)}
                          className="w-full px-3 py-2 text-sm font-semibold text-purple-600 border border-purple-200 hover:bg-purple-50 rounded-lg disabled:opacity-60"
                          disabled={isPreviewLoading && previewBlog?.id !== blog.id}
                        >
                          {isPreviewLoading && previewBlog?.id !== blog.id ? 'Loading...' : 'View blog'}
                        </button>
                        <button
                          onClick={() => handleApproveAndPublish(blog.id)}
                          disabled={publishingId === blog.id}
                          className="w-full px-3 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-60"
                        >
                          {publishingId === blog.id ? 'Publishing...' : 'Approve & Publish'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BlogPreviewModal
        blog={previewBlog}
        isLoading={isPreviewLoading}
        onClose={() => setPreviewBlog(null)}
      />
      <ConnectWebsiteModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectWebsite}
        isSubmitting={isSubmitting}
        workspaceName={activeWorkspace?.name}
      />
      <EditWebsiteModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWebsite(null);
        }}
        onUpdate={handleUpdateWebsite}
        isSubmitting={isUpdating}
        website={editingWebsite}
      />
    </div>
  );
}
