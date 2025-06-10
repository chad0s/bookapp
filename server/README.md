# Book Management System Backend

## Overview

A GraphQL API backend for managing books and authors with PostgreSQL and MongoDB databases.

## Features

- GraphQL API with Apollo Server
- PostgreSQL for main data (books, authors, users)
- MongoDB for metadata (reviews, ratings, tags)
- JWT authentication
- Role-based authorization
- Pagination and filtering
- File upload support for book covers and author photos

## Setup

### Prerequisites

- Node.js 16+
- PostgreSQL
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update values
4. Run database migrations: `npm run migrate`
5. Start the server: `npm run dev`

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 4000)

## API Documentation

### Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### Main Queries

- `books(page, limit, filter)`: Get paginated books
- `book(id)`: Get single book by ID
- `authors(page, limit, filter)`: Get paginated authors
- `author(id)`: Get single author by ID

### Main Mutations

- `signup(email, password)`: Create new user account
- `login(email, password)`: Login and get JWT token
- `createBook(input)`: Create new book (requires auth)
- `updateBook(id, input)`: Update book (requires auth)
- `deleteBook(id)`: Delete book (requires admin role)
- `createAuthor(input)`: Create new author (requires auth)
- `updateAuthor(id, input)`: Update author (requires auth)
- `deleteAuthor(id)`: Delete author (requires admin role)
- `addReview(input)`: Add review to book (requires auth)

## Testing

Run tests with: `npm test`

## Deployment

1. Set up PostgreSQL and MongoDB instances
2. Configure environment variables
3. Build and deploy to platform of choice (Heroku, AWS, etc.)
4. Run database migrations in production
