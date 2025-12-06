import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';

export async function POST(request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Nama, email, dan password wajib diisi' },
      { status: 400 },
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user'],
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Registrasi berhasil, silakan login' },
      { status: 201 },
    );
  } catch (error) {
    // Duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar, silakan gunakan email lain' },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


