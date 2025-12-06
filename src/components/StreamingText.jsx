import { useState, useEffect } from 'react';

/**
 * StreamingText component that displays text with a typing/streaming effect
 * @param {string} text - The full text to display
 * @param {number} speed - Characters per interval (default: 1)
 * @param {number} delay - Delay between characters in ms (default: 20)
 * @param {boolean} autoStart - Whether to start streaming automatically (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function StreamingText({ 
  text = '', 
  speed = 1, 
  delay = 20, 
  autoStart = true,
  className = '' 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsStreaming(false);
      return;
    }

    if (!autoStart) {
      setDisplayedText(text);
      return;
    }

    // Reset when text changes
    setDisplayedText('');
    setIsStreaming(true);

    let currentIndex = 0;
    const textLength = text.length;

    const streamInterval = setInterval(() => {
      if (currentIndex < textLength) {
        // Stream multiple characters at once based on speed
        const endIndex = Math.min(currentIndex + speed, textLength);
        setDisplayedText(text.substring(0, endIndex));
        currentIndex = endIndex;
      } else {
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, delay);

    return () => {
      clearInterval(streamInterval);
    };
  }, [text, speed, delay, autoStart]);

  return (
    <span className={className}>
      {displayedText}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-current ml-0.5 typing-cursor" />
      )}
    </span>
  );
}

