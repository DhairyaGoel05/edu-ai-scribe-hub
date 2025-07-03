
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, User, Users } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'student' | 'instructor'>('student');

  // Separate login forms for student and instructor
  const [studentLoginData, setStudentLoginData] = useState({
    email: '',
    password: ''
  });

  const [instructorLoginData, setInstructorLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    age: ''
  });

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(studentLoginData.email, studentLoginData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleInstructorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(instructorLoginData.email, instructorLoginData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!signupData.name || !signupData.phone || !signupData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await signup(signupData.email, signupData.password, {
        name: signupData.name,
        phone: signupData.phone,
        age: parseInt(signupData.age),
        role: role
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">AI PDF Assistant</h1>
          <p className="text-gray-600 dark:text-gray-300">Choose your role and get started</p>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Student Login */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                  </div>
                  <CardTitle className="text-xl dark:text-white">Student Login</CardTitle>
                  <CardDescription className="dark:text-gray-300">Access your learning dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="student-email" className="dark:text-gray-200">Email</Label>
                      <Input
                        id="student-email"
                        type="email"
                        value={studentLoginData.email}
                        onChange={(e) => setStudentLoginData({ ...studentLoginData, email: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="student-password" className="dark:text-gray-200">Password</Label>
                      <Input
                        id="student-password"
                        type="password"
                        value={studentLoginData.password}
                        onChange={(e) => setStudentLoginData({ ...studentLoginData, password: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? 'Signing in...' : 'Login as Student'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Instructor Login */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                  </div>
                  <CardTitle className="text-xl dark:text-white">Instructor Login</CardTitle>
                  <CardDescription className="dark:text-gray-300">Manage tests and students</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInstructorLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="instructor-email" className="dark:text-gray-200">Email</Label>
                      <Input
                        id="instructor-email"
                        type="email"
                        value={instructorLoginData.email}
                        onChange={(e) => setInstructorLoginData({ ...instructorLoginData, email: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructor-password" className="dark:text-gray-200">Password</Label>
                      <Input
                        id="instructor-password"
                        type="password"
                        value={instructorLoginData.password}
                        onChange={(e) => setInstructorLoginData({ ...instructorLoginData, password: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                      {loading ? 'Signing in...' : 'Login as Instructor'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="max-w-2xl mx-auto">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl dark:text-white">Create Account</CardTitle>
                  <CardDescription className="dark:text-gray-300">Choose your role and fill in your details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={role === 'student' ? 'default' : 'outline'}
                      onClick={() => setRole('student')}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <GraduationCap className="w-6 h-6" />
                      <span>Student</span>
                    </Button>
                    <Button
                      type="button"
                      variant={role === 'instructor' ? 'default' : 'outline'}
                      onClick={() => setRole('instructor')}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Users className="w-6 h-6" />
                      <span>Instructor</span>
                    </Button>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={signupData.age}
                          onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-password">Password *</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm Password *</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : `Sign Up as ${role === 'student' ? 'Student' : 'Instructor'}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => navigate('/')} className="dark:text-gray-300">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
