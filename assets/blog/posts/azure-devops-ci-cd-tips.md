# Azure DevOps CI/CD Tips

- Gate merges with **SonarQube** quality profiles and unit tests.
- Add **OWASP/Black Duck** scans to catch vulnerabilities early.
- Use **stages** and **environments** with approvals for production.

```bash
jenkins build && jenkins deploy
```
