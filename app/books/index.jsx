import pool from '../../../lib/db';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const [books] = await pool.query('SELECT * FROM books ORDER BY title');
      return res.status(200).json(books);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    if (session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { title, author, isbn, stock } = req.body;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO books (title, author, isbn, stock, available) VALUES (?, ?, ?, ?, ?)',
        [title, author, isbn, stock, stock]
      );
      
      return res.status(201).json({ id: result.insertId, message: 'Book created' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}