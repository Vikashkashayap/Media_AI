export default function SharesModal({ show, onClose, shareLink, onCopyLink, selectedProject, currentConversation }) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Share</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200"
              />
              <button
                onClick={onCopyLink}
                className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl transition-all hover:from-cyan-600 hover:to-blue-600 font-medium"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-300">
              Share this link to allow others to view {selectedProject ? `the "${selectedProject.name}" project` : 'your chat'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

