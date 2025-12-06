// Helper function to convert UI model names to backend format
export const convertModelToBackendFormat = (model) => {
  if (!model) return 'gpt';
  
  const modelLower = model.toLowerCase().trim();
  
  // Handle different model name formats
  if (modelLower === 'gpt' || modelLower.includes('gpt')) {
    return 'gpt';
  }
  if (modelLower === 'gemini' || modelLower.includes('gemini')) {
    return 'gemini';
  }
  if (modelLower.includes('compare') || modelLower.includes('vs')) {
    return ['gpt', 'gemini'];
  }
  if (modelLower.includes('dall') || (modelLower.includes('image') && !modelLower.includes('to'))) {
    return 'dall-e'; // For image generation
  }
  if (modelLower.includes('image to image') || modelLower.includes('img2img')) {
    return 'img2img'; // For image-to-image transformation
  }
  
  // Default to gpt if unknown
  return 'gpt';
};

export const modelOptions = [
  { id: "GPT", name: "GPT Smart", description: "OpenAI GPT", badge: "Smart" },
  { id: "Gemini", name: "Gemini Smart", description: "Google Gemini", badge: "Smart" },
  { id: "GPT vs Gemini", name: "GPT vs Gemini", description: "Compare both models", badge: "Compare" },
  { id: "DALL-E", name: "DALL-E Image", description: "Image Generation", badge: "Image" },
  { id: "Image to Image", name: "Image to Image", description: "Transform images with AI", badge: "Image" },
  { id: "Blog Agent", name: "Blog Agent", description: "Generate SEO-friendly blogs", badge: "Blog" }
];

export const getModelDisplayName = (modelId) => {
  const model = modelOptions.find(m => m.id === modelId);
  return model ? model.name : "GPT";
};

export const getModelBadge = (modelId) => {
  const model = modelOptions.find(m => m.id === modelId);
  return model ? model.badge : "Smart";
};

