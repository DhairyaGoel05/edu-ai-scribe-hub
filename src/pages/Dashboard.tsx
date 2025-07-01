
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import UploadPDF from '@/components/UploadPDF';
import PDFViewer from '@/components/PDFViewer';
import ChatWithPDF from '@/components/ChatWithPDF';
import SummaryGenerator from '@/components/SummaryGenerator';
import MCQGenerator from '@/components/MCQGenerator';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadPDF onPDFUpload={setCurrentPDF} />;
      case 'viewer':
        return <PDFViewer file={currentPDF} />;
      case 'chat':
        return <ChatWithPDF file={currentPDF} />;
      case 'summary':
        return <SummaryGenerator file={currentPDF} />;
      case 'mcq':
        return <MCQGenerator file={currentPDF} />;
      default:
        return <UploadPDF onPDFUpload={setCurrentPDF} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
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
