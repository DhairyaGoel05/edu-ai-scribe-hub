
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
import { Upload, FileText, MessageCircle, FileSpreadsheet, Brain, TestTube } from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasApiKey: boolean;
}

const menuItems = [
  { id: 'upload', label: 'Upload PDF', icon: Upload },
  { id: 'viewer', label: 'PDF Viewer', icon: FileText },
  { id: 'chat', label: 'Chat with PDF', icon: MessageCircle },
  { id: 'summary', label: 'Summary', icon: FileSpreadsheet },
  { id: 'mcq', label: 'Generate MCQs', icon: Brain },
  { id: 'test', label: 'Take Test', icon: TestTube },
];

const DashboardSidebar = ({ activeTab, onTabChange, hasApiKey }: DashboardSidebarProps) => {
  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI PDF Assistant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
