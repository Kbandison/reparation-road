import React from "react";
import { books } from "@/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  // Assume user is logged in for now
  const isLoggedIn = true;

  const freeBooks = books.filter((book) => book.isFree);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div
        className="relative h-[300px] md:h-[400px] flex items-center justify-center bg-cover bg-center rounded-lg"
        style={{
          backgroundImage:
            "url('/20250626_0830_Vintage Desk Legacy_simple_compose_01jyp3brxdfdtbe2693rmngbcx.png')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
        <div className="relative z-10 text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Find Your Next Read
          </h1>
          <p className="text-lg md:text-xl mt-4">
            Search for books by title or author.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 focus:ring-[var(--color-brand-green)]">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full max-w-md text-black"
            />
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-12">
        {/* Main Content */}
        <main className="w-full md:w-3/4">
          <h2 className="text-3xl font-bold mb-6">Free Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {freeBooks.map((book) => (
              <div
                key={book.id}
                className="border rounded-lg p-4 flex flex-col"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold">{book.title}</h3>
                <p className="text-gray-600">by {book.author}</p>
                <p className="mt-2 flex-grow">{book.description}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        {isLoggedIn && (
          <aside className="w-full md:w-1/4">
            <div className="sticky top-8 border rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">All Books</h2>
              <div className="space-y-4">
                {books.map((book) => (
                  <div key={book.id}>
                    <div>
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
