/**
 * Webhook service for AI agent integration
 * Handles calls to n8n webhook API for GPT, Gemini, and comparison modes
 */

const WEBHOOK_BASE_URL = import.meta.env.VITE_WEBHOOK_BASE_URL || 'https://aiagent.mraix.com/webhook';

/**
 * Recursively extract reply from nested results arrays
 * Handles structures like: { results: [{ results: [{ reply: "..." }] }] }
 */
function extractReplyFromNestedResults(data) {
  if (!data || typeof data !== 'object') return null;
  
  // Check for direct reply field
  if (typeof data.reply === 'string' && data.reply.trim()) {
    return data.reply;
  }
  
  // Check for results array
  if (Array.isArray(data.results) && data.results.length > 0) {
    for (const item of data.results) {
      const reply = extractReplyFromNestedResults(item);
      if (reply) return reply;
    }
  }
  
  // Check other common fields
  if (typeof data.output === 'string' && data.output.trim()) return data.output;
  if (typeof data.response === 'string' && data.response.trim()) return data.response;
  if (typeof data.text === 'string' && data.text.trim()) return data.text;
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  
  return null;
}

/**
 * Convert model name to webhook model array format
 * @param {string} model - The model name from UI ('GPT', 'Gemini', 'GPT vs Gemini', etc.)
 * @returns {string[]} Array of model names for API
 */
function getModelArray(model) {
  if (!model) return ['openai'];
  
  const modelLower = model.toLowerCase().trim();
  
  // Handle different model name formats
  if (modelLower === 'gpt' || modelLower.includes('gpt')) {
    return ['openai'];
  }
  if (modelLower === 'gemini' || modelLower.includes('gemini')) {
    return ['gemini'];
  }
  if (modelLower.includes('compare') || modelLower.includes('vs')) {
    return ['openai', 'gemini'];
  }
  
  // Default to openai if unknown
  return ['openai'];
}

/**
 * Call the webhook API with a specific model
 * @param {string} message - The user's message
 * @param {string} model - The model to use ('GPT', 'Gemini', etc.)
 * @returns {Promise<Object>} Response from the webhook
 */
export async function callWebhook(message, model = 'GPT') {
  try {
    const url = `${WEBHOOK_BASE_URL}/dynamicAgent`;
    
    // Convert model to model array format
    const modelArray = getModelArray(model);
    
    // Prepare the request body in the format webhook expects
    const requestBody = {
      model: modelArray,
      prompt: message,
    };

    console.log('Calling webhook:', { 
      url, 
      model: modelArray, 
      prompt: message.substring(0, 50) + '...',
      requestBody 
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    let response;
    try {
      response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Webhook request timed out after 30 seconds');
      }
      throw fetchError;
    }

    // Log all response headers for debugging
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    // Get the response text first (can only read once)
    const responseText = await response.text();
    
    console.log('Webhook response text length:', responseText?.length || 0);
    console.log('Webhook response text (first 200 chars):', responseText?.substring(0, 200));
    
    if (!response.ok) {
      const errorMsg = responseText || `HTTP ${response.status} ${response.statusText}`;
      console.error('Webhook request failed:', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorMsg 
      });
      throw new Error(`Webhook request failed with status ${response.status}: ${errorMsg}`);
    }

    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from webhook');
      console.error('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: url,
        requestBody: requestBody
      });
      
      // Try to return a helpful message instead of throwing
      // This allows the UI to show something useful
      return {
        response: `The webhook returned an empty response. This might mean:
1. The webhook endpoint is not configured correctly
2. The webhook is processing your request asynchronously
3. The webhook expects different parameters

Please check:
- Webhook URL: ${url}
- Model array: ${JSON.stringify(modelArray)}
- Prompt: ${message.substring(0, 50)}...`,
        message: 'Empty response from webhook. Please check the webhook configuration.',
        text: 'Empty response from webhook. Please check the webhook configuration.',
        error: true,
        empty: true
      };
    }

    // Get the response content type
    const contentType = response.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    
    // Try to parse as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      console.log('Parsed JSON response keys:', Object.keys(parsedData));
      console.log('Parsed JSON response:', parsedData);
      
      // First, try to extract reply from nested results structure
      const extractedReply = extractReplyFromNestedResults(parsedData);
      if (extractedReply) {
        return { response: extractedReply, message: extractedReply, text: extractedReply };
      }
      
      // Handle different response structures (fallback)
      // Check for results array format: { results: [{ output: "..." }] }
      if (parsedData.results && Array.isArray(parsedData.results) && parsedData.results.length > 0) {
        const output = parsedData.results[0].output || parsedData.results[0].response || parsedData.results[0].text || parsedData.results[0].message;
        if (output) {
          return { response: output, message: output, text: output };
        }
      }
      
      if (parsedData.response) {
        return parsedData;
      }
      if (parsedData.message) {
        return { response: parsedData.message, message: parsedData.message, text: parsedData.message, ...parsedData };
      }
      if (parsedData.text) {
        return { response: parsedData.text, message: parsedData.text, text: parsedData.text, ...parsedData };
      }
      if (parsedData.data) {
        const data = typeof parsedData.data === 'string' ? parsedData.data : JSON.stringify(parsedData.data);
        return { response: data, message: data, text: data, ...parsedData };
      }
      if (parsedData.reply) {
        return { response: parsedData.reply, message: parsedData.reply, text: parsedData.reply, ...parsedData };
      }
      if (parsedData.content) {
        return { response: parsedData.content, message: parsedData.content, text: parsedData.content, ...parsedData };
      }
      if (parsedData.answer) {
        return { response: parsedData.answer, message: parsedData.answer, text: parsedData.answer, ...parsedData };
      }
      if (parsedData.output) {
        return { response: parsedData.output, message: parsedData.output, text: parsedData.output, ...parsedData };
      }
      
      // If it's an object but we don't recognize the structure, stringify it
      if (typeof parsedData === 'object') {
        const stringified = JSON.stringify(parsedData, null, 2);
        return { response: stringified, message: stringified, text: stringified, ...parsedData };
      }
      
      return parsedData;
      } catch (parseError) {
        // If JSON parsing fails, return the text as is
        console.warn('Failed to parse response as JSON, returning as text:', parseError);
        return { response: responseText, message: responseText, text: responseText };
    }
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to reach the webhook. Please check your internet connection and webhook URL.');
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      throw new Error('Webhook request timed out. The webhook may be slow or unresponsive.');
    }
    
    // Re-throw with more context
    if (error.message.includes('Empty response')) {
      throw error;
    }
    if (error.message.includes('failed')) {
    throw error;
    }
    throw new Error(`Webhook call failed: ${error.message}`);
  }
}

