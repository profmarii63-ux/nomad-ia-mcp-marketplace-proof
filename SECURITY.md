# Security

- Never commit API keys or customer credentials.
- Use environment variables or the deployment platform secret store.
- Public-listing tools should remain read-only unless the client explicitly authorizes write operations.
- Upstream error bodies are not echoed to MCP clients by default.
- Timeouts prevent indefinite upstream requests.
- Any write-capable marketplace action should add authentication, idempotency, audit logging and explicit authorization before production use.
