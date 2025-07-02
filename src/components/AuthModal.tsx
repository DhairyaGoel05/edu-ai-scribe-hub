
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

const AuthModal = ({ isOpen, onClose, mode, onToggleMode }: AuthModalProps) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Please use our new authentication page for a better experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-gray-600">
            We've moved authentication to a dedicated page with role selection for students and instructors.
          </p>
          
          <Button 
            onClick={handleRedirect}
            className="w-full"
          >
            Go to Authentication Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
