# BookApp - Book Management System

A full-stack web application for managing books and authors, built with modern technologies including Next.js, GraphQL, PostgreSQL, and MongoDB.

## 📚 Features

### Core Functionality

- **Book Management**: Create, read, update, and delete books with detailed information
- **Author Management**: Manage author profiles with biographies and birth dates
- **Author-Book Association**: Link books with their respective authors
- **Search & Filtering**: Find books and authors with filtering options
- **Pagination**: Efficient data browsing with client-side pagination

## 🏗️ Architecture

### Frontend (Client)

- **Framework**: Next.js 13+ with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client
- **State Management**: React Context + Apollo Cache

### Backend (Server)

- **API**: GraphQL with Apollo Server
- **Runtime**: Node.js
- **Primary Database**: PostgreSQL (Books & Authors)
- **Secondary Database**: MongoDB (Metadata & Reviews)
- **ORM**: Sequelize for PostgreSQL
- **Authentication**: JWT-based auth system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- MongoDB 5+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd bookapp
   ```

2. **Install Backend Dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Database Setup

#### PostgreSQL Setup

1. Create a PostgreSQL database named `book_management`
2. Create a user with appropriate permissions:
   ```sql
   CREATE DATABASE book_management;
   CREATE USER admin WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE book_management TO admin;
   ```

#### MongoDB Setup

1. Ensure MongoDB is running on your system
2. The application will automatically create the `book_management_metadata` database

### Environment Configuration

#### Backend Environment (.env in server directory)

```env
DATABASE_URL=postgresql://admin:password@localhost:5431/book_management
MONGODB_URI=mongodb://localhost:27017/book_management_metadata
JWT_SECRET=your_jwt_secret_key_here
PORT=4000
```

#### Frontend Environment (.env in client directory)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/graphql
```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd server
   npm run dev
   ```

   The GraphQL API will be available at `http://localhost:4000/graphql`

2. **Start the Frontend Application**
   ```bash
   cd client
   npm run dev
   ```
   The web application will be available at `http://localhost:3000`

## 📁 Project Structure

```
bookapp/
├── client/                     # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── authors/          # Author-related pages
│   │   └── books/            # Book-related pages
│   ├── components/           # Reusable React components
│   │   └── ui/              # UI components
│   ├── contexts/            # React Context providers
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions
│       ├── graphql/        # mutations and queries
│       └── other files
├── server/                   # Backend API
│   ├── src/
│   │   ├── config/          # Database configurations
│   │   ├── graphql/         # GraphQL schema and resolvers
│   │   ├── middleware/      # Express middleware
│   │   └── models/          # Database models
│   │       ├── mongodb/     # MongoDB models
│   │       └── postgresql/  # PostgreSQL models
│   └── .env                 # Backend environment variables
└── README.md
```

**Happy coding! 📚✨**
