import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { logout as logoutUser, getProfile } from "../services/authService";
import { callWebhook, callBothModels, callImageGenerationWebhook } from "../services/webhookService";
import { generateImage } from "../services/imageService";
import { generateImageToImage } from "../services/imageToImageService";
import { uploadImage } from "../services/imageUploadService";
import { getProjects, createProject, updateProject, deleteProject } from "../services/projectService";
import { getConversations, createConversation, getConversation } from "../services/conversationService";
import { getMessages, startOrSend, sendMessage } from "../services/messageService";
import { generateBlog, getBlogById, submitBlogForApproval } from "../services/blogService";
import { enhancePrompt as enhancePromptRequest } from "../services/promptService";
import { connectWebsiteToPersonalWorkspace, connectWebsite } from "../services/workspaceService";

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
import { extractResponseContent } from "../utils/responseUtils";
import { convertModelToBackendFormat, getModelDisplayName, getModelBadge, modelOptions } from "../utils/modelUtils";
import { transformBackendMessage, shouldTruncate, getTruncatedContent } from "../utils/messageUtils";
import { useWorkspace } from "../contexts/WorkspaceContext";
import StreamingText from "./StreamingText";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInputBox from "./ChatInputBox";
import LoadingSkeleton from "./LoadingSkeleton";
import NewProjectModal from "./modals/NewProjectModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import ImagePreviewModal from "./modals/ImagePreviewModal";
import PostToSocialModal from "./modals/PostToSocialModal";
import InviteModal from "./modals/InviteModal";
import SharesModal from "./modals/SharesModal";
import AgentModal from "./modals/AgentModal";
import ConnectWebsiteModal from "./workspaces/ConnectWebsiteModal";

