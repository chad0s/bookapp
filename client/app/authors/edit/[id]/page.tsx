'use client';

import { useParams } from 'next/navigation';
import AuthorForm from '@/components/AuthorForm';

export default function EditAuthorPage() {
  const params = useParams();
  const authorId = params.id as string;
  
  return <AuthorForm authorId={authorId} isEdit={true} />;
}