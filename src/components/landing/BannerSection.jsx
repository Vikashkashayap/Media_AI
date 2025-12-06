export default function BannerSection() {
  return (
    <section className="relative mt-16 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-500/90 to-orange-500/90 backdrop-blur-sm" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-white">
          <div className="flex items-center gap-2 animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-semibold text-sm md:text-base">New Update Available</span>
          </div>
          <span className="hidden md:inline text-sm">|</span>
          <p className="text-sm md:text-base">Introducing AI-Powered Reel Generation - Create viral content in seconds!</p>
          <a href="#features" className="hidden md:flex items-center gap-1 text-sm font-medium underline underline-offset-2 hover:opacity-80">
            Learn more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

