import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/callback',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    
    if (!tokens.refresh_token) {
      return NextResponse.json({
        error: 'No refresh token received. Try revoking app permissions in your Google account and try again.',
        tokens: tokens
      }, { status: 400 });
    }

    // Return the tokens for manual copying
    return NextResponse.json({
      success: true,
      message: 'OAuth completed successfully! Copy the refresh token below:',
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      instructions: [
        '1. Copy the refresh_token value below',
        '2. Update your .env.local file with: GOOGLE_REFRESH_TOKEN=<the token>',
        '3. Restart your development server',
        '4. Your gallery should now work!'
      ]
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Token exchange failed', details: String(error) },
      { status: 500 }
    );
  }
}