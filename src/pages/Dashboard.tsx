
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import UploadPDF from '@/components/UploadPDF';
import PDFViewer from '@/components/PDFViewer';
import ChatWithPDF from '@/components/ChatWithPDF';
import SummaryGenerator from '@/components/SummaryGenerator';
import MCQGenerator from '@/components/MCQGenerator';
import ShortAnswerGenerator from '@/components/ShortAnswerGenerator';
import APIKeySetup from '@/components/APIKeySetup';
import TakeTest from '@/components/TakeTest';
import CreateTest from '@/components/CreateTest';
import ManageTests from '@/components/ManageTests';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [editingTest, setEditingTest] = useState<any>(null);

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }

    // Set default tab based on user role
    if (profile?.role === 'instructor') {
      setActiveTab('create-test');
    }
  }, [profile]);

  const handleApiKeyConfigured = (key: string) => {
    setApiKey(key);
  };

  const handleNavigateHome = () => {
    console.log('Navigating to home from Dashboard...');
    navigate('/');
  };

  const handleEditTest = (test: any) => {
    setEditingTest(test);
    setActiveTab('create-test');
  };

  const renderContent = () => {
    // Show API key setup if no key is configured for AI features
    if (!apiKey && !['upload', 'viewer', 'create-test', 'manage-tests', 'student-results'].includes(activeTab)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup Required</h2>
            <p className="text-gray-600 dark:text-gray-300">Configure your Gemini API key to use AI features</p>
          </div>
          <APIKeySetup onKeyConfigured={handleApiKeyConfigured} currentKey={apiKey} />
        </div>
      );
    }

    switch (activeTab) {
      case 'upload':
        return <UploadPDF onPDFUpload={setCurrentPDF} />;
      case 'viewer':
        return <PDFViewer file={currentPDF} />;
      case 'chat':
        return <ChatWithPDF file={currentPDF} apiKey={apiKey} />;
      case 'summary':
        return <SummaryGenerator file={currentPDF} apiKey={apiKey} />;
      case 'mcq':
        return <MCQGenerator file={currentPDF} apiKey={apiKey} />;
      case 'short-answer':
        return <ShortAnswerGenerator file={currentPDF} apiKey={apiKey} />;
      case 'test':
        return <TakeTest file={currentPDF} apiKey={apiKey} />;
      case 'create-test':
        return <CreateTest key={editingTest?.id || 'new'} editingTest={editingTest} onTestSaved={() => setEditingTest(null)} />;
      case 'manage-tests':
        return <ManageTests onEditTest={handleEditTest} />;
      case 'student-results':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Results</h2>
              <p className="text-gray-600 dark:text-gray-300">View student performance and results</p>
            </div>
            <div className="text-center py-8 text-gray-500">
              Student results features coming soon...
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
              <p className="text-gray-600 dark:text-gray-300">Manage your API keys and preferences</p>
            </div>
            <APIKeySetup onKeyConfigured={handleApiKeyConfigured} currentKey={apiKey} />
          </div>
        );
      default:
        return <UploadPDF onPDFUpload={setCurrentPDF} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <DashboardSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          hasApiKey={!!apiKey}
          onNavigateHome={handleNavigateHome}
          userRole={profile?.role || 'student'}
        />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
