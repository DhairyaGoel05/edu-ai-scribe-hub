
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
}

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const { logout } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="text-sm text-gray-700">{user?.email}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
