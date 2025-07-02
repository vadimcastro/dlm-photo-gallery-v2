#!/usr/bin/env python3

import urllib.parse
import webbrowser
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import json
import requests

# Google OAuth2 configuration
CLIENT_ID = "your_google_client_id"
CLIENT_SECRET = "your_google_client_secret"
REDIRECT_URI = "http://localhost:5000/api/auth/callback"
SCOPES = "https://www.googleapis.com/auth/photoslibrary.readonly"

class OAuthHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/auth/callback'):
            # Parse the authorization code
            query = urlparse(self.path).query
            params = parse_qs(query)
            
            if 'code' in params:
                code = params['code'][0]
                print(f"\n✅ Authorization code received: {code[:20]}...")
                
                # Exchange code for tokens
                token_data = {
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET,
                    'code': code,
                    'grant_type': 'authorization_code',
                    'redirect_uri': REDIRECT_URI,
                }
                
                try:
                    response = requests.post('https://oauth2.googleapis.com/token', data=token_data)
                    tokens = response.json()
                    
                    if 'refresh_token' in tokens:
                        print(f"\n🎉 SUCCESS! Your new refresh token is:")
                        print(f"GOOGLE_REFRESH_TOKEN={tokens['refresh_token']}")
                        print(f"\n📝 Copy this token to your frontend/.env.local file")
                        
                        self.send_response(200)
                        self.send_header('Content-type', 'text/html')
                        self.end_headers()
                        self.wfile.write(b'''
                        <html><body>
                        <h1>Success! OAuth Complete</h1>
                        <p>Check your terminal for the refresh token.</p>
                        <p>You can close this window.</p>
                        </body></html>
                        ''')
                    else:
                        print(f"\n❌ Error: No refresh token received")
                        print(f"Response: {tokens}")
                        self.send_response(400)
                        self.end_headers()
                        
                except Exception as e:
                    print(f"\n❌ Error exchanging code for token: {e}")
                    self.send_response(500)
                    self.end_headers()
            else:
                error = params.get('error', ['Unknown error'])[0]
                print(f"\n❌ OAuth error: {error}")
                self.send_response(400)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Suppress default logging

def main():
    print("🔑 Google Photos OAuth Token Generator")
    print("=====================================")
    
    # Build authorization URL
    params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': SCOPES,
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
    
    print(f"\n1. Starting local server on http://localhost:5000")
    print(f"2. Opening Google OAuth URL...")
    print(f"3. Please authorize the app in your browser")
    
    # Start local server
    PORT = 5000
    with socketserver.TCPServer(("", PORT), OAuthHandler) as httpd:
        print(f"\n🌐 Server running on http://localhost:{PORT}")
        
        # Open browser
        webbrowser.open(auth_url)
        
        print(f"\n📱 If browser didn't open, visit:")
        print(f"{auth_url}")
        
        print(f"\n⏳ Waiting for authorization...")
        
        # Handle one request
        httpd.handle_request()
        
        print(f"\n✅ Server stopped. Check output above for your refresh token!")

if __name__ == "__main__":
    main()