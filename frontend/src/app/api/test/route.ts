import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Environment check:');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
    console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'SET' : 'NOT SET');
    
    return NextResponse.json({
      status: 'ok',
      env: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
        GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? 'SET' : 'NOT SET',
        PORTRAITS_ALBUM_ID: process.env.PORTRAITS_ALBUM_ID ? 'SET' : 'NOT SET',
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    );
  }
}