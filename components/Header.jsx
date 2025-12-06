"use client";

import { signOut, useSession } from 'next-auth/react';
import { BookOpen } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              Perpustakaan Digital
            </h1>
            <p className="text-xs text-indigo-100">
              Sistem peminjaman buku sederhana
            </p>
          </div>
        </div>
        {session && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-indigo-100">
              Selamat datang,&nbsp;
              <strong>{session.user?.name}</strong>
              {session.user?.role && ` (${session.user.role})`}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-white text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}