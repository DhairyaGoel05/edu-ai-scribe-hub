
import { Button } from '@/components/ui/button';
import DarkModeToggle from './DarkModeToggle';

interface NavigationProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

const Navigation = ({ onAuthClick }: NavigationProps) => {
  return (
    <nav className="flex items-center justify-between p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">AI PDF Assistant</span>
      </div>

      <div className="flex items-center space-x-4">
        <DarkModeToggle />
        <Button 
          variant="ghost" 
          onClick={() => onAuthClick('login')}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Login
        </Button>
        <Button 
          onClick={() => onAuthClick('signup')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          Get Started
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
