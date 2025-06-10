"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_BOOK, UPDATE_BOOK } from "@/lib/graphql/mutations";
import { GET_BOOK, GET_AUTHORS } from "@/lib/graphql/queries";
import { Save, ArrowLeft, User, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Author {
  id: string;
  name: string;
}

interface BookFormProps {
  bookId?: string;
  isEdit?: boolean;
}

export default function BookForm({ bookId, isEdit = false }: BookFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    published_date: "",
    author_id: "",
    cover_url: "",
  });
  const [errors, setErrors] = useState<any>({});

  // Author filter states
  const [authorSearch, setAuthorSearch] = useState("");
  const [debouncedAuthorSearch, setDebouncedAuthorSearch] = useState("");
  const [selectedAuthorName, setSelectedAuthorName] = useState("");
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize author query variables to prevent unnecessary re-renders
  const authorQueryVariables = useMemo(
    () => ({
      page: 1,
      limit: 100,
      filter: { name: debouncedAuthorSearch || undefined },
    }),
    [debouncedAuthorSearch]
  );

  const {
    data: authorsData,
    loading: authorsLoading,
    networkStatus,
  } = useQuery(GET_AUTHORS, {
    variables: authorQueryVariables,
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: true,
  });

  const { data: bookData, loading: bookLoading } = useQuery(GET_BOOK, {
    variables: { id: bookId },
    skip: !isEdit || !bookId,
  });

  const [createBook, { loading: creating }] = useMutation(CREATE_BOOK, {
    onCompleted: () => {
      router.push("/books");
    },
    onError: (error) => {
      console.error("Create error:", error);
      setErrors({ submit: error.message });
    },
  });

  const [updateBook, { loading: updating }] = useMutation(UPDATE_BOOK, {
    onCompleted: () => {
      router.push("/books");
    },
    onError: (error) => {
      console.error("Update error:", error);
      setErrors({ submit: error.message });
    },
  });

  // Debounce author search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedAuthorSearch(authorSearch);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [authorSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAuthorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load book data for editing
  useEffect(() => {
    if (isEdit && bookData?.book) {
      const book = bookData.book;
      setFormData({
        title: book.title || "",
        description: book.description || "",
        published_date: book.published_date
          ? book.published_date.split("T")[0]
          : "",
        author_id: book.author.id || "",
        cover_url: book.cover_url || "",
      });
      setSelectedAuthorName(book.author.name || "");
    }
  }, [bookData, isEdit]);

  // Memoize authors list to prevent unnecessary re-renders
  const authors = useMemo(() => {
    return authorsData?.authors?.authors || [];
  }, [authorsData?.authors?.authors]);

  // Check if we're loading authors
  const isLoadingAuthors =
    authorsLoading && (!authorsData || networkStatus === 1);

  // Memoize filtered authors for display
  const filteredAuthors = useMemo(() => {
    if (!authorSearch) return authors;
    return authors.filter((author: Author) =>
      author.name.toLowerCase().includes(authorSearch.toLowerCase())
    );
  }, [authors, authorSearch]);

  const handleAuthorSelect = useCallback((author: Author) => {
    setFormData((prev) => ({ ...prev, author_id: author.id }));
    setSelectedAuthorName(author.name);
    setAuthorSearch("");
    setIsAuthorDropdownOpen(false);
    setErrors((prev: any) => ({ ...prev, author_id: undefined }));
  }, []);

  const handleClearAuthor = useCallback(() => {
    setFormData((prev) => ({ ...prev, author_id: "" }));
    setSelectedAuthorName("");
    setAuthorSearch("");
    setIsAuthorDropdownOpen(false);
  }, []);

  const handleAuthorSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAuthorSearch(value);
      if (!isAuthorDropdownOpen) {
        setIsAuthorDropdownOpen(true);
      }
    },
    [isAuthorDropdownOpen]
  );

  const handleInputFocus = useCallback(() => {
    setIsAuthorDropdownOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: any = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.author_id) newErrors.author_id = "Author is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const input = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      published_date: formData.published_date || null,
      author_id: formData.author_id,
      cover_url: formData.cover_url.trim() || null,
    };

    try {
      if (isEdit && bookId) {
        await updateBook({ variables: { id: bookId, input } });
      } else {
        await createBook({ variables: { input } });
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if ((authorsLoading && !authorsData) || (isEdit && bookLoading)) {
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
          href="/books"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Books
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? "Edit Book" : "Create New Book"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter book title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div className="mb-4 relative" ref={dropdownRef}>
          <label
            htmlFor="authorSearch"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Author *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="authorSearch"
              type="text"
              placeholder="Search and select an author..."
              value={authorSearch}
              ref={inputRef}
              onChange={handleAuthorSearchChange}
              onFocus={handleInputFocus}
              className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.author_id ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {isAuthorDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <ul>
                {isLoadingAuthors ? (
                  <li className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-gray-500 text-sm">
                        Loading authors...
                      </span>
                    </div>
                  </li>
                ) : filteredAuthors.length === 0 ? (
                  <li className="px-4 py-2 text-gray-500">No authors found</li>
                ) : (
                  filteredAuthors.map((author: Author) => (
                    <li
                      key={author.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAuthorSelect(author)}
                    >
                      <span>{author.name}</span>
                      {author.id === formData.author_id && (
                        <span className="text-blue-600 font-semibold">✓</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {selectedAuthorName && (
            <div className="mt-1 text-sm text-gray-600">
              Selected: {selectedAuthorName}
              <button
                type="button"
                onClick={handleClearAuthor}
                className="ml-2 text-blue-600 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {errors.author_id && (
            <p className="mt-1 text-sm text-red-600">{errors.author_id}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter book description"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="published_date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Published Date
          </label>
          <input
            type="date"
            id="published_date"
            value={formData.published_date}
            onChange={(e) =>
              setFormData({ ...formData, published_date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="cover_url"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cover Image URL
          </label>
          <input
            type="url"
            id="cover_url"
            value={formData.cover_url}
            onChange={(e) =>
              setFormData({ ...formData, cover_url: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/books"
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
            {creating || updating ? "Saving..." : "Save Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
