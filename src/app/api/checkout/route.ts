import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderDataRaw = formData.get('orderData') as string;
    const orderData = JSON.parse(orderDataRaw);

    // Convert file to buffer for email attachment
    const buffer = Buffer.from(await file.arrayBuffer());

    // Send the email to yourself
    await resend.emails.send({
      from: 'Velos Archive <orders@yourdomain.com>',
      to: 'your-email@example.com', // PUT YOUR EMAIL HERE
      subject: `NEW ORDER // ${orderData.customer.name.toUpperCase()}`,
      html: `
        <h1>NEW ARCHIVE TRANSACTION</h1>
        <p><strong>Customer:</strong> ${orderData.customer.name}</p>
        <p><strong>Email:</strong> ${orderData.customer.email}</p>
        <p><strong>Address:</strong> ${orderData.customer.address}, ${orderData.customer.city}</p>
        <hr />
        <h3>ITEMS:</h3>
        <ul>
          ${orderData.items.map((item: any) => `<li>${item.name} - €${item.price}</li>`).join('')}
        </ul>
        <p><strong>TOTAL: €${orderData.total.toFixed(2)}</strong></p>
      `,
      attachments: [
        {
          filename: file.name,
          content: buffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}