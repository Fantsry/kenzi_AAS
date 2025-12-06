"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import BookList from '../../components/BookList';
import BorrowList from '../../components/BorrowList';
import UserList from '../../components/UserList';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState('books');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('books')}
              className={`px-6 py-4 font-medium transition ${
                currentView === 'books'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Daftar Buku
            </button>
            <button
              onClick={() => setCurrentView('borrows')}
              className={`px-6 py-4 font-medium transition ${
                currentView === 'borrows'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Peminjaman
            </button>
            {session.user.role === 'admin' && (
              <button
                onClick={() => setCurrentView('users')}
                className={`px-6 py-4 font-medium transition ${
                  currentView === 'users'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Pengguna
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'books' && <BookList />}
        {currentView === 'borrows' && <BorrowList />}
        {currentView === 'users' && session.user.role === 'admin' && <UserList />}
      </main>
    </div>
  );
}
