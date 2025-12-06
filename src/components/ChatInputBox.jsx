import { useRef, useEffect, useState } from "react";
import FeatureOptions from "./FeatureOptions";
import FeaturePopup from "./FeaturePopup";

export default function ChatInputBox({
  inputValue,
  setInputValue,
  isChatBoxExpanded,
  setIsChatBoxExpanded,
  isRecording,
  setIsRecording,
  showPopup,
  setShowPopup,
  selectedFeature,
  setSelectedFeature,
  showFeatureOptions,
  setShowFeatureOptions,
  featureOptions,
  setFeatureOptions,
  openDropdown,
  setOpenDropdown,
  isGenerating,
  isEnhancingPrompt,
  handleSend,
  handleFileUpload,
  handleFileChange,
  handleMicrophone,
  handleTextFormatting,
  handlePhoneCall,
  handleMention,
  handleEnhancePrompt,
  handleFeatureSelect,
  fileInputRef,
  popupRef,
  textareaRef,
  selectedImage,
  setSelectedImage,
  selectedModel
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update input value with final transcript
        if (finalTranscript) {
          setInputValue(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setInputValue]);

  // Handle voice input
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        setIsRecording(false);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue, textareaRef]);

  const handleExpandChatBox = () => {
    setIsChatBoxExpanded(!isChatBoxExpanded);
  };

  return (
    <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-2 sm:p-3 flex-shrink-0 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Chat Input Box - Simple style like ChatGPT */}
        <div className={`relative bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg transition-all ${isChatBoxExpanded ? 'min-h-[300px]' : 'min-h-[80px] sm:min-h-[100px]'}`}>
          {/* Textarea */}
          <div className="relative p-2 sm:p-3 h-full flex flex-col">
            {/* Text Area Section - Top */}
            <div className="flex-1 relative pb-12 sm:pb-14">
              {/* Placeholder Text at Top Left */}
              {!inputValue && (
                <div className="absolute top-0 left-0 pointer-events-none z-10">
                  <span className="text-sm text-gray-500">Ask me anything...</span>
                </div>
              )}
              
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder=""
                rows={isChatBoxExpanded ? 10 : 3}
                className="w-full outline-none text-sm text-gray-200 placeholder-gray-500 bg-transparent resize-none overflow-y-auto relative z-0"
                style={{ 
                  minHeight: isChatBoxExpanded ? '250px' : '60px',
                  maxHeight: isChatBoxExpanded ? '250px' : '120px',
                  paddingTop: '0',
                  paddingBottom: '0'
                }}
              />
            </div>
            
            {/* Icons Row at Bottom */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-1 sm:gap-1.5 flex-wrap">
              {/* Left Side - Plus Button with Popup */}
              <div className="relative z-20" ref={popupRef}>
                <button 
                  onClick={() => setShowPopup(!showPopup)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-300"
                  title="Add features"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                {/* Popup Menu */}
                <FeaturePopup
                  show={showPopup}
                  onClose={() => setShowPopup(false)}
                  onFeatureSelect={handleFeatureSelect}
                />
              </div>

              {/* Right Side - All Other Icons */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                {/* Voice/Microphone Icon */}
                <button 
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg transition-all ${isListening || isRecording ? 'bg-red-500/20 text-red-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                  title={isListening ? "Stop recording" : "Voice input"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Expand/Maximize Icon */}
                <button 
                  onClick={handleExpandChatBox}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-300"
                  title={isChatBoxExpanded ? "Collapse chat box" : "Expand chat box"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isChatBoxExpanded ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </button>

                {/* File Upload Icon */}
                <button 
                  onClick={handleFileUpload}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-300"
                  title="Upload file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </button>

                {/* Enhance Prompt Icon */}
                <button 
                  onClick={handleEnhancePrompt}
                  disabled={!inputValue.trim() || isEnhancingPrompt}
                  className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEnhancingPrompt ? 'text-cyan-400 animate-pulse bg-cyan-500/20' : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                  title="Enhance prompt"
                >
                  {isEnhancingPrompt ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M8 12H4m13.657-5.657l-2.828 2.828M9.172 14.828l-2.829 2.828" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>

                {/* Send Icon (Paper Airplane) - Styled like in image */}
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isGenerating || (selectedModel === "Image to Image" && selectedImage && !selectedImage.url)}
                  className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-500"
                  title={selectedModel === "Image to Image" && selectedImage && !selectedImage.url ? "Please wait for image to upload" : "Send message"}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept={selectedModel === "Image to Image" ? "image/*" : "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"}
            />
            
            {/* Image Preview for Image to Image mode */}
            {selectedModel === "Image to Image" && selectedImage && (
              <div className="mt-2 p-2 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="flex items-center gap-2">
                  <img 
                    src={selectedImage.preview} 
                    alt="Selected" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{selectedImage.file.name}</p>
                    {selectedImage.url ? (
                      <p className="text-xs text-green-400">✓ Uploaded</p>
                    ) : (
                      <p className="text-xs text-yellow-400">Uploading...</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (selectedImage.preview) {
                        URL.revokeObjectURL(selectedImage.preview);
                      }
                      setSelectedImage(null);
                    }}
                    className="p-1 hover:bg-gray-600 rounded text-gray-300"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feature Options Dropdowns */}
          <FeatureOptions
            showFeatureOptions={showFeatureOptions}
            selectedFeature={selectedFeature}
            featureOptions={featureOptions}
            setFeatureOptions={setFeatureOptions}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            setShowFeatureOptions={setShowFeatureOptions}
            setSelectedFeature={setSelectedFeature}
          />
        </div>
      </div>
    </div>
  );
}

