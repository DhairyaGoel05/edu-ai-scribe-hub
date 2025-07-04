
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'STUDENT'
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Self Study User Routes
app.post('/api/self-study/register', async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    
    const existingUser = await prisma.selfStudyUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.selfStudyUser.create({
      data: { name, email, preferences }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Test Routes
app.post('/api/tests', authenticateToken, async (req, res) => {
  try {
    const { title, description, questions, showAnswersAfterAttempt } = req.body;
    
    if (req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Only instructors can create tests' });
    }

    const test = await prisma.test.create({
      data: {
        title,
        description,
        showAnswersAfterAttempt,
        instructorId: req.user.userId,
        questions: {
          create: questions.map(q => ({
            type: q.type,
            questionText: q.question,
            options: q.options || [],
            correctAnswer: q.correct_answer,
            points: q.points
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test' });
  }
});

app.get('/api/tests', authenticateToken, async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      where: {
        instructorId: req.user.userId
      },
      include: {
        questions: true,
        _count: {
          select: {
            testAttempts: true,
            testAssignments: true
          }
        }
      }
    });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

app.get('/api/tests/:id', authenticateToken, async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        questions: true,
        instructor: {
          select: { name: true, email: true }
        }
      }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// Student-Teacher Relations
app.post('/api/student-teacher-relations', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Only instructors can add students' });
    }

    const relation = await prisma.studentTeacherRelation.create({
      data: {
        studentId,
        instructorId: req.user.userId
      }
    });

    res.status(201).json(relation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create relation' });
  }
});

app.get('/api/my-students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Only instructors can view students' });
    }

    const students = await prisma.user.findMany({
      where: {
        teacherRelations: {
          some: {
            instructorId: req.user.userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Test Assignment Routes
app.post('/api/test-assignments', authenticateToken, async (req, res) => {
  try {
    const { testId, studentIds, dueDate } = req.body;
    
    if (req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Only instructors can assign tests' });
    }

    const assignments = await Promise.all(
      studentIds.map(studentId => 
        prisma.testAssignment.create({
          data: {
            testId,
            studentId,
            assignedBy: req.user.userId,
            dueDate: dueDate ? new Date(dueDate) : null
          }
        })
      )
    );

    res.status(201).json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign tests' });
  }
});

app.get('/api/assigned-tests', authenticateToken, async (req, res) => {
  try {
    const assignments = await prisma.testAssignment.findMany({
      where: {
        studentId: req.user.userId
      },
      include: {
        test: {
          include: {
            questions: true,
            instructor: {
              select: { name: true }
            }
          }
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assigned tests' });
  }
});

// Test Attempt Routes
app.post('/api/test-attempts', authenticateToken, async (req, res) => {
  try {
    const { testId, answers, isSelfStudy } = req.body;
    
    // Get test with questions
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    let score = 0;
    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);

    // Create test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        testId,
        studentId: isSelfStudy ? null : req.user.userId,
        selfStudyUserId: isSelfStudy ? req.user.userId : null,
        totalPoints,
        answers: {
          create: answers.map(answer => {
            const question = test.questions.find(q => q.id === answer.questionId);
            const isCorrect = question.correctAnswer === answer.answerText;
            const pointsAwarded = isCorrect ? question.points : 0;
            score += pointsAwarded;

            return {
              questionId: answer.questionId,
              answerText: answer.answerText,
              isCorrect,
              pointsAwarded
            };
          })
        }
      },
      include: {
        answers: true
      }
    });

    // Update the attempt with calculated score
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: { score },
      include: {
        test: true,
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    res.status(201).json(updatedAttempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

app.get('/api/test-attempts', authenticateToken, async (req, res) => {
  try {
    let attempts;
    
    if (req.user.role === 'INSTRUCTOR') {
      // Get attempts for instructor's tests
      attempts = await prisma.testAttempt.findMany({
        where: {
          test: {
            instructorId: req.user.userId
          }
        },
        include: {
          test: true,
          student: {
            select: { name: true, email: true }
          },
          answers: {
            include: {
              question: true
            }
          }
        }
      });
    } else {
      // Get attempts for student
      attempts = await prisma.testAttempt.findMany({
        where: {
          studentId: req.user.userId
        },
        include: {
          test: true,
          answers: {
            include: {
              question: true
            }
          }
        }
      });
    }

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test attempts' });
  }
});

// AI Evaluation Route
app.post('/api/test-attempts/:id/ai-evaluate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { aiEvaluation } = req.body;
    
    if (req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Only instructors can evaluate' });
    }

    const attempt = await prisma.testAttempt.update({
      where: { id },
      data: {
        aiEvaluation,
        evaluationStatus: 'AI_EVALUATED'
      }
    });

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save AI evaluation' });
  }
});

// Instructor Feedback Route
app.post('/api/test-attempts/:id/instructor-feedback', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    
    if (req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Only instructors can provide feedback' });
    }

    const attempt = await prisma.testAttempt.update({
      where: { id },
      data: {
        instructorFeedback: feedback,
        evaluationStatus: 'INSTRUCTOR_EVALUATED'
      }
    });

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save instructor feedback' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
