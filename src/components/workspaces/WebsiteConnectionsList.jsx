export default function WebsiteConnectionsList({ websites, isLoading, error, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <p className="text-sm text-gray-500">Loading website connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!websites || websites.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <p className="text-sm text-gray-500">No websites connected yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Site Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">URL</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created At</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {websites.map((site) => (
            <tr key={site.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-800">{site.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{site.platform}</td>
              <td className="px-4 py-3 text-sm text-purple-600 truncate max-w-xs">{site.url}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {site.createdAt ? new Date(site.createdAt).toLocaleString() : '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(site)}
                    className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(site)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
