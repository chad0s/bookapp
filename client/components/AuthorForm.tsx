'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_AUTHOR, UPDATE_AUTHOR } from '@/lib/graphql/mutations';
import { GET_AUTHOR } from '@/lib/graphql/queries';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AuthorFormProps {
  authorId?: string;
  isEdit?: boolean;
}

export default function AuthorForm({ authorId, isEdit = false }: AuthorFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    born_date: '',
    photo_url: ''
  });
  const [errors, setErrors] = useState<any>({});

  const { data: authorData, loading: authorLoading } = useQuery(GET_AUTHOR, {
    variables: { id: authorId },
    skip: !isEdit || !authorId
  });

  const [createAuthor, { loading: creating }] = useMutation(CREATE_AUTHOR, {
    onCompleted: () => {
      router.push('/authors');
    },
    onError: (error) => {
      console.error('Create error:', error);
      setErrors({ submit: error.message });
    }
  });

  const [updateAuthor, { loading: updating }] = useMutation(UPDATE_AUTHOR, {
    onCompleted: () => {
      router.push('/authors');
    },
    onError: (error) => {
      console.error('Update error:', error);
      setErrors({ submit: error.message });
    }
  });

  useEffect(() => {
    if (isEdit && authorData?.author) {
      const author = authorData.author;
      setFormData({
        name: author.name || '',
        biography: author.biography || '',
        born_date: author.born_date ? author.born_date.split('T')[0] : '',
        photo_url: author.photo_url || ''
      });
    }
  }, [authorData, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const input = {
      name: formData.name.trim(),
      biography: formData.biography.trim() || null,
      born_date: formData.born_date || null,
      photo_url: formData.photo_url.trim() || null
    };

    try {
      if (isEdit && authorId) {
        await updateAuthor({ variables: { id: authorId, input } });
      } else {
        await createAuthor({ variables: { input } });
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (isEdit && authorLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-6">
        <Link 
          href="/authors"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Authors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? 'Edit Author' : 'Create New Author'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter author name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-2">
            Biography
          </label>
          <textarea
            id="biography"
            rows={4}
            value={formData.biography}
            onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter author biography"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="born_date" className="block text-sm font-medium text-gray-700 mb-2">
            Birth Date
          </label>
          <input
            type="date"
            id="born_date"
            value={formData.born_date}
            onChange={(e) => setFormData({ ...formData, born_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-2">
            Photo URL
          </label>
          <input
            type="url"
            id="photo_url"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/authors"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={creating || updating}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {creating || updating ? 'Saving...' : 'Save Author'}
          </button>
        </div>
      </form>
    </div>
  );
}