# Quick Memo API

A RESTful API built with Express, Prisma, PostgreSQL, and TypeScript for managing memos, users, and categories.

## Features

- 🚀 Express.js with TypeScript
- 🗄️ PostgreSQL database with Prisma ORM
- 📝 CRUD operations for Memos, Users, and Categories
- 🔍 Advanced filtering and querying
- 🛡️ Error handling and validation
- 🌐 CORS enabled
- 📦 ES Modules support

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/quick_memo?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Memos
- `GET /api/memos` - Get all memos (supports query params: userId, categoryId, isPinned, isArchived)
- `GET /api/memos/:id` - Get memo by ID
- `POST /api/memos` - Create new memo
- `PUT /api/memos/:id` - Update memo
- `DELETE /api/memos/:id` - Delete memo

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Database Schema

### User
- id (UUID)
- email (unique)
- name (optional)
- createdAt
- updatedAt

### Category
- id (UUID)
- name (unique)
- color (optional)
- createdAt
- updatedAt

### Memo
- id (UUID)
- title
- content
- isPinned (default: false)
- isArchived (default: false)
- userId (foreign key)
- categoryId (foreign key, optional)
- createdAt
- updatedAt

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Project Structure

```
quick_memo_api/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── memoController.ts
│   │   ├── userController.ts
│   │   └── categoryController.ts
│   ├── routes/
│   │   ├── memoRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── categoryRoutes.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

## License

ISC
