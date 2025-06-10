'use client';

import AuthorList from '@/components/AuthorList';

export default function AuthorsPage() {
  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
        <p className="text-gray-600 mt-2">Browse and manage authors</p>
      </div>
      
      <AuthorList showActions={true} />
    </div>
  );
}