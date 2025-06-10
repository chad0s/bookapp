'use client';

import Link from 'next/link';
import { Book, Users, Plus } from 'lucide-react';

export default function Home() {
  return (
    <div className="px-4">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to BookStore
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your collection of books and authors
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Link
            href="/books"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center"
          >
            <Book className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Books</h3>
            <p className="text-gray-600">Explore our collection of books</p>
          </Link>
          
          <Link
            href="/authors"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center"
          >
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Authors</h3>
            <p className="text-gray-600">Discover amazing authors</p>
          </Link>
          
          <Link
            href="/books/create"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center"
          >
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Book</h3>
            <p className="text-gray-600">Add a new book to the collection</p>
          </Link>
          
          <Link
            href="/authors/create"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center"
          >
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Author</h3>
            <p className="text-gray-600">Add a new author to the database</p>
          </Link>
        </div>
      </div>
    </div>
  );
}