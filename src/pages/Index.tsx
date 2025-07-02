
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Hero3D from '@/components/Hero3D';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuthClick = (mode: 'login' | 'signup') => {
    navigate('/auth');
  };

  const features = [
    {
      icon: '📄',
      title: 'PDF Upload & Analysis',
      description: 'Upload any educational PDF and our AI will analyze the content, making it ready for interactive learning.',
      color: 'bg-blue-100'
    },
    {
      icon: '💬',
      title: 'AI-Powered Chat',
      description: 'Ask questions about your PDF content and get instant, accurate answers with persistent chat history across sessions.',
      color: 'bg-purple-100'
    },
    {
      icon: '📺',
      title: 'Related Video Content',
      description: 'Automatically discover YouTube videos that complement your PDF material for enhanced learning.',
      color: 'bg-pink-100'
    },
    {
      icon: '🧠',
      title: 'Smart Summaries',
      description: 'Get concise summaries of complex documents to quickly grasp key concepts and main ideas.',
      color: 'bg-green-100'
    },
    {
      icon: '⏰',
      title: 'Timed Tests',
      description: 'Take comprehensive timed tests to evaluate your understanding and track your learning progress.',
      color: 'bg-yellow-100'
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      description: 'Monitor your learning progress with detailed analytics and performance tracking across all topics.',
      color: 'bg-indigo-100'
    },
    {
      icon: '⬇️',
      title: 'Exportable Content',
      description: 'Export summaries, questions, and notes in various formats for offline study and sharing.',
      color: 'bg-red-100'
    },
    {
      icon: '🔗',
      title: 'Custom API Integration',
      description: 'Seamlessly integrate with your existing learning management systems and educational tools.',
      color: 'bg-teal-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="relative">
        <Hero3D onGetStarted={() => handleAuthClick('signup')} />
        
        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Powerful AI Features for Education
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform combines cutting-edge AI with educational best practices to transform how you learn from PDF content.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Transform your PDFs into interactive learning experiences in just a few steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4">Upload Your PDF</h3>
                <p className="text-gray-600">Simply drag and drop your educational PDF document to get started with AI-powered analysis.</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
                <p className="text-gray-600">Our advanced AI processes your document, extracting key concepts and preparing interactive features.</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4">Learn & Test</h3>
                <p className="text-gray-600">Chat with your document, generate summaries, create quizzes, and take comprehensive tests.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600">
                All plans include a 14-day free trial. No credit card required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Free Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Up to 3 PDFs per month
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Basic chat functionality
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Summary generation
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    5 MCQs per document
                  </li>
                </ul>
                <button 
                  onClick={() => handleAuthClick('signup')}
                  className="w-full py-3 px-6 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Get Started Free
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl shadow-lg text-white relative">
                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </div>
                <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-300 mr-2">✓</span>
                    Unlimited PDFs
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-2">✓</span>
                    Advanced AI chat
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-2">✓</span>
                    Detailed summaries
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-2">✓</span>
                    Unlimited MCQs & tests
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-2">✓</span>
                    Performance analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-300 mr-2">✓</span>
                    Export capabilities
                  </li>
                </ul>
                <button 
                  onClick={() => handleAuthClick('signup')}
                  className="w-full py-3 px-6 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  Start Pro Trial
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
