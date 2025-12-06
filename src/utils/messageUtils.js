// Helper functions for message transformations
export const transformBackendMessage = (msg) => {
  const frontendMessage = {
    id: msg.id,
    content: msg.content,
    timestamp: msg.createdAt 
      ? new Date(msg.createdAt).toLocaleTimeString() 
      : new Date().toLocaleTimeString(),
    meta: msg.meta,
    // Preserve attachments if they exist
    attachments: msg.attachments,
  };
  
  // Transform role to type
  if (msg.role === 'user') {
    frontendMessage.type = 'user';
    
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
    
    // Priority 1: Handle user message attachments (for image-to-image)
    // This is the most reliable source as it comes from the database
    if (msg.attachments && Array.isArray(msg.attachments)) {
      const imageAttachment = msg.attachments.find(att => att.kind === 'image');
      if (imageAttachment && imageAttachment.url) {
        frontendMessage.image = getFullImageUrl(imageAttachment.url);
        console.log('[transformBackendMessage] User message: Found image in attachments:', imageAttachment.url);
      }
    }
    
    // Priority 2: Handle image-to-image request meta data
    // This is a fallback if attachments aren't available
    if (msg.meta && msg.meta.type === 'image_to_image_request') {
      if (msg.meta.originalImageUrl) {
        // Only set if we don't already have an image from attachments
        if (!frontendMessage.image) {
          frontendMessage.image = getFullImageUrl(msg.meta.originalImageUrl);
          console.log('[transformBackendMessage] User message: Found image in meta.originalImageUrl:', msg.meta.originalImageUrl);
        }
      }
      // Ensure meta is preserved
      frontendMessage.meta = {
        ...msg.meta,
        type: 'image_to_image_request',
        originalImageUrl: msg.meta.originalImageUrl ? getFullImageUrl(msg.meta.originalImageUrl) : null,
      };
    }
    
    // Debug log to verify user message has image
    if (frontendMessage.image) {
      console.log('[transformBackendMessage] User message transformed with image:', {
        messageId: frontendMessage.id,
        hasImage: !!frontendMessage.image,
        imageUrl: frontendMessage.image.substring(0, 50) + '...',
        hasAttachments: !!(msg.attachments && msg.attachments.length > 0),
        hasMeta: !!msg.meta,
      });
    }
  } else if (msg.role === 'assistant') {
    frontendMessage.type = 'ai';
    // Add model if available, normalize to standard format
    if (msg.model) {
      const modelLower = String(msg.model).toLowerCase();
      if (modelLower.includes('gpt')) {
        frontendMessage.model = 'GPT';
      } else if (modelLower.includes('gemini')) {
        frontendMessage.model = 'Gemini';
      } else {
        frontendMessage.model = msg.model; // Keep original if not recognized
      }
    }
    
    // Handle image attachments if present
    if (msg.attachments && Array.isArray(msg.attachments)) {
      const imageAttachment = msg.attachments.find(att => att.kind === 'image');
      if (imageAttachment) {
        frontendMessage.image = imageAttachment.url;
        frontendMessage.width = imageAttachment.width;
        frontendMessage.height = imageAttachment.height;
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
    
    // Handle image_to_image meta data
    if (msg.meta && msg.meta.type === 'image_to_image') {
      // Helper to convert static image URL to full URL
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
      
      frontendMessage.image = getFullImageUrl(msg.meta.imageUrl);
      frontendMessage.meta = {
        ...msg.meta,
        imageUrl: getFullImageUrl(msg.meta.imageUrl),
        originalImageUrl: msg.meta.originalImageUrl ? getFullImageUrl(msg.meta.originalImageUrl) : null,
      };
      // Set model to Image to Image for image-to-image messages
      frontendMessage.model = msg.meta.model || 'Image to Image';
    }
    
    // Handle blog meta data
    if (msg.meta && msg.meta.type === 'blog') {
      // Helper to convert static image URL to full URL
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
      // Set model to Blog Agent for blog messages
      frontendMessage.model = 'Blog Agent';
    }
  }
  
  return frontendMessage;
};

export const shouldTruncate = (content) => {
  // Truncate if content is longer than 150 characters for compare mode
  return content && content.length > 150;
};

export const getTruncatedContent = (content) => {
  if (!content) return '';
  // Show first 150 characters with ellipsis
  return content.substring(0, 150) + '...';
};

