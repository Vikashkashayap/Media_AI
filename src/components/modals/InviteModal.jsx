export default function InviteModal({ show, onClose, inviteEmail, setInviteEmail, onInvite }) {
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
          <h2 className="text-2xl font-bold text-white">Invite User</h2>
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
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onInvite();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              placeholder="Enter email address..."
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
              onClick={onInvite}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg transition-all hover:from-cyan-600 hover:to-blue-600 font-medium"
            >
              Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