/**
 * Call both GPT and Gemini models and return their responses
 * Makes two separate parallel calls to ensure different responses from each model
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Object containing both GPT and Gemini responses
 */
export async function callBothModels(message) {
  try {
    console.log('Calling both models for comparison (separate calls)...');
    
    const url = `${WEBHOOK_BASE_URL}/dynamicAgent`;
    
    // Make two separate parallel calls - one for GPT, one for Gemini
    // This ensures we get different responses from each model
    const [gptResponse, geminiResponse] = await Promise.all([
      // Call GPT
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, 30000);

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
            },
            body: JSON.stringify({
              model: ['openai'],
              prompt: message,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GPT webhook failed: ${response.status} - ${errorText}`);
          }

          const responseText = await response.text();
          if (!responseText || responseText.trim() === '') {
            throw new Error('Empty response from GPT webhook');
          }

          let parsedData;
          try {
            parsedData = JSON.parse(responseText);
          } catch (parseError) {
            // If not JSON, treat as plain text
            parsedData = responseText;
          }

          return extractResponseContent(parsedData) || 'No response from GPT model';
        } catch (error) {
          console.error('Error calling GPT:', error);
          return `Error: ${error.message}`;
        }
      })(),
      
      // Call Gemini
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, 30000);

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
            },
            body: JSON.stringify({
              model: ['gemini'],
              prompt: message,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini webhook failed: ${response.status} - ${errorText}`);
          }

          const responseText = await response.text();
          if (!responseText || responseText.trim() === '') {
            throw new Error('Empty response from Gemini webhook');
          }

          let parsedData;
          try {
            parsedData = JSON.parse(responseText);
          } catch (parseError) {
            // If not JSON, treat as plain text
            parsedData = responseText;
          }

          return extractResponseContent(parsedData) || 'No response from Gemini model';
        } catch (error) {
          console.error('Error calling Gemini:', error);
          return `Error: ${error.message}`;
        }
      })()
    ]);

    console.log('GPT response length:', gptResponse.length);
    console.log('Gemini response length:', geminiResponse.length);
    console.log('GPT response preview:', gptResponse.substring(0, 150));
    console.log('Gemini response preview:', geminiResponse.substring(0, 150));
    
    // Verify they are different
    if (gptResponse === geminiResponse && gptResponse.length > 50) {
      console.warn('WARNING: Both outputs are identical! This might indicate an issue with the webhook.');
    }

    return {
      gpt: { response: gptResponse, message: gptResponse, text: gptResponse },
      gemini: { response: geminiResponse, message: geminiResponse, text: geminiResponse },
    };
  } catch (error) {
    console.error('Error calling both models:', error);
    throw error;
  }
}

