"use client";

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_AUTHOR } from "@/lib/graphql/queries";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Book, Star } from "lucide-react";
import BookCard from "@/components/BookCard";
import ReviewForm from "@/components/ReviewForm";

export default function AuthorDetailsPage() {
  const params = useParams();
  const authorId = params.id as string;

  const { data, loading, error } = useQuery(GET_AUTHOR, {
    variables: { id: authorId },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading author: {error.message}</p>
      </div>
    );
  }

  const author = data?.author;
  if (!author) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Author not found</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="mb-6">
        <Link
          href="/authors"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Authors
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              {author.photo_url ? (
                <img
                  src={author.photo_url}
                  alt={author.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="md:w-3/4">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {author.name}
              </h1>

              {author.born_date && (
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="w-5 h-5 mr-2" />
                  Born: {new Date(author.born_date).toLocaleDateString()}
                </div>
              )}

              {author.biography && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Biography
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {author.biography}
                  </p>
                </div>
              )}

              {author.metadata?.average_rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Rating: {author.metadata.average_rating.toFixed(1)} (
                  {author.metadata.total_reviews} reviews)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {author.books && author.books.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Book className="w-6 h-6 mr-2" />
            Books by {author.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {author.books.map((book: any) => (
              <BookCard
                key={book.id}
                book={{
                  ...book,
                  author: { id: author.id, name: author.name },
                }}
              />
            ))}
          </div>
        </div>
      )}
      {author.metadata?.reviews && author.metadata.reviews.length > 0 && (
        <div className="border-t bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reviews
            </h3>
            <div className="space-y-4">
              {author.metadata.reviews.map((review: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {review.user_email}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ReviewForm type="Author" id={authorId} />
    </div>
  );
}
