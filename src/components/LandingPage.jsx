import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './landing/LoginModal';
import Header from './landing/Header';
import BannerSection from './landing/BannerSection';
import HeroSection from './landing/HeroSection';
import StatsSection from './landing/StatsSection';
import FeaturesSection from './landing/FeaturesSection';
import UseCasesSection from './landing/UseCasesSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const navigate = useNavigate();

  const handleChatSubmit = (prompt) => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      // Show login modal and save the prompt
      setPendingPrompt(prompt);
      setShowLoginModal(true);
    } else {
      // Redirect to chat with the prompt
      navigate('/chat', { state: { initialPrompt: prompt } });
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Redirect to chat with pending prompt if exists
    if (pendingPrompt) {
      navigate('/chat', { state: { initialPrompt: pendingPrompt } });
      setPendingPrompt('');
    } else {
      navigate('/chat');
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#0f1429] to-[#0a0e27]">
      {/* Header */}
      <Header onLoginClick={() => setShowLoginModal(true)} />

      {/* Banner Section */}
      <BannerSection />

      {/* Hero Section with integrated ChatInput */}
      <HeroSection onChatSubmit={handleChatSubmit} />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            setPendingPrompt('');
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

