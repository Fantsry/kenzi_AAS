"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Navbar from "@/components/Navbar"
import { MoreVertical, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Image from "next/image"

export default function AdminBorrowsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
        return
      }
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

  const handleStatusChange = async (borrowId, newStatus) => {
    try {
      const response = await fetch(`/api/borrows/${borrowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBorrows()
      } else {
        alert("Gagal mengubah status")
      }
    } catch (error) {
      alert("Terjadi kesalahan")
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

  const filteredBorrows = borrows.filter((borrow) => {
    if (filter === "all") return true
    if (filter === "active") return borrow.status === "borrowed" || borrow.status === "overdue"
    return borrow.status === filter
  })

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kelola Transaksi Peminjaman</h1>
          <p className="text-gray-500">Lihat dan kelola semua transaksi peminjaman</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Semua
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Aktif
          </Button>
          <Button
            variant={filter === "borrowed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("borrowed")}
          >
            Dipinjam
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("overdue")}
          >
            Terlambat
          </Button>
          <Button
            variant={filter === "returned" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("returned")}
          >
            Dikembalikan
          </Button>
        </div>

        {filteredBorrows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium">Tidak ada transaksi</p>
              <p className="text-gray-500">Tidak ada transaksi dengan filter yang dipilih</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBorrows.map((borrow) => (
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
                          <Clock className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{borrow.book_title}</h3>
                          <p className="text-gray-500">{borrow.book_author}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Peminjam: <strong>{borrow.user_name}</strong> ({borrow.user_email})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(borrow)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {borrow.status !== "returned" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(borrow.id, "returned")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Set Dikembalikan
                                </DropdownMenuItem>
                              )}
                              {borrow.status !== "overdue" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(borrow.id, "overdue")}
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Set Terlambat
                                </DropdownMenuItem>
                              )}
                              {borrow.status !== "borrowed" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(borrow.id, "borrowed")}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Set Dipinjam
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
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
                        <div>
                          <span className="text-gray-500">Tanggal Kembali:</span>
                          <p className="font-medium">
                            {borrow.return_date
                              ? new Date(borrow.return_date).toLocaleDateString('id-ID')
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

