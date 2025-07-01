
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface APIKeySetupProps {
  onKeyConfigured: (key: string) => void;
  currentKey?: string;
}

const APIKeySetup = ({ onKeyConfigured, currentKey }: APIKeySetupProps) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (currentKey) {
      setApiKey(currentKey);
    }
  }, [currentKey]);

  const validateAndSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Gemini API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      toast.error('Invalid Gemini API key format. It should start with "AIza"');
      return;
    }

    setIsValidating(true);
    
    try {
      // Store in localStorage
      localStorage.setItem('gemini_api_key', apiKey);
      onKeyConfigured(apiKey);
      toast.success('Gemini API key configured successfully!');
    } catch (error) {
      toast.error('Failed to configure API key');
    } finally {
      setIsValidating(false);
    }
  };

  const removeKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    onKeyConfigured('');
    toast.success('API key removed');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="w-5 h-5" />
          <span>Gemini AI Configuration</span>
        </CardTitle>
        <CardDescription>
          Enter your Google Gemini API key to enable AI features like chat, summaries, and MCQ generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Gemini API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key (AIza...)"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {currentKey && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>API key is configured and ready to use</span>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">How to get your Gemini API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key" and copy the generated key</li>
                <li>Paste it above to enable AI features</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={validateAndSaveKey} 
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? 'Configuring...' : currentKey ? 'Update Key' : 'Configure Key'}
          </Button>
          
          {currentKey && (
            <Button 
              onClick={removeKey} 
              variant="outline"
              className="flex-shrink-0"
            >
              Remove Key
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeySetup;