/**
 * Helper function to extract response content from various formats
 */
function extractResponseContent(data) {
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null) {
    // First try to extract reply from nested results structure
    const extractedReply = extractReplyFromNestedResults(data);
    if (extractedReply) return extractedReply;
    
    // Check for results array format: { results: [{ output: "..." }] }
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const output = data.results[0].output || data.results[0].response || data.results[0].text || data.results[0].message;
      if (output) return output;
    }
    
    if (data.response) return data.response;
    if (data.message) return data.message;
    if (data.text) return data.text;
    if (data.content) return data.content;
    if (data.reply) return data.reply;
    if (data.answer) return data.answer;
    if (data.output) return data.output;
    if (data.data) {
      return typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
    }
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

/**
 * Call the image generation webhook API
 * @param {string} message - The user's prompt for image generation
 * @param {string} aspectRatio - The aspect ratio for the image (e.g., "16:9", "1:1", "9:16")
 * @param {string} size - The size for the image (e.g., "Small", "Standard", "Medium", "Large", "Extra Large")
 * @returns {Promise<Object>} Response from the image generation webhook
 */
export async function callImageGenerationWebhook(message, aspectRatio = "16:9", size = "Standard") {
  try {
    const url = 'https://aiagent.mraix.com/webhook/generatePost';
    
    console.log('Calling image generation webhook:', { 
      url, 
      prompt: message.substring(0, 50) + '...',
      aspectRatio: aspectRatio,
      size: size
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // 60 second timeout for image generation

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
          prompt: message,
          aspectRatio: aspectRatio,
          size: size, // Send size parameter
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Image generation request timed out after 60 seconds');
      }
      throw fetchError;
    }

    console.log('Image generation response status:', response.status);
    console.log('Image generation response statusText:', response.statusText);

    const responseText = await response.text();
    console.log('Image generation response text length:', responseText?.length || 0);
    console.log('Image generation response text (first 200 chars):', responseText?.substring(0, 200));

    if (!response.ok) {
      const errorMsg = responseText || `HTTP ${response.status} ${response.statusText}`;
      console.error('Image generation webhook request failed:', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorMsg 
      });
      throw new Error(`Image generation request failed with status ${response.status}: ${errorMsg}`);
    }

    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from image generation webhook');
      throw new Error('Empty response from image generation webhook');
    }

    // Get the response content type
    const contentType = response.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    // Try to parse as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      console.log('Parsed image generation JSON response keys:', Object.keys(parsedData));
      console.log('Parsed image generation JSON response:', parsedData);
      
      // Extract image URL from various possible locations in the response
      let imageUrl = null;
      
      // Check for image URL in different possible fields
      if (parsedData.image) {
        imageUrl = parsedData.image;
      } else if (parsedData.url) {
        imageUrl = parsedData.url;
      } else if (parsedData.imageUrl) {
        imageUrl = parsedData.imageUrl;
      } else if (parsedData.image_url) {
        imageUrl = parsedData.image_url;
      } else if (parsedData.data?.image) {
        imageUrl = parsedData.data.image;
      } else if (parsedData.data?.url) {
        imageUrl = parsedData.data.url;
      } else if (parsedData.results && Array.isArray(parsedData.results) && parsedData.results.length > 0) {
        // Check in results array
        const firstResult = parsedData.results[0];
        imageUrl = firstResult.image || firstResult.url || firstResult.imageUrl || firstResult.image_url;
      }
      
      // If we found an image URL, return it
      if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        return { 
          response: imageUrl, 
          message: imageUrl, 
          text: imageUrl, 
          image: imageUrl,
          ...parsedData 
        };
      }
      
      // Handle different response structures
      if (parsedData.results && Array.isArray(parsedData.results) && parsedData.results.length > 0) {
        const output = parsedData.results[0].output || parsedData.results[0].response || parsedData.results[0].text || parsedData.results[0].message;
        if (output) {
          // Try to extract URL from output string if it contains a URL
          const urlMatch = output.match(/https?:\/\/[^\s"']+/);
          if (urlMatch) {
            return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
          }
          return { response: output, message: output, text: output, image: output, ...parsedData };
        }
      }
      
      if (parsedData.response) {
        // Try to extract URL from response string if it contains a URL
        const urlMatch = parsedData.response.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { ...parsedData, image: urlMatch[0], response: urlMatch[0], message: urlMatch[0], text: urlMatch[0] };
        }
        return { ...parsedData, image: parsedData.response };
      }
      if (parsedData.message) {
        // Try to extract URL from message string if it contains a URL
        const urlMatch = parsedData.message.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: parsedData.message, message: parsedData.message, text: parsedData.message, image: parsedData.message, ...parsedData };
      }
      if (parsedData.text) {
        // Try to extract URL from text string if it contains a URL
        const urlMatch = parsedData.text.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: parsedData.text, message: parsedData.text, text: parsedData.text, image: parsedData.text, ...parsedData };
      }
      if (parsedData.data) {
        const data = typeof parsedData.data === 'string' ? parsedData.data : JSON.stringify(parsedData.data);
        // Try to extract URL from data string if it contains a URL
        const urlMatch = data.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: data, message: data, text: data, image: data, ...parsedData };
      }
      
      // If it's an object but we don't recognize the structure, try to find any URL in the stringified version
      if (typeof parsedData === 'object') {
        const stringified = JSON.stringify(parsedData, null, 2);
        const urlMatch = stringified.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: stringified, message: stringified, text: stringified, ...parsedData };
      }
      
      return parsedData;
    } catch (parseError) {
      // If JSON parsing fails, return the text as is
      console.warn('Failed to parse image generation response as JSON, returning as text:', parseError);
      return { response: responseText, message: responseText, text: responseText, image: responseText };
    }
  } catch (error) {
    console.error('Image generation webhook error:', error);
    
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to reach the image generation webhook. Please check your internet connection and webhook URL.');
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      throw new Error('Image generation request timed out. The webhook may be slow or unresponsive.');
    }
    
    // Re-throw with more context
    throw new Error(`Image generation webhook call failed: ${error.message}`);
  }
}

