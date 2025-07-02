import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env_check: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET', 
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? 'SET' : 'NOT SET',
      PORTRAITS_ALBUM_ID: process.env.PORTRAITS_ALBUM_ID ? 'SET' : 'NOT SET',
      LANDSCAPE_ALBUM_ID: process.env.LANDSCAPE_ALBUM_ID ? 'SET' : 'NOT SET',
    },
    actual_values: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      PORTRAITS_ALBUM_ID: process.env.PORTRAITS_ALBUM_ID?.substring(0, 20) + '...',
    }
  });
}