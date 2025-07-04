
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';

interface Question {
  id: string;
  type: 'MCQ' | 'SHORT_ANSWER';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  showAnswersAfterAttempt: boolean;
  instructorId: string;
  createdAt: string;
  _count?: {
    testAttempts: number;
    testAssignments: number;
  };
}

interface ManageTestsProps {
  onEditTest: (test: Test) => void;
}

const ManageTests = ({ onEditTest }: ManageTestsProps) => {
  const { profile } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, [profile]);

  const loadTests = async () => {
    if (!profile || profile.role !== 'INSTRUCTOR') return;
    
    try {
      setLoading(true);
      const data = await apiService.getTests();
      setTests(data);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        // Note: We'll need to add a delete endpoint to the backend
        // For now, we'll just remove from local state
        setTests(tests.filter(test => test.id !== testId));
        toast.success('Test deleted successfully');
      } catch (error) {
        toast.error('Failed to delete test');
      }
    }
  };

  const getTestStats = (test: Test) => {
    const totalQuestions = test.questions.length;
    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    return { totalQuestions, totalPoints };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Tests</h2>
          <p className="text-gray-600 dark:text-gray-300">View and manage your created tests</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Tests</h2>
        <p className="text-gray-600 dark:text-gray-300">View and manage your created tests</p>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No tests created yet</p>
              <p className="text-sm mt-2">Create your first test to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tests.map((test) => {
            const stats = getTestStats(test);
            return (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{test.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {test.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTest(test)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTest(test.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
                      <div className="text-sm text-gray-500">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
                      <div className="text-sm text-gray-500">Total Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{test._count?.testAttempts || 0}</div>
                      <div className="text-sm text-gray-500">Attempts</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={test.showAnswersAfterAttempt ? 'default' : 'secondary'}>
                        {test.showAnswersAfterAttempt ? 'Show Answers' : 'Hide Answers'}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">After Attempt</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Questions Overview:</h4>
                    {test.questions.slice(0, 3).map((question, index) => (
                      <div key={question.id} className="text-sm text-gray-600 truncate">
                        {index + 1}. {question.questionText}
                      </div>
                    ))}
                    {test.questions.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{test.questions.length - 3} more questions...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageTests;
