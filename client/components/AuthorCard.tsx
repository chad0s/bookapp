'use client';

import Link from 'next/link';
import { User, Calendar, Edit, Trash2 } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { DELETE_AUTHOR } from '@/lib/graphql/mutations';
import { GET_AUTHORS } from '@/lib/graphql/queries';

interface AuthorCardProps {
  author: {
    id: string;
    name: string;
    biography?: string;
    born_date?: string;
    photo_url?: string;
  };
  showActions?: boolean;
  onRefetch?: () => void;
}

export default function AuthorCard({ author, showActions = false, onRefetch }: AuthorCardProps) {
  const [deleteAuthor, { loading: deleting }] = useMutation(DELETE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
    onCompleted: () => {
      onRefetch?.();
    },
    onError: (error) => {
      console.error('Delete error:', error);
      alert('Error deleting author: ' + error.message);
    }
  });

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this author?')) {
      try {
        await deleteAuthor({ variables: { id: author.id } });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {author.photo_url ? (
            <img
              src={author.photo_url}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <Link 
              href={`/authors/${author.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {author.name}
            </Link>
            
            {author.born_date && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Born: {new Date(author.born_date).toLocaleDateString()}
              </div>
            )}
            
            {author.biography && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {author.biography}
              </p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <Link
              href={`/authors/edit/${author.id}`}
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