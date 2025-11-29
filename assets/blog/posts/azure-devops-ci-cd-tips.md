# Azure DevOps CI/CD Tips

Some practices that improved pipeline reliability:

- Gate merges with **SonarQube** quality profiles and unit tests.
- Add **OWASP/Black Duck** scans to catch vulnerabilities early.
- Use **stages** and **environments** with approvals for production.
- Bake **immutable images** and sign them before deployment.

```yaml
stages:
- stage: Build
  jobs:
  - job: build
    steps:
    - task: NodeTool@0
```

CI/CD: Jenkins or Azure DevOps.
