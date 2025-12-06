"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function BookList() {
  const { data: session } = useSession();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setBooks(data);
        } else {
          console.error('Unexpected books response JSON:', data);
          setBooks([]);
        }
      } catch {
        console.error('Non-JSON response from /api/books:', text);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      const res = await fetch('/api/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId }),
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        // response bukan JSON (mungkin HTML error page)
      }

      if (!res.ok) {
        alert((data && data.error) || 'Gagal meminjam buku (Unauthorized / server error)');
        return;
      }

      alert((data && data.message) || 'Buku berhasil dipinjam!');
      fetchBooks();
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Terjadi kesalahan');
    }
  };

  const filteredBooks = Array.isArray(books) ? books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Katalog Buku</h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari judul buku atau penulis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{book.title}</h3>
            <p className="text-gray-600 text-sm">{book.author}</p>
            <p className="text-gray-500 text-xs mt-1">ISBN: {book.isbn}</p>
            
            <div className="mt-4 mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Stok: {book.stock}</span>
              <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                book.available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                Tersedia: {book.available}
              </span>
            </div>

            {session && (
              <button
                onClick={() => handleBorrow(book.id)}
                disabled={book.available === 0}
                className={`w-full py-2 rounded-lg transition ${
                  book.available > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {book.available > 0 ? 'Pinjam Buku' : 'Tidak Tersedia'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
