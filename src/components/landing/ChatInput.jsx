import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSubmit }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePlan = (e) => {
    e.preventDefault();
    // Plan functionality can be added later
    console.log('Plan clicked');
  };

  const handleBuildNow = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  useEffect(() => {
    // Auto-focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center gap-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border transition-all duration-300 min-h-[72px] ${
          isFocused
            ? 'border-cyan-500/50 shadow-cyan-500/20'
            : 'border-gray-700/50 hover:border-gray-600'
        }`}
      >
        {/* Left side - Plus icon */}
        <div className="flex items-center pl-6">
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700/50"
            aria-label="Add"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Input field - larger height */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Let's build a prototype to validate..."
          className="flex-1 py-7  px-4 text-lg md:text-xl bg-transparent outline-none placeholder:text-gray-500 text-white"
        />

        {/* Right side - Plan and Build buttons - larger with more height */}
        <div className="flex items-center gap-3 pr-6">
          {/* Plan button */}
          <button
            type="button"
            onClick={handlePlan}
            className="px-5 py-3.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-base font-medium flex items-center gap-2 transition-colors border border-gray-600/50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21h6M12 3v18M5 12H2a10 10 0 0 0 20 0h-3" />
            </svg>
            Plan
          </button>

          {/* Build now button */}
          <button
            type="button"
            onClick={handleBuildNow}
            disabled={!input.trim()}
            className={`px-6 py-3.5 rounded-lg text-base font-medium flex items-center gap-2 transition-all ${
              input.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            Build now
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
