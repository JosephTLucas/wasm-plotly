import http.server
import socketserver
import os
from pathlib import Path

class VerboseHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def list_directory(self, path):
        print(f"Listing directory: {path}")
        print("Directory contents:", os.listdir(path))
        return super().list_directory(path)
        
    def do_GET(self):
        print(f"GET request received for: {self.path}")
        return super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    DIRECTORY = "/app/output"
    
    os.chdir(DIRECTORY)
    print(f"Starting server in directory: {DIRECTORY}")
    print("Directory contents:", os.listdir(DIRECTORY))
    
    Handler = VerboseHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()