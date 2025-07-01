
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit3, Loader2, Key, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PDFService } from '@/services/pdfService';
import { GeminiAPIService } from '@/services/geminiApiService';

interface ShortAnswerGeneratorProps {
  file: File | null;
  apiKey?: string;
}

const ShortAnswerGenerator = ({ file, apiKey }: ShortAnswerGeneratorProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (file && apiKey) {
      analyzePDF();
    }
  }, [file, apiKey]);

  const analyzePDF = async () => {
    if (!file) return;
    
    try {
      const extractedText = await PDFService.extractTextFromPDF(file);
      setPdfText(extractedText);
    } catch (error) {
      toast.error('Failed to analyze PDF');
      console.error('PDF analysis error:', error);
    }
  };

  const generateQuestions = async () => {
    if (!pdfText) {
      toast.error('PDF is still being analyzed. Please wait.');
      return;
    }

    setIsLoading(true);
    try {
      const geminiService = new GeminiAPIService(apiKey!);
      const prompt = `Based on the following text, generate 8-10 short answer questions that test comprehension and understanding. These should be questions that require 2-3 sentence answers. Format each question on a new line with "Q: " prefix.

Text: ${pdfText.substring(0, 4000)}`;
      
      const response = await geminiService.generateSummary(prompt);
      const questionLines = response
        .split('\n')
        .filter(line => line.trim().startsWith('Q:'))
        .map(line => line.replace('Q:', '').trim())
        .filter(q => q.length > 0);
      
      if (questionLines.length === 0) {
        // Fallback parsing
        const allLines = response.split('\n').filter(line => line.trim().length > 10);
        setQuestions(allLines.slice(0, 8));
      } else {
        setQuestions(questionLines);
      }
      
      toast.success(`Generated ${questionLines.length || 8} short answer questions!`);
    } catch (error) {
      toast.error('Failed to generate questions');
      console.error('Question generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Question copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (!apiKey) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Short Answer Questions</h2>
          <p className="text-gray-600">Generate short answer questions from your PDF</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gemini API key required</p>
              <p className="text-sm text-gray-500 mt-2">
                Please configure your API key in Settings to generate questions
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Short Answer Questions</h2>
          <p className="text-gray-600">Generate short answer questions from your PDF</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Please upload a PDF first to generate questions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Short Answer Questions</h2>
        <p className="text-gray-600">Generate comprehensive short answer questions from: {file.name}</p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <span>Short Answer Questions</span>
          </CardTitle>
          <CardDescription>
            AI-generated questions that require 2-3 sentence answers based on your PDF content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={generateQuestions} 
              disabled={isLoading || !pdfText}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Generate Short Answer Questions'
              )}
            </Button>

            {!pdfText && (
              <p className="text-gray-500 text-sm">
                Analyzing PDF content, please wait...
              </p>
            )}

            {questions.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Generated Questions:</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            {index + 1}. {question}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expected answer length: 2-3 sentences
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(question, index)}
                          className="ml-4"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortAnswerGenerator;
