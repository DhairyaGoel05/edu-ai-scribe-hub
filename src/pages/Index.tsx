
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Hero3D from '@/components/Hero3D';
import AuthModal from '@/components/AuthModal';
import Navigation from '@/components/Navigation';

const Index = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="relative">
        <Hero3D onGetStarted={() => handleAuthClick('signup')} />
        
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Transform Your Learning Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload PDFs, generate summaries, create quizzes, and chat with your documents using advanced AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">PDF Analysis</h3>
                <p className="text-gray-600">Upload and analyze PDFs with AI-powered summarization and insights</p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Quizzes</h3>
                <p className="text-gray-600">Generate custom MCQs and practice tests from your documents</p>
              </div>

              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Chat</h3>
                <p className="text-gray-600">Ask questions and get instant answers about your PDF content</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    </div>
  );
};

export default Index;
