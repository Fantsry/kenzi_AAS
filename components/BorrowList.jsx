"use client";

import { useState, useEffect } from 'react';

export default function BorrowList() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = async () => {
    try {
      const res = await fetch('/api/borrows');
      const data = await res.json();
      setBorrows(data);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      const res = await fetch(`/api/borrows/${borrowId}/return`, {
        method: 'PUT',
      });

      if (res.ok) {
        alert('Buku berhasil dikembalikan!');
        fetchBorrows();
      } else {
        alert('Gagal mengembalikan buku');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Peminjaman</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul Buku</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Pinjam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {borrows.map(borrow => (
              <tr key={borrow.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{borrow.book_title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{borrow.user_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(borrow.borrow_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(borrow.due_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    borrow.status === 'borrowed' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {borrow.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {borrow.status === 'borrowed' && (
                    <button
                      onClick={() => handleReturn(borrow.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Kembalikan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}