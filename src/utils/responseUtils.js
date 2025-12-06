// Helper function to recursively extract reply from nested results arrays
export const extractReplyFromNestedResults = (data) => {
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
};

// Helper function to extract response content from various formats
export const extractResponseContent = (response) => {
  if (typeof response === 'string') {
    return response;
  }
  
  
  if (typeof response === 'object' && response !== null) {
    // First, try to extract reply from nested results structure
    const extractedReply = extractReplyFromNestedResults(response);
    if (extractedReply) return extractedReply;
    
    // Try common response fields
    if (response.response) return response.response;
    if (response.message) return response.message;
    if (response.text) return response.text;
    if (response.content) return response.content;
    if (response.reply) return response.reply;
    if (response.data) {
      // If data is a string, return it
      if (typeof response.data === 'string') return response.data;
      // If data is an object, try to extract from it
      if (typeof response.data === 'object') {
        return extractResponseContent(response.data);
      }
    }
    if (response.body) {
      if (typeof response.body === 'string') return response.body;
      if (typeof response.body === 'object') {
        return extractResponseContent(response.body);
      }
    }
    // If it's an array, try to extract from first item
    if (Array.isArray(response) && response.length > 0) {
      return extractResponseContent(response[0]);
    }
    // Last resort: stringify the object
    return JSON.stringify(response, null, 2);
  }
  
  return String(response);
};

