"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { BookOpen, Calendar, AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { returnBook } from "@/lib/actions"
import Image from "next/image"

export default function BorrowsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchBorrows()
    }
  }, [status])

  const fetchBorrows = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/borrows")
      if (response.ok) {
        const data = await response.json()
        setBorrows(data)
      }
    } catch (error) {
      console.error("Error fetching borrows:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (borrowId) => {
    setReturning({ ...returning, [borrowId]: true })

    try {
      const result = await returnBook(borrowId)
      if (result.success) {
        await fetchBorrows()
      } else {
        alert(result.error || "Gagal mengembalikan buku")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengembalikan buku")
    } finally {
      setReturning({ ...returning, [borrowId]: false })
    }
  }

  const getStatusBadge = (borrow) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(borrow.due_date)
    dueDate.setHours(0, 0, 0, 0)

    if (borrow.status === "returned") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Dikembalikan
        </span>
      )
    }

    if (borrow.status === "overdue" || (borrow.status === "borrowed" && dueDate < today)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
          Terlambat
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3" />
        Dipinjam
      </span>
    )
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

  const activeBorrows = borrows.filter(b => b.status === "borrowed" || b.status === "overdue")
  const returnedBorrows = borrows.filter(b => b.status === "returned")

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Peminjaman Saya</h1>
          <p className="text-gray-500">Lihat semua riwayat peminjaman Anda</p>
        </div>

        {activeBorrows.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Peminjaman Aktif</h2>
            <div className="grid gap-4 mb-8">
              {activeBorrows.map((borrow) => (
                <Card key={borrow.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-24 h-32 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {borrow.book_image ? (
                          <Image
                            src={borrow.book_image.startsWith('/') ? borrow.book_image : `/books/${borrow.book_image}`}
                            alt={borrow.book_title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold">{borrow.book_title}</h3>
                            <p className="text-gray-500">{borrow.book_author}</p>
                          </div>
                          {getStatusBadge(borrow)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tanggal Pinjam:</span>
                            <p className="font-medium">
                              {new Date(borrow.borrow_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Batas Pengembalian:</span>
                            <p className="font-medium">
                              {new Date(borrow.due_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button
                            onClick={() => handleReturn(borrow.id)}
                            disabled={returning[borrow.id]}
                            variant="default"
                          >
                            {returning[borrow.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Memproses...
                              </>
                            ) : (
                              "Kembalikan Buku"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {returnedBorrows.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Riwayat Peminjaman</h2>
            <div className="grid gap-4">
              {returnedBorrows.map((borrow) => (
                <Card key={borrow.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-24 h-32 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {borrow.book_image ? (
                          <Image
                            src={borrow.book_image.startsWith('/') ? borrow.book_image : `/books/${borrow.book_image}`}
                            alt={borrow.book_title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold">{borrow.book_title}</h3>
                            <p className="text-gray-500">{borrow.book_author}</p>
                          </div>
                          {getStatusBadge(borrow)}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tanggal Pinjam:</span>
                            <p className="font-medium">
                              {new Date(borrow.borrow_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tanggal Kembali:</span>
                            <p className="font-medium">
                              {borrow.return_date ? new Date(borrow.return_date).toLocaleDateString('id-ID') : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Batas Pengembalian:</span>
                            <p className="font-medium">
                              {new Date(borrow.due_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {borrows.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Belum ada peminjaman</p>
              <p className="text-gray-500 mb-4">Mulai pinjam buku dari katalog</p>
              <Link href="/books">
                <Button>Lihat Katalog Buku</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

