
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

interface DashboardHeaderProps {
  user: any;
}

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const { logout } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <DarkModeToggle />
        
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
