#!/usr/bin/env python3
"""
Simple HTTP server for serving the Precision HVAC NorCal website
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class MyHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
        sys.stdout.flush()

if __name__ == "__main__":
    # Change to the website directory
    os.chdir('/home/user/webapp')
    
    port = 8000
    server = HTTPServer(('0.0.0.0', port), MyHandler)
    print(f"Server running on port {port}")
    print(f"Serving directory: {os.getcwd()}")
    sys.stdout.flush()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()