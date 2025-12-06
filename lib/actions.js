'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from "./db"
import { revalidatePath } from "next/cache"

// Book Actions
export async function getBooks(search = '') {
  try {
    let query = 'SELECT * FROM books'
    let params = []
    
    if (search) {
      query += ' WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?'
      const searchTerm = `%${search}%`
      params = [searchTerm, searchTerm, searchTerm]
    }
    
    query += ' ORDER BY title'
    const [books] = await pool.query(query, params)
    return { success: true, data: books }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getBookById(id) {
  try {
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [id])
    if (books.length === 0) {
      return { success: false, error: 'Book not found' }
    }
    return { success: true, data: books[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function createBook(formData) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const title = formData.get('title')
    const author = formData.get('author')
    const isbn = formData.get('isbn')
    const stock = parseInt(formData.get('stock'))
    const image = formData.get('image') || null

    if (!title || !author || !isbn || !stock) {
      return { success: false, error: 'All fields are required' }
    }

    const [result] = await pool.query(
      'INSERT INTO books (title, author, isbn, stock, available, image) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, stock, stock, image]
    )

    revalidatePath('/admin/books')
    revalidatePath('/books')
    return { success: true, data: { id: result.insertId } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateBook(id, formData) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const title = formData.get('title')
    const author = formData.get('author')
    const isbn = formData.get('isbn')
    const stock = parseInt(formData.get('stock'))
    const image = formData.get('image') || null

    if (!title || !author || !isbn || !stock) {
      return { success: false, error: 'All fields are required' }
    }

    // Get current book to calculate available
    const [currentBook] = await pool.query('SELECT stock, available FROM books WHERE id = ?', [id])
    if (currentBook.length === 0) {
      return { success: false, error: 'Book not found' }
    }

    const currentStock = currentBook[0].stock
    const currentAvailable = currentBook[0].available
    const stockDiff = stock - currentStock
    const newAvailable = Math.max(0, currentAvailable + stockDiff)

    await pool.query(
      'UPDATE books SET title = ?, author = ?, isbn = ?, stock = ?, available = ?, image = ? WHERE id = ?',
      [title, author, isbn, stock, newAvailable, image, id]
    )

    revalidatePath('/admin/books')
    revalidatePath(`/books/${id}`)
    revalidatePath('/books')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteBook(id) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await pool.query('DELETE FROM books WHERE id = ?', [id])
    revalidatePath('/admin/books')
    revalidatePath('/books')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Borrow Actions
export async function borrowBook(bookId) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if book exists and is available
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [bookId])
    if (books.length === 0) {
      return { success: false, error: 'Book not found' }
    }

    const book = books[0]
    if (book.available <= 0) {
      return { success: false, error: 'Book is not available' }
    }

    // Check if user already has an active borrow for this book
    const [activeBorrows] = await pool.query(
      'SELECT * FROM borrows WHERE user_id = ? AND book_id = ? AND status IN (?, ?)',
      [session.user.id, bookId, 'borrowed', 'overdue']
    )

    if (activeBorrows.length > 0) {
      return { success: false, error: 'You already have an active borrow for this book' }
    }

    // Check max 3 active borrows (optional)
    const [allActiveBorrows] = await pool.query(
      'SELECT COUNT(*) as count FROM borrows WHERE user_id = ? AND status IN (?, ?)',
      [session.user.id, 'borrowed', 'overdue']
    )

    if (allActiveBorrows[0].count >= 3) {
      return { success: false, error: 'Maximum 3 active borrows allowed' }
    }

    // Create borrow record
    const borrowDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7) // 7 days

    await pool.query(
      'INSERT INTO borrows (user_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [session.user.id, bookId, borrowDate, dueDate, 'borrowed']
    )

    // Update available count
    await pool.query('UPDATE books SET available = available - 1 WHERE id = ?', [bookId])

    revalidatePath('/dashboard')
    revalidatePath('/borrows')
    revalidatePath(`/books/${bookId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function returnBook(borrowId) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get borrow record
    const [borrows] = await pool.query(
      'SELECT * FROM borrows WHERE id = ?',
      [borrowId]
    )

    if (borrows.length === 0) {
      return { success: false, error: 'Borrow record not found' }
    }

    const borrow = borrows[0]

    // Check if user owns this borrow or is admin
    if (session.user.role !== 'admin' && borrow.user_id !== session.user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (borrow.status === 'returned') {
      return { success: false, error: 'Book already returned' }
    }

    // Update borrow status
    const returnDate = new Date()
    await pool.query(
      'UPDATE borrows SET status = ?, return_date = ? WHERE id = ?',
      ['returned', returnDate, borrowId]
    )

    // Update available count
    await pool.query('UPDATE books SET available = available + 1 WHERE id = ?', [borrow.book_id])

    revalidatePath('/dashboard')
    revalidatePath('/borrows')
    revalidatePath('/admin/borrows')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getBorrows() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, 
             bk.title as book_title, bk.author as book_author, bk.image as book_image
      FROM borrows b
      JOIN users u ON b.user_id = u.id
      JOIN books bk ON b.book_id = bk.id
    `

    if (session.user.role !== 'admin') {
      query += ' WHERE b.user_id = ?'
      const [borrows] = await pool.query(query + ' ORDER BY b.created_at DESC', [session.user.id])
      return { success: true, data: borrows }
    } else {
      const [borrows] = await pool.query(query + ' ORDER BY b.created_at DESC')
      return { success: true, data: borrows }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateBorrowStatus(borrowId, status) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await pool.query('UPDATE borrows SET status = ? WHERE id = ?', [status, borrowId])
    revalidatePath('/admin/borrows')
    revalidatePath('/borrows')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Auto update overdue status
export async function updateOverdueStatus() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    await pool.query(
      'UPDATE borrows SET status = ? WHERE status = ? AND due_date < ? AND return_date IS NULL',
      ['overdue', 'borrowed', today]
    )
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

