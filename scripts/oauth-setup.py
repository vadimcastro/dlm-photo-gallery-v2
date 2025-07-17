#!/usr/bin/env python3
"""
Automatic Google Photos OAuth2 Token Generator with Server
"""

import http.server
import socketserver
import threading
import webbrowser
import time
import os
import sys
import requests
from urllib.parse import urlparse, parse_qs

# Google OAuth credentials - MUST be set via environment variables
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5000/api/auth/callback"
SCOPES = "https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary.sharing"

# Validate required environment variables
if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ Missing required environment variables:")
    print("   GOOGLE_CLIENT_ID - your Google OAuth client ID")
    print("   GOOGLE_CLIENT_SECRET - your Google OAuth client secret")
    print("\nPlease set these in your environment or .env file")
    sys.exit(1)

# Global variables for communication
auth_code = None
server_running = True

class OAuthHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code, server_running
        
        if self.path.startswith('/api/auth/callback'):
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            if 'code' in params:
                auth_code = params['code'][0]
                print(f"\n✅ Authorization code received!")
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                success_html = '''
                <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #4CAF50;">✅ Success!</h1>
                    <p>Authorization successful! You can close this window.</p>
                    <p>Returning to the terminal...</p>
                    <script>
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
                </html>
                '''
                self.wfile.write(success_html.encode('utf-8'))
                
                # Stop server after short delay
                threading.Timer(1.0, self.stop_server).start()
                
            else:
                # Error case
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                error_html = '''
                <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #f44336;">❌ Error</h1>
                    <p>Authorization failed. Please try again.</p>
                </body>
                </html>
                '''
                self.wfile.write(error_html.encode('utf-8'))
                
        else:
            self.send_response(404)
            self.end_headers()
    
    def stop_server(self):
        global server_running
        server_running = False
    
    def log_message(self, format, *args):
        # Suppress server logs
        pass

def update_env_file(file_path, key, value):
    """Update a specific key in the .env file"""
    lines = []
    updated = False
    
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            lines = f.readlines()
    
    # Update existing key
    for i, line in enumerate(lines):
        if line.strip().startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            updated = True
            break
    
    if not updated:
        lines.append(f"{key}={value}\n")
    
    with open(file_path, 'w') as f:
        f.writelines(lines)

