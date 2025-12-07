import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import JSZip from 'jszip';
import { getAuthSession } from '@/lib/auth';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const { data, mapping } = await request.json();
    const zip = new JSZip();

    for (const row of data) {
      const memoData = {
        customerName: row[mapping['Customer Name']],
        customerMobile: row[mapping['Mobile']],
        customerAddress: row[mapping['Address']],
        products: [{
          name: row[mapping['Product Name']],
          quantity: parseInt(row[mapping['Quantity']]),
          price: parseFloat(row[mapping['Price']]),
        }],
        // ... calculate totals etc.
      };

      const htmlContent = `
        <html>
          <body>
            <h1>Memo for ${memoData.customerName}</h1>
            <p>Mobile: ${memoData.customerMobile}</p>
            <p>Address: ${memoData.customerAddress}</p>
            <h2>Products</h2>
            <ul>
              ${memoData.products.map(p => `<li>${p.name} - ${p.quantity} x ${p.price}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const imageBuffer = await page.screenshot();
      await browser.close();

      zip.file(`${memoData.customerName}.png`, imageBuffer);
    }

    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="memos.zip"',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to generate memos' }, { status: 500 });
  }
}
