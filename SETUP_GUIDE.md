
# Complete Setup Guide - PDF Learning Platform

This guide will help you set up the complete system with PostgreSQL, Express backend, and React frontend.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## Step 1: Database Setup

1. **Install PostgreSQL**:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE pdf_learning_db;
   
   # Create user (optional)
   CREATE USER pdf_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE pdf_learning_db TO pdf_user;
   ```

## Step 2: Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pdf_learning_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=3001
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate
   ```

5. **Generate Prisma client**:
   ```bash
   npm run generate
   ```

6. **Start the backend server**:
   ```bash
   npm run dev
   ```
   
   Backend will run on http://localhost:3001

## Step 3: Frontend Setup

1. **Navigate to project root**:
   ```bash
   cd ..
   ```

2. **Install frontend dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```
   
   Frontend will run on http://localhost:5173

## Step 4: Testing the Integration

1. **Register as Instructor**:
   - Go to http://localhost:5173
   - Click "Get Started" → Sign Up
   - Choose "Instructor" role
   - Fill in details and register

2. **Create a Test**:
   - Login and go to Dashboard
   - Navigate to "Create Test" tab
   - Create a test with questions

3. **Register as Student**:
   - Open incognito/private window
   - Register as "Student" role

4. **Test the Flow**:
   - Instructor creates tests
   - Tests are stored in PostgreSQL
   - Students can be assigned tests
   - Results are tracked in database

## Step 5: Database Verification

You can check if data is being stored correctly:

```bash
# Connect to database
psql -U postgres -d pdf_learning_db

# Check users
SELECT * FROM users;

# Check tests
SELECT * FROM tests;

# Check questions
SELECT * FROM questions;
```

## API Endpoints Available

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/tests` - Create test (Instructor)
- `GET /api/tests` - Get instructor's tests
- `POST /api/test-assignments` - Assign tests to students
- `POST /api/test-attempts` - Submit test attempts
- `GET /api/test-attempts` - Get test results

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Verify database exists

2. **Port Conflicts**:
   - Backend: Change PORT in .env
   - Frontend: Update API_BASE_URL in apiService.ts

3. **CORS Issues**:
   - Backend already configured for localhost:5173
   - Update if using different ports

## Production Deployment

For production, you'll need to:
1. Set up PostgreSQL on your server
2. Deploy backend (Heroku, Railway, etc.)
3. Deploy frontend (Vercel, Netlify, etc.)
4. Update API_BASE_URL to production backend URL

## Next Steps

Once everything is working:
- Test creation and assignment flows
- Student test-taking experience
- AI evaluation features
- Instructor feedback system

The system now stores everything in PostgreSQL and provides a complete learning management experience!
