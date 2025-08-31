#!/usr/bin/env python3
"""
Simple HTTP server for the Workflow Planner application
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8085
DIRECTORY = Path(__file__).parent

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers to allow API calls
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"\n🚀 Workflow Planner Server Started!")
        print(f"📍 Visit: http://localhost:{PORT}")
        print(f"📁 Serving from: {DIRECTORY}")
        print("\n Press Ctrl+C to stop the server\n")
        
        # Try to open browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n Server stopped.")

if __name__ == "__main__":
    main()