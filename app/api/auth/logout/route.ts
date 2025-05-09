import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookie = await cookies()
  cookie.set({
    name: 'auth_token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return NextResponse.json({ message: 'Logged out successfully' });
}