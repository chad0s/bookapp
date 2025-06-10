'use client';

import Link from 'next/link';
import { Book, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { DELETE_BOOK } from '@/lib/graphql/mutations';
import { GET_BOOKS } from '@/lib/graphql/queries';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    description?: string;
    published_date?: string;
    cover_url?: string;
    author: {
      id: string;
      name: string;
    };
  };
  showActions?: boolean;
  onRefetch?: () => void;
}

export default function BookCard({ book, showActions = false, onRefetch }: BookCardProps) {
  const [deleteBook, { loading: deleting }] = useMutation(DELETE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
    onCompleted: () => {
      onRefetch?.();
    },
    onError: (error) => {
      console.error('Delete error:', error);
      alert('Error deleting book: ' + error.message);
    }
  });

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook({ variables: { id: book.id } });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link 
              href={`/books/${book.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {book.title}
            </Link>
            
            <Link 
              href={`/authors/${book.author.id}`}
              className="text-sm text-gray-600 hover:text-blue-600 mt-1 inline-flex items-center"
            >
              <User className="w-4 h-4 mr-1" />
              {book.author.name}
            </Link>
            
            {book.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {book.description}
              </p>
            )}
            
            {book.published_date && (
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(book.published_date).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {book.cover_url && (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-16 h-20 object-cover rounded ml-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
        
        {showActions && (
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <Link
              href={`/books/edit/${book.id}`}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}