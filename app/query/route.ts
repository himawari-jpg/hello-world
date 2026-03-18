import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function listInvoices() {
 	const data = await sql`
     SELECT invoices.amount, customers.name
     FROM invoices
     JOIN customers ON invoices.customer_id = customers.id
          WHERE invoices.amount = 666;
   `;

	return data;
 }

export async function GET() {
   try {
   	const data = await listInvoices();
   	return NextResponse.json(data);
   } catch (error) {
   	return NextResponse.json({ error }, { status: 500 });
   }
}
