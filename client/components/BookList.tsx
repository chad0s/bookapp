"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_BOOKS, GET_AUTHORS } from "@/lib/graphql/queries";
import BookCard from "./BookCard";
import Pagination from "./Pagination";
import { Search, Filter, Calendar, User, ChevronDown } from "lucide-react";

interface Author {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: Author;
  published_date: string;
}

interface BookListProps {
  showActions?: boolean;
}

export default function BookList({ showActions = false }: BookListProps) {
  const [page, setPage] = useState(1);
  const [searchTitle, setSearchTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [debouncedAuthorSearch, setDebouncedAuthorSearch] = useState("");
  const [selectedAuthorName, setSelectedAuthorName] = useState("All Authors");
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const [publishedAfter, setPublishedAfter] = useState("");
  const [publishedBefore, setPublishedBefore] = useState("");
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    author_id: "",
    published_after: "",
    published_before: "",
  });
  const [dateError, setDateError] = useState("");

  const currentDate = new Date("2025-06-10");
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

  // Fetch authors with stable configuration
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

  const { data, loading, error, refetch } = useQuery(GET_BOOKS, {
    variables: {
      page,
      limit: 12,
      filter: {
        title: searchQuery.title || undefined,
        author_id: searchQuery.author_id
          ? parseInt(searchQuery.author_id)
          : undefined,
        published_after: searchQuery.published_after || undefined,
        published_before: searchQuery.published_before || undefined,
      },
    },
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });

  // Debounce author search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedAuthorSearch(authorSearch);
    }, 500); // Increased debounce time

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

  const validateDates = useCallback(() => {
    if (!publishedAfter && !publishedBefore) {
      setDateError("");
      return true;
    }

    const publishedAfterDate = publishedAfter ? new Date(publishedAfter) : null;
    const publishedBeforeDate = publishedBefore
      ? new Date(publishedBefore)
      : null;

    if (publishedAfterDate && publishedAfterDate > currentDate) {
      setDateError("Published After date cannot be in the future.");
      return false;
    }
    if (publishedBeforeDate && publishedBeforeDate > currentDate) {
      setDateError("Published Before date cannot be in the future.");
      return false;
    }

    if (publishedAfterDate && publishedBeforeDate) {
      if (publishedBeforeDate <= publishedAfterDate) {
        setDateError(
          "Published Before date must be greater than Published After date."
        );
        return false;
      }
    }

    setDateError("");
    return true;
  }, [publishedAfter, publishedBefore, currentDate]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateDates()) return;

      setSearchQuery({
        title: searchTitle,
        author_id: authorId,
        published_after: publishedAfter,
        published_before: publishedBefore,
      });
      setPage(1);
    },
    [searchTitle, authorId, publishedAfter, publishedBefore, validateDates]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTitle("");
    setAuthorId("");
    setAuthorSearch("");
    setDebouncedAuthorSearch("");
    setSelectedAuthorName("All Authors");
    setPublishedAfter("");
    setPublishedBefore("");
    setSearchQuery({
      title: "",
      author_id: "",
      published_after: "",
      published_before: "",
    });
    setDateError("");
    setPage(1);
  }, []);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDateChange = useCallback(
    (setter: (value: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        // Don't call validateDates immediately to prevent re-renders
      },
    []
  );

  const handleAuthorSelect = useCallback((author: Author) => {
    setAuthorId(author.id);
    setSelectedAuthorName(author.name);
    setAuthorSearch("");
    setIsAuthorDropdownOpen(false);
  }, []);

  const handleClearAuthor = useCallback(() => {
    setAuthorId("");
    setSelectedAuthorName("All Authors");
    setAuthorSearch("");
    setIsAuthorDropdownOpen(false);
  }, []);

  // Stable input change handler that preserves focus
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

  // Memoize authors list to prevent unnecessary re-renders
  const authors = useMemo(() => {
    return authorsData?.authors?.authors || [];
  }, [authorsData?.authors?.authors]);

  // Check if we're fetching new author data
  const isLoadingAuthors =
    authorsLoading && (!authorsData || networkStatus === 1);

  // Memoize filtered authors for display
  const filteredAuthors = useMemo(() => {
    if (!authorSearch) return authors;
    return authors.filter((author: Author) =>
      author.name.toLowerCase().includes(authorSearch.toLowerCase())
    );
  }, [authors, authorSearch]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading books: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const books = data?.books?.books || [];
  const totalPages = data?.books?.totalPages || 1;
  const isFilterActive =
    searchQuery.title ||
    searchQuery.author_id ||
    searchQuery.published_after ||
    searchQuery.published_before;
  const isSearchDisabled = !!dateError;

  return (
    <div>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="searchTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search by Title
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="searchTitle"
                  type="text"
                  placeholder="Enter book title..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 relative" ref={dropdownRef}>
              <label
                htmlFor="authorSearch"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Author
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="authorSearch"
                  type="text"
                  placeholder="Search authors..."
                  value={authorSearch}
                  ref={inputRef}
                  onChange={handleAuthorSearchChange}
                  onFocus={handleInputFocus}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {isAuthorDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <ul>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={handleClearAuthor}
                    >
                      <span>All Authors</span>
                      {selectedAuthorName === "All Authors" && (
                        <span className="text-blue-600 font-semibold">✓</span>
                      )}
                    </li>
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
                      <li className="px-4 py-2 text-gray-500">
                        No authors found
                      </li>
                    ) : (
                      filteredAuthors.map((author: Author) => (
                        <li
                          key={author.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => handleAuthorSelect(author)}
                        >
                          <span>{author.name}</span>
                          {author.id === authorId && (
                            <span className="text-blue-600 font-semibold">
                              ✓
                            </span>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
              {selectedAuthorName !== "All Authors" && (
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
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="publishedAfter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Published After
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="publishedAfter"
                  type="date"
                  value={publishedAfter}
                  onChange={handleDateChange(setPublishedAfter)}
                  onBlur={validateDates}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label
                htmlFor="publishedBefore"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Published Before
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="publishedBefore"
                  type="date"
                  value={publishedBefore}
                  onChange={handleDateChange(setPublishedBefore)}
                  onBlur={validateDates}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          {dateError && (
            <p className="text-red-600 text-sm mt-2">{dateError}</p>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSearchDisabled}
              className={`px-4 py-2 rounded-md flex items-center ${
                isSearchDisabled
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Search
            </button>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: Book) => (
              <BookCard
                key={book.id}
                book={book}
                showActions={showActions}
                onRefetch={handleRefetch}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
