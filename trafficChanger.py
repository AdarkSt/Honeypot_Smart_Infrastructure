import http.server
import socketserver
import json
import subprocess
import yaml

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8'))

        if payload.get('output_fields', {}).get('source', '') == 'falco':
            # Fetch the Ingress YAML file from the cloud drive
            ingress_file_path = "/var/cloudVol"  # mounted in pod
            with open(ingress_file_path, "r") as f:
                ingress_yaml = f.read()

            # Modify the Ingress YAML as needed
            ingress_data = yaml.safe_load(ingress_yaml)
            for rule in ingress_data['spec']['rules']:
                for path in rule['http']['paths']:
                    path['backend']['service']['name'] = 'sandbox-be-decoy'

            modified_ingress_yaml = yaml.dump(ingress_data)

            # Write the modified YAML back to the file
            with open(ingress_file_path, "w") as f:
                f.write(modified_ingress_yaml)

            # Apply changes to the Kubernetes cluster using kubectl
            kubectl_command = f"kubectl apply -f {ingress_file_path}"
            subprocess.run(kubectl_command, shell=True)

        self.send_response(200)
        self.end_headers()

def run_webhook_server():
    port = 8080
    server_address = ('', port)
    httpd = socketserver.TCPServer(server_address, WebhookHandler)
    print(f"Webhook server listening on port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run_webhook_server()
