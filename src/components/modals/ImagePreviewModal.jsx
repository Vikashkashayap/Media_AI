export default function ImagePreviewModal({ show, imageUrl, onClose, onShare, onDownload, imageWidth, imageHeight }) {
  if (!show || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 p-3 rounded-full transition-all z-10 shadow-lg"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 p-3 rounded-full transition-all shadow-lg hover:scale-110"
            title="Share"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(imageWidth, imageHeight);
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 p-3 rounded-full transition-all shadow-lg hover:scale-110"
            title="Download"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

