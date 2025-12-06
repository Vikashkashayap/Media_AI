import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function ChatHeader({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isSidebarCollapsed,
  selectedModel,
  setSelectedModel,
  showModelDropdown,
  setShowModelDropdown,
  modelOptions,
  getModelDisplayName,
  getModelBadge,
  selectedFeature,
  setShowFeatureOptions,
  setSelectedFeature,
  isAuthenticated,
  setShowAgentModal,
  setShowInviteModal,
  setShowSharesModal,
  showProfileDropdown,
  setShowProfileDropdown,
  setShowSettingsDropdown,
  handleLogout,
  profileDropdownRef,
  userProfile,
}) {
  const navigate = useNavigate();
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const headerSettingsRef = useRef(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerSettingsRef.current && !headerSettingsRef.current.contains(event.target)) {
        setShowHeaderSettings(false);
      }
    };


    if (showHeaderSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHeaderSettings]);

  // Get user initials from profile
  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };
  return (
    <header className="h-14 sm:h-16 border-b border-gray-700/50 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-gray-900/80 backdrop-blur-xl flex-shrink-0 shadow-lg z-30 relative">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-300 flex-shrink-0"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Logo/User Icon - Only show when sidebar is collapsed on desktop */}
        {isSidebarCollapsed && (
          <div className="hidden lg:flex w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/40 transition-all">
            <span className="text-white font-bold text-sm sm:text-base md:text-lg">{getUserInitials()}</span>
          </div>
        )}
        
        {/* Model Selector - Updated to match image design */}
        <div className="relative model-dropdown-container flex-shrink-0">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-cyan-500/30 bg-gray-800/50 hover:bg-gray-800 transition-all"
          >
            {/* Pencil/Edit Icon for Blog Agent, Briefcase for others */}
            {selectedModel === "Blog Agent" ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (selectedModel === "GPT" || selectedModel === "Gemini") ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ) : selectedModel === "DALL-E" || selectedModel === "Image to Image" ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            <span className="text-sm sm:text-base font-medium text-white whitespace-nowrap">{getModelDisplayName(selectedModel)}</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              selectedModel === "DALL-E" || selectedModel === "Image to Image"
                ? "bg-cyan-500/20 text-cyan-400" 
                : selectedModel === "GPT vs Gemini"
                ? "bg-blue-500/20 text-blue-400"
                : selectedModel === "Blog Agent"
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}>
              {getModelBadge(selectedModel)}
            </span>
            <svg 
              className={`w-4 h-4 text-white transition-transform flex-shrink-0 ${showModelDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Model Dropdown Menu */}
          {showModelDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 min-w-[240px] z-50">
              {modelOptions.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelDropdown(false);
                    // Keep feature options open if we're in image generation mode
                    if (selectedFeature === "image" || model.id === "DALL-E" || model.id === "Image to Image") {
                      setShowFeatureOptions(true);
                      setSelectedFeature("image");
                    }
                  }}
                  className={`w-full px-4 py-2.5 hover:bg-gray-700/50 flex items-center justify-between text-left transition-colors ${
                    selectedModel === model.id ? 'bg-cyan-500/20' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 font-medium">{model.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        model.id === "DALL-E" || model.id === "Image to Image"
                          ? "bg-cyan-500/20 text-cyan-400" 
                          : model.id === "GPT vs Gemini"
                          ? "bg-blue-500/20 text-blue-400"
                          : model.id === "Blog Agent"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        {model.badge}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-0.5">{model.description}</span>
                  </div>
                  {selectedModel === model.id && (
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {isAuthenticated ? (
          <>
            {/* Agent Button - Updated to match image with gradient, visible on all screens */}
            <button
              onClick={() => setShowAgentModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 transition-all cursor-pointer border border-cyan-500/30"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm text-white font-semibold whitespace-nowrap">Agent</span>
              <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">Beta</span>
            </button>

            {/* Settings Button - Contains Shares and Profile */}
            <div className="relative" ref={headerSettingsRef}>
              <button
                onClick={() => setShowHeaderSettings(!showHeaderSettings)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex-shrink-0"
                title="Settings"
              >
                <span className="text-white font-bold text-base sm:text-lg">{getUserInitials()}</span>
              </button>
              
              {/* Settings Dropdown with Shares and Profile */}
              {showHeaderSettings && (
                <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 min-w-[200px] z-50">
                  {/* Shares */}
                  <button
                    onClick={() => {
                      setShowSharesModal(true);
                      setShowHeaderSettings(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-left text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm font-medium">Shares</span>
                  </button>
                  
                  {/* Profile/Settings */}
                  <button
                    onClick={() => {
                      setShowHeaderSettings(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2.5 text-sm text-left text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-700 my-1"></div>
                  
                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowHeaderSettings(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Login and Signup Buttons */}
            <Link
              to="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg sm:rounded-xl transition-all font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all font-medium shadow-md shadow-cyan-500/30"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

