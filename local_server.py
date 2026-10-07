import http.server
import socketserver
import os

PORT = 8080

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Emulate nginx try_files $uri $uri/ $uri.html =404
        
        # Determine the base path
        path = self.path
        if path == '/':
            path = '/index.html'
            
        # Strip query parameters if any
        path = path.split('?')[0]
        
        # Local file path
        local_path = "." + path
        
        if os.path.exists(local_path) and not os.path.isdir(local_path):
            # File exists (e.g. /global.css)
            return super().do_GET()
        elif os.path.exists(local_path + '.html'):
            # $uri.html exists (e.g. /about -> ./about.html)
            self.path = path + '.html'
            return super().do_GET()
        elif os.path.isdir(local_path) and os.path.exists(os.path.join(local_path, 'index.html')):
            # $uri/ exists and has index.html
            self.path = path + '/index.html'
            return super().do_GET()
        else:
            # 404 error page
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            if os.path.exists("./404.html"):
                with open("./404.html", "rb") as file:
                    self.wfile.write(file.read())
            else:
                self.wfile.write(b"404 Not Found")

Handler = MyHttpRequestHandler
with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
