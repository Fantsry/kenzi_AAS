"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, User, LogOut, LayoutDashboard, Book, Settings } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-lg">Perpustakaan Digital</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="sm">
              <Book className="h-4 w-4 mr-2" />
              Katalog
            </Button>
          </Link>

          {session.user.role === 'admin' && (
            <>
              <Link href="/admin/books">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Kelola Buku
                </Button>
              </Link>
              <Link href="/admin/borrows">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Transaksi
                </Button>
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                {session.user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{session.user.name}</div>
                <div className="text-xs text-muted-foreground">{session.user.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Role: {session.user.role === 'admin' ? 'Admin' : 'User'}
                </div>
              </div>
              <DropdownMenuSeparator />
              <Link href="/dashboard">
                <DropdownMenuItem>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/borrows">
                <DropdownMenuItem>
                  <Book className="h-4 w-4 mr-2" />
                  Peminjaman Saya
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}

