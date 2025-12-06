export default function FeaturePopup({ show, onClose, onFeatureSelect }) {
  const popupOptions = [
    { id: "image", name: "Image generation", icon: "image" },
    { id: "doc", name: "Doc", icon: "doc" },
    { id: "video", name: "Video generation", icon: "video" },
    { id: "thinking", name: "Thinking", icon: "thinking" },
  ];

  if (!show) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[240px] z-50">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {popupOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => {
            onFeatureSelect(option.id);
            onClose();
          }}
          className="w-full px-4 py-3 hover:bg-purple-50 flex items-center justify-between text-left transition-all rounded-lg mx-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              {option.icon === "image" && (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {option.icon === "doc" && (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {option.icon === "video" && (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              {option.icon === "thinking" && (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-700 font-semibold">{option.name}</span>
          </div>
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-lg">Creative</span>
        </button>
      ))}
    </div>
  );
}

