
# Complete Deployment Guide - PDF Learning Platform

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Git

### Step 1: Clone and Setup

```bash
# Clone your repository
git clone <your-repo-url>
cd pdf-learning-platform

# Or create the structure manually
mkdir pdf-learning-platform
cd pdf-learning-platform
mkdir frontend backend
```

### Step 2: Backend Setup

```bash
cd backend

# Create package.json
npm init -y

# Install dependencies
npm install express cors bcryptjs jsonwebtoken @prisma/client dotenv
npm install -D nodemon prisma

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start backend
npm run dev
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies (if not already installed)
npm install

# Update API base URL in src/services/apiService.ts
# Change to: const API_BASE_URL = 'http://localhost:3001/api';

# Start frontend
npm run dev
```

### Step 4: Database Configuration

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE pdf_learning_db;

-- Create user (optional)
CREATE USER pdf_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pdf_learning_db TO pdf_user;
```

### Step 5: Environment Variables

Create `backend/.env`:
```env
DATABASE_URL="postgresql://pdf_user:your_password@localhost:5432/pdf_learning_db"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
PORT=3001
NODE_ENV=development
```

## Production Deployment

### Option 1: Railway (Recommended)

**Backend Deployment:**
1. Push backend code to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

**Frontend Deployment:**
1. Build frontend: `npm run build`
2. Deploy to Vercel/Netlify
3. Update API_BASE_URL to production backend URL

### Option 2: Heroku

**Backend:**
```bash
# Install Heroku CLI
heroku create your-app-name-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET="your-secret-key"
git push heroku main
```

**Frontend:**
```bash
# Build and deploy to Vercel
npm run build
npx vercel --prod
```

### Option 3: Docker (Advanced)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: pdf_learning_db
      POSTGRES_USER: pdf_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://pdf_user:your_password@db:5432/pdf_learning_db
      JWT_SECRET: your-secret-key
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Testing the Complete System

1. **Register as Instructor**
2. **Create a test with questions**
3. **Register as Student**
4. **Assign test to student**
5. **Student takes test**
6. **View results and AI evaluation**

## Troubleshooting

### Common Issues:

1. **CORS Error**: Update backend CORS settings
2. **Database Connection**: Check DATABASE_URL format
3. **Port Conflicts**: Change ports in .env and vite.config.ts
4. **API 404 Errors**: Verify API base URL matches backend port

### Quick Fixes:

```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Check backend logs
npm run dev # in backend folder

# Check frontend console
Open browser DevTools -> Console
```

## Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **API Caching**: Implement Redis for caching
3. **Image Optimization**: Use CDN for static assets
4. **Code Splitting**: Implement lazy loading in React
5. **Database Connection Pooling**: Configure in Prisma

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **JWT Secrets**: Use long, random strings
3. **Database Security**: Use connection pooling
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs
6. **HTTPS**: Always use HTTPS in production

The system is now ready for production use with full teacher-student functionality, test management, and AI evaluation capabilities!
