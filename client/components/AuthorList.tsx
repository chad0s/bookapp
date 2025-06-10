"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_AUTHORS } from "@/lib/graphql/queries";
import AuthorCard from "./AuthorCard";
import Pagination from "./Pagination";
import { Search, Filter, Calendar } from "lucide-react";

interface AuthorListProps {
  showActions?: boolean;
}

export default function AuthorList({ showActions = false }: AuthorListProps) {
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [bornAfter, setBornAfter] = useState("");
  const [bornBefore, setBornBefore] = useState("");
  const [searchQuery, setSearchQuery] = useState({
    name: "",
    born_after: "",
    born_before: "",
  });
  const [dateError, setDateError] = useState("");

  const currentDate = new Date("2025-06-10"); // Current date: June 10, 2025

  const { data, loading, error, refetch } = useQuery(GET_AUTHORS, {
    variables: {
      page,
      limit: 12,
      filter: {
        name: searchQuery.name || undefined,
        born_after: searchQuery.born_after || undefined,
        born_before: searchQuery.born_before || undefined,
      },
    },
    fetchPolicy: "network-only",
  });

  const validateDates = () => {
    if (!bornAfter && !bornBefore) {
      setDateError("");
      return true; // No dates to validate
    }

    const bornAfterDate = bornAfter ? new Date(bornAfter) : null;
    const bornBeforeDate = bornBefore ? new Date(bornBefore) : null;

    // Check if dates are greater than the current date
    if (bornAfterDate && bornAfterDate > currentDate) {
      setDateError("Born After date cannot be in the future.");
      return false;
    }
    if (bornBeforeDate && bornBeforeDate > currentDate) {
      setDateError("Born Before date cannot be in the future.");
      return false;
    }

    // Check if both dates are filled and bornBefore is not greater than bornAfter
    if (bornAfterDate && bornBeforeDate) {
      if (bornBeforeDate <= bornAfterDate) {
        setDateError("Born Before date must be greater than Born After date.");
        return false;
      }
    }

    setDateError("");
    return true;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    setSearchQuery({
      name: searchName,
      born_after: bornAfter,
      born_before: bornBefore,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setBornAfter("");
    setBornBefore("");
    setSearchQuery({ name: "", born_after: "", born_before: "" });
    setDateError("");
    setPage(1);
  };

  const handleRefetch = () => {
    refetch();
  };

  // Validate dates whenever the inputs change
  const handleDateChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      validateDates();
    };

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
        <p className="text-red-600">Error loading authors: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const authors = data?.authors?.authors || [];
  const totalPages = data?.authors?.totalPages || 1;
  const isFilterActive =
    searchQuery.name || searchQuery.born_after || searchQuery.born_before;

  return (
    <div>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="searchName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search by Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="searchName"
                  type="text"
                  placeholder="Enter author name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label
                htmlFor="bornAfter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Born After
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="bornAfter"
                  type="date"
                  placeholder="Filter by Born After (YYYY-MM-DD)"
                  value={bornAfter}
                  onChange={handleDateChange(setBornAfter)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label
                htmlFor="bornBefore"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Born Before
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="bornBefore"
                  type="date"
                  placeholder="Filter by Born Before (YYYY-MM-DD)"
                  value={bornBefore}
                  onChange={handleDateChange(setBornBefore)}
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
              className={`px-4 py-2 rounded-md flex items-center bg-blue-600 text-white hover:bg-blue-700`}
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

      {authors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No authors found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author: any) => (
              <AuthorCard
                key={author.id}
                author={author}
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
