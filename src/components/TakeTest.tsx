import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TestTube, Loader2, Clock, Key, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { PDFService } from '@/services/pdfService';
import { GeminiAPIService } from '@/services/geminiApiService';

interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TakeTestProps {
  file: File | null;
  apiKey?: string;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';

const TakeTest = ({ file, apiKey }: TakeTestProps) => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');

  useEffect(() => {
    if (file && apiKey) {
      analyzePDF();
    }
  }, [file, apiKey]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && !testCompleted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !testCompleted) {
      completeTest();
    }
    return () => clearTimeout(timer);
  }, [testStarted, testCompleted, timeLeft]);

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

  const generateTest = async () => {
    if (!pdfText) {
      toast.error('PDF is still being analyzed. Please wait.');
      return;
    }

    setIsLoading(true);
    try {
      const geminiService = new GeminiAPIService(apiKey!);
      
      const difficultyPrompt = {
        easy: 'Generate easy questions that test basic recall and understanding of key facts.',
        medium: 'Generate medium difficulty questions that test comprehension and application of concepts.',
        hard: 'Generate challenging questions that test analysis, synthesis, and critical thinking skills.'
      };

      const prompt = `Based on the following text, generate 10 multiple-choice questions with 4 options each at ${difficulty} difficulty level. ${difficultyPrompt[difficulty]}

Format the response as a valid JSON array with the following structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Text: ${pdfText.substring(0, 4000)}`;
      
      const result = await geminiService.generateSummary(prompt);
      
      // Extract JSON from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      let generatedQuestions;
      
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback questions based on difficulty
        generatedQuestions = generateFallbackQuestions(difficulty);
      }
      
      setQuestions(generatedQuestions);
      setSelectedAnswers(new Array(generatedQuestions.length).fill(-1));
      setTestStarted(true);
      toast.success(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty test generated! You have 10 minutes to complete it.`);
    } catch (error) {
      toast.error('Failed to generate test');
      console.error('Test generation error:', error);
      // Use fallback questions
      const fallbackQuestions = generateFallbackQuestions(difficulty);
      setQuestions(fallbackQuestions);
      setSelectedAnswers(new Array(fallbackQuestions.length).fill(-1));
      setTestStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackQuestions = (level: DifficultyLevel): TestQuestion[] => {
    const baseQuestion = {
      question: "Based on the document content, what is the main topic discussed?",
      options: [
        "Technical specifications",
        "Educational content and methodology", 
        "Business processes",
        "Research findings"
      ],
      correctAnswer: 1,
      explanation: "The document primarily focuses on educational content and learning methodologies."
    };

    if (level === 'easy') {
      return [{ ...baseQuestion, question: "What type of document is this?" }];
    } else if (level === 'hard') {
      return [{ ...baseQuestion, question: "Which complex concept is most thoroughly analyzed in this document?" }];
    }
    
    return [baseQuestion];
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeTest = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setTestCompleted(true);
    setTestStarted(false);
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    toast.success(`Test completed! You scored ${correctAnswers}/${questions.length} (${percentage}%)`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!apiKey) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Take Test</h2>
          <p className="text-gray-600">Test your knowledge with AI-generated questions</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gemini API key required</p>
              <p className="text-sm text-gray-500 mt-2">
                Please configure your API key in Settings to take tests
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Take Test</h2>
          <p className="text-gray-600">Test your knowledge with AI-generated questions</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No PDF uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Please upload a PDF first to take a test
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Results</h2>
          <p className="text-gray-600">Your performance on: {file.name}</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Trophy className={`w-16 h-16 mx-auto mb-4 ${percentage >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
              <h3 className="text-2xl font-bold mb-2">Test Completed!</h3>
              <p className="text-lg mb-4">You scored {score} out of {questions.length} questions</p>
              <div className={`text-3xl font-bold mb-2 ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {percentage}%
              </div>
              <p className="text-sm text-gray-500 mb-6">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
              <Button onClick={() => {
                setTestCompleted(false);
                setTestStarted(false);
                setCurrentQuestion(0);
                setSelectedAnswers([]);
                setTimeLeft(600);
              }}>
                Take Test Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Take Test</h2>
        <p className="text-gray-600">Test your knowledge on: {file.name}</p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Knowledge Test</span>
            </div>
            {testStarted && (
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {testStarted ? `Question ${currentQuestion + 1} of ${questions.length}` : 'AI-generated test questions based on your PDF content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!testStarted ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Difficulty Level:
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        difficulty === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">{level}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {level === 'easy' && 'Basic recall and facts'}
                        {level === 'medium' && 'Comprehension and application'}
                        {level === 'hard' && 'Analysis and critical thinking'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center py-8">
                <Button 
                  onClick={generateTest} 
                  disabled={isLoading || !pdfText}
                  size="lg"
                  className="mb-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Test...
                    </>
                  ) : (
                    `Start ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Test`
                  )}
                </Button>
                <p className="text-gray-500 text-sm">
                  {pdfText ? 'Click to start a 10-minute timed test with 10 questions' : 'Analyzing PDF, please wait...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {questions[currentQuestion]?.question}
                </h3>
                
                <div className="space-y-3">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`current-question`}
                        value={index}
                        checked={selectedAnswers[currentQuestion] === index}
                        onChange={() => handleAnswerSelect(index)}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentQuestion === questions.length - 1 ? (
                    <Button onClick={completeTest}>
                      Complete Test
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeTest;