/**
 * Call the image-to-image generation webhook API
 * @param {string} message - The user's prompt for image transformation
 * @param {string} imageUrl - The URL of the source image to transform
 * @param {string} aspectRatio - The aspect ratio for the image (e.g., "16:9", "1:1", "9:16")
 * @param {string} size - The size for the image (e.g., "small", "medium", "large")
 * @param {string} tenantId - The tenant ID
 * @param {string} userId - The user ID
 * @param {string} workspaceId - The workspace ID
 * @param {string} conversationId - The conversation ID
 * @param {Object} style - Style options (preset, mood, lighting, extra)
 * @param {Object} params - Additional parameters (steps, guidance, strength, seed, upscale, enhanceFace)
 * @returns {Promise<Object>} Response from the image-to-image webhook
 */
export async function callImageToImageWebhook(
  message,
  imageUrl,
  aspectRatio = "16:9",
  size = "medium",
  tenantId = null,
  userId = null,
  workspaceId = null,
  conversationId = null,
  style = {
    preset: "realistic",
    mood: "neutral",
    lighting: "natural",
    extra: "high quality, detailed"
  },
  params = {
    steps: 30,
    guidance: 7.5,
    strength: 0.6,
    seed: null,
    upscale: false,
    enhanceFace: true
  }
) {
  try {
    const url = 'https://n8n.srv1067808.hstgr.cloud/webhook/image-generate';
    
    // Prepare the payload according to the webhook format
    const payload = {
      tenantId: tenantId,
      userId: userId,
      conversationId: conversationId,
      workspaceId: workspaceId,
      model: "gemini",
      mode: "img2img",
      prompt: message,
      image: imageUrl,
      ratio: aspectRatio,
      size: size,
      style: style,
      params: params
    };

    console.log('Calling image-to-image webhook:', { 
      url, 
      prompt: message.substring(0, 50) + '...',
      imageUrl: imageUrl?.substring(0, 50) + '...',
      aspectRatio: aspectRatio,
      size: size,
      tenantId: tenantId,
      userId: userId,
      workspaceId: workspaceId,
      conversationId: conversationId
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000); // 120 second timeout for image-to-image generation

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Image-to-image generation request timed out after 120 seconds');
      }
      throw fetchError;
    }

    console.log('Image-to-image response status:', response.status);
    console.log('Image-to-image response statusText:', response.statusText);

    const responseText = await response.text();
    console.log('Image-to-image response text length:', responseText?.length || 0);
    console.log('Image-to-image response text (first 200 chars):', responseText?.substring(0, 200));

    if (!response.ok) {
      const errorMsg = responseText || `HTTP ${response.status} ${response.statusText}`;
      console.error('Image-to-image webhook request failed:', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorMsg 
      });
      throw new Error(`Image-to-image request failed with status ${response.status}: ${errorMsg}`);
    }

    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from image-to-image webhook');
      throw new Error('Empty response from image-to-image webhook');
    }

    // Get the response content type
    const contentType = response.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    // Try to parse as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      console.log('Parsed image-to-image JSON response keys:', Object.keys(parsedData));
      console.log('Parsed image-to-image JSON response:', parsedData);
      
      // For image-to-image, if we have base64 in response, return the full object
      // The backend will handle saving it
      if (parsedData.success && parsedData.base64 && parsedData.mimeType) {
        return parsedData;
      }
      
      // Extract image URL from various possible locations in the response
      let imageUrl = null;
      
      // Check for image URL in different possible fields
      if (parsedData.image) {
        imageUrl = parsedData.image;
      } else if (parsedData.url) {
        imageUrl = parsedData.url;
      } else if (parsedData.imageUrl) {
        imageUrl = parsedData.imageUrl;
      } else if (parsedData.image_url) {
        imageUrl = parsedData.image_url;
      } else if (parsedData.data?.image) {
        imageUrl = parsedData.data.image;
      } else if (parsedData.data?.url) {
        imageUrl = parsedData.data.url;
      } else if (parsedData.results && Array.isArray(parsedData.results) && parsedData.results.length > 0) {
        // Check in results array
        const firstResult = parsedData.results[0];
        imageUrl = firstResult.image || firstResult.url || firstResult.imageUrl || firstResult.image_url;
      }
      
      // If we found an image URL, return it
      if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        return { 
          response: imageUrl, 
          message: imageUrl, 
          text: imageUrl, 
          image: imageUrl,
          ...parsedData 
        };
      }
      
      // Handle different response structures
      if (parsedData.results && Array.isArray(parsedData.results) && parsedData.results.length > 0) {
        const output = parsedData.results[0].output || parsedData.results[0].response || parsedData.results[0].text || parsedData.results[0].message;
        if (output) {
          // Try to extract URL from output string if it contains a URL
          const urlMatch = output.match(/https?:\/\/[^\s"']+/);
          if (urlMatch) {
            return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
          }
          return { response: output, message: output, text: output, image: output, ...parsedData };
        }
      }
      
      if (parsedData.response) {
        // Try to extract URL from response string if it contains a URL
        const urlMatch = parsedData.response.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { ...parsedData, image: urlMatch[0], response: urlMatch[0], message: urlMatch[0], text: urlMatch[0] };
        }
        return { ...parsedData, image: parsedData.response };
      }
      if (parsedData.message) {
        // Try to extract URL from message string if it contains a URL
        const urlMatch = parsedData.message.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: parsedData.message, message: parsedData.message, text: parsedData.message, image: parsedData.message, ...parsedData };
      }
      if (parsedData.text) {
        // Try to extract URL from text string if it contains a URL
        const urlMatch = parsedData.text.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: parsedData.text, message: parsedData.text, text: parsedData.text, image: parsedData.text, ...parsedData };
      }
      if (parsedData.data) {
        const data = typeof parsedData.data === 'string' ? parsedData.data : JSON.stringify(parsedData.data);
        // Try to extract URL from data string if it contains a URL
        const urlMatch = data.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: data, message: data, text: data, image: data, ...parsedData };
      }
      
      // If it's an object but we don't recognize the structure, try to find any URL in the stringified version
      if (typeof parsedData === 'object') {
        const stringified = JSON.stringify(parsedData, null, 2);
        const urlMatch = stringified.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          return { response: urlMatch[0], message: urlMatch[0], text: urlMatch[0], image: urlMatch[0], ...parsedData };
        }
        return { response: stringified, message: stringified, text: stringified, ...parsedData };
      }
      
      return parsedData;
    } catch (parseError) {
      // If JSON parsing fails, return the text as is
      console.warn('Failed to parse image-to-image response as JSON, returning as text:', parseError);
      return { response: responseText, message: responseText, text: responseText, image: responseText };
    }
  } catch (error) {
    console.error('Image-to-image webhook error:', error);
    
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to reach the image-to-image webhook. Please check your internet connection and webhook URL.');
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      throw new Error('Image-to-image request timed out. The webhook may be slow or unresponsive.');
    }
    
    // Re-throw with more context
    throw new Error(`Image-to-image webhook call failed: ${error.message}`);
  }
}

export default {
  callWebhook,
  callBothModels,
  callImageGenerationWebhook,
  callImageToImageWebhook,
};

