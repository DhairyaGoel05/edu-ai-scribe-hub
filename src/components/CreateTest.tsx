
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string;
  points: number;
}

const CreateTest = () => {
  const { profile } = useAuth();
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    show_answers_after_attempt: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

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
      const { data, error } = await supabase
        .from('tests')
        .insert({
          instructor_id: profile.id,
          title: testData.title,
          description: testData.description,
          questions: questions,
          show_answers_after_attempt: testData.show_answers_after_attempt,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Test created successfully!');
      
      // Reset form
      setTestData({
        title: '',
        description: '',
        show_answers_after_attempt: false,
      });
      setQuestions([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Test</h2>
        <p className="text-gray-600 dark:text-gray-300">Design a custom test for your students</p>
      </div>

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
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              placeholder="Enter test description (optional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-answers"
              checked={testData.show_answers_after_attempt}
              onCheckedChange={(checked) => setTestData({ ...testData, show_answers_after_attempt: checked })}
            />
            <Label htmlFor="show-answers">Show answers to students after attempt</Label>
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
            <Button onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold">Question {index + 1}</h4>
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
                    <Label>Question Text *</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <select
                        className="w-full p-2 border rounded"
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
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  {question.type === 'mcq' && question.options && (
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correct_answer === option}
                              onChange={() => updateQuestion(question.id, { correct_answer: option })}
                            />
                            <Label className="text-sm">Correct</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === 'short_answer' && (
                    <div>
                      <Label>Correct Answer *</Label>
                      <Input
                        value={question.correct_answer}
                        onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No questions added yet. Click "Add Question" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveTest} disabled={loading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Creating Test...' : 'Create Test'}
        </Button>
      </div>
    </div>
  );
};

export default CreateTest;
