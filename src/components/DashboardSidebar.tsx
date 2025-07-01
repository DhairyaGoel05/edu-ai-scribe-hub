
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Upload, FileText, MessageCircle, FileSpreadsheet, Brain, TestTube, Home, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasApiKey: boolean;
}

const menuItems = [
  { id: 'upload', label: 'Upload PDF', icon: Upload, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'viewer', label: 'PDF Viewer', icon: FileText, color: 'text-green-600 dark:text-green-400' },
  { id: 'chat', label: 'Chat with PDF', icon: MessageCircle, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'summary', label: 'Summary', icon: FileSpreadsheet, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'mcq', label: 'Generate MCQs', icon: Brain, color: 'text-pink-600 dark:text-pink-400' },
  { id: 'test', label: 'Take Test', icon: TestTube, color: 'text-indigo-600 dark:text-indigo-400' },
];

const DashboardSidebar = ({ activeTab, onTabChange, hasApiKey }: DashboardSidebarProps) => {
  return (
    <Sidebar className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 dark:text-gray-300 font-semibold">
            AI PDF Assistant
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Landing Page Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                  >
                    <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Back to Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Divider */}
              <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>

              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const needsApiKey = ['chat', 'summary', 'mcq', 'test'].includes(item.id);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={isActive}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 shadow-md' 
                          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                        }
                        ${needsApiKey && !hasApiKey ? 'opacity-60' : ''}
                      `}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? item.color : 'text-gray-600 dark:text-gray-400'}`} />
                      <span className={`${isActive ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.label}
                      </span>
                      {needsApiKey && !hasApiKey && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto"></div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Settings */}
              <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTabChange('settings')}
                  isActive={activeTab === 'settings'}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                    ${activeTab === 'settings'
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 shadow-md'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                    }
                  `}
                >
                  <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className={`${activeTab === 'settings' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    Settings
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
