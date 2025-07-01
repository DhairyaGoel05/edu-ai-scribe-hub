
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Brain, Loader2, CheckCircle, XCircle, Key } from 'lucide-react';
import { toast } from 'sonner';
import { PDFService } from '@/services/pdfService';
import { GeminiAPIService } from '@/services/geminiApiService';

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MCQGeneratorProps {
  file: File | null;
  apiKey?: string;
}

const MCQGenerator = ({ file, apiKey }: MCQGeneratorProps) => {
  const [mcqs, setMCQs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [pdfText, setPdfText] = useState<string>('');

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

  if (!apiKey) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate MCQs</h2>
          <p className="text-gray-600">Create multiple-choice questions from your PDF</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gemini API key required</p>
              <p className="text-sm text-gray-500 mt-2">
                Please configure your API key in Settings to generate MCQs
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate MCQs</h2>
          <p className="text-gray-600">Create multiple-choice questions from your PDF</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Please upload a PDF first to generate MCQs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateMCQs = async () => {
    if (!pdfText) {
      toast.error('PDF is still being analyzed. Please wait.');
      return;
    }

    setIsLoading(true);
    try {
      const geminiService = new GeminiAPIService(apiKey!);
      const generatedMCQs = await geminiService.generateMCQs(pdfText, 5);
      
      setMCQs(generatedMCQs);
      setSelectedAnswers(new Array(generatedMCQs.length).fill(-1));
      toast.success('MCQs generated successfully!');
    } catch (error) {
      toast.error('Failed to generate MCQs');
      console.error('MCQ generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const checkAnswers = () => {
    let correct = 0;
    mcqs.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.correctAnswer) {
        correct++;
      }
    });
    
    toast.success(`You got ${correct} out of ${mcqs.length} questions correct!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate MCQs</h2>
        <p className="text-gray-600">Create multiple-choice questions from: {file.name}</p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Multiple Choice Questions</span>
          </CardTitle>
          <CardDescription>
            AI-generated MCQs based on your PDF content using Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mcqs.length === 0 ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateMCQs} 
                disabled={isLoading || !pdfText}
                size="lg"
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating MCQs...
                  </>
                ) : (
                  'Generate MCQs'
                )}
              </Button>
              <p className="text-gray-500 text-sm">
                {pdfText ? 'Click to analyze your PDF and generate multiple-choice questions using Gemini AI' : 'Analyzing PDF, please wait...'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {mcqs.map((mcq, questionIndex) => (
                <div key={questionIndex} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-4">
                    {questionIndex + 1}. {mcq.question}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {mcq.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAnswers[questionIndex] === optionIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={selectedAnswers[questionIndex] === optionIndex}
                          onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                          className="mr-3"
                        />
                        <span>{option}</span>
                        
                        {selectedAnswers[questionIndex] !== -1 && (
                          <div className="ml-auto">
                            {optionIndex === mcq.correctAnswer ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : selectedAnswers[questionIndex] === optionIndex ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : null}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  {selectedAnswers[questionIndex] !== -1 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {mcq.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex space-x-2">
                <Button onClick={checkAnswers}>
                  Check All Answers
                </Button>
                <Button 
                  onClick={generateMCQs} 
                  disabled={isLoading}
                  variant="outline"
                >
                  Generate New MCQs
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MCQGenerator;
