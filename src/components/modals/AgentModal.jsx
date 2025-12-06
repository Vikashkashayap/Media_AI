export default function AgentModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Agent</h2>
              <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-semibold rounded-full">Beta</span>
            </div>
          </div>
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
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-gray-200">
              <strong className="text-white">AI Agent</strong> is an intelligent assistant that can help you with various tasks. 
              This feature is currently in <strong className="text-white">Beta</strong> and we're continuously improving it.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Features:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Intelligent task automation</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Context-aware responses</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Multi-step problem solving</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg transition-all hover:from-cyan-600 hover:to-blue-600 font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

