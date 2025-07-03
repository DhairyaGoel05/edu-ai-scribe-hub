
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { GeminiAPIService } from '@/services/geminiApiService';

interface Question {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string;
  points: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  show_answers_after_attempt: boolean;
  instructor_id: string;
  created_at: string;
}

interface CreateTestProps {
  editingTest?: Test | null;
  onTestSaved?: () => void;
}

const CreateTest = ({ editingTest, onTestSaved }: CreateTestProps) => {
  const { profile } = useAuth();
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    show_answers_after_attempt: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerationData, setAiGenerationData] = useState({
    topic: '',
    questionCount: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionTypes: 'mixed' as 'mcq' | 'short_answer' | 'mixed'
  });
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  // Get API key from localStorage
  const apiKey = localStorage.getItem('gemini_api_key');

  useEffect(() => {
    if (editingTest) {
      setTestData({
        title: editingTest.title,
        description: editingTest.description,
        show_answers_after_attempt: editingTest.show_answers_after_attempt,
      });
      setQuestions(editingTest.questions);
    }
  }, [editingTest]);

  const generateAITest = async () => {
    if (!apiKey) {
      toast.error('Please configure your Gemini API key in Settings first');
      return;
    }

    if (!aiGenerationData.topic.trim()) {
      toast.error('Please enter a topic for the test');
      return;
    }

    setIsGeneratingTest(true);
    try {
      const geminiService = new GeminiAPIService(apiKey);
      
      const prompt = `Generate a ${aiGenerationData.difficulty} level test on the topic: "${aiGenerationData.topic}"
      
      Requirements:
      - Create exactly ${aiGenerationData.questionCount} questions
      - Question types: ${aiGenerationData.questionTypes === 'mixed' ? 'mix of multiple choice and short answer' : aiGenerationData.questionTypes}
      - For multiple choice questions, provide exactly 4 options
      - Include the correct answer for each question
      - Each question should be worth 1 point
      
      Please return the response in this exact JSON format:
      {
        "title": "Test title based on topic",
        "description": "Brief description of the test",
        "questions": [
          {
            "type": "mcq" or "short_answer",
            "question": "Question text",
            "options": ["A", "B", "C", "D"] (only for MCQ),
            "correct_answer": "Correct answer",
            "points": 1
          }
        ]
      }
      
      Return only valid JSON, no additional text.`;

      const response = await geminiService.generateContent(prompt);
      
      try {
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const generatedTest = JSON.parse(cleanResponse);
        
        if (generatedTest.title && generatedTest.questions && Array.isArray(generatedTest.questions)) {
          setTestData({
            title: generatedTest.title,
            description: generatedTest.description || '',
            show_answers_after_attempt: false,
          });
          
          const processedQuestions = generatedTest.questions.map((q: any, index: number) => ({
            id: (Date.now() + index).toString(),
            type: q.type || 'mcq',
            question: q.question || '',
            options: q.options || (q.type === 'mcq' ? ['', '', '', ''] : undefined),
            correct_answer: q.correct_answer || '',
            points: q.points || 1,
          }));
          
          setQuestions(processedQuestions);
          toast.success('AI test generated successfully!');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        toast.error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('Error generating AI test:', error);
      toast.error('Failed to generate AI test');
    } finally {
      setIsGeneratingTest(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const saveTest = async () => {
    if (!profile || !testData.title || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }

    setLoading(true);
    try {
      const test: Test = {
        id: editingTest?.id || Date.now().toString(),
        title: testData.title,
        description: testData.description,
        questions: questions,
        show_answers_after_attempt: testData.show_answers_after_attempt,
        instructor_id: profile.id,
        created_at: editingTest?.created_at || new Date().toISOString(),
      };

      // Get existing tests
      const tests = JSON.parse(localStorage.getItem('tests') || '[]');
      
      if (editingTest) {
        // Update existing test
        const testIndex = tests.findIndex((t: Test) => t.id === editingTest.id);
        if (testIndex !== -1) {
          tests[testIndex] = test;
        }
        toast.success('Test updated successfully!');
      } else {
        // Add new test
        tests.push(test);
        toast.success('Test created successfully!');
      }

      localStorage.setItem('tests', JSON.stringify(tests));
      
      // Reset form
      setTestData({
        title: '',
        description: '',
        show_answers_after_attempt: false,
      });
      setQuestions([]);
      
      // Call onTestSaved callback if provided
      if (onTestSaved) {
        onTestSaved();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {editingTest ? 'Edit Test' : 'Create New Test'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Design a custom test for your students</p>
      </div>

      {/* AI Test Generation */}
      {!editingTest && apiKey && (
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
              <Sparkles className="w-5 h-5" />
              <span>AI Test Generator</span>
            </CardTitle>
            <CardDescription>Generate a complete test using AI based on your topic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-topic">Topic/Subject *</Label>
                <Input
                  id="ai-topic"
                  value={aiGenerationData.topic}
                  onChange={(e) => setAiGenerationData({ ...aiGenerationData, topic: e.target.value })}
                  placeholder="e.g., World War II, Calculus, Biology"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <Label htmlFor="ai-count">Number of Questions</Label>
                <select
                  id="ai-count"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
                  value={aiGenerationData.questionCount}
                  onChange={(e) => setAiGenerationData({ ...aiGenerationData, questionCount: parseInt(e.target.value) })}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
              <div>
                <Label htmlFor="ai-difficulty">Difficulty Level</Label>
                <select
                  id="ai-difficulty"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
                  value={aiGenerationData.difficulty}
                  onChange={(e) => setAiGenerationData({ ...aiGenerationData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <Label htmlFor="ai-types">Question Types</Label>
                <select
                  id="ai-types"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
                  value={aiGenerationData.questionTypes}
                  onChange={(e) => setAiGenerationData({ ...aiGenerationData, questionTypes: e.target.value as 'mcq' | 'short_answer' | 'mixed' })}
                >
                  <option value="mixed">Mixed (MCQ + Short Answer)</option>
                  <option value="mcq">Multiple Choice Only</option>
                  <option value="short_answer">Short Answer Only</option>
                </select>
              </div>
            </div>
            
            <Button
              onClick={generateAITest}
              disabled={isGeneratingTest || !aiGenerationData.topic.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGeneratingTest ? 'Generating Test...' : 'Generate AI Test'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
          <CardDescription>Basic details about your test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Test Title *</Label>
            <Input
              id="title"
              value={testData.title}
              onChange={(e) => setTestData({ ...testData, title: e.target.value })}
              placeholder="Enter test title"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              placeholder="Enter test description (optional)"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-answers"
              checked={testData.show_answers_after_attempt}
              onCheckedChange={(checked) => setTestData({ ...testData, show_answers_after_attempt: checked })}
            />
            <Label htmlFor="show-answers" className="dark:text-gray-200">Show answers to students after attempt</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add questions to your test</CardDescription>
            </div>
            <Button onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500 dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold dark:text-white">Question {index + 1}</h4>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="dark:text-gray-200">Question Text *</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="Enter your question"
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="dark:text-gray-200">Question Type</Label>
                      <select
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { 
                          type: e.target.value as 'mcq' | 'short_answer',
                          options: e.target.value === 'mcq' ? ['', '', '', ''] : undefined
                        })}
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                    <div>
                      <Label className="dark:text-gray-200">Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {question.type === 'mcq' && question.options && (
                    <div>
                      <Label className="dark:text-gray-200">Options</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="dark:bg-gray-700 dark:border-gray-600"
                            />
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correct_answer === option}
                              onChange={() => updateQuestion(question.id, { correct_answer: option })}
                            />
                            <Label className="text-sm dark:text-gray-200">Correct</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === 'short_answer' && (
                    <div>
                      <Label className="dark:text-gray-200">Correct Answer *</Label>
                      <Input
                        value={question.correct_answer}
                        onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
                        placeholder="Enter the correct answer"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No questions added yet. Click "Add Question" to get started or use AI to generate a complete test.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        {editingTest && (
          <Button variant="outline" onClick={() => {
            setTestData({ title: '', description: '', show_answers_after_attempt: false });
            setQuestions([]);
            if (onTestSaved) {
              onTestSaved();
            }
          }}>
            Cancel Edit
          </Button>
        )}
        <Button onClick={saveTest} disabled={loading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving Test...' : editingTest ? 'Update Test' : 'Create Test'}
        </Button>
      </div>
    </div>
  );
};

export default CreateTest;
