import ReactMarkdown from 'react-markdown';

export default function BlogPreviewModal({ blog, isLoading, onClose }) {
  const isOpen = Boolean(blog) || isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">Blog Preview</p>
            <h3 className="text-lg font-bold text-gray-900">
              {blog?.title || 'Loading blog...'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-2 transition-colors"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-gray-500">Loading blog...</p>
          </div>
        )}
        {!isLoading && blog && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {blog.imageUrl && (
              <div className="w-full">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>
            )}
            {blog.metaDescription && (
              <p className="text-sm text-gray-600 italic">{blog.metaDescription}</p>
            )}
            {blog.hashtags && blog.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="prose max-w-none">
              <ReactMarkdown>{blog.content || ''}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

