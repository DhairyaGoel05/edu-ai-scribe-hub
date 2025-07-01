
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Send, MessageCircle, Key, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PDFService } from '@/services/pdfService';
import { GeminiAPIService } from '@/services/geminiApiService';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatWithPDFProps {
  file: File | null;
  apiKey?: string;
}

const ChatWithPDF = ({ file, apiKey }: ChatWithPDFProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (file && apiKey) {
      analyzePDF();
    }
  }, [file, apiKey]);

  const analyzePDF = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    try {
      const extractedText = await PDFService.extractTextFromPDF(file);
      setPdfText(extractedText);
      toast.success('PDF analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze PDF');
      console.error('PDF analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat with PDF</h2>
          <p className="text-gray-600 dark:text-gray-300">Ask questions about your PDF document</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto border-2 border-dashed border-yellow-300 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Gemini API key required</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please configure your API key in Settings to use chat features
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat with PDF</h2>
          <p className="text-gray-600 dark:text-gray-300">Ask questions about your PDF document</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto border-2 border-dashed border-blue-300 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please upload a PDF first to start chatting
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !pdfText) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const geminiService = new GeminiAPIService(apiKey!);
      const response = await geminiService.chatWithDocument(inputMessage, pdfText);
      
      const aiMessage: ChatMessage = {
        type: 'ai',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to process message');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
            Chat with PDF
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Ask questions about: <span className="font-medium text-blue-600 dark:text-blue-400">{file.name}</span></p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Analyzing PDF...</span>
          </div>
        )}
      </div>

      <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>AI Assistant</span>
          </CardTitle>
          <CardDescription className="text-purple-100">
            Ask any questions about your PDF content and get intelligent responses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full p-6 w-fit mx-auto mb-4">
                  <MessageCircle className="w-12 h-12 text-purple-500" />
                </div>
                <p className="font-medium">Start a conversation about your PDF</p>
                <p className="text-sm mt-2">Ask questions, request summaries, or seek clarification</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
            <div className="flex space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={pdfText ? "Ask a question about your PDF..." : "Analyzing PDF, please wait..."}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || !pdfText}
                className="flex-1 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isLoading || !pdfText}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWithPDF;
