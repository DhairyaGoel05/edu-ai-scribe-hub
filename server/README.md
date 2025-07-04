
# PDF Learning Platform Backend

This is the backend server for the PDF Learning Platform built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- **User Authentication**: JWT-based authentication for instructors and students
- **Role-based Access**: Separate roles for instructors and students
- **Test Management**: Create, store, and manage tests with questions
- **Student-Teacher Relations**: Link students to instructors
- **Test Assignments**: Assign tests to specific students
- **Test Attempts**: Track student submissions and scores
- **AI Evaluation**: Support for AI-powered test evaluation
- **Self-Study Users**: Separate table for users who want to self-study

## Database Schema

### Tables:
- `users` - Stores instructors and students
- `self_study_users` - Separate table for self-study users
- `tests` - All created tests
- `questions` - Individual questions (MCQ and Short Answer)
- `student_teacher_relations` - Links students to instructors
- `test_assignments` - Test assignments to students
- `test_attempts` - Student test submissions
- `test_attempt_answers` - Individual answers within attempts

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Setup PostgreSQL Database**:
   - Install PostgreSQL
   - Create a new database: `pdf_learning_db`

3. **Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and JWT secret.

4. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

5. **Generate Prisma Client**:
   ```bash
   npm run generate
   ```

6. **Start the Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Self Study Users
- `POST /api/self-study/register` - Register self-study user

### Tests
- `POST /api/tests` - Create new test (Instructor only)
- `GET /api/tests` - Get instructor's tests
- `GET /api/tests/:id` - Get specific test

### Student Management
- `POST /api/student-teacher-relations` - Add student to instructor
- `GET /api/my-students` - Get instructor's students

### Test Assignments
- `POST /api/test-assignments` - Assign test to students
- `GET /api/assigned-tests` - Get student's assigned tests

### Test Attempts
- `POST /api/test-attempts` - Submit test attempt
- `GET /api/test-attempts` - Get test attempts
- `POST /api/test-attempts/:id/ai-evaluate` - AI evaluation
- `POST /api/test-attempts/:id/instructor-feedback` - Instructor feedback

## Usage

1. **For Instructors**:
   - Register as instructor
   - Create tests with questions
   - Add students to your class
   - Assign tests to students
   - Review student submissions
   - Provide feedback or use AI evaluation

2. **For Students**:
   - Register as student
   - Get assigned tests from instructors
   - Submit test attempts
   - View results and feedback

3. **For Self-Study Users**:
   - Register as self-study user
   - Take available tests
   - View your own progress

## Database Management

- View database: `npm run studio`
- Reset database: `npm run migrate -- --reset`
