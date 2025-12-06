"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/Navbar"
import { Search, BookOpen, User, Calendar } from "lucide-react"
import Image from "next/image"

export default function BooksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchBooks()
    }
  }, [status, search])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/books?search=${encodeURIComponent(search)}`)
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Katalog Buku</h1>
          <p className="text-gray-500">Temukan buku yang Anda cari</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Cari buku berdasarkan judul, penulis, atau ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat buku...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Tidak ada buku ditemukan</p>
            <p className="text-gray-500">Coba ubah kata kunci pencarian Anda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-[3/4] relative mb-4 bg-muted rounded-lg overflow-hidden">
                    {book.image ? (
                      <Image
                        src={book.image.startsWith('/') ? book.image : `/books/${book.image}`}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {book.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">ISBN: </span>
                      <span className="font-mono">{book.isbn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Stok:</span>
                      <span className="font-medium">{book.stock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tersedia:</span>
                      <span className={`font-medium ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.available}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/books/${book.id}`} className="w-full">
                    <Button className="w-full" variant={book.available > 0 ? "default" : "secondary"}>
                      {book.available > 0 ? "Lihat Detail" : "Tidak Tersedia"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

