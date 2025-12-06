import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CreateAccountPage from './components/CreateAccountPage';
import LoginPage from './components/LoginPage';
import ChatInterface from './components/ChatInterface';
import ProfilePage from './components/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import WorkspaceDashboard from './components/workspaces/WorkspaceDashboard';
import ConnectAccountsPage from './components/ConnectAccountsPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<CreateAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId/setup"
          element={
            <ProtectedRoute>
              <WorkspaceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId/connect-accounts"
          element={
            <ProtectedRoute>
              <ConnectAccountsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;




