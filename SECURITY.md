# Security Policy

## Supported Versions

| Version | Supported |
|:--------|:----------|
| 1.2.x   | ✅ Yes    |
| 1.1.x   | ✅ Yes    |
| < 1.1   | ❌ No     |

## Reporting a Vulnerability

If you discover a security vulnerability in `create-dsa-lab`, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please use one of these channels:

1. **GitHub Security Advisories** — [Report a vulnerability](https://github.com/YTTHEMIGHTY/create-dsa-lab/security/advisories/new) (preferred)
2. **GitHub Discussions** — Send a private message via [Discussions](https://github.com/YTTHEMIGHTY/create-dsa-lab/discussions)

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix timeline** depends on severity — critical issues will be patched ASAP

### What counts as a security issue?

| Type | Security issue? |
|:-----|:----------------|
| Arbitrary code execution via CLI | ✅ Yes |
| Path traversal in template copy | ✅ Yes |
| Dependency with known CVE | ✅ Yes |
| Bug in dashboard display | ❌ No (regular bug) |
| Feature request | ❌ No |

## Security Best Practices for Users

- Always use the latest version: `npx create-dsa-lab@latest`
- Review the `scripts/` directory after running `update`
- Keep your Node.js version up to date