export default function ChatInterface() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspaceId, activeWorkspace, refreshWorkspaces, isLoading: workspaceLoading, setActiveWorkspaceId } = useWorkspace();
  const [inputValue, setInputValue] = useState("");
  const [proEnabled, setProEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("home");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showFeatureOptions, setShowFeatureOptions] = useState(false);
  const [featureOptions, setFeatureOptions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('featureOptions');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing  saved featureOptions:', e);
        }
      }
    }
    return {
      platform: "All Platforms",
      size: "Standard",
      aspectRatio: "16:9",
      style: "Default"
    };
  });
  const [autoSubmitBlogs, setAutoSubmitBlogs] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('autoSubmitBlogs') === 'true';
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatBoxExpanded, setIsChatBoxExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedModel') || "GPT";
    }
    return "GPT";
  });
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isProjectsExpanded');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isChatsExpanded, setIsChatsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isChatsExpanded');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });
  const [conversations, setConversations] = useState([]);
  const [conversationsWithoutProject, setConversationsWithoutProject] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [projectConversations, setProjectConversations] = useState({});
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [streamingMessages, setStreamingMessages] = useState(new Set());
  const [hoveredImage, setHoveredImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [postToSocialData, setPostToSocialData] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSharesModal, setShowSharesModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showConnectWebsiteModal, setShowConnectWebsiteModal] = useState(false);
  const [isConnectingWebsite, setIsConnectingWebsite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [isInitializingFromUrl, setIsInitializingFromUrl] = useState(false);
  const justCreatedProjectRef = useRef(false);
  const creatingNewChatRef = useRef(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // { file: File, preview: string, url: string | null }
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const popupRef = useRef(null);
  const settingsRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const inviteModalRef = useRef(null);
  const sharesModalRef = useRef(null);
  const agentModalRef = useRef(null);
  const isSendingMessageRef = useRef(false);
  const previousWorkspaceIdRef = useRef(undefined);
  const isWorkspaceChangingRef = useRef(false);


  useEffect(() => {
    if (typeof window !== 'undefined' && selectedModel) {
      localStorage.setItem('selectedModel', selectedModel);
    }
    // Clear selected image when model changes (unless switching to Image to Image)
    if (selectedModel !== "Image to Image" && selectedImage) {
      if (selectedImage.preview) {
        URL.revokeObjectURL(selectedImage.preview);
      }
      setSelectedImage(null);
    }
    
    // Show feature options for image-related models
    if (selectedModel === "DALL-E" || selectedModel === "Image to Image") {
      setShowFeatureOptions(true);
      setSelectedFeature("image");
    } else {
      // Hide feature options for other models
      setShowFeatureOptions(false);
      setSelectedFeature(null);
    }
  }, [selectedModel]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (selectedImage?.preview) {
        URL.revokeObjectURL(selectedImage.preview);
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('autoSubmitBlogs', autoSubmitBlogs ? 'true' : 'false');
  }, [autoSubmitBlogs]);

  // Persist feature options to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('featureOptions', JSON.stringify(featureOptions));
    }
  }, [featureOptions]);

  // Persist projects expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isProjectsExpanded', isProjectsExpanded.toString());
    }
  }, [isProjectsExpanded]);

  // Persist chats expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isChatsExpanded', isChatsExpanded.toString());
    }
  }, [isChatsExpanded]);

  const setSendingFlag = (value, delay = 0) => {
    if (delay > 0) {
      setTimeout(() => {
        isSendingMessageRef.current = value;
        setIsSendingMessage(value);
      }, delay);
    } else {
      isSendingMessageRef.current = value;
      setIsSendingMessage(value);
    }
  };

  const handleSend = async () => {
    console.log('[ChatInterface] handleSend called', {
      inputValue: inputValue.trim(),
      selectedModel,
      selectedImage: selectedImage ? { hasUrl: !!selectedImage.url, fileName: selectedImage.file?.name } : null,
      isGenerating,
    });
    
    if (!inputValue.trim()) {
      console.log('[ChatInterface] Input is empty, returning');
      return;
    }

    if (isGenerating) {
      console.log('[ChatInterface] Already generating, ignoring send');
      return;
    }

    // Set flag to prevent useEffect from loading messages
    setSendingFlag(true);
    
    const messageContent = inputValue.trim();
    const projectId = selectedProject ? selectedProject.id : null;
    // Use currentConversation if available, otherwise fall back to URL parameter
    // This ensures we use the existing conversation even if currentConversation hasn't loaded yet
    const conversationIdFromUrl = searchParams.get('conversation');
    const conversationId = currentConversation?.id || conversationIdFromUrl || null;
    
    console.log('[ChatInterface] Preparing to send message', {
      messageContent: messageContent.substring(0, 50) + '...',
      projectId,
      conversationId,
      conversationIdFromUrl,
      currentConversationId: currentConversation?.id,
      selectedModel,
    });
    
    // Add user message to UI immediately
    const userMessage = {
      id: `temp-${Date.now()}`,
      type: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    // For image-to-image, include the image in the user message
    if (selectedModel === "Image to Image" && selectedImage?.url) {
      userMessage.image = selectedImage.url;
      userMessage.meta = {
        type: "image_to_image_request",
        originalImageUrl: selectedImage.url,
      };
      console.log('[ChatInterface] Added image to user message', { imageUrl: selectedImage.url });
    } else if (selectedModel === "Image to Image" && !selectedImage?.url) {
      console.warn('[ChatInterface] Image to Image selected but no image URL found', {
        selectedImage,
        hasFile: !!selectedImage?.file,
        hasPreview: !!selectedImage?.preview,
        hasUrl: !!selectedImage?.url,
      });
    }
    
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setInputValue("");

    try {
      // Convert model to backend format
      const backendModel = convertModelToBackendFormat(selectedModel);
      const isImageTask = selectedModel === "DALL-E";
      const isImageToImageTask = selectedModel === "Image to Image";
      const isCompareMode = selectedModel === "GPT vs Gemini";
      const isBlogTask = selectedModel === "Blog Agent";
      
      console.log('[ChatInterface] Model detection:', {
        selectedModel,
        isImageTask,
        isImageToImageTask,
        isCompareMode,
        isBlogTask,
      });

      let response;
      
      if (isBlogTask) {
        // Blog generation mode
        console.log('Blog generation mode: Calling backend API', {
          prompt: messageContent.substring(0, 50) + '...',
          conversationId: conversationId
        });

        try {
          const blogData = await generateBlog({
            prompt: messageContent,
            style: featureOptions.style || "professional",
            model: "blog-pro-1",
            ratio: featureOptions.aspectRatio || "16:9",
            size: featureOptions.size || "large",
            conversationId: conversationId,
            projectId: projectId
          });

          // Create or get conversation for blog
          let blogConversationId = conversationId;
          
          // If backend returned a conversation ID, use it
          if (!blogConversationId && blogData.conversationId) {
             blogConversationId = blogData.conversationId;
             
             // Fetch the new conversation details
             try {
               const newConv = await getConversation(blogConversationId);
               setCurrentConversation(newConv);
               // Add to conversations list
               setConversations(prev => [newConv, ...prev]);
               
               // Update URL
               const newParams = new URLSearchParams();
               if (selectedProject) {
                 newParams.set('project', selectedProject.id);
                 // Add to project conversations
                 setProjectConversations(prev => ({
                    ...prev,
                    [selectedProject.id]: [newConv, ...(prev[selectedProject.id] || [])]
                 }));
               } else {
                 newParams.set('project', 'null');
                 // Add to conversations without project
                 setConversationsWithoutProject(prev => [newConv, ...prev]);
               }
               newParams.set('conversation', blogConversationId);
               setSearchParams(newParams, { replace: true });
             } catch (err) {
               console.error("Error fetching new conversation:", err);
             }
          } else if (!blogConversationId) {
            // Keep flag set to prevent useEffect from loading messages
            setSendingFlag(true);
            
            // Create a new conversation for the blog (Fallback if backend didn't create one)
            // Ensure title is a string
            const conversationTitle = (blogData.title && typeof blogData.title === 'string') 
              ? blogData.title 
              : (typeof messageContent === 'string' ? messageContent.substring(0, 50) : 'New Blog');
            
            const newConv = await createConversation(conversationTitle, projectId);
            blogConversationId = newConv.id;
            
            // Update URL first
            const newParams = new URLSearchParams();
            if (selectedProject) {
              newParams.set('project', selectedProject.id);
            } else {
              newParams.set('project', 'null');
            }
            newParams.set('conversation', blogConversationId);
            setSearchParams(newParams, { replace: true });
            
            // Set conversation after URL is updated
            setCurrentConversation(newConv);
            setConversations(prev => [newConv, ...prev]);
          }

          // Add user message
          setMessages((prev) => {
            const filtered = prev.filter(m => m.id !== userMessage.id);
            return [...filtered, {
              id: userMessage.id.replace('temp-', ''),
              type: "user",
              content: messageContent,
              timestamp: new Date().toLocaleTimeString(),
            }];
          });

          // Add blog as AI message
          const blogMessage = {
            id: `blog-${blogData.blogId || Date.now()}`,
            type: "ai",
            content: blogData.blog || blogData.title || "Blog generated successfully",
            model: "Blog Agent",
            timestamp: new Date().toLocaleTimeString(),
            // Blog-specific data
            blog: {
              id: blogData.blogId,
              title: blogData.title,
              content: blogData.blog,
              imageUrl: getFullImageUrl(blogData.imageUrl),
              metaDescription: blogData.metaDescription,
              hashtags: blogData.hashtags || [],
              model: blogData.model,
              ratio: blogData.ratio,
              size: blogData.size,
            status: blogData.status || 'DRAFT',
            },
            // For image display
            image: getFullImageUrl(blogData.imageUrl),
            meta: {
              type: "blog",
              blogId: blogData.blogId,
              title: blogData.title,
              imageUrl: blogData.imageUrl,
            blogStatus: blogData.status || 'DRAFT',
            }
          };

          if (autoSubmitBlogs && blogData.blogId) {
            try {
              const submitted = await submitBlogForApproval(blogData.blogId);
              if (submitted?.status) {
                blogMessage.blog.status = submitted.status;
                blogMessage.meta.blogStatus = submitted.status;
              }
            } catch (err) {
              console.error('Auto submit for approval failed:', err);
            }
          }

          setMessages((prev) => [...prev, blogMessage]);
          setStreamingMessages(prev => {
            const newSet = new Set(prev);
            newSet.add(blogMessage.id);
            return newSet;
          });
          setIsLoadingConversation(false);

          // Ensure workspaceId is set if blog response includes it and it's not already set
          if (blogData.workspaceId && !activeWorkspaceId) {
            setActiveWorkspaceId(blogData.workspaceId);
          }

          // Reload messages to get the actual message from backend if conversationId exists
          // Wait a bit longer to ensure backend has processed the message
          if (blogConversationId) {
            setTimeout(async () => {
              try {
                // Capture current streaming messages to preserve state
                const currentStreamingIds = new Set(streamingMessages);
                // Also track by blog ID to handle ID changes
                const currentStreamingBlogIds = new Set();
                messages.forEach(m => {
                  if (streamingMessages.has(m.id) && m.meta?.blogId) {
                    currentStreamingBlogIds.add(m.meta.blogId);
                  }
                  // Also add the newly created blog ID
                  if (m.id === blogMessage.id) {
                    currentStreamingBlogIds.add(blogData.blogId);
                  }
                });
                // Add the current blog ID explicitly just in case
                currentStreamingBlogIds.add(blogData.blogId);

                const backendMessages = await getMessages(blogConversationId);
                if (backendMessages && backendMessages.length > 0) {
                  const transformed = backendMessages
                    .reverse()
                    .map((msg) => {
                      const frontendMessage = {
                        id: msg.id,
                        type: msg.role === 'user' ? 'user' : 'ai',
                        content: msg.content,
                        model: msg.model,
                        timestamp: msg.createdAt 
                          ? new Date(msg.createdAt).toLocaleTimeString() 
                          : new Date().toLocaleTimeString(),
                        meta: msg.meta,
                      };
                      
                      // Handle image_to_image meta data
                      if (msg.meta && msg.meta.type === 'image_to_image') {
                        if (msg.meta.imageUrl) {
                          frontendMessage.image = getFullImageUrl(msg.meta.imageUrl);
                          frontendMessage.model = msg.meta.model || 'Image to Image';
                        }
                        // Store image-to-image metadata similar to blogs
                        frontendMessage.imageToImage = {
                          id: msg.meta.imageToImageId,
                          imageUrl: getFullImageUrl(msg.meta.imageUrl),
                          originalImageUrl: getFullImageUrl(msg.meta.originalImageUrl),
                          prompt: msg.meta.prompt,
                          model: msg.meta.model,
                          ratio: msg.meta.ratio,
                          size: msg.meta.size,
                        };
                      }
                      
                      // Handle blog meta data
                      if (msg.meta && msg.meta.type === 'blog') {
                        frontendMessage.blog = {
                          id: msg.meta.blogId,
                          title: msg.meta.title,
                          imageUrl: getFullImageUrl(msg.meta.imageUrl),
                          hashtags: msg.meta.hashtags,
                          ratio: msg.meta.ratio,
                          size: msg.meta.size,
                          metaDescription: msg.meta.metaDescription,
                        };
                        frontendMessage.image = getFullImageUrl(msg.meta.imageUrl);
                        frontendMessage.model = 'Blog Agent';
                        
                        // Fetch full blog content from API if blogId exists
                        if (msg.meta.blogId) {
                          getBlogById(msg.meta.blogId).then(blogData => {
                            setMessages(prev => prev.map(m => {
                              if (m.id === msg.id || m.meta?.blogId === msg.meta.blogId) {
                                return {
                                  ...m,
                                  blog: {
                                    id: blogData.id,
                                    title: blogData.title,
                                    content: blogData.content,
                                    imageUrl: getFullImageUrl(blogData.imageUrl),
                                    metaDescription: blogData.metaDescription,
                                    hashtags: blogData.hashtags || [],
                                    model: blogData.model,
                                    ratio: blogData.ratio,
                              size: blogData.size,
                              status: blogData.status,
                                  },
                                  content: blogData.content || m.content,
                            image: getFullImageUrl(blogData.imageUrl),
                            meta: m.meta?.type === 'blog'
                              ? { ...m.meta, blogStatus: blogData.status }
                              : m.meta,
                                };
                              }
                              return m;
                            }));
                          }).catch(console.error);
                        }
                      }
                      
                      return frontendMessage;
                    });
                  
                  // Only update if we have messages, don't clear existing ones
                  setMessages(transformed);

                  // Update streaming messages to include the new IDs for any blogs that were streaming
                  setStreamingMessages(prev => {
                    const newSet = new Set(prev);
                    transformed.forEach(msg => {
                      if (msg.meta?.type === 'blog' && msg.meta?.blogId) {
                        if (currentStreamingBlogIds.has(msg.meta.blogId)) {
                          newSet.add(msg.id);
                        }
                      }
                    });
                    return newSet;
                  });
                }
              } catch (error) {
                console.error('Error reloading messages:', error);
                // Don't clear messages on error, keep what we have
              }
            }, 1000); // Increased delay to ensure backend has processed
          }

          setIsGenerating(false);
          // Reset flag after a delay to allow useEffect to work normally
          setSendingFlag(false, 1500);
          return;
        } catch (error) {
          console.error('Error generating blog:', error);
          setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
          const errorMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `Sorry, I encountered an error generating the blog: ${error.message || 'Unknown error'}. Please try again.`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsGenerating(false);
          setSendingFlag(false);
          return;
        }
      } else if (isImageTask) {
        // Image generation mode
        console.log('Image generation mode: Calling backend API', {
          prompt: messageContent.substring(0, 50) + '...',
          size: featureOptions.size,
          aspectRatio: featureOptions.aspectRatio
        });

        // Convert size to backend format (e.g., "1024x1024")
        const sizeMap = {
          "Standard": "1024x1024",
          "256x256": "256x256",
          "512x512": "512x512",
          "1024x1024": "1024x1024"
        };
        const imageSize = sizeMap[featureOptions.size] || "1024x1024";

        response = await startOrSend({
          task: "image",
          prompt: messageContent,
          model: backendModel,
          projectId: projectId,
          conversationId: conversationId,
          imageOptions: {
            size: imageSize,
            count: 1
          }
        });
      } else if (isImageToImageTask) {
        // Image-to-image generation mode
        console.log('Image-to-image generation mode: Calling webhook', {
          prompt: messageContent.substring(0, 50) + '...',
          size: featureOptions.size,
          aspectRatio: featureOptions.aspectRatio
        });

        // Get image URL from selected image, prompt, or previous messages
        let imageUrl = null;
        let promptText = messageContent;
        
        // First priority: Use selected image
        if (selectedImage?.url) {
          imageUrl = selectedImage.url;
        } else {
          // Try to extract URL from the prompt
          const urlMatch = messageContent.match(/https?:\/\/[^\s"']+/);
          if (urlMatch) {
            imageUrl = urlMatch[0];
            // Remove the URL from the prompt
            promptText = messageContent.replace(urlMatch[0], '').trim();
          } else {
            // Look for image in previous messages
            const imageMessages = messages.filter(m => m.image || m.meta?.imageUrl);
            if (imageMessages.length > 0) {
              const lastImageMessage = imageMessages[imageMessages.length - 1];
              imageUrl = lastImageMessage.image || lastImageMessage.meta?.imageUrl || lastImageMessage.meta?.image;
            }
          }
        }

        // If no image URL found, show error
        if (!imageUrl) {
          const errorMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: "Please select an image using the upload button or provide an image URL in your prompt. Example: 'transform this image: https://example.com/image.png'",
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => {
            const filtered = prev.filter(m => m.id !== userMessage.id);
            return [...filtered, errorMessage];
          });
          setIsGenerating(false);
          setSendingFlag(false);
          return;
        }

        // Get user data
        const tenantId = userProfile?.tenantId || null;
        const userId = userProfile?.id || null;
        const workspaceId = activeWorkspaceId || null;

        // Convert size to webhook format
        const sizeMap = {
          "Standard": "medium",
          "256x256": "small",
          "512x512": "medium",
          "1024x1024": "large",
          "small": "small",
          "medium": "medium",
          "large": "large"
        };
        const webhookSize = sizeMap[featureOptions.size] || "medium";

        // Prepare style and params
        const style = {
          preset: featureOptions.style === "realistic" ? "realistic" : featureOptions.style || "realistic",
          mood: "neutral",
          lighting: "natural",
          extra: "high quality, detailed"
        };

        const params = {
          steps: 30,
          guidance: 7.5,
          strength: 0.6,
          seed: null,
          upscale: false,
          enhanceFace: true
        };

        try {
          // Call backend endpoint - backend will call n8n webhook and save to DB
          const backendResult = await generateImageToImage({
            prompt: promptText || "generate a image like this",
            imageUrl: imageUrl,
            conversationId: conversationId,
            projectId: projectId,
            aspectRatio: featureOptions.aspectRatio || "16:9",
            size: webhookSize,
            style: style,
            params: params,
          });

          // Update conversation if it was created
          if (backendResult.conversationId && !conversationId) {
            try {
              const newConv = await getConversation(backendResult.conversationId);
              setCurrentConversation(newConv);
              setConversations(prev => [newConv, ...prev]);
              
              const newParams = new URLSearchParams();
              if (selectedProject) {
                newParams.set('project', selectedProject.id);
                setProjectConversations(prev => ({
                  ...prev,
                  [selectedProject.id]: [newConv, ...(prev[selectedProject.id] || [])]
                }));
              } else {
                newParams.set('project', 'null');
                setConversationsWithoutProject(prev => [newConv, ...prev]);
              }
              newParams.set('conversation', backendResult.conversationId);
              setSearchParams(newParams, { replace: true });
            } catch (err) {
              console.error("Error fetching new conversation:", err);
            }
          }

          // Reload messages from backend to get the saved messages
          if (backendResult.conversationId) {
            try {
              // Wait a bit for backend to finish processing
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const backendMessages = await getMessages(backendResult.conversationId);
              console.log('Backend messages received:', backendMessages);
              
              if (backendMessages && backendMessages.length > 0) {
                const transformed = backendMessages
                  .reverse()
                  .map((msg) => transformBackendMessage(msg));
                
                console.log('Transformed messages:', transformed);
                console.log('User messages in transformed:', transformed.filter(m => m.type === 'user'));
                
                // Remove temporary user message and replace with backend messages
                // Backend should have created both user and assistant messages
                // Ensure we have both user and assistant messages
                const hasUserMessage = transformed.some(m => m.type === 'user');
                const hasAssistantMessage = transformed.some(m => m.type === 'ai' && m.meta?.type === 'image_to_image');
                
                console.log('[ChatInterface] Message check:', {
                  hasUserMessage,
                  hasAssistantMessage,
                  totalMessages: transformed.length,
                  userMessages: transformed.filter(m => m.type === 'user').length,
                  assistantMessages: transformed.filter(m => m.type === 'ai').length,
                });
                
                // Check if backend user message has the image properly set
                const backendUserMsg = transformed.find(m => m.type === 'user');
                const backendUserHasImage = backendUserMsg && (
                  backendUserMsg.image || 
                  backendUserMsg.meta?.originalImageUrl || 
                  backendUserMsg.attachments?.some(att => att.kind === 'image')
                );
                
                // Always preserve the temp user message if it has an image, even if backend returns one
                // This ensures the user's uploaded image and prompt are always visible
                setMessages((prev) => {
                  // Find the temp user message BEFORE filtering
                  const tempUserMsg = prev.find(m => m.id === userMessage.id);
                  const tempUserHasImage = tempUserMsg && (
                    tempUserMsg.image || 
                    tempUserMsg.meta?.originalImageUrl
                  );
                  
                  // Remove temp user message from prev
                  const filtered = prev.filter(m => m.id !== userMessage.id);
                  
                  // If temp message has image, always preserve it
                  if (tempUserHasImage) {
                    console.log('[ChatInterface] Preserving temp user message with image');
                    const assistantMsgs = transformed.filter(m => m.type === 'ai');
                    // Combine: existing messages (without temp), temp user message, backend assistant messages
                    // Sort by timestamp to maintain chronological order
                    const allMessages = [...filtered, tempUserMsg, ...assistantMsgs];
                    return allMessages.sort((a, b) => {
                      const timeA = new Date(a.timestamp || 0).getTime();
                      const timeB = new Date(b.timestamp || 0).getTime();
                      return timeA - timeB;
                    });
                  } else if (hasUserMessage && backendUserHasImage) {
                    // Use backend messages which should include both user and assistant with proper images
                    console.log('[ChatInterface] Using backend messages with images');
                    return [...transformed];
                  } else {
                    // Fallback: use backend messages or keep what we have
                    console.warn('[ChatInterface] Fallback: using backend messages');
                    return [...transformed];
                  }
                });
                
                // Update streaming for the new assistant message
                const assistantMsg = transformed.find(m => m.type === 'ai' && m.meta?.type === 'image_to_image');
                if (assistantMsg) {
                  setStreamingMessages(prev => {
                    const newSet = new Set(prev);
                    newSet.add(assistantMsg.id);
                    return newSet;
                  });
                }
              } else {
                // Fallback: create message from backend result
                const aiMessage = {
                  id: backendResult.messageId || Date.now() + 1,
                  type: "ai",
                  model: backendResult.model || "Image to Image",
                  content: `Image transformed successfully!`,
                  image: getFullImageUrl(backendResult.imageUrl),
                  timestamp: new Date().toLocaleTimeString(),
                  meta: {
                    type: "image_to_image",
                    imageUrl: backendResult.imageUrl,
                    prompt: backendResult.prompt,
                    ratio: backendResult.ratio,
                    size: backendResult.size,
                    model: backendResult.model,
                  }
                };
                setMessages((prev) => {
                  const filtered = prev.filter(m => m.id !== userMessage.id);
                  return [...filtered, aiMessage];
                });
                setStreamingMessages(prev => {
                  const newSet = new Set(prev);
                  newSet.add(aiMessage.id);
                  return newSet;
                });
              }
            } catch (err) {
              console.error('Error reloading messages:', err);
              // Fallback: create message from backend result
              const aiMessage = {
                id: backendResult.messageId || Date.now() + 1,
                type: "ai",
                model: webhookResponse.model || "Image to Image",
                content: `Image transformed successfully!`,
                image: getFullImageUrl(backendResult.imageUrl),
                timestamp: new Date().toLocaleTimeString(),
                meta: {
                  type: "image_to_image",
                  imageUrl: backendResult.imageUrl,
                  prompt: backendResult.prompt,
                  ratio: backendResult.ratio,
                  size: backendResult.size,
                  model: webhookResponse.model,
                }
              };
              setMessages((prev) => {
                const filtered = prev.filter(m => m.id !== userMessage.id);
                return [...filtered, aiMessage];
              });
              setStreamingMessages(prev => {
                const newSet = new Set(prev);
                newSet.add(aiMessage.id);
                return newSet;
              });
            }
          }

          setIsGenerating(false);
          setSendingFlag(false);
          // Clear selected image after successful generation
          setSelectedImage(null);
          return;
        } catch (error) {
          console.error('Error in image-to-image generation:', error);
          console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            data: error?.data,
            stack: error?.stack?.substring(0, 200),
          });
          
          const errorMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `Sorry, I encountered an error transforming the image: ${error?.message || error?.data?.message || 'Unknown error'}. ${error?.status === 401 ? 'Please make sure you are logged in.' : ''} ${error?.status === 403 ? 'You may not have access to this workspace.' : ''} Please try again.`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => {
            const filtered = prev.filter(m => m.id !== userMessage.id);
            return [...filtered, errorMessage];
          });
          setIsGenerating(false);
          setSendingFlag(false);
          setSelectedImage(null); // Clear selected image on error
          return;
        }
      } else {
        // Chat mode - use startOrSend which handles conversation creation
        console.log(`Chat mode: Calling backend API with model: ${selectedModel}`);
        
        response = await startOrSend({
          task: "chat",
          content: messageContent,
          model: isCompareMode ? ['gpt', 'gemini'] : backendModel,
          projectId: projectId,
          conversationId: conversationId,
        });
      }

      // Backend returns: { conversationId, messages: [userMessage, ...assistantMessages] }
      const responseData = response;
      const responseConversationId = responseData.conversationId;
      const responseMessages = responseData.messages || [];

      // If this is a new conversation (different from what we have), fetch conversation details and update state
      // Also check if the response conversationId matches the URL conversationId - if so, we should use the existing one
      const isNewConversation = responseConversationId && 
        (!currentConversation || currentConversation.id !== responseConversationId) &&
        responseConversationId !== conversationIdFromUrl;
      
      if (isNewConversation) {
        try {
          const newConversation = await getConversation(responseConversationId);
          setCurrentConversation(newConversation);
          setConversations([newConversation, ...conversations]);
          
          // Update project conversations if project exists
          if (selectedProject) {
            setProjectConversations(prev => ({
              ...prev,
              [selectedProject.id]: [newConversation, ...(prev[selectedProject.id] || [])]
            }));
          } else {
            // Update conversations without project
            setConversationsWithoutProject(prev => [newConversation, ...prev]);
          }
          
          // Update URL with new conversation ID
          const newParams = new URLSearchParams();
          if (selectedProject) {
            newParams.set('project', selectedProject.id);
          } else {
            newParams.set('project', 'null');
          }
          newParams.set('conversation', responseConversationId);
          setSearchParams(newParams, { replace: true });
        } catch (error) {
          console.error('Error fetching conversation details:', error);
          // Still set conversationId even if fetch fails
          setCurrentConversation({ id: responseConversationId });
          // Update URL even if fetch fails
          const newParams = new URLSearchParams();
          if (selectedProject) {
            newParams.set('project', selectedProject.id);
          } else {
            newParams.set('project', 'null');
          }
          newParams.set('conversation', responseConversationId);
          setSearchParams(newParams, { replace: true });
        }
      } else if (responseConversationId && currentConversation?.id !== responseConversationId) {
        // If we have a conversationId from URL that matches the response, use that
        if (responseConversationId === conversationIdFromUrl) {
          // Try to load the full conversation object
          try {
            const existingConversation = await getConversation(responseConversationId);
            if (existingConversation) {
              setCurrentConversation(existingConversation);
            } else {
              setCurrentConversation({ id: responseConversationId });
            }
          } catch (error) {
            console.error('Error loading existing conversation:', error);
            setCurrentConversation({ id: responseConversationId });
          }
        } else {
          // Update current conversation ID if it changed
          setCurrentConversation({ id: responseConversationId });
          // Update URL
          const newParams = new URLSearchParams();
          if (selectedProject) {
            newParams.set('project', selectedProject.id);
          } else {
            newParams.set('project', 'null');
          }
          newParams.set('conversation', responseConversationId);
          setSearchParams(newParams, { replace: true });
        }
      } else if (responseConversationId && !currentConversation && responseConversationId === conversationIdFromUrl) {
        // If we don't have currentConversation but the response matches URL, load it
        try {
          const existingConversation = await getConversation(responseConversationId);
          if (existingConversation) {
            setCurrentConversation(existingConversation);
          }
        } catch (error) {
          console.error('Error loading conversation from URL:', error);
        }
      }

      // Separate user and assistant messages from response
      const userMsg = responseMessages.find(m => m.role === 'user');
      const assistantMsgs = responseMessages.filter(m => m.role === 'assistant');

      // Replace temporary user message with real one from backend
      if (userMsg) {
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== userMessage.id);
          return [...filtered, {
            id: userMsg.id,
            type: "user",
            content: userMsg.content,
            timestamp: userMsg.createdAt 
              ? new Date(userMsg.createdAt).toLocaleTimeString() 
              : new Date().toLocaleTimeString(),
          }];
        });
      }

      // Transform assistant messages to frontend format
      const transformedMessages = assistantMsgs.map((msg, index) => {
        // Normalize model name to standard format
        let normalizedModel = msg.model || (isCompareMode ? (index === 0 ? 'GPT' : 'Gemini') : selectedModel);
        if (normalizedModel) {
          const modelLower = String(normalizedModel).toLowerCase();
          if (modelLower.includes('gpt')) {
            normalizedModel = 'GPT';
          } else if (modelLower.includes('gemini')) {
            normalizedModel = 'Gemini';
          }
        }
        
        const aiMessage = {
          id: msg.id || `ai-${Date.now()}-${index}`,
          type: "ai",
          content: msg.content || 'No response',
          model: normalizedModel,
          timestamp: msg.createdAt 
            ? new Date(msg.createdAt).toLocaleTimeString() 
            : new Date().toLocaleTimeString(),
          // Preserve meta information
          meta: msg.meta,
        };

        // Handle image attachments if present (from messageAttachments table)
        // Note: Attachments might need to be fetched separately or included in response
        if (msg.attachments && Array.isArray(msg.attachments)) {
          const imageAttachment = msg.attachments.find(att => att.kind === 'image');
          if (imageAttachment) {
            aiMessage.image = imageAttachment.url;
            aiMessage.width = imageAttachment.width;
            aiMessage.height = imageAttachment.height;
          }
        }

        // Handle meta data for image_to_image
        if (msg.meta && msg.meta.type === 'image_to_image') {
          if (msg.meta.imageUrl) {
            aiMessage.image = getFullImageUrl(msg.meta.imageUrl);
            aiMessage.meta = {
              ...msg.meta,
              imageUrl: getFullImageUrl(msg.meta.imageUrl),
              originalImageUrl: msg.meta.originalImageUrl ? getFullImageUrl(msg.meta.originalImageUrl) : null,
            };
            aiMessage.model = msg.meta.model || 'Image to Image';
          }
        }
        
        // Handle meta data for images
        if (msg.meta && msg.meta.type === 'image_generation' && msg.meta.images) {
          const firstImage = Array.isArray(msg.meta.images) ? msg.meta.images[0] : msg.meta.images;
          if (firstImage && firstImage.url) {
            aiMessage.image = firstImage.url;
            aiMessage.width = firstImage.width || aiMessage.width;
            aiMessage.height = firstImage.height || aiMessage.height;
          }
        }

        return aiMessage;
      });

      // Add assistant messages
      if (transformedMessages.length > 0) {
        setMessages((prev) => [...prev, ...transformedMessages]);
        setStreamingMessages(prev => {
          const newSet = new Set(prev);
          transformedMessages.forEach(msg => newSet.add(msg.id));
          return newSet;
        });
      } else {
        // If no assistant messages, show error
        const errorMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: 'No response received from the AI. Please try again.',
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      // Reload all messages from backend to ensure consistency and get attachments
      if (responseConversationId) {
        setTimeout(async () => {
          try {
            const backendMessages = await getMessages(responseConversationId);
            const transformed = backendMessages
              .reverse()
              .map((msg) => {
                const frontendMessage = {
                  id: msg.id,
                  type: msg.role === 'user' ? 'user' : 'ai',
                  content: msg.content,
                  model: msg.model,
                  timestamp: msg.createdAt 
                    ? new Date(msg.createdAt).toLocaleTimeString() 
                    : new Date().toLocaleTimeString(),
                  // Include attachments if available
                  image: msg.attachments?.find(att => att.kind === 'image')?.url,
                  width: msg.attachments?.find(att => att.kind === 'image')?.width,
                  height: msg.attachments?.find(att => att.kind === 'image')?.height,
                  // Preserve meta information
                  meta: msg.meta,
                };
                
                // Handle image_to_image meta data
                if (msg.meta && msg.meta.type === 'image_to_image') {
                  if (msg.meta.imageUrl) {
                    frontendMessage.image = getFullImageUrl(msg.meta.imageUrl);
                    frontendMessage.model = msg.meta.model || 'Image to Image';
                  }
                }
                
                // Handle meta data for images
                if (msg.meta && msg.meta.type === 'image_generation' && msg.meta.images) {
                  const firstImage = Array.isArray(msg.meta.images) ? msg.meta.images[0] : msg.meta.images;
                  if (firstImage && firstImage.url) {
                    frontendMessage.image = firstImage.url;
                    frontendMessage.width = firstImage.width || frontendMessage.width;
                    frontendMessage.height = firstImage.height || frontendMessage.height;
                  }
                }
                
                // Handle blog meta data
                if (msg.meta && msg.meta.type === 'blog') {
                  frontendMessage.blog = {
                    id: msg.meta.blogId,
                    title: msg.meta.title,
                    imageUrl: getFullImageUrl(msg.meta.imageUrl),
                    hashtags: msg.meta.hashtags,
                    ratio: msg.meta.ratio,
                    size: msg.meta.size,
                    metaDescription: msg.meta.metaDescription,
                    status: msg.meta.blogStatus,
                  };
                  frontendMessage.image = getFullImageUrl(msg.meta.imageUrl);
                  // Fetch full blog content from API if blogId exists
                  if (msg.meta.blogId) {
                    getBlogById(msg.meta.blogId).then(blogData => {
                      setMessages(prev => prev.map(m => {
                        if (m.id === msg.id || m.meta?.blogId === msg.meta.blogId) {
                          return {
                            ...m,
                            blog: {
                              id: blogData.id,
                              title: blogData.title,
                              content: blogData.content,
                              imageUrl: getFullImageUrl(blogData.imageUrl),
                              metaDescription: blogData.metaDescription,
                              hashtags: blogData.hashtags || [],
                              model: blogData.model,
                              ratio: blogData.ratio,
                              size: blogData.size,
                              status: blogData.status,
                            },
                            content: blogData.content || m.content,
                            image: getFullImageUrl(blogData.imageUrl),
                            meta: m.meta?.type === 'blog'
                              ? { ...m.meta, blogStatus: blogData.status }
                              : m.meta,
                          };
                        }
                        return m;
                      }));
                    }).catch(console.error);
                  }
                }
                
                return frontendMessage;
              });
            setMessages(transformed);
          } catch (error) {
            console.error('Error reloading messages:', error);
          }
        }, 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove temporary user message on error
      setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      // Reset flag after a short delay to ensure useEffect doesn't run immediately
      setSendingFlag(false, 100);
    }
  };

  const getAIResponse = (input) => {
    const responses = {
      "market trends": "Based on current market analysis, I'm seeing significant growth in AI integration across industries. Key trends include...",
      "generate reports": "I can help you generate comprehensive reports. Please specify the type of report and the data sources you'd like me to focus on.",
      "data visualization": "I'll create an insightful data visualization for you. Could you provide the dataset or describe what you'd like to visualize?",
      "default": "I understand you're asking about: \"" + input + "\". This is a simulated response from your AI assistant. In a real implementation, this would connect to an AI API."
    };

    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("market") || lowerInput.includes("trend")) return responses["market trends"];
    if (lowerInput.includes("report")) return responses["generate reports"];
    if (lowerInput.includes("visual") || lowerInput.includes("data")) return responses["data visualization"];
    
    return responses["default"];
  };

  const suggestedPrompts = [
    { text: "Any advice for me?", icon: "⚡" },
    { text: "Market Trends Research", icon: "📈" },
    { text: "Generate Reports", icon: "📄" },
    { text: "Create data visualization", icon: "📊" },
  ];

  // Load projects and conversations without project on mount (only if authenticated)
  // Also reload when workspace changes (but only if not already handled by workspace change effect)
  useEffect(() => {
    // Don't load if workspace is changing (the workspace change effect will handle it)
    if (isWorkspaceChangingRef.current) {
      return;
    }
    
    // Only load when workspaceLoading becomes false AND we have an activeWorkspaceId
    // This prevents reloading when refreshWorkspaces temporarily sets loading to true
    if (isAuthenticated && activeWorkspaceId && !workspaceLoading) {
      // Only load if we don't have projects yet (to avoid duplicate loading)
      // The workspace change effect will handle reloading when workspace changes
      if (projects.length === 0) {
        loadProjects();
        loadConversationsWithoutProject();
      }
    }
    // Note: We intentionally don't include workspaceLoading in deps to prevent reloads on refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeWorkspaceId]);

  // Clear and reload data only when workspace actually changes
  useEffect(() => {
    if (!isAuthenticated) {
      previousWorkspaceIdRef.current = activeWorkspaceId ?? null;
      return;
    }

    const currentWorkspace = activeWorkspaceId ?? null;
    const previousWorkspace = previousWorkspaceIdRef.current;
    previousWorkspaceIdRef.current = currentWorkspace;

    // Skip first run so a refresh inside the same workspace/chat keeps context
    if (previousWorkspace === undefined) {
      return;
    }

    if (previousWorkspace === currentWorkspace) {
      return;
    }

    // Mark that workspace is changing to prevent other effects from interfering
    isWorkspaceChangingRef.current = true;

    // Immediately clear all workspace-specific data
    console.log('Workspace changed, clearing old data:', { previousWorkspace, currentWorkspace });
    setProjects([]);
    setSelectedProject(null);
    setConversations([]);
    setConversationsWithoutProject([]);
    setCurrentConversation(null);
    setMessages([]);
    setProjectConversations({});
    setExpandedProjects({});
    setIsLoadingConversation(false);
    setIsInitializingFromUrl(false);
    // Clear URL parameters to reset navigation state
    setSearchParams({}, { replace: true });

    // Reload data for the new workspace
    // Ensure localStorage is updated synchronously BEFORE making API calls
    if (currentWorkspace) {
      console.log('Loading data for new workspace:', currentWorkspace);
      // Update localStorage synchronously
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeWorkspaceId', currentWorkspace);
      }
      
      // Use setTimeout to ensure localStorage write is complete and API will read correct value
      setTimeout(() => {
        // Verify localStorage was updated correctly before loading
        const storedWorkspaceId = localStorage.getItem('activeWorkspaceId');
        if (storedWorkspaceId === currentWorkspace) {
          loadProjects();
          loadConversationsWithoutProject();
        } else {
          console.error('WorkspaceId mismatch in localStorage, retrying...', { 
            expected: currentWorkspace, 
            actual: storedWorkspaceId 
          });
          // Retry after another small delay
          setTimeout(() => {
            localStorage.setItem('activeWorkspaceId', currentWorkspace);
            loadProjects();
            loadConversationsWithoutProject();
          }, 50);
        }
        // Clear the flag after loading is initiated
        isWorkspaceChangingRef.current = false;
      }, 10);
    } else {
      isWorkspaceChangingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId, isAuthenticated]);

  // Initialize from URL parameters on mount (only if authenticated)
  useEffect(() => {
    const initializeFromUrl = async () => {
      // Wait for authentication before initializing
      if (!isAuthenticated) {
        return;
      }
      
      // Don't initialize if workspace is changing
      if (isWorkspaceChangingRef.current) {
        return;
      }
      
      const projectId = searchParams.get('project');
      const conversationId = searchParams.get('conversation');
      
      if (!projectId && !conversationId) {
        // No URL params, nothing to initialize
        return;
      }

      // Skip if we're already initializing, if projects haven't loaded yet, or if workspace is still loading
      // Also skip if we just created a project (to prevent interference)
      // Wait for workspace to be loaded (either activeWorkspaceId is set, or workspace loading is complete)
      if (isInitializingFromUrl || projects.length === 0 || workspaceLoading || !activeWorkspaceId || justCreatedProjectRef.current) {
        return;
      }

      setIsInitializingFromUrl(true);
      setIsLoadingConversation(true);

      try {
        // Load project if specified
        if (projectId && projectId !== 'null') {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            // Don't update URL here since we're initializing from URL
            setSelectedProject(project);
            // Expand the project
            if (!expandedProjects[project.id]) {
              setExpandedProjects(prev => ({
                ...prev,
                [project.id]: true
              }));
            }
            // Load project conversations
            await loadProjectConversations(project.id);
            await loadConversations(project.id);
          } else {
            // Project not found in current list
            console.warn('Project not found:', projectId);
            setIsLoadingConversation(false);
            setIsInitializingFromUrl(false);
            return;
          }
        } else if (projectId === 'null') {
          // Explicitly no project
          setSelectedProject(null);
          await loadConversations(null);
        }

        // Load conversation if specified
        if (conversationId) {
          // Verify workspaceId before loading
          const currentWorkspaceId = activeWorkspaceId;
          const storedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
          
          if (!currentWorkspaceId || (storedWorkspaceId && currentWorkspaceId !== storedWorkspaceId)) {
            console.warn('WorkspaceId mismatch, skipping conversation load from URL');
            setIsLoadingConversation(false);
            setIsInitializingFromUrl(false);
            // Clear URL params if workspace doesn't match
            setSearchParams({}, { replace: true });
            return;
          }
          
          // Auto-expand chats section when loading a conversation from URL
          if (!isChatsExpanded) {
            setIsChatsExpanded(true);
          }
          try {
            const conversation = await getConversation(conversationId);
            
            // Verify conversation belongs to current workspace
            if (conversation) {
              // Check if conversation's workspaceId matches current workspace
              // If conversation.workspaceId is null, it might be from before workspace was required
              // In that case, we should still validate it's accessible
              const verifyWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
              
              if (currentWorkspaceId && verifyWorkspaceId && currentWorkspaceId !== verifyWorkspaceId) {
                console.warn('Workspace changed during conversation load, discarding');
                setIsLoadingConversation(false);
                setIsInitializingFromUrl(false);
                setSearchParams({}, { replace: true });
                return;
              }
              
              // If conversation has workspaceId, it must match current workspace
              if (conversation.workspaceId && conversation.workspaceId !== currentWorkspaceId) {
                console.warn('Conversation does not belong to current workspace:', {
                  conversationWorkspaceId: conversation.workspaceId,
                  currentWorkspaceId: currentWorkspaceId
                });
                setIsLoadingConversation(false);
                setIsInitializingFromUrl(false);
                // Clear URL and messages since conversation doesn't belong to this workspace
                setSearchParams({}, { replace: true });
                setMessages([]);
                setCurrentConversation(null);
                return;
              }
              
              setCurrentConversation(conversation);
              // If conversation has a project, make sure it's selected
              if (conversation.projectId) {
                const convProject = projects.find(p => p.id === conversation.projectId);
                if (convProject && (!selectedProject || selectedProject.id !== conversation.projectId)) {
                  setSelectedProject(convProject);
                  if (!expandedProjects[convProject.id]) {
                    setExpandedProjects(prev => ({
                      ...prev,
                      [convProject.id]: true
                    }));
                  }
                  await loadProjectConversations(convProject.id);
                  await loadConversations(convProject.id);
                }
              } else if (selectedProject) {
                // Conversation has no project but we have one selected, clear it
                setSelectedProject(null);
                await loadConversations(null);
              }
            } else {
              console.warn('Conversation not found or does not belong to current workspace:', conversationId);
              setIsLoadingConversation(false);
              // Clear URL if conversation not found
              setSearchParams({}, { replace: true });
              setMessages([]);
              setCurrentConversation(null);
            }
          } catch (error) {
            console.error('Error loading conversation from URL:', error);
            setIsLoadingConversation(false);
            // Clear URL and messages on error
            setSearchParams({}, { replace: true });
            setMessages([]);
            setCurrentConversation(null);
          }
        } else {
          setIsLoadingConversation(false);
        }
      } catch (error) {
        console.error('Error initializing from URL:', error);
        setIsLoadingConversation(false);
      } finally {
        setIsInitializingFromUrl(false);
      }
    };

    // Wait for authentication, projects to load, and workspace to be ready before initializing
    // Also ensure activeWorkspaceId is set
    // Note: workspaceLoading is checked in condition but not in deps to prevent reloads on refresh
    if (isAuthenticated && projects.length > 0 && !workspaceLoading && activeWorkspaceId && !isWorkspaceChangingRef.current) {
      initializeFromUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, projects, isAuthenticated, activeWorkspaceId]);

  // Listen for authentication changes (e.g., login from another tab)
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };
    
    // Check on mount
    checkAuth();
    
    // Listen for storage changes (login from another tab)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth state change event (login/logout in same tab)
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const profile = await getProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // Load conversations without project
  const loadConversationsWithoutProject = async () => {
    try {
      // Verify we're loading for the correct workspace
      const currentWorkspaceId = activeWorkspaceId;
      const storedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      
      // Only load if workspaceId matches (prevents loading conversations from wrong workspace)
      if (currentWorkspaceId && storedWorkspaceId && currentWorkspaceId !== storedWorkspaceId) {
        console.warn('WorkspaceId mismatch, skipping conversation load:', {
          activeWorkspaceId: currentWorkspaceId,
          storedWorkspaceId: storedWorkspaceId
        });
        return;
      }
      
      const convs = await getConversations(null);
      console.log('Loaded conversations without project:', convs, 'for workspace:', currentWorkspaceId);
      
      // Double-check workspaceId still matches before setting state (prevent stale data)
      const verifyWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      if (currentWorkspaceId && verifyWorkspaceId && currentWorkspaceId === verifyWorkspaceId) {
        setConversationsWithoutProject(convs || []);
      } else {
        console.warn('Workspace changed during conversation load, discarding results');
      }
    } catch (error) {
      console.error('Error loading conversations without project:', error);
      setConversationsWithoutProject([]);
    }
  };

  // Load conversations when project changes (including null for no project)
  // Skip if workspace is loading to avoid loading with wrong workspace
  useEffect(() => {
    // Don't load if workspace is changing, still loading, or not set
    if (isWorkspaceChangingRef.current || workspaceLoading || !activeWorkspaceId) {
      return;
    }
    
    if (selectedProject) {
      loadConversations(selectedProject.id);
    } else {
      // Load conversations without project (projectId = null)
      loadConversations(null);
    }
    // Note: workspaceLoading is checked in condition but not in deps to prevent reloads on refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, activeWorkspaceId]);

  // Load conversations for expanded projects
  useEffect(() => {
    // Don't load if workspace is changing
    if (isWorkspaceChangingRef.current) {
      return;
    }
    
    Object.keys(expandedProjects).forEach(projectId => {
      if (expandedProjects[projectId] && !projectConversations[projectId]) {
        loadProjectConversations(projectId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedProjects]);

  // Load projects
  const loadProjects = async () => {
    try {
      const projectsList = await getProjects();
      setProjects(projectsList);
      // Auto-load conversations for all projects
      if (projectsList && projectsList.length > 0) {
        // Load conversations for each project in parallel
        const conversationPromises = projectsList.map(async (project) => {
          try {
            const convs = await getConversations(project.id);
            return { projectId: project.id, conversations: convs || [] };
          } catch (error) {
            console.error(`Error loading conversations for project ${project.id}:`, error);
            return { projectId: project.id, conversations: [] };
          }
        });
        
        const results = await Promise.all(conversationPromises);
        // Update projectConversations state with all results
        setProjectConversations(prev => {
          const updated = { ...prev };
          results.forEach(({ projectId, conversations }) => {
            updated[projectId] = conversations;
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Handle create new project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      // Set flag to prevent URL initialization from interfering
      justCreatedProjectRef.current = true;
      
      // Pass workspaceId (can be null to create outside workspace)
      const project = await createProject(newProjectName.trim(), activeWorkspaceId || null);
      
      // Update projects list first
      setProjects([project, ...projects]);
      
      // First, update URL to remove conversation parameter BEFORE clearing state
      // This prevents the message loading effect from trying to load old messages
      const newParams = new URLSearchParams();
      newParams.set('project', project.id);
      // Explicitly don't set conversation - this creates a new chat state
      // Use replace: true to remove the old conversation from URL
      setSearchParams(newParams, { replace: true });
      
      // Clear all conversation-related state to start fresh in the new project
      // Do this AFTER URL update to prevent effects from reloading old data
      setMessages([]);
      setCurrentConversation(null);
      setIsLoadingConversation(false);
      setStreamingMessages(new Set());
      
      // Expand the new project
      setExpandedProjects(prev => ({
        ...prev,
        [project.id]: true
      }));
      
      // Set selected project after clearing state
      setSelectedProject(project);
      
      // Load conversations for the new project
      await loadProjectConversations(project.id);
      // Also load conversations for the selected project (this will update the conversations state)
      await loadConversations(project.id);
      
      // Ensure chats section is expanded to show the new project's chats
      if (!isChatsExpanded) {
        setIsChatsExpanded(true);
      }
      
      // Prevent URL initialization from trying to load the old conversation
      setIsInitializingFromUrl(false);
      
      // Clear the flag after a short delay to allow state to settle
      setTimeout(() => {
        justCreatedProjectRef.current = false;
      }, 500);
      
      setNewProjectName("");
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      justCreatedProjectRef.current = false;
      alert('Failed to create project. Please try again.');
    }
  };

  // Handle project selection (project can be null for "no project" mode)
  const handleSelectProject = async (project, skipClear = false) => {
    setSelectedProject(project);
    // Close mobile sidebar when selecting a project
    setIsMobileSidebarOpen(false);
    // Only clear messages if we're not immediately selecting a conversation
    if (!skipClear) {
      setMessages([]); // Clear messages when switching project
      setCurrentConversation(null); // Clear current conversation
      setIsLoadingConversation(false); // No conversation selected, so no loading
      // Update URL - clear conversation param when switching projects
      const newParams = new URLSearchParams();
      if (project) {
        newParams.set('project', project.id);
      } else {
        newParams.set('project', 'null');
      }
      setSearchParams(newParams, { replace: true });
    } else {
      // If skipClear is true, we're selecting a conversation, so loading will be handled by handleSelectConversation
      setIsLoadingConversation(true);
      // Update URL but keep conversation if exists
      const newParams = new URLSearchParams();
      if (project) {
        newParams.set('project', project.id);
      } else {
        newParams.set('project', 'null');
      }
      const conversationId = searchParams.get('conversation');
      if (conversationId) {
        newParams.set('conversation', conversationId);
      }
      setSearchParams(newParams, { replace: true });
    }
    // Load conversations for project or without project
    if (project) {
      if (!expandedProjects[project.id]) {
        setExpandedProjects(prev => ({
          ...prev,
          [project.id]: true
        }));
      }
      await loadConversations(project.id);
      if (!projectConversations[project.id]) {
        await loadProjectConversations(project.id);
      }
    } else {
      // Load conversations without project
      await loadConversations(null);
    }
  };

  // Load conversations for a project (or without project if projectId is null)
  const loadConversations = async (projectId) => {
    try {
      // Verify we're loading for the correct workspace
      const currentWorkspaceId = activeWorkspaceId;
      const storedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      
      // Only load if workspaceId matches (prevents loading conversations from wrong workspace)
      if (currentWorkspaceId && storedWorkspaceId && currentWorkspaceId !== storedWorkspaceId) {
        console.warn('WorkspaceId mismatch, skipping conversation load:', {
          activeWorkspaceId: currentWorkspaceId,
          storedWorkspaceId: storedWorkspaceId
        });
        return;
      }
      
      // Pass null explicitly for conversations without project
      const convs = await getConversations(projectId);
      console.log('Loaded conversations for project:', projectId, convs, 'for workspace:', currentWorkspaceId);
      
      // Double-check workspaceId still matches before setting state (prevent stale data)
      const verifyWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      if (currentWorkspaceId && verifyWorkspaceId && currentWorkspaceId === verifyWorkspaceId) {
        setConversations(convs || []);
      } else {
        console.warn('Workspace changed during conversation load, discarding results');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  // Load conversations for a specific project (for nested display)
  const loadProjectConversations = async (projectId) => {
    try {
      // Verify we're loading for the correct workspace
      const currentWorkspaceId = activeWorkspaceId;
      const storedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      
      // Only load if workspaceId matches (prevents loading conversations from wrong workspace)
      if (currentWorkspaceId && storedWorkspaceId && currentWorkspaceId !== storedWorkspaceId) {
        console.warn('WorkspaceId mismatch, skipping project conversation load:', {
          activeWorkspaceId: currentWorkspaceId,
          storedWorkspaceId: storedWorkspaceId
        });
        return;
      }
      
      const convs = await getConversations(projectId);
      console.log('Loaded project conversations:', projectId, convs, 'for workspace:', currentWorkspaceId);
      
      // Double-check workspaceId still matches before setting state (prevent stale data)
      const verifyWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      if (currentWorkspaceId && verifyWorkspaceId && currentWorkspaceId === verifyWorkspaceId) {
        setProjectConversations(prev => ({
          ...prev,
          [projectId]: convs || []
        }));
      } else {
        console.warn('Workspace changed during project conversation load, discarding results');
      }
    } catch (error) {
      console.error('Error loading project conversations:', error);
      setProjectConversations(prev => ({
        ...prev,
        [projectId]: []
      }));
    }
  };

  // Toggle project expansion
  const toggleProjectExpansion = async (projectId) => {
    const isExpanded = expandedProjects[projectId];
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !isExpanded
    }));
    
    // Load conversations if expanding
    if (!isExpanded && !projectConversations[projectId]) {
      await loadProjectConversations(projectId);
    }
  };

  // Handle project edit
  const handleEditProject = (project) => {
    setEditingProject(project.id);
    setEditProjectName(project.name);
  };

  // Save project edit
  const handleSaveProjectEdit = async () => {
    if (!editingProject || !editProjectName.trim()) return;
    try {
      const updatedProject = await updateProject(editingProject, editProjectName.trim());
      setProjects(prev => prev.map(p => p.id === editingProject ? updatedProject : p));
      if (selectedProject?.id === editingProject) {
        setSelectedProject(updatedProject);
      }
      setEditingProject(null);
      setEditProjectName("");
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  // Cancel project edit
  const handleCancelProjectEdit = () => {
    setEditingProject(null);
    setEditProjectName("");
  };

  // Handle project delete
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setMessages([]);
        setCurrentConversation(null);
      }
      // Clean up state
      setExpandedProjects(prev => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      setProjectConversations(prev => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Handle new chat creation
  const handleNewChat = (forceNoProject = false) => {
    // Set flag to prevent message loading effect from running
    creatingNewChatRef.current = true;
    
    // Clear conversation state first to prevent message loading effect from running
    setIsLoadingConversation(false);
    setCurrentConversation(null);
    setMessages([]);
    setStreamingMessages(new Set());
    
    // Allow chat without project - don't require selectedProject
    // Close mobile sidebar when creating new chat
    setIsMobileSidebarOpen(false);
    
    // Clear URL params for new chat - remove conversation parameter
    // Update URL FIRST to prevent effects from reloading old messages
    const newParams = new URLSearchParams();
    // If forceNoProject is true, always set project to null
    // Otherwise, use the current selectedProject state
    if (forceNoProject || !selectedProject) {
      newParams.set('project', 'null');
      // Clear selected project state immediately
      setSelectedProject(null);
      // Reload conversations without project
      loadConversationsWithoutProject();
    } else {
      newParams.set('project', selectedProject.id);
      // Explicitly don't set conversation - this creates a new chat state
    }
    // Explicitly don't set conversation parameter - this ensures a fresh chat
    setSearchParams(newParams, { replace: true });
    
    // Clear the flag after a short delay to allow state to settle
    setTimeout(() => {
      creatingNewChatRef.current = false;
    }, 300);
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation, projectOverride) => {
    setIsLoadingConversation(true);
    setCurrentConversation(conversation);
    // Close mobile sidebar when selecting a conversation
    setIsMobileSidebarOpen(false);
    // Update URL with conversation ID
    const newParams = new URLSearchParams();
    const projectContext = projectOverride === undefined ? selectedProject : projectOverride;
    if (projectContext) {
      newParams.set('project', projectContext.id);
    } else {
      newParams.set('project', 'null');
    }
    if (conversation && conversation.id) {
      newParams.set('conversation', conversation.id);
    }
    setSearchParams(newParams, { replace: true });
    // Messages will be loaded automatically by the useEffect that watches currentConversation
  };

  // Load messages when currentConversation changes (including when switching back to old chat)
  useEffect(() => {
    const loadMessagesForConversation = async () => {
      // Skip loading if workspace is changing
      if (isWorkspaceChangingRef.current) {
        console.log('Skipping message load - workspace is changing');
        return;
      }
      
      // Skip loading if we're currently sending a message (to prevent overwriting local messages)
      if (isSendingMessage) {
        console.log('Skipping message load - message is being sent');
        return;
      }
      
      // Skip if we just created a project (to prevent loading old messages)
      if (justCreatedProjectRef.current) {
        console.log('Skipping message load - project was just created');
        return;
      }
      
      // Skip if we're creating a new chat (to prevent loading old messages)
      if (creatingNewChatRef.current) {
        console.log('Skipping message load - new chat is being created');
        return;
      }
      
      // Verify workspaceId is set and matches localStorage
      const currentWorkspaceId = activeWorkspaceId;
      if (!currentWorkspaceId) {
        console.log('Skipping message load - no active workspace');
        setMessages([]);
        return;
      }
      
      const storedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      if (storedWorkspaceId && currentWorkspaceId !== storedWorkspaceId) {
        console.warn('WorkspaceId mismatch, skipping message load:', {
          activeWorkspaceId: currentWorkspaceId,
          storedWorkspaceId: storedWorkspaceId
        });
        setMessages([]);
        setCurrentConversation(null);
        return;
      }
      
      // Get conversationId from currentConversation or URL as fallback
      const conversationIdFromUrl = searchParams.get('conversation');
      const conversationId = currentConversation?.id || conversationIdFromUrl;
      
      if (conversationId) {
        try {
          // If we have currentConversation, verify it belongs to current workspace
          if (currentConversation && currentConversation.workspaceId) {
            if (currentConversation.workspaceId !== currentWorkspaceId) {
              console.warn('Conversation does not belong to current workspace, clearing:', {
                conversationWorkspaceId: currentConversation.workspaceId,
                currentWorkspaceId: currentWorkspaceId
              });
              setMessages([]);
              setCurrentConversation(null);
              setSearchParams({}, { replace: true });
              return;
            }
          }
          
          console.log('Loading messages for conversation:', conversationId, 'for workspace:', currentWorkspaceId);
          const backendMessages = await getMessages(conversationId);
          
          // Verify workspaceId still matches after API call
          const verifyWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
          if (currentWorkspaceId && verifyWorkspaceId && currentWorkspaceId !== verifyWorkspaceId) {
            console.warn('Workspace changed during message load, discarding results');
            setMessages([]);
            setCurrentConversation(null);
            return;
          }
          
          // If we loaded from URL but don't have currentConversation, try to load it
          if (!currentConversation && conversationIdFromUrl) {
            try {
              const conversation = await getConversation(conversationIdFromUrl);
              if (conversation) {
                // Verify conversation belongs to current workspace
                if (conversation.workspaceId && conversation.workspaceId !== currentWorkspaceId) {
                  console.warn('Conversation from URL does not belong to current workspace:', {
                    conversationWorkspaceId: conversation.workspaceId,
                    currentWorkspaceId: currentWorkspaceId
                  });
                  setMessages([]);
                  setCurrentConversation(null);
                  setSearchParams({}, { replace: true });
                  return;
                }
                setCurrentConversation(conversation);
              }
            } catch (error) {
              console.error('Error loading conversation after loading messages:', error);
            }
          }
          console.log('Backend messages received:', backendMessages);
          
          // Ensure backendMessages is an array
          if (!Array.isArray(backendMessages)) {
            console.error('Backend messages is not an array:', backendMessages);
            setMessages([]);
            return;
          }
          
          // Transform backend messages to frontend format
          // Backend returns messages in descending order (newest first), so reverse to get ascending order
          const transformedMessages = backendMessages
            .reverse()
            .map((msg) => transformBackendMessage(msg));
          
          console.log('Transformed messages:', transformedMessages);
          
          // Debug: Check user messages specifically
          const userMessages = transformedMessages.filter(m => m.type === 'user');
          console.log('User messages found:', userMessages.length);
          userMessages.forEach((msg, idx) => {
            console.log(`User message ${idx + 1}:`, {
              id: msg.id,
              content: msg.content?.substring(0, 50),
              hasImage: !!msg.image,
              imageUrl: msg.image?.substring(0, 50),
              hasAttachments: !!(msg.attachments && msg.attachments.length > 0),
              attachmentUrl: msg.attachments?.[0]?.url?.substring(0, 50),
              hasMeta: !!msg.meta,
              metaType: msg.meta?.type,
              metaOriginalImageUrl: msg.meta?.originalImageUrl?.substring(0, 50),
            });
          });
          
          // Fetch full blog content for blog messages
          const messagesWithBlogs = await Promise.all(
            transformedMessages.map(async (msg) => {
              if (msg.meta && msg.meta.type === 'blog' && msg.meta.blogId) {
                try {
                  const blogData = await getBlogById(msg.meta.blogId);
                  return {
                    ...msg,
                    blog: {
                      id: blogData.id,
                      title: blogData.title,
                      content: blogData.content,
                      imageUrl: getFullImageUrl(blogData.imageUrl),
                      metaDescription: blogData.metaDescription,
                      hashtags: blogData.hashtags || [],
                      model: blogData.model,
                      ratio: blogData.ratio,
                      size: blogData.size,
                      status: blogData.status,
                    },
                    content: blogData.content || msg.content,
                    image: getFullImageUrl(blogData.imageUrl),
                    meta: msg.meta?.type === 'blog'
                      ? { ...msg.meta, blogStatus: blogData.status }
                      : msg.meta,
                  };
                } catch (error) {
                  console.error('Error fetching blog content:', error);
                  return msg; // Return original message if blog fetch fails
                }
              }
              return msg;
            })
          );
          
          // Final verification before setting messages - ensure workspace hasn't changed
          const finalWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
          if (currentWorkspaceId && finalWorkspaceId && currentWorkspaceId === finalWorkspaceId) {
            setMessages(messagesWithBlogs);
          } else {
            console.warn('Workspace changed before setting messages, discarding results');
            setMessages([]);
            setCurrentConversation(null);
            setSearchParams({}, { replace: true });
          }
          setIsLoadingConversation(false);
        } catch (error) {
          console.error('Error loading messages for conversation:', error);
          // If loading fails, still clear messages to show empty state
          setMessages([]);
          setIsLoadingConversation(false);
        }
      } else {
        // If no conversation selected, clear messages
        setMessages([]);
        setIsLoadingConversation(false);
      }
    };

    loadMessagesForConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation, isSendingMessage, searchParams, activeWorkspaceId]);


  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
      // Close dropdowns when clicking outside
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
      // Close model dropdown when clicking outside
      if (showModelDropdown && !event.target.closest('.model-dropdown-container')) {
        setShowModelDropdown(false);
      }
      // Close settings dropdown when clicking outside
      if (showSettingsDropdown && settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
      // Close more options dropdown when clicking outside
      if (showMoreOptions && !event.target.closest('.more-options-container')) {
        setShowMoreOptions(null);
      }
      // Close profile dropdown when clicking outside
      if (showProfileDropdown && profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      // Close modals when clicking outside (backdrop click is handled by onClick on the modal container)
      // These checks are for clicks outside the modal content but inside the backdrop
      if (showInviteModal && inviteModalRef.current && !inviteModalRef.current.contains(event.target) && !event.target.closest('[class*="backdrop"]')) {
        // Modal backdrop handles its own close
      }
      if (showSharesModal && sharesModalRef.current && !sharesModalRef.current.contains(event.target) && !event.target.closest('[class*="backdrop"]')) {
        // Modal backdrop handles its own close
      }
      if (showAgentModal && agentModalRef.current && !agentModalRef.current.contains(event.target) && !event.target.closest('[class*="backdrop"]')) {
        // Modal backdrop handles its own close
      }
    };

    if (showPopup || openDropdown || showModelDropdown || showSettingsDropdown || showMoreOptions || showProfileDropdown || showInviteModal || showSharesModal || showAgentModal || showConnectWebsiteModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup, openDropdown, showModelDropdown, showSettingsDropdown, showMoreOptions, showProfileDropdown, showInviteModal, showSharesModal, showAgentModal, showConnectWebsiteModal]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else if (showInviteModal) {
          setShowInviteModal(false);
          setInviteEmail("");
        } else if (showSharesModal) {
          setShowSharesModal(false);
        } else if (showAgentModal) {
          setShowAgentModal(false);
        } else if (showConnectWebsiteModal) {
          setShowConnectWebsiteModal(false);
        } else if (showProfileDropdown) {
          setShowProfileDropdown(false);
        }
      }
    };

    if (previewImage || showInviteModal || showSharesModal || showAgentModal || showConnectWebsiteModal || showProfileDropdown) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [previewImage, showInviteModal, showSharesModal, showAgentModal, showConnectWebsiteModal, showProfileDropdown]);

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    setShowFeatureOptions(true);
    setShowPopup(false);
    
    // Auto-select DALL-E model when Image generation is clicked
    if (feature === "image") {
      setSelectedModel("DALL-E");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Only handle images when Image to Image mode is selected
      if (selectedModel === "Image to Image") {
        // Validate it's an image
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        // Set selected image
        setSelectedImage({
          file,
          preview,
          url: null // Will be set after upload
        });

        // Auto-upload the image
        try {
          const imageUrl = await uploadImage(file);
          setSelectedImage(prev => ({
            ...prev,
            url: imageUrl
          }));
        } catch (error) {
          console.error('Error uploading image:', error);
          // Show user-friendly error message
          const errorMessage = error.message || 'Failed to upload image. Please try again.';
          alert(errorMessage);
          // Clean up preview URL
          if (preview) {
            URL.revokeObjectURL(preview);
          }
          setSelectedImage(null);
        }
      } else {
        // Handle other file types for future use
        console.log("File selected:", file.name);
      }
    }
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMicrophone = () => {
    setIsRecording(!isRecording);
    // Add voice recording logic here
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleExpandChatBox = () => {
    setIsChatBoxExpanded(!isChatBoxExpanded);
  };

  const handleTextFormatting = () => {
    // Add text formatting logic here
    console.log('Text formatting clicked');
  };

  const handlePhoneCall = () => {
    // Add phone call logic here
    console.log('Phone call clicked');
  };

  const handleMention = () => {
    // Add mention/tag logic here
    setInputValue(inputValue + '@');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEnhancePrompt = async () => {
    if (!inputValue.trim() || isEnhancingPrompt) return;
    
    setIsEnhancingPrompt(true);
    try {
      const result = await enhancePromptRequest(inputValue.trim());
      const enhancedPrompt = result?.enhancedPrompt || result?.data?.enhancedPrompt;
      if (enhancedPrompt) {
        setInputValue(enhancedPrompt);
      } else {
        console.warn('Enhance prompt API did not return enhanced text', result);
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      alert(error?.message || 'Failed to enhance prompt. Please try again.');
    } finally {
      setIsEnhancingPrompt(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };



  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentConversation(null);
      setMessages([]);
      setSelectedProject(null);
      setShowProfileDropdown(false);
      // Ensure the user sees the login screen immediately
      navigate('/', { replace: true });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
    // TODO: Implement invite API call
    console.log('Inviting:', inviteEmail);
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleCopyShareLink = () => {
    const shareLink = `${window.location.origin}/chat${selectedProject ? `?project=${selectedProject.id}` : ''}${currentConversation ? `&conversation=${currentConversation.id}` : ''}`;
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const handleConnectWebsite = async (payload) => {
    setIsConnectingWebsite(true);
    try {
      if (activeWorkspaceId) {
        // Connect to the active workspace
        await connectWebsite(activeWorkspaceId, payload);
      } else {
        // Connect to personal workspace
        await connectWebsiteToPersonalWorkspace(payload);
      }
      await refreshWorkspaces();
      setShowConnectWebsiteModal(false);
    } catch (error) {
      console.error('Error connecting website:', error);
      throw error; // Let the modal handle the error display
    } finally {
      setIsConnectingWebsite(false);
    }
  };

  const handleCopyMessage = (content, messageId) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    // Reset check icon after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handlePostToSocial = (imageUrl, prompt) => {
    setPostToSocialData({ imageUrl, prompt });
  };

  const handleImageShare = async (imageUrl) => {
    try {
      if (navigator.share) {
        // Use Web Share API if available
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.png', { type: blob.type });
        await navigator.share({
          title: 'Generated Image',
          files: [file]
        });
      } else {
        // Fallback: copy image URL to clipboard
        await navigator.clipboard.writeText(imageUrl);
        alert('Image URL copied to clipboard!');
      }
    } catch (error) {
      // If user cancels or error occurs, try copying URL
      try {
        await navigator.clipboard.writeText(imageUrl);
        alert('Image URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to share image:', err);
      }
    }
  };

  const handleImageDownload = async (imageUrl, width = null, height = null) => {
    try {
      // If width and height are provided, resize the image to original generated size
      if (width && height) {
        try {
          // Create an image element to load the image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (error) => {
              console.warn('CORS error or image load failed, falling back to direct download:', error);
              reject(error);
            };
            img.src = imageUrl;
          });

          // Create a canvas with the original dimensions
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Draw the image on canvas at the original size
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob
          await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `generated-image-${width}x${height}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                resolve();
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, 'image/png');
          });
        } catch (canvasError) {
          // If canvas approach fails (e.g., CORS), fall back to direct download
          console.warn('Canvas resize failed, downloading original image:', canvasError);
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `generated-image-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      } else {
        // If no dimensions provided, download as-is
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleEditMessage = (content) => {
    setInputValue(content);
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleRegenerate = async (messageId) => {
    // Find the message before this AI message to get the user prompt
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage && userMessage.type === 'user') {
        // Get the model of the message being regenerated
        const messageToRegenerate = messages[messageIndex];
        const modelToRegenerate = messageToRegenerate?.model || selectedModel;
        
        // Remove only the specific AI message being regenerated
        setMessages(prev => prev.filter(m => m.id !== messageId));
        
        // Regenerate response
        setIsGenerating(true);
        try {
          let response;
          // Regenerate with the same model as the original message
          if (modelToRegenerate === "DALL-E") {
// Use image generation API for DALL-E with size and aspect ratio
            try {
              response = await generateImage(userMessage.content, featureOptions.aspectRatio, featureOptions.size);
            } catch (apiError) {
              console.warn('Backend API failed, falling back to webhook:', apiError);
              response = await callImageGenerationWebhook(userMessage.content, featureOptions.aspectRatio, featureOptions.size);
            }
          } else if (modelToRegenerate === "Image to Image") {
            // Use backend endpoint for image-to-image
            // Find the original image from previous messages
            const imageMessages = messages.filter(m => m.image || m.meta?.imageUrl || m.meta?.originalImageUrl);
            const originalImageUrl = imageMessages.length > 0 
              ? (imageMessages[imageMessages.length - 1].image || 
                 imageMessages[imageMessages.length - 1].meta?.imageUrl ||
                 imageMessages[imageMessages.length - 1].meta?.originalImageUrl)
              : null;

            if (!originalImageUrl) {
              throw new Error('No source image found for image-to-image transformation');
            }

            const sizeMap = {
              "Standard": "medium",
              "256x256": "small",
              "512x512": "medium",
              "1024x1024": "large",
              "small": "small",
              "medium": "medium",
              "large": "large"
            };
            const webhookSize = sizeMap[featureOptions.size] || "medium";

            const style = {
              preset: featureOptions.style === "realistic" ? "realistic" : featureOptions.style || "realistic",
              mood: "neutral",
              lighting: "natural",
              extra: "high quality, detailed"
            };

            const params = {
              steps: 30,
              guidance: 7.5,
              strength: 0.6,
              seed: null,
              upscale: false,
              enhanceFace: true
            };

            // Call backend endpoint - backend will call webhook and save to DB
            const backendResult = await generateImageToImage({
              prompt: userMessage.content || "generate a image like this",
              imageUrl: originalImageUrl,
              conversationId: currentConversation?.id || null,
              projectId: selectedProject?.id || null,
              aspectRatio: featureOptions.aspectRatio || "16:9",
              size: webhookSize,
              style: style,
              params: params,
            });

            // Reload messages from backend
            if (backendResult.conversationId) {
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const backendMessages = await getMessages(backendResult.conversationId);
                if (backendMessages && backendMessages.length > 0) {
                  const transformed = backendMessages
                    .reverse()
                    .map((msg) => transformBackendMessage(msg));
                  
                  setMessages(transformed);
                  
                  const assistantMsg = transformed.find(m => m.type === 'ai' && m.meta?.type === 'image_to_image');
                  if (assistantMsg) {
                    setStreamingMessages(prev => {
                      const newSet = new Set(prev);
                      newSet.add(assistantMsg.id);
                      return newSet;
                    });
                  }
                  setIsGenerating(false);
                  return;
                }
              } catch (err) {
                console.error('Error reloading messages:', err);
              }
            }

            // Fallback: create message from backend result
            response = {
              image: getFullImageUrl(backendResult.imageUrl),
              imageUrl: backendResult.imageUrl,
              response: getFullImageUrl(backendResult.imageUrl),
              message: getFullImageUrl(backendResult.imageUrl),
              text: getFullImageUrl(backendResult.imageUrl),
            };
          } else if (modelToRegenerate === "GPT vs Gemini") {
            // Use compare mode for GPT vs Gemini
            const responses = await callBothModels(userMessage.content);
            const gptContent = extractResponseContent(responses.gpt);
            const geminiContent = extractResponseContent(responses.gemini);
            const gptMessage = {
              id: Date.now() + 1,
              type: "ai",
              model: "GPT",
              content: gptContent || 'No response from GPT model',
              timestamp: new Date().toLocaleTimeString(),
            };
            const geminiMessage = {
              id: Date.now() + 2,
              type: "ai",
              model: "Gemini",
              content: geminiContent || 'No response from Gemini model',
              timestamp: new Date().toLocaleTimeString(),
            };
            setMessages(prev => [...prev, gptMessage, geminiMessage]);
            setStreamingMessages(prev => new Set([...prev, gptMessage.id, geminiMessage.id]));
            setIsGenerating(false);
            return;
          } else {
            // Use regular webhook for other models
            response = await callWebhook(userMessage.content, modelToRegenerate);
          }
          
          const responseContent = extractResponseContent(response);
          // Extract image URL for DALL-E and Image to Image
          let imageUrl = response?.image || response?.imageUrl;
          if ((modelToRegenerate === "DALL-E" || modelToRegenerate === "Image to Image") && !imageUrl && responseContent && typeof responseContent === 'string') {
            // Check if responseContent itself is a URL
            const urlMatch = responseContent.match(/https?:\/\/[^\s"']+/);
            if (urlMatch) {
              imageUrl = urlMatch[0];
            } else {
              imageUrl = responseContent;
            }
          }
          
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            model: modelToRegenerate,
            content: responseContent || 'No response from the model',
            image: imageUrl,
            size: (modelToRegenerate === "DALL-E" || modelToRegenerate === "Image to Image") ? (response?.size || featureOptions.size) : undefined,
            aspectRatio: (modelToRegenerate === "DALL-E" || modelToRegenerate === "Image to Image") ? (response?.aspectRatio || featureOptions.aspectRatio) : undefined,
            width: (modelToRegenerate === "DALL-E" || modelToRegenerate === "Image to Image") ? response?.width : undefined,
            height: (modelToRegenerate === "DALL-E" || modelToRegenerate === "Image to Image") ? response?.height : undefined,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, aiMessage]);
          setStreamingMessages(prev => new Set([...prev, aiMessage.id]));
        } catch (error) {
          console.error('Error regenerating:', error);
          const errorMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `Sorry, I encountered an error while regenerating: ${error.message}. Please try again.`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setStreamingMessages(prev => new Set([...prev, errorMessage.id]));
        } finally {
          setIsGenerating(false);
        }
      }
    }
  };

  const handleThumbsUp = (messageId) => {
    // Handle thumbs up feedback
    console.log('Thumbs up for message:', messageId);
  };

  const handleThumbsDown = (messageId) => {
    // Handle thumbs down feedback
    console.log('Thumbs down for message:', messageId);
  };

  const toggleExpandMessage = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };


  // Remove messages from streamingMessages after they finish streaming
  useEffect(() => {
    const timeouts = [];
    
    streamingMessages.forEach((messageId) => {
      const message = messages.find(m => m.id === messageId);
      if (message && message.content) {
        // Calculate approximate streaming time: (text length / speed) * delay
        const streamingTime = (message.content.length / 2) * 15; // speed=2, delay=15ms
        const timeout = setTimeout(() => {
          setStreamingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(messageId);
            return newSet;
          });
        }, streamingTime + 100); // Add 100ms buffer
        
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [streamingMessages, messages]);
  

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#0a0e27] via-[#0f1429] to-[#0a0e27] flex overflow-hidden relative">
      {/* Enhanced glowing arc effect - matching landing page */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none z-0">
        {/* Outer wide glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-64 bg-gradient-to-t from-cyan-400/25 via-blue-400/15 to-transparent blur-3xl" />
        </div>
        
        {/* Middle blue glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] h-full">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-56 bg-gradient-to-t from-blue-500/30 via-cyan-400/20 to-transparent blur-2xl rounded-full" />
        </div>
        
        {/* Inner bright white/cyan line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[70%] h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[70%] h-1 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent blur-sm" />
        </div>
        
        {/* Additional glow layers */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-48 bg-gradient-to-t from-white/15 via-cyan-300/10 to-transparent rounded-full blur-xl" />
      </div>

      <ChatSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        handleNewChat={handleNewChat}
        projects={projects}
        selectedProject={selectedProject}
        expandedProjects={expandedProjects}
        setExpandedProjects={setExpandedProjects}
        projectConversations={projectConversations}
        currentConversation={currentConversation}
        conversationsWithoutProject={conversationsWithoutProject}
        isProjectsExpanded={isProjectsExpanded}
        setIsProjectsExpanded={setIsProjectsExpanded}
        isChatsExpanded={isChatsExpanded}
        setIsChatsExpanded={setIsChatsExpanded}
        editingProject={editingProject}
        setEditingProject={setEditingProject}
        editProjectName={editProjectName}
        setEditProjectName={setEditProjectName}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        setShowNewProjectModal={setShowNewProjectModal}
        handleSelectProject={handleSelectProject}
        handleSelectConversation={handleSelectConversation}
        toggleProjectExpansion={toggleProjectExpansion}
        handleEditProject={handleEditProject}
        handleSaveProjectEdit={handleSaveProjectEdit}
        handleCancelProjectEdit={handleCancelProjectEdit}
        activeSidebarItem={activeSidebarItem}
        setActiveSidebarItem={setActiveSidebarItem}
        showSettingsDropdown={showSettingsDropdown}
        setShowSettingsDropdown={setShowSettingsDropdown}
        handleLogout={handleLogout}
        settingsRef={settingsRef}
        userProfile={userProfile}
        autoSubmitBlogs={autoSubmitBlogs}
        setAutoSubmitBlogs={setAutoSubmitBlogs}
        showConnectWebsiteModal={showConnectWebsiteModal}
        setShowConnectWebsiteModal={setShowConnectWebsiteModal}
        setShowSharesModal={setShowSharesModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0 relative z-10">
        <ChatHeader
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          showModelDropdown={showModelDropdown}
          setShowModelDropdown={setShowModelDropdown}
          modelOptions={modelOptions}
          getModelDisplayName={getModelDisplayName}
          getModelBadge={getModelBadge}
          selectedFeature={selectedFeature}
          setShowFeatureOptions={setShowFeatureOptions}
          setSelectedFeature={setSelectedFeature}
          isAuthenticated={isAuthenticated}
          setShowAgentModal={setShowAgentModal}
          setShowInviteModal={setShowInviteModal}
          setShowSharesModal={setShowSharesModal}
          showProfileDropdown={showProfileDropdown}
          setShowProfileDropdown={setShowProfileDropdown}
          setShowSettingsDropdown={setShowSettingsDropdown}
          handleLogout={handleLogout}
          profileDropdownRef={profileDropdownRef}
          userProfile={userProfile}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-transparent min-h-0 relative z-10">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 min-h-0">
            {isLoadingConversation ? (
              <LoadingSkeleton />
            ) : (
              <ChatMessages
                messages={messages}
                selectedModel={selectedModel}
                selectedProject={selectedProject}
                streamingMessages={streamingMessages}
                expandedMessages={expandedMessages}
                copiedMessageId={copiedMessageId}
                hoveredImage={hoveredImage}
                showMoreOptions={showMoreOptions}
                isGenerating={isGenerating}
                messagesEndRef={messagesEndRef}
                shouldTruncate={shouldTruncate}
                getTruncatedContent={getTruncatedContent}
                toggleExpandMessage={toggleExpandMessage}
                handleCopyMessage={handleCopyMessage}
                handleEditMessage={handleEditMessage}
                handleThumbsUp={handleThumbsUp}
                handleThumbsDown={handleThumbsDown}
                handleRegenerate={handleRegenerate}
                handleImagePreview={handleImagePreview}
                handleImageShare={handleImageShare}
                handleImageDownload={handleImageDownload}
                handlePostToSocial={handlePostToSocial}
                setHoveredImage={setHoveredImage}
                setShowMoreOptions={setShowMoreOptions}
                setMessages={setMessages}
              />
            )}
          </div>

          {/* Input Section */}
          <ChatInputBox
            inputValue={inputValue}
            setInputValue={setInputValue}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedModel={selectedModel}
            isChatBoxExpanded={isChatBoxExpanded}
            setIsChatBoxExpanded={setIsChatBoxExpanded}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            showFeatureOptions={showFeatureOptions}
            setShowFeatureOptions={setShowFeatureOptions}
            featureOptions={featureOptions}
            setFeatureOptions={setFeatureOptions}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            isGenerating={isGenerating}
            handleSend={handleSend}
            handleFileUpload={handleFileUpload}
            handleFileChange={handleFileChange}
            handleMicrophone={handleMicrophone}
            handleTextFormatting={handleTextFormatting}
            handlePhoneCall={handlePhoneCall}
            handleMention={handleMention}
            handleEnhancePrompt={handleEnhancePrompt}
          isEnhancingPrompt={isEnhancingPrompt}
            handleFeatureSelect={handleFeatureSelect}
            fileInputRef={fileInputRef}
            popupRef={popupRef}
            textareaRef={textareaRef}
          />
        </main>
      </div>

      {/* Modals */}
      <NewProjectModal
        show={showNewProjectModal}
        onClose={() => {
          setShowNewProjectModal(false);
          setNewProjectName("");
        }}
        projectName={newProjectName}
        setProjectName={setNewProjectName}
        onCreate={handleCreateProject}
      />

      <DeleteConfirmModal
        show={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => handleDeleteProject(showDeleteConfirm)}
      />

      <ImagePreviewModal
        show={!!previewImage}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
        onShare={() => handleImageShare(previewImage)}
        onDownload={(width, height) => handleImageDownload(previewImage, width, height)}
        imageWidth={(() => {
          const messageWithImage = messages.find(m => m.image === previewImage);
          return messageWithImage?.width || null;
        })()}
        imageHeight={(() => {
          const messageWithImage = messages.find(m => m.image === previewImage);
          return messageWithImage?.height || null;
        })()}
      />

      <InviteModal
        show={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteEmail("");
        }}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        onInvite={handleInvite}
      />

      <SharesModal
        show={showSharesModal}
        onClose={() => setShowSharesModal(false)}
        shareLink={`${window.location.origin}/chat${selectedProject ? `?project=${selectedProject.id}` : ''}${currentConversation ? `&conversation=${currentConversation.id}` : ''}`}
        onCopyLink={handleCopyShareLink}
        selectedProject={selectedProject}
        currentConversation={currentConversation}
      />

      <AgentModal
        show={showAgentModal}
        onClose={() => setShowAgentModal(false)}
      />

      <ConnectWebsiteModal
        isOpen={showConnectWebsiteModal}
        onClose={() => setShowConnectWebsiteModal(false)}
        onConnect={handleConnectWebsite}
        isSubmitting={isConnectingWebsite}
        workspaceName={activeWorkspace?.name || 'Personal Workspace'}
      />

      <PostToSocialModal
        isOpen={!!postToSocialData}
        onClose={() => setPostToSocialData(null)}
        imageUrl={postToSocialData?.imageUrl}
        prompt={postToSocialData?.prompt}
      />
    </div>
  );
}
