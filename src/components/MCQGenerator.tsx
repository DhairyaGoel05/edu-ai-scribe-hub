
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Brain, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MCQGeneratorProps {
  file: File | null;
}

const MCQGenerator = ({ file }: MCQGeneratorProps) => {
  const [mcqs, setMCQs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

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
    setIsLoading(true);
    try {
      // TODO: Implement actual PDF text extraction and AI MCQ generation
      // For now, we'll simulate the process with sample MCQs
      setTimeout(() => {
        const sampleMCQs: MCQ[] = [
          {
            question: "What is the primary purpose of the document analysis discussed in the PDF?",
            options: [
              "To extract text from images",
              "To summarize content using AI",
              "To convert PDF to other formats",
              "To compress file sizes"
            ],
            correctAnswer: 1,
            explanation: "The document focuses on AI-powered content summarization and analysis."
          },
          {
            question: "Which technology is mentioned as key for natural language processing?",
            options: [
              "Machine Learning",
              "Blockchain",
              "Virtual Reality",
              "Quantum Computing"
            ],
            correctAnswer: 0,
            explanation: "Machine Learning is fundamental to natural language processing applications."
          },
          {
            question: "What format is recommended for structured data output?",
            options: [
              "XML",
              "CSV",
              "JSON",
              "Plain Text"
            ],
            correctAnswer: 2,
            explanation: "JSON is widely used for structured data exchange in modern applications."
          },
          {
            question: "How many steps are typically involved in the document processing pipeline?",
            options: [
              "3 steps",
              "5 steps",
              "7 steps",
              "10 steps"
            ],
            correctAnswer: 1,
            explanation: "A typical document processing pipeline involves 5 main steps: extraction, preprocessing, analysis, generation, and output."
          },
          {
            question: "What is the recommended approach for handling large documents?",
            options: [
              "Process everything at once",
              "Split into smaller chunks",
              "Use only the first page",
              "Skip complex sections"
            ],
            correctAnswer: 1,
            explanation: "Splitting large documents into manageable chunks ensures better processing and analysis quality."
          }
        ];

        setMCQs(sampleMCQs);
        setSelectedAnswers(new Array(sampleMCQs.length).fill(-1));
        setIsLoading(false);
        toast.success('MCQs generated successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate MCQs');
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
            AI-generated MCQs based on your PDF content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mcqs.length === 0 ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateMCQs} 
                disabled={isLoading}
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
                Click to analyze your PDF and generate multiple-choice questions
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
