import ChatInput from './ChatInput';

export default function HeroSection({ onChatSubmit }) {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-32 px-4 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0f1429] to-[#0a0e27]" />
      
      {/* Enhanced glowing arc effect - matching bolt.new design */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none">
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

      {/* Subtle animated particles */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full blur-sm animate-pulse animation-delay-2000" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-cyan-300 rounded-full blur-sm animate-pulse animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Announcement Banner - matching bolt.new style */}
        <div className="mb-8">
          <div className="px-3 py-1.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full text-white text-xs flex items-center gap-2 shadow-lg">
            <span className="font-bold text-sm">M²</span>
            <span className="text-gray-300 text-xs">Introducing MediaLab AI V2</span>
          </div>
        </div>
        

        {/* Main heading - reduced size */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight text-center">
          What will you{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            build
          </span>{' '}
          today?
        </h1>
        
        <p className="text-base md:text-lg text-gray-300 mb-12 max-w-2xl mx-auto text-center">
          Create stunning images, engaging reels, and compelling blog posts by chatting with AI.
        </p>

        {/* Chat Input integrated in hero - larger size with more height */}
        <div className="w-full max-w-5xl mb-14">
          <ChatInput onSubmit={onChatSubmit} />
        </div>

        {/* Import section */}
        {/* <div className="flex flex-col items-center gap-5">
          <p className="text-sm text-gray-400">or import from</p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full text-white text-sm flex items-center gap-2 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.852 8.98h-4.588v-1.18c0-1.046-.52-1.46-1.374-1.46-.911 0-1.629.442-2.133 1.244l-1.592-.962c.739-1.31 1.86-2.095 3.704-2.095 2.308 0 3.814 1.262 3.814 3.597v1.856zm4.935 0v5.568c0 .476.42.853.892.853.49 0 .894-.377.894-.853V8.98h-1.786zm.538-1.76c-.59 0-1.053-.44-1.053-1.017 0-.58.463-1.02 1.053-1.02.605 0 1.054.44 1.054 1.02 0 .577-.449 1.017-1.054 1.017zm-3.614 1.76v3.592c0 1.42-.695 2.143-1.908 2.143-1.153 0-1.856-.72-1.856-2.143V8.22h-1.785v3.654c0 2.454 1.422 3.744 3.64 3.744 2.185 0 3.64-1.29 3.64-3.744V8.22h-1.783zm-6.783 0v5.568c0 .476.42.853.893.853.49 0 .893-.377.893-.853V8.22h-1.786zm.538-1.76c-.59 0-1.053-.44-1.053-1.017 0-.58.463-1.02 1.053-1.02.605 0 1.054.44 1.054 1.02 0 .577-.449 1.017-1.054 1.017z"/>
              </svg>
              Figma
            </button>
            <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full text-white text-sm flex items-center gap-2 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
}
