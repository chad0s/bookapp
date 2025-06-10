'use client';

import BookList from '@/components/BookList';

export default function BooksPage() {
  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Books</h1>
        <p className="text-gray-600 mt-2">Browse and manage your book collection</p>
      </div>
      
      <BookList showActions={true} />
    </div>
  );
}