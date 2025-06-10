"use client";

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_BOOK } from "@/lib/graphql/queries";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Eye, Star } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";

export default function BookDetailsPage() {
  const params = useParams();
  const bookId = params.id as string;

  const { data, loading, error } = useQuery(GET_BOOK, {
    variables: { id: bookId },
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
        <p className="text-red-600">Error loading book: {error.message}</p>
      </div>
    );
  }

  const book = data?.book;
  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Book not found</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="mb-6">
        <Link
          href="/books"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Books
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full max-w-sm mx-auto bg-gray-200 rounded-lg shadow-md aspect-[3/4] flex items-center justify-center">
                  <span className="text-gray-500">No cover image</span>
                </div>
              )}
            </div>

            <div className="lg:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {book.title}
              </h1>

              <Link
                href={`/authors/${book.author.id}`}
                className="inline-flex items-center text-lg text-blue-600 hover:text-blue-800 mb-4"
              >
                <User className="w-5 h-5 mr-2" />
                {book.author.name}
              </Link>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                {book.published_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Published:{" "}
                    {new Date(book.published_date).toLocaleDateString()}
                  </div>
                )}

                {book.metadata?.view_count && (
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    Views: {book.metadata.view_count}
                  </div>
                )}

                {book.metadata?.average_rating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Rating: {book.metadata.average_rating.toFixed(1)} (
                    {book.metadata.total_reviews} reviews)
                  </div>
                )}
              </div>

              {book.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {book.author.biography && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    About the Author
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {book.author.biography}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {book.metadata?.reviews && book.metadata.reviews.length > 0 && (
          <div className="border-t bg-gray-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews
              </h3>
              <div className="space-y-4">
                {book.metadata.reviews.map((review: any, index: number) => (
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
      </div>

      <ReviewForm type="Book" id={bookId} />
    </div>
  );
}
