"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { BookOpen, User, Calendar, ArrowLeft, AlertCircle } from "lucide-react"
import Image from "next/image"
import { borrowBook } from "@/lib/actions"

export default function BookDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchBook()
    }
  }, [status, params.id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/books/${params.id}`)
      if (!response.ok) {
        throw new Error("Book not found")
      }
      const data = await response.json()
      setBook(data)
    } catch (error) {
      console.error("Error fetching book:", error)
      setError("Buku tidak ditemukan")
    } finally {
      setLoading(false)
    }
  }

  const handleBorrow = async () => {
    if (!book || book.available <= 0) {
      setError("Buku tidak tersedia untuk dipinjam")
      return
    }

    setBorrowing(true)
    setError("")

    try {
      const result = await borrowBook(book.id)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Gagal meminjam buku")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat meminjam buku")
    } finally {
      setBorrowing(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/books">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Katalog
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!book) return null

  const canBorrow = book.available > 0

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link href="/books">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden">
                {book.image ? (
                  <Image
                    src={book.image.startsWith('/') ? book.image : `/books/${book.image}`}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-32 w-32 text-gray-500" />
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{book.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  {book.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">ISBN:</span>
                  <p className="font-mono text-lg">{book.isbn}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Stok Total:</span>
                    <p className="text-2xl font-bold">{book.stock}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tersedia:</span>
                    <p className={`text-2xl font-bold ${canBorrow ? 'text-green-600' : 'text-red-600'}`}>
                      {book.available}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {!canBorrow && (
                  <div className="p-4 bg-muted border rounded-lg">
                    <p className="text-sm text-gray-500">
                      Buku ini sedang tidak tersedia untuk dipinjam.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBorrow}
                  disabled={!canBorrow || borrowing}
                >
                  {borrowing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : canBorrow ? (
                    "Pinjam Buku"
                  ) : (
                    "Tidak Tersedia"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