def main():
    global auth_code, server_running
    
    print("🔑 Automatic Google Photos OAuth2 Token Generator")
    print("=" * 55)
    print("🔧 Enhanced for scope escalation (fixes 403 errors)")
    
    # First, kill any existing processes on port 5000
    print("\n🧹 Cleaning up port 5000...")
    os.system("lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null || echo 'Port 5000 is free'")
    time.sleep(1)
    
    # Build authorization URL with enhanced scopes
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPES}&"
        f"access_type=offline&"
        f"prompt=consent&"
        f"include_granted_scopes=true"
    )
    
    print("\n🚀 Starting OAuth flow...")
    print("📝 This will generate a token with ENHANCED SCOPES:")
    print("   ✅ photoslibrary.readonly")
    print("   ✅ photoslibrary.sharing")
    print("   ✅ This should fix 403 'insufficient scopes' errors")
    
    # Try multiple ports in case 5000 is still busy
    ports_to_try = [5000, 5001, 5002]
    server = None
    actual_port = None
    
    for port in ports_to_try:
        try:
            print(f"🌐 Trying to start server on port {port}...")
            server = socketserver.TCPServer(("", port), OAuthHandler)
            actual_port = port
            print(f"✅ Server started successfully on port {port}")
            break
        except OSError as e:
            if e.errno == 48:  # Port in use
                print(f"⚠️  Port {port} is busy, trying next...")
                continue
            else:
                raise e
    
    if server is None:
        print("❌ Could not start server on any port")
        sys.exit(1)
    
    # Update redirect URI if we're using a different port
    if actual_port != 5000:
        redirect_uri = f"http://localhost:{actual_port}/api/auth/callback"
        auth_url = auth_url.replace("localhost:5000", f"localhost:{actual_port}")
        print(f"🔄 Using port {actual_port} instead of 5000")
    else:
        redirect_uri = REDIRECT_URI
    
    # Start server in a separate thread
    try:
        server_thread = threading.Thread(target=server.serve_forever)
        server_thread.daemon = True
        server_thread.start()
        
        print(f"\n🌐 Callback server running on http://localhost:{actual_port}")
        print("🚀 Opening authorization URL in your browser...")
        webbrowser.open(auth_url)
        
        print("\n📝 What you should see:")
        print("   1. Google sign-in page")
        print("   2. Consent screen asking for Google Photos permissions")
        print("   3. Automatic redirect back to this application")
        print("   4. Success message in browser")
        
        print(f"\n⏳ Waiting for authorization (timeout: 120 seconds)...")
        
        # Wait for auth code or timeout
        timeout = 120  # 2 minutes
        start_time = time.time()
        
        while auth_code is None and server_running and (time.time() - start_time) < timeout:
            elapsed = int(time.time() - start_time)
            if elapsed % 10 == 0 and elapsed > 0:  # Show progress every 10 seconds
                print(f"   ⏱️  Still waiting... ({elapsed}s elapsed)")
            time.sleep(0.5)
        
        server.shutdown()
        
        if auth_code is None:
            print("❌ Authorization timed out or failed")
            print("💡 Troubleshooting:")
            print("   • Make sure you completed the consent flow in the browser")
            print("   • Check if any firewall is blocking localhost connections")
            print("   • Try running the script again")
            sys.exit(1)
        
        print("\n🔄 Exchanging authorization code for tokens...")
        
        # Exchange code for tokens
        try:
            response = requests.post('https://oauth2.googleapis.com/token', data={
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'code': auth_code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri,
            }, timeout=30)
            
            if response.status_code == 200:
                tokens = response.json()
                refresh_token = tokens.get('refresh_token')
                access_token = tokens.get('access_token')
                scope = tokens.get('scope', '')
                
                print(f"✅ Token exchange successful!")
                print(f"📋 Granted scopes: {scope}")
                
                if refresh_token:
                    print(f"✅ Refresh token obtained: {refresh_token[:20]}...")
                    
                    # Verify the token works with Google Photos API
                    print("🧪 Testing token with Google Photos API...")
                    test_response = requests.get(
                        'https://photoslibrary.googleapis.com/v1/albums',
                        headers={'Authorization': f'Bearer {access_token}'},
                        timeout=15
                    )
                    
                    if test_response.status_code == 200:
                        print("✅ Token verified - Google Photos API access confirmed!")
                    else:
                        print(f"⚠️  Token test warning: {test_response.status_code}")
                        print("   (This might be normal - continuing anyway)")
                    
                    # Update .env.development with the refresh token
                    env_file_path = '/Users/vadimcastro/Desktop/PROJECTS/dlm-photo-gallery-v2/.env.development'
                    update_env_file(env_file_path, 'GOOGLE_REFRESH_TOKEN', refresh_token)
                    
                    print(f"✅ Updated {env_file_path}")
                    print("\n🎉 OAuth setup complete with ENHANCED SCOPES!")
                    print("✅ This should fix the 403 'insufficient scopes' error")
                    print("✅ Google Photos API should now work properly")
                    print("✅ You can now run the development server and see real photos")
                    
                    # Quick test to verify scopes
                    if 'photoslibrary.readonly' in scope and 'photoslibrary.sharing' in scope:
                        print("🔒 Scope verification: ✅ All required scopes granted")
                    else:
                        print("⚠️  Scope verification: Some scopes may be missing")
                        print(f"   Granted: {scope}")
                        print(f"   Required: {SCOPES}")
                    
                else:
                    print("❌ No refresh token received.")
                    print("💡 This can happen if:")
                    print("   • You already authorized this app before")
                    print("   • You didn't see the consent screen")
                    print("   • Try revoking access and running again:")
                    print("   https://myaccount.google.com/permissions")
                    
            else:
                print(f"❌ Token exchange failed: {response.status_code}")
                print(f"Response: {response.text}")
                print("💡 Common causes:")
                print("   • Authorization code expired (try again quickly)")
                print("   • Redirect URI mismatch")
                print("   • Invalid client credentials")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error during token exchange: {e}")
            print("💡 Check your internet connection and try again")
            
    except OSError as e:
        if e.errno == 48:  # Port already in use
            print("❌ Port 5000 is already in use.")
            print("   Please run: pkill -f python3")
            print("   Then try again.")
        else:
            print(f"❌ Server error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()