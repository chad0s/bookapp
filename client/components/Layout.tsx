"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Book, Users, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { ME } from "@/lib/graphql/queries";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { data, loading } = useQuery(ME);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router, loading]);

  useEffect(() => {
    console.log("user data : ", data);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // Don't show layout on auth pages
  if (pathname.startsWith("/auth") && !pathname.startsWith("/author")) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                BookStore
              </Link>
            </div>

            <div className="flex items-center space-x-8">
              <Link
                href="/books"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive("/books")
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Book className="w-4 h-4 mr-1" />
                Books
              </Link>

              <Link
                href="/authors"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive("/authors")
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4 mr-1" />
                Authors
              </Link>

              <div className="flex items-center space-x-2">
                <Link
                  href="/books/create"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Book
                </Link>

                <Link
                  href="/authors/create"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Author
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="w-4 h-4 mr-1" />
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
