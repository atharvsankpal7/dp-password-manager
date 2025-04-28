import { NextResponse } from 'next/server';
import { seedAdmin } from '@/lib/seed';

export async function GET() {
  try {
    await seedAdmin();
    return NextResponse.json({ message: 'Admin user seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { message: 'Failed to seed admin user' },
      { status: 500 }
    );
  }
}