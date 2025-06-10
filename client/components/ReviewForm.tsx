"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_AUTHOR_REVIEW, ADD_REVIEW } from "@/lib/graphql/mutations";
import { GET_AUTHOR, GET_BOOK } from "@/lib/graphql/queries";
import { Star, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewFormProps {
  id: string;
  type: "Book" | "Author";
}

export default function ReviewForm({ id, type }: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const [addReview, { loading }] = useMutation(ADD_REVIEW, {
    refetchQueries: [{ query: GET_BOOK, variables: { id } }],
    onCompleted: () => {
      setRating(0);
      setComment("");
    },
    onError: (error) => {
      alert("Error adding review: " + error.message);
    },
  });

  const [addBookReview] = useMutation(ADD_AUTHOR_REVIEW, {
    refetchQueries: [{ query: GET_AUTHOR, variables: { id } }],
    onCompleted: () => {
      setRating(0);
      setComment("");
    },
    onError: (error) => {
      alert("Error adding review: " + error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      if (type === "Book") {
        await addReview({
          variables: {
            input: {
              book_id: id,
              rating,
              comment: comment.trim() || null,
            },
          },
        });
      } else {
        await addBookReview({
          variables: {
            input: {
              author_id: id,
              rating,
              comment: comment.trim() || null,
            },
          },
        });
      }
    } catch (error) {
      console.error("Review submission error:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Add Your Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comment (optional)
          </label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts about this book..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" />
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
