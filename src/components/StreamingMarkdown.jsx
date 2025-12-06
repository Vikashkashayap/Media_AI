import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * StreamingMarkdown component that displays markdown content with a typing/streaming effect
 * @param {string} content - The full markdown content to display
 * @param {number} speed - Characters per interval (default: 2)
 * @param {number} delay - Delay between characters in ms (default: 10)
 * @param {string} className - Additional CSS classes
 */
export default function StreamingMarkdown({ 
  content = '', 
  speed = 5, 
  delay = 10, 
  className = 'prose prose-sm sm:prose-base max-w-none text-gray-700',
  components = {}
}) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!content) {
      setDisplayedContent('');
      setIsStreaming(false);
      return;
    }

    // If content is already fully displayed (e.g. from previous render), don't restart
    // But here we want to stream if it's a new message or we assume it's new.
    // To avoid re-streaming on every render if parent re-renders, we can check length.
    // However, for simplicity and "effect", we'll restart if content prop changes completely.
    // If we want to support "updates" (appending), that's different.
    // Assuming content comes in full block.

    setDisplayedContent('');
    setIsStreaming(true);

    let currentIndex = 0;
    const textLength = content.length;

    // Clear any existing interval
    if (streamRef.current) clearInterval(streamRef.current);

    streamRef.current = setInterval(() => {
      if (currentIndex < textLength) {
        // Stream multiple characters at once based on speed
        // For longer text, we might want to accelerate
        const chunk = Math.max(speed, Math.floor(textLength / 500)); // Dynamic speed for very long text
        const endIndex = Math.min(currentIndex + chunk, textLength);
        setDisplayedContent(content.substring(0, endIndex));
        currentIndex = endIndex;
      } else {
        setIsStreaming(false);
        clearInterval(streamRef.current);
      }
    }, delay);

    return () => {
      if (streamRef.current) clearInterval(streamRef.current);
    };
  }, [content, speed, delay]);

  return (
    <div className={className}>
      <ReactMarkdown components={components}>{displayedContent}</ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1 h-4 bg-gray-500 ml-1 animate-pulse" />
      )}
    </div>
  );
}

