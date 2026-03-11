import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This ensures we find the file regardless of deployment environment
const configPath = path.join(process.cwd(), 'src/lib/site-config.json');

export async function GET() {
  try {
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ error: "Config file not found on disk" }, { status: 404 });
    }
    const fileData = fs.readFileSync(configPath, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}