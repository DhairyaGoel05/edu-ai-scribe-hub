
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Auth methods
  async register(userData: { email: string; password: string; name: string; role: string }) {
    return this.post('/auth/register', userData);
  }

  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  // Test methods
  async createTest(testData: any) {
    return this.post('/tests', testData);
  }

  async getTests() {
    return this.get('/tests');
  }

  async getTest(id: string) {
    return this.get(`/tests/${id}`);
  }

  // Student methods
  async getMyStudents() {
    return this.get('/my-students');
  }

  async addStudent(studentId: string) {
    return this.post('/student-teacher-relations', { studentId });
  }

  // Assignment methods
  async assignTest(testId: string, studentIds: string[], dueDate?: string) {
    return this.post('/test-assignments', { testId, studentIds, dueDate });
  }

  async getAssignedTests() {
    return this.get('/assigned-tests');
  }

  // Test attempt methods
  async submitTestAttempt(testId: string, answers: any[], isSelfStudy = false) {
    return this.post('/test-attempts', { testId, answers, isSelfStudy });
  }

  async getTestAttempts() {
    return this.get('/test-attempts');
  }

  async saveAIEvaluation(attemptId: string, aiEvaluation: any) {
    return this.post(`/test-attempts/${attemptId}/ai-evaluate`, { aiEvaluation });
  }

  async saveInstructorFeedback(attemptId: string, feedback: string) {
    return this.post(`/test-attempts/${attemptId}/instructor-feedback`, { feedback });
  }

  // Self-study methods
  async registerSelfStudyUser(userData: { name: string; email: string; preferences?: any }) {
    return this.post('/self-study/register', userData);
  }
}

export const apiService = new ApiService();
