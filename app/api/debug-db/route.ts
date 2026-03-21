import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  try {
    const url = process.env.POSTGRES_URL;
    if (!url) {
      return NextResponse.json({ error: 'POSTGRES_URL is not set' }, { status: 500 });
    }
    const sql = postgres(url, { ssl: 'require', connect_timeout: 10 });
    const result = await sql`SELECT COUNT(*) as count FROM invoices`;
    await sql.end();
    return NextResponse.json({ success: true, count: result[0].count });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
