export default function FeatureOptions({
  showFeatureOptions,
  selectedFeature,
  featureOptions,
  setFeatureOptions,
  openDropdown,
  setOpenDropdown,
  setShowFeatureOptions,
  setSelectedFeature
}) {
  const dropdownOptions = {
    platform: ["All Platforms", "Instagram", "Facebook", "Twitter", "LinkedIn", "TikTok"],
    size: ["Standard", "Small", "Medium", "Large", "Extra Large"],
    aspectRatio: ["16:9", "4:3", "1:1", "9:16", "21:9"],
    style: ["Default", "Creative", "Professional", "Casual", "Bold", "Minimal"]
  };

  if (!showFeatureOptions || !selectedFeature) return null;

  return (
    <div className="mt-3 flex items-center gap-3 flex-wrap">
      {/* Platform Dropdown */}
      <div className="relative dropdown-container">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'platform' ? null : 'platform')}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 flex items-center gap-2 transition-all font-medium shadow-sm"
        >
          <span>{featureOptions.platform}</span>
          <svg className={`w-4 h-4 transition-transform ${openDropdown === 'platform' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openDropdown === 'platform' && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-[180px] z-50">
            {dropdownOptions.platform.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setFeatureOptions({...featureOptions, platform: option});
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all rounded-lg mx-1 ${
                  featureOptions.platform === option 
                    ? 'bg-purple-50 text-purple-700 font-semibold' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size Dropdown */}
      <div className="relative dropdown-container">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 flex items-center gap-2 transition-all font-medium shadow-sm"
        >
          <span>{featureOptions.size}</span>
          <svg className={`w-4 h-4 transition-transform ${openDropdown === 'size' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openDropdown === 'size' && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-[180px] z-50">
            {dropdownOptions.size.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setFeatureOptions({...featureOptions, size: option});
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all rounded-lg mx-1 ${
                  featureOptions.size === option 
                    ? 'bg-purple-50 text-purple-700 font-semibold' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aspect Ratio Dropdown */}
      <div className="relative dropdown-container">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'aspectRatio' ? null : 'aspectRatio')}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 flex items-center gap-2 transition-all font-medium shadow-sm"
        >
          <span>{featureOptions.aspectRatio}</span>
          <svg className={`w-4 h-4 transition-transform ${openDropdown === 'aspectRatio' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openDropdown === 'aspectRatio' && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-[180px] z-50">
            {dropdownOptions.aspectRatio.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setFeatureOptions({...featureOptions, aspectRatio: option});
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all rounded-lg mx-1 ${
                  featureOptions.aspectRatio === option 
                    ? 'bg-purple-50 text-purple-700 font-semibold' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Style Dropdown */}
      <div className="relative dropdown-container">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'style' ? null : 'style')}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 flex items-center gap-2 transition-all font-medium shadow-sm"
        >
          <span>{featureOptions.style}</span>
          <svg className={`w-4 h-4 transition-transform ${openDropdown === 'style' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openDropdown === 'style' && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-[180px] z-50">
            {dropdownOptions.style.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setFeatureOptions({...featureOptions, style: option});
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all rounded-lg mx-1 ${
                  featureOptions.style === option 
                    ? 'bg-purple-50 text-purple-700 font-semibold' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close Feature Options */}
      <button
        onClick={() => {
          setShowFeatureOptions(false);
          setSelectedFeature(null);
          setOpenDropdown(null);
        }}
        className="px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
      >
        Close
      </button>
    </div>
  );
}

