import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header({ onLoginClick }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="default" />

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <div className="relative group">
              <a href="#resources" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                Resources
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
            </div>
          </nav>
          

          {/* Social icons and Auth buttons */}
          <div className="flex items-center gap-4">
            {/* Social icons - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="https://reddit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Reddit"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-1.34a1.25 1.25 0 0 1 .635-2.39l2.597 1.34a1.25 1.25 0 0 1 .613.081zm-10.02 0a1.25 1.25 0 0 1 .613-.08l2.597-1.34a1.25 1.25 0 1 1 .635 2.39L8.752 6.544a1.25 1.25 0 0 1-1.25 1.25A1.25 1.25 0 0 1 6.25 6.306l-2.597-1.34a1.25 1.25 0 0 1 .635-2.39l2.597 1.34a1.25 1.25 0 0 1 .613.081zm5.01 2.376c-2.497 0-4.716 1.398-5.845 3.438a5.73 5.73 0 0 0-.718 2.794c0 .636.109 1.246.31 1.812a5.73 5.73 0 0 0-.718-2.794c-1.13-2.04-3.348-3.438-5.845-3.438v1.5c1.796 0 3.423.916 4.352 2.31a5.78 5.78 0 0 0-1.644 1.526c-1.046.893-1.708 2.22-1.708 3.7 0 2.786 2.497 5.044 5.58 5.044s5.58-2.258 5.58-5.044c0-1.48-.662-2.807-1.708-3.7a5.78 5.78 0 0 0-1.644-1.526c.929-1.394 2.556-2.31 4.352-2.31v-1.5zm0 3c-1.397 0-2.523 1.126-2.523 2.523 0 1.397 1.126 2.523 2.523 2.523s2.523-1.126 2.523-2.523c0-1.397-1.126-2.523-2.523-2.523z"/>
                </svg>
              </a>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onLoginClick}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </button>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
