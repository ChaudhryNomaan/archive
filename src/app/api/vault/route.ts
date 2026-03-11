import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/vault.json');
// This is where the images will be stored so the browser can see them
const UPLOAD_DIR = path.join(process.cwd(), 'public/images');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) return NextResponse.json([]);
    const fileData = fs.readFileSync(DATA_PATH, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;

    // --- NEW: PHYSICAL FILE UPLOAD LOGIC ---
    const files = formData.getAll('file') as File[];
    
    // Ensure the public/images folder exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(UPLOAD_DIR, file.name);
      
      // Physically save the file to public/images/
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved file to: ${filePath}`);
    }
    // ---------------------------------------

    const newItem = {
      id,
      name: formData.get('name'),
      sku: formData.get('sku'),
      price: formData.get('price'),
      originalPrice: formData.get('originalPrice'),
      size: formData.get('size'),
      category: formData.get('category'),
      subCategory: formData.get('subCategory'),
      media: JSON.parse(formData.get('media') as string || "[]")
    };

    let vault = [];
    if (fs.existsSync(DATA_PATH)) {
      vault = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    }

    const index = vault.findIndex((item: any) => item.id === id);
    if (index > -1) {
      vault[index] = newItem;
    } else {
      vault.push(newItem);
    }

    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(DATA_PATH, JSON.stringify(vault, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}