import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'src/lib/settings.json');
const uploadDir = path.join(process.cwd(), 'public/uploads');

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) return NextResponse.json({});
    const fileData = fs.readFileSync(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ error: "Load failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const videoFile = formData.get('videoFile') as File | null;
    const settingsRaw = formData.get('settings') as string;
    let settings = JSON.parse(settingsRaw);

    // 1. Handle Video Upload if a file exists
    if (videoFile && videoFile.size > 0) {
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      const fileName = `${Date.now()}-${videoFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      
      fs.writeFileSync(filePath, buffer);
      settings.menuVideo = `/uploads/${fileName}`; // Update path in JSON
    }

    // 2. Save Settings to JSON
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let currentSettings = {};
    if (fs.existsSync(settingsPath)) {
      currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    const updatedSettings = { ...currentSettings, ...settings };
    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}