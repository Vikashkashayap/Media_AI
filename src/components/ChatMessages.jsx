import { useRef, useEffect, useState } from "react";
import StreamingText from "./StreamingText";
import StreamingMarkdown from "./StreamingMarkdown";
import ReactMarkdown from "react-markdown";
import { submitBlogForApproval } from "../services/blogService";
import { getImageToImageById } from "../services/imageToImageService";

// Helper function to convert static image URL to full URL
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return imageUrl;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  const serverBaseUrl = API_BASE_URL.replace('/api/v1', '');
  if (imageUrl.startsWith('/static')) {
    return `${serverBaseUrl}${imageUrl}`;
  }
  return imageUrl;
};

export default function ChatMessages({
  messages,
  selectedModel,
  selectedProject,
  streamingMessages,
  expandedMessages,
  copiedMessageId,
  hoveredImage,
  showMoreOptions,
  isGenerating,
  messagesEndRef,
  shouldTruncate,
  getTruncatedContent,
  toggleExpandMessage,
  handleCopyMessage,
  handleEditMessage,
  handleThumbsUp,
  handleThumbsDown,
  handleRegenerate,
  handleImagePreview,
  handleImageShare,
  handleImageDownload,
  handlePostToSocial,
  setHoveredImage,
  setShowMoreOptions,
  setMessages
}) {
  const [blogSubmissionState, setBlogSubmissionState] = useState({});
  const [imageToImageData, setImageToImageData] = useState({});

  const updateBlogStatusOnMessages = (blogId, status) => {
    if (!blogId || !status) return;
    setMessages((prev) =>
      prev.map((msg) => {
        const matches =
          msg.blog?.id === blogId ||
          (msg.meta?.type === "blog" && msg.meta?.blogId === blogId);
        if (!matches) return msg;

        const updatedBlog = {
          ...(msg.blog || {}),
          id: blogId,
          status,
        };

        return {
          ...msg,
          blog: updatedBlog,
          meta:
            msg.meta?.type === "blog"
              ? { ...msg.meta, blogStatus: status }
              : msg.meta,
        };
      })
    );
  };

  const handleSendForApproval = async (blogId) => {
    if (!blogId) return;
    setBlogSubmissionState((prev) => ({
      ...prev,
      [blogId]: { status: "loading" },
    }));
    try {
      const updated = await submitBlogForApproval(blogId);
      updateBlogStatusOnMessages(blogId, updated?.status || "PENDING_APPROVAL");
      setBlogSubmissionState((prev) => ({
        ...prev,
        [blogId]: { status: "success", message: "Sent for approval" },
      }));
      setTimeout(() => {
        setBlogSubmissionState((prev) => {
          const next = { ...prev };
          delete next[blogId];
          return next;
        });
      }, 2500);
    } catch (error) {
      setBlogSubmissionState((prev) => ({
        ...prev,
        [blogId]: {
          status: "error",
          message: error.message || "Failed to submit",
        },
      }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-600";
      case "APPROVED":
        return "bg-green-50 text-green-400";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-gray-800/80 text-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "Published";
      case "APPROVED":
        return "Approved";
      case "PENDING_APPROVAL":
        return "Pending approval";
      case "DRAFT":
      default:
        return "Draft";
    }
  };

  // Format blog content to promote likely subheadings to H2/H3
  const formatBlogContent = (rawContent) => {
    if (!rawContent || typeof rawContent !== "string") return rawContent;

    const lines = rawContent.split("\n");

    const formatted = lines.map((line, index) => {
      const trimmed = line.trim();

      // Leave empty lines untouched
      if (!trimmed) return line;

      // Heuristic: treat short standalone lines as subheadings
      const isShort = trimmed.length <= 90;
      const noEndingPunctuation = !/[.!?]$/.test(trimmed);
      const prevEmpty = index === 0 || !lines[index - 1].trim();
      const nextNonEmpty = index < lines.length - 1 && !!lines[index + 1].trim();

      if (isShort && noEndingPunctuation && prevEmpty && nextNonEmpty) {
        // If it already starts with markdown heading, don't duplicate
        if (/^#{1,6}\s+/.test(trimmed)) return line;
        // Use H2 for main sections
        return `## ${trimmed}`;
      }

      return line;
    });

    return formatted.join("\n");
  };

  const markdownComponents = {
    h2: ({ children }) => (
      <h2 className="text-xl sm:text-2xl font-semibold text-white mt-6 mb-3 break-words">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg sm:text-xl font-semibold text-gray-200 mt-5 mb-2 break-words">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-base leading-relaxed text-gray-300 break-words">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-2 break-words">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-2 break-words">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-base text-gray-300 break-words">
        {children}
      </li>
    ),
    pre: ({ children }) => (
      <pre className="w-full overflow-x-auto bg-gray-900 text-gray-100 rounded-lg p-4 text-sm my-4 border border-gray-700">
        {children}
      </pre>
    ),
    code({ inline, className, children, ...props }) {
      if (inline) {
        return (
          <code
            className="bg-gray-800 text-cyan-300 rounded px-1 py-0.5 text-sm break-words border border-gray-700"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className={`block w-full overflow-x-auto text-sm ${className || ""}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-gray-300">
        {children}
      </blockquote>
    ),
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  if (messages.length === 0) {
    // Welcome Screen - Simple style like ChatGPT
    return (
      <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-medium text-white mb-2">
          Hi! 👋
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          How can I help you today?
        </p>
      </div>
    );
  }

  // Chat Messages
  // Group messages for compare mode
  const groupedMessages = [];
  let i = 0;
  
  // Helper function to check if a message is GPT
  const isGPT = (msg) => {
    if (!msg || !msg.model) return false;
    const model = String(msg.model).toLowerCase();
    return model === 'gpt' || model.includes('gpt');
  };
  
  // Helper function to check if a message is Gemini
  const isGemini = (msg) => {
    if (!msg || !msg.model) return false;
    const model = String(msg.model).toLowerCase();
    return model === 'gemini' || model.includes('gemini');
  };
  
  while (i < messages.length) {
    const message = messages[i];
    
    if (message.type === "user") {
      groupedMessages.push({ type: "user", message });
      i++;
    } else if (message.type === "ai") {
      // Check if this is a GPT or Gemini message that can be paired
      let gptMessage = null;
      let geminiMessage = null;
      
      if (isGPT(message)) {
        gptMessage = message;
        // Check if next message is Gemini
        if (i + 1 < messages.length && messages[i + 1].type === "ai" && isGemini(messages[i + 1])) {
          geminiMessage = messages[i + 1];
        }
      } else if (isGemini(message)) {
        geminiMessage = message;
        // Check if next message is GPT
        if (i + 1 < messages.length && messages[i + 1].type === "ai" && isGPT(messages[i + 1])) {
          gptMessage = messages[i + 1];
        }
      }
      
      // If we have both GPT and Gemini messages, show them side by side
      if (gptMessage && geminiMessage) {
        // Ensure GPT is always on the left, Gemini on the right
        if (isGemini(gptMessage) && isGPT(geminiMessage)) {
          // Swap if they're in wrong order
          const temp = gptMessage;
          gptMessage = geminiMessage;
          geminiMessage = temp;
        }
        
        groupedMessages.push({ 
          type: "compare", 
          gpt: gptMessage,
          gemini: geminiMessage
        });
        i += 2;
      } else {
        // Single AI message
        groupedMessages.push({ type: "ai", message });
        i++;
      }
    } else {
      // Single AI message
      groupedMessages.push({ type: "ai", message });
      i++;
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {groupedMessages.map((group, index) => {
        if (group.type === "user") {
          // Check if this is an image-to-image request message with an image
          const isImageToImageRequest = group.message.meta?.type === 'image_to_image_request';
          const hasImage = isImageToImageRequest || 
                          group.message.image || 
                          group.message.meta?.originalImageUrl || 
                          group.message.meta?.image ||
                          (group.message.attachments && group.message.attachments.some(att => att.kind === 'image'));
          
          const rawImageUrl = group.message.image || 
                              group.message.meta?.originalImageUrl || 
                              group.message.meta?.image ||
                              (group.message.attachments?.find(att => att.kind === 'image')?.url);
          
          const imageUrl = rawImageUrl ? getFullImageUrl(rawImageUrl) : null;

          // User Message - Right side with image and prompt
          return (
            <div
              key={group.message.id}
              className="flex justify-end group"
            >
              <div className={`${hasImage ? 'max-w-[85%] sm:max-w-[75%]' : 'max-w-[85%] sm:max-w-[80%]'} relative flex flex-col items-end gap-3`}>
                {hasImage && imageUrl ? (
                  // Image-to-image request: Image outside gray bubble, prompt inside
                  <>
                    {/* Image - displayed outside the gray bubble (above) */}
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt="Uploaded image" 
                        className="w-full max-w-md h-auto rounded-lg shadow-sm object-contain"
                        style={{
                          maxHeight: '400px',
                        }}
                      />
                    </div>
                    {/* Prompt text - inside gray bubble */}
                    {group.message.content && group.message.content.trim() && (
                      <div className="bg-gray-800/80 text-gray-100 rounded-lg rounded-br-sm p-3 sm:p-4 border border-gray-700/50">
                        <div className="whitespace-pre-wrap text-sm sm:text-base">
                          {group.message.content}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Regular text-only message - inside gray bubble
                  <div className="bg-gray-800/80 text-gray-100 rounded-lg rounded-br-sm p-3 sm:p-4 border border-gray-700/50">
                    <div className="whitespace-pre-wrap text-sm sm:text-base">{group.message.content}</div>
                  </div>
                )}
                {/* Hover Actions - Copy and Edit */}
                <div className="absolute -bottom-8 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (group.message.image) {
                        handleCopyMessage(group.message.image, `copy-${group.message.id}`);
                      } else {
                        handleCopyMessage(group.message.content, `copy-${group.message.id}`);
                      }
                    }}
                    className="p-1.5 hover:bg-gray-700/50 rounded transition-all text-gray-300"
                    title="Copy"
                  >
                    {copiedMessageId === `copy-${group.message.id}` ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditMessage(group.message.content)}
                    className="p-1.5 hover:bg-gray-700/50 rounded transition-all text-gray-300"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        } else if (group.type === "compare") {
          // Horizontal Compare Mode - Simple style
          return (
            <div key={`compare-${group.gpt.id}-${group.gemini.id}`} className="w-full flex flex-col sm:flex-row gap-4 items-stretch mb-6">
              {/* GPT Panel */}
              <div className="flex flex-col flex-1">
                <div className="bg-gray-800/80 rounded-lg p-4 flex flex-col min-h-[200px]">
                  {/* Model Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">gpt-4o-mini</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-h-[100px]">
                    <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                      {streamingMessages.has(group.gpt.id) ? (
                        <StreamingText 
                          text={expandedMessages[group.gpt.id] || !shouldTruncate(group.gpt.content)
                            ? group.gpt.content
                            : getTruncatedContent(group.gpt.content)}
                          speed={2}
                          delay={15}
                        />
                      ) : (
                        expandedMessages[group.gpt.id] || !shouldTruncate(group.gpt.content)
                          ? group.gpt.content
                          : getTruncatedContent(group.gpt.content)
                      )}
                    </div>
                    {shouldTruncate(group.gpt.content) && (
                      <button
                        onClick={() => toggleExpandMessage(group.gpt.id)}
                        className="flex items-center gap-1 mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors hover:underline"
                      >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${expandedMessages[group.gpt.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{expandedMessages[group.gpt.id] ? 'Read less' : 'Read more'}</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Action Icons for GPT */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => {
                      if (group.gpt.image) {
                        handleCopyMessage(group.gpt.image, `copy-gpt-${group.gpt.id}`);
                      } else {
                        handleCopyMessage(group.gpt.content, `copy-gpt-${group.gpt.id}`);
                      }
                    }}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Copy"
                  >
                    {copiedMessageId === `copy-gpt-${group.gpt.id}` ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleThumbsUp(group.gpt.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Thumbs up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleThumbsDown(group.gpt.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Thumbs down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (group.gpt.image) {
                        handleImageShare(group.gpt.image);
                      } else {
                        if (navigator.share) {
                          navigator.share({
                            title: 'AI Response',
                            text: group.gpt.content
                          });
                        } else {
                          handleCopyMessage(group.gpt.content, `share-gpt-${group.gpt.id}`);
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Share"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRegenerate(group.gpt.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Regenerate"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="relative more-options-container">
                    <button
                      onClick={() => setShowMoreOptions(showMoreOptions === group.gpt.id ? null : group.gpt.id)}
                      className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {showMoreOptions === group.gpt.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                        <button
                          onClick={() => {
                            if (group.gpt.image) {
                              handleCopyMessage(group.gpt.image, `copy-gpt-menu-${group.gpt.id}`);
                            } else {
                              handleCopyMessage(group.gpt.content, `copy-gpt-menu-${group.gpt.id}`);
                            }
                            setShowMoreOptions(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-800/80 text-gray-300 transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setMessages(prev => prev.filter(m => m.id !== group.gpt.id));
                            setShowMoreOptions(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Gemini Panel */}
              <div className="flex flex-col flex-1">
                <div className="bg-gray-800/80 rounded-lg p-4 flex flex-col min-h-[200px]">
                  {/* Model Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">gemini-1.5-flash</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-h-[100px]">
                    <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                      {streamingMessages.has(group.gemini.id) ? (
                        <StreamingText 
                          text={expandedMessages[group.gemini.id] || !shouldTruncate(group.gemini.content)
                            ? group.gemini.content
                            : getTruncatedContent(group.gemini.content)}
                          speed={2}
                          delay={15}
                        />
                      ) : (
                        expandedMessages[group.gemini.id] || !shouldTruncate(group.gemini.content)
                          ? group.gemini.content
                          : getTruncatedContent(group.gemini.content)
                      )}
                    </div>
                    {shouldTruncate(group.gemini.content) && (
                      <button
                        onClick={() => toggleExpandMessage(group.gemini.id)}
                        className="flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
                      >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${expandedMessages[group.gemini.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{expandedMessages[group.gemini.id] ? 'Read less' : 'Read more'}</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Action Icons for Gemini */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => {
                      if (group.gemini.image) {
                        handleCopyMessage(group.gemini.image, `copy-gemini-${group.gemini.id}`);
                      } else {
                        handleCopyMessage(group.gemini.content, `copy-gemini-${group.gemini.id}`);
                      }
                    }}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Copy"
                  >
                    {copiedMessageId === `copy-gemini-${group.gemini.id}` ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleThumbsUp(group.gemini.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Thumbs up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleThumbsDown(group.gemini.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Thumbs down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (group.gemini.image) {
                        handleImageShare(group.gemini.image);
                      } else {
                        if (navigator.share) {
                          navigator.share({
                            title: 'AI Response',
                            text: group.gemini.content
                          });
                        } else {
                          handleCopyMessage(group.gemini.content, `share-gemini-${group.gemini.id}`);
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Share"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRegenerate(group.gemini.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Regenerate"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="relative more-options-container">
                    <button
                      onClick={() => setShowMoreOptions(showMoreOptions === group.gemini.id ? null : group.gemini.id)}
                      className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {showMoreOptions === group.gemini.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                        <button
                          onClick={() => {
                            if (group.gemini.image) {
                              handleCopyMessage(group.gemini.image, `copy-gemini-menu-${group.gemini.id}`);
                            } else {
                              handleCopyMessage(group.gemini.content, `copy-gemini-menu-${group.gemini.id}`);
                            }
                            setShowMoreOptions(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-800/80 text-gray-300 transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setMessages(prev => prev.filter(m => m.id !== group.gemini.id));
                            setShowMoreOptions(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          // Single AI Message - Simple style like ChatGPT
          return (
            <div
              key={group.message.id}
              className="flex justify-start"
            >
              <div className="max-w-[80%]">
                <div className="bg-gray-800/80 rounded-lg rounded-bl-sm p-3 sm:p-4">
                  {group.message.model && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        {group.message.model}
                      </span>
                    </div>
                  )}
                  {/* Blog Display */}
                  {group.message.blog || (group.message.meta && group.message.meta.type === 'blog') ? (
                    <div className="blog-content w-full max-w-full space-y-4 break-words">
                      {/* Blog Image */}
                      {group.message.image && (
                        <div className="mb-4 relative">
                          <img 
                            src={group.message.image} 
                            alt={group.message.blog?.title || "Blog image"} 
                            className="w-full h-auto rounded-lg shadow-md"
                            style={{
                              maxWidth: '100%',
                              aspectRatio: group.message.blog?.ratio ? group.message.blog.ratio.replace(':', '/') : '16/9',
                            }}
                          />
                        </div>
                      )}
                      {/* Blog Title */}
                      {group.message.blog?.title && (
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                          {group.message.blog.title}
                        </h2>
                      )}
                      {/* Meta Description */}
                      {group.message.blog?.metaDescription && (
                        <p className="text-sm text-gray-300 mb-4 italic">
                          {group.message.blog.metaDescription}
                        </p>
                      )}
                      {/* Blog Content */}
                      {streamingMessages.has(group.message.id) ? (
                        <StreamingMarkdown 
                          content={formatBlogContent(group.message.blog?.content || group.message.content)} 
                          className="prose prose-sm sm:prose-base max-w-none text-gray-300"
                          speed={5}
                          delay={10}
                          components={markdownComponents}
                        />
                      ) : (
                        <div className="prose prose-sm sm:prose-base max-w-none text-gray-300">
                          <ReactMarkdown components={markdownComponents}>
                            {formatBlogContent(group.message.blog?.content || group.message.content)}
                          </ReactMarkdown>
                        </div>
                      )}
                      {/* Hashtags */}
                      {group.message.blog?.hashtags && group.message.blog.hashtags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {group.message.blog.hashtags.map((tag, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {(() => {
                        const blogId = group.message.blog?.id || group.message.meta?.blogId;
                        const blogStatus =
                          group.message.blog?.status ||
                          group.message.meta?.blogStatus ||
                          (group.message.meta?.type === "blog" ? "DRAFT" : null);
                        if (!blogId || !blogStatus) {
                          return null;
                        }
                        const submissionState = blogSubmissionState[blogId];
                        const isSubmitting = submissionState?.status === "loading";
                        const feedbackMessage = submissionState?.message;

                        return (
                          <div className="mt-5 border border-dashed border-gray-600 rounded-lg p-4 bg-gray-800/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Workflow status</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(blogStatus)}`}>
                                  {getStatusLabel(blogStatus)}
                                </span>
                                {blogStatus === "PENDING_APPROVAL" && (
                                  <span className="text-xs text-gray-500">Waiting for workspace approval</span>
                                )}
                                {blogStatus === "APPROVED" && (
                                  <span className="text-xs text-gray-500">Publish from workspace dashboard</span>
                                )}
                                {blogStatus === "PUBLISHED" && (
                                  <span className="text-xs text-gray-500">Live on connected website</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              {blogStatus === "DRAFT" ? (
                                <button
                                  onClick={() => handleSendForApproval(blogId)}
                                  disabled={isSubmitting}
                                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {isSubmitting ? "Sending..." : "Send to workspace for approval"}
                                </button>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  {blogStatus === "PENDING_APPROVAL"
                                    ? "Your workspace will review this soon."
                                    : blogStatus === "APPROVED"
                                    ? "Approved — head to the workspace to publish."
                                    : "Already published to a website."}
                                </p>
                              )}
                              {feedbackMessage && (
                                <span
                                  className={`text-xs ${
                                    submissionState?.status === "error"
                                      ? "text-red-400"
                                      : "text-green-400"
                                  }`}
                                >
                                  {feedbackMessage}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (group.message.meta && group.message.meta.type === 'image_to_image') || group.message.imageToImage ? (
                    // Image-to-image: Show only the transformed image on the left (assistant side)
                    <div className="mb-3 relative inline-block group">
                      <div 
                        className="relative cursor-pointer"
                        style={{
                          maxWidth: group.message.meta?.size === 'large' || group.message.imageToImage?.size === 'large' ? '768px' :
                                    group.message.meta?.size === 'medium' || group.message.imageToImage?.size === 'medium' ? '640px' :
                                    group.message.meta?.size === 'small' || group.message.imageToImage?.size === 'small' ? '512px' : '512px',
                        }}
                        onMouseEnter={() => setHoveredImage(group.message.id)}
                        onMouseLeave={() => setHoveredImage(null)}
                        onClick={() => handleImagePreview(getFullImageUrl(group.message.image || group.message.meta?.imageUrl || group.message.imageToImage?.imageUrl))}
                      >
                        <img 
                          src={getFullImageUrl(group.message.image || group.message.meta?.imageUrl || group.message.imageToImage?.imageUrl)} 
                          alt="Transformed image" 
                          className="w-full h-auto rounded-lg shadow-sm transition-opacity"
                          style={{
                            maxWidth: '100%',
                            aspectRatio: (group.message.meta?.ratio || group.message.imageToImage?.ratio) ? (group.message.meta?.ratio || group.message.imageToImage?.ratio).replace(':', '/') : '16/9',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallbackDiv = e.target.nextSibling;
                            if (fallbackDiv) {
                              fallbackDiv.style.display = 'block';
                            }
                          }}
                        />
                        {/* Hover overlay with icons */}
                        {hoveredImage === group.message.id && (
                          <div className="absolute inset-0 rounded-lg flex items-center justify-center gap-4 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImagePreview(getFullImageUrl(group.message.image || group.message.meta?.imageUrl || group.message.imageToImage?.imageUrl));
                              }}
                              className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                              title="Preview"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageDownload(getFullImageUrl(group.message.image || group.message.meta?.imageUrl || group.message.imageToImage?.imageUrl));
                              }}
                              className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageShare(getFullImageUrl(group.message.image || group.message.meta?.imageUrl || group.message.imageToImage?.imageUrl));
                              }}
                              className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                              title="Share"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : group.message.image ? (
                    <div className="mb-3 relative inline-block group">
                      <div 
                        className="relative cursor-pointer"
                        style={{
                          maxWidth: group.message.size === 'Extra Large' ? '100%' : 
                                    group.message.size === 'Large' ? '768px' :
                                    group.message.size === 'Medium' ? '640px' :
                                    group.message.size === 'Small' ? '512px' : '512px',
                          width: group.message.width ? `${Math.min(group.message.width, 1024)}px` : 'auto',
                          height: group.message.height ? `${Math.min(group.message.height, 1024)}px` : 'auto',
                        }}
                        onMouseEnter={() => setHoveredImage(group.message.id)}
                        onMouseLeave={() => setHoveredImage(null)}
                        onClick={() => handleImagePreview(group.message.image)}
                      >
                        <img 
                          src={group.message.image} 
                          alt="Generated image" 
                          className="w-full h-auto rounded-lg shadow-sm transition-opacity"
                          style={{
                            maxWidth: '100%',
                            aspectRatio: group.message.aspectRatio ? group.message.aspectRatio.replace(':', '/') : '16/9',
                          }}
                          onError={(e) => {
                            // If image fails to load, show the content as fallback
                            e.target.style.display = 'none';
                            const fallbackDiv = e.target.nextSibling;
                            if (fallbackDiv) {
                              fallbackDiv.style.display = 'block';
                            }
                          }}
                        />
                        {/* Hover overlay with icons */}
                        {hoveredImage === group.message.id && (
                          <div className="absolute inset-0 rounded-lg flex items-center justify-center gap-4 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImagePreview(group.message.image);
                              }}
                              className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                              title="Preview"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageShare(group.message.image);
                              }}
                              className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                              title="Share"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageDownload(group.message.image, group.message.width, group.message.height);
                              }}
                              className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            {handlePostToSocial && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Find the original prompt from the user message that generated this image
                                  // Look for the most recent user message before this image message
                                  const currentIndex = messages.findIndex(msg => msg.id === group.message.id);
                                  let prompt = 'Generated image';
                                  
                                  // Search backwards from current message to find the user message
                                  for (let i = currentIndex - 1; i >= 0; i--) {
                                    if (messages[i].type === 'user' && messages[i].content) {
                                      prompt = messages[i].content;
                                      break;
                                    }
                                  }
                                  
                                  handlePostToSocial(group.message.image, prompt);
                                }}
                                className="bg-gray-800 bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all hover:scale-110 shadow-lg border border-gray-700"
                                title="Post to Social Media"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Fallback text content (hidden by default, shown if image fails) */}
                      <div className="whitespace-pre-wrap hidden">{group.message.content}</div>
                    </div>
                  ) : (
                    /* Show text content only if there's no image */
                    <div className="whitespace-pre-wrap text-gray-200">
                      {streamingMessages.has(group.message.id) ? (
                        <StreamingText 
                          text={group.message.content} 
                          speed={2}
                          delay={15}
                          className="text-gray-200"
                        />
                      ) : (
                        <span className="text-gray-200">{group.message.content}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* Action Icons - Copy, Thumbs Up, Thumbs Down, Share, Regenerate, More Options */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => {
                      if (group.message.image) {
                        handleCopyMessage(group.message.image, `copy-ai-${group.message.id}`);
                      } else {
                        handleCopyMessage(group.message.content, `copy-ai-${group.message.id}`);
                      }
                    }}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Copy"
                  >
                    {copiedMessageId === `copy-ai-${group.message.id}` ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleThumbsUp(group.message.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Thumbs up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleThumbsDown(group.message.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Thumbs down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (group.message.image) {
                        handleImageShare(group.message.image);
                      } else {
                        // Share text content
                        if (navigator.share) {
                          navigator.share({
                            title: 'AI Response',
                            text: group.message.content
                          });
                        } else {
                          handleCopyMessage(group.message.content, `share-${group.message.id}`);
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Share"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRegenerate(group.message.id)}
                    className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                    title="Regenerate"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="relative more-options-container">
                    <button
                      onClick={() => setShowMoreOptions(showMoreOptions === group.message.id ? null : group.message.id)}
                      className="p-1.5 hover:bg-gray-800/80 rounded transition-all text-gray-300"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {/* More Options Dropdown */}
                    {showMoreOptions === group.message.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                        <button
                          onClick={() => {
                            if (group.message.image) {
                              handleCopyMessage(group.message.image, `copy-ai-menu-${group.message.id}`);
                            } else {
                              handleCopyMessage(group.message.content, `copy-ai-menu-${group.message.id}`);
                            }
                            setShowMoreOptions(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-800/80 text-gray-300 transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setMessages(prev => prev.filter(m => m.id !== group.message.id));
                            setShowMoreOptions(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })}
      
      {isGenerating && (
        <div className="flex justify-start">
          <div className="bg-gray-800/80 rounded-lg rounded-bl-sm p-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span className="text-gray-500 text-sm">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

