"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Navbar from "@/components/Navbar"
import { Plus, Edit, Trash2, BookOpen, Upload } from "lucide-react"
import Image from "next/image"

export default function AdminBooksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    stock: "",
    image: "",
  })

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
      fetchBooks()
    }
  }, [status])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/books")
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (book = null) => {
    if (book) {
      setEditingBook(book)
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        stock: book.stock.toString(),
        image: book.image || "",
      })
    } else {
      setEditingBook(null)
      setFormData({
        title: "",
        author: "",
        isbn: "",
        stock: "",
        image: "",
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books"
      const method = editingBook ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stock: parseInt(formData.stock),
        }),
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchBooks()
      } else {
        const error = await response.json()
        alert(error.error || "Gagal menyimpan buku")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan buku")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return

    try {
      const response = await fetch(`/api/books/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchBooks()
      } else {
        alert("Gagal menghapus buku")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus buku")
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, image: data.path })
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal mengupload gambar')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengupload gambar')
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Kelola Buku</h1>
            <p className="text-gray-500">Tambah, edit, atau hapus buku dari katalog</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Buku
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold">
                  {editingBook ? "Edit Buku" : "Tambah Buku Baru"}
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {editingBook ? "Ubah informasi buku yang ada" : "Isi form di bawah untuk menambahkan buku baru ke katalog"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                      Judul Buku <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masukkan judul buku"
                      className="h-11 text-base border-2 focus:border-slate-800"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="author" className="text-sm font-semibold text-gray-700">
                      Penulis <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Masukkan nama penulis"
                      className="h-11 text-base border-2 focus:border-slate-800"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="isbn" className="text-sm font-semibold text-gray-700">
                      ISBN <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="Masukkan nomor ISBN"
                      className="h-11 text-base border-2 focus:border-slate-800 font-mono"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                      Stok Awal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className="h-11 text-base border-2 focus:border-slate-800"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Jumlah buku yang tersedia di perpustakaan
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="image" className="text-sm font-semibold text-gray-700">
                      Gambar Buku
                    </Label>
                    <div className="space-y-3">
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="contoh: buku1.jpg atau /books/buku1.jpg"
                        className="h-11 text-base border-2 focus:border-slate-800"
                      />
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="flex-1">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm text-gray-700 hover:text-slate-800">
                              <Upload className="h-5 w-5" />
                              <span className="font-medium">Upload Gambar</span>
                            </div>
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        {formData.image && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ {formData.image.split('/').pop()}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Upload gambar atau masukkan path/nama file. Format: JPG, PNG, atau GIF
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6 pt-4 border-t gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="px-6"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    className="px-6 bg-slate-800 hover:bg-slate-900"
                  >
                    {editingBook ? "Update Buku" : "Tambah Buku"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {books.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Belum ada buku</p>
              <p className="text-gray-500 mb-4">Mulai dengan menambahkan buku pertama</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id}>
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
                  <CardDescription>{book.author}</CardDescription>
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
                      <span className="font-medium">{book.available}</span>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(book)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(book.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
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

