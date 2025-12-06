export default function NewProjectModal({ show, onClose, projectName, setProjectName, onCreate }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Project</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onCreate();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={!projectName.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/30 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none font-medium"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

