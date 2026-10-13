# devops-pipelines

[![CI/CD](https://github.com/Mohammad-El-Zein/devops-pipelines/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Mohammad-El-Zein/devops-pipelines/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/Mohammad-El-Zein/devops-pipelines/actions/workflows/codeql.yml/badge.svg)](https://github.com/Mohammad-El-Zein/devops-pipelines/actions/workflows/codeql.yml)
[![Release](https://github.com/Mohammad-El-Zein/devops-pipelines/actions/workflows/release.yml/badge.svg)](https://github.com/Mohammad-El-Zein/devops-pipelines/actions/workflows/release.yml)

A small Node.js HTTP service whose real purpose is to demonstrate a production-grade
CI/CD pipeline built with GitHub Actions: linting, multi-version testing, coverage gates,
security scanning, containerization, and automated releases to GitHub Container Registry.

## Pipeline overview

```
 pull request / push to main
          │
          ├── Lint ─────────────┐
          ├── Test (Node 20/22/24)
          ├── Coverage (≥ 80 %) ├──► Docker build ─► Smoke test ─► Trivy scan ─► Push to GHCR
          └── npm audit ────────┘                                              (main only)

 git tag vX.Y.Z  ──►  Lint + Test ─► Build & push versioned image ─► GitHub Release
```

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [`ci-cd.yml`](.github/workflows/ci-cd.yml) | push to `main`, pull requests | Lint, test matrix, coverage gate, dependency audit, Docker build, container smoke test, Trivy image scan, publish `latest` + `sha-*` image to GHCR |
| [`release.yml`](.github/workflows/release.yml) | tags `v*.*.*` | Publishes semver-tagged images (`1.2.3`, `1.2`, `1`) and a GitHub Release with generated notes |
| [`codeql.yml`](.github/workflows/codeql.yml) | push, pull requests, weekly | Static security analysis (SAST) |
| [`qodana_code_quality.yml`](.github/workflows/qodana_code_quality.yml) | push, pull requests | JetBrains Qodana code quality scan (requires `QODANA_TOKEN` secret) |
| [`dependabot.yml`](.github/dependabot.yml) | weekly | Update PRs for npm packages, GitHub Actions and the Docker base image |

Practices used: least-privilege `permissions`, `concurrency` to cancel outdated runs,
npm and Docker layer caching, multi-stage non-root Docker image with a `HEALTHCHECK`,
quality gates before anything is published.

## API

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | Greeting |
| GET | `/health` | `{ "status": "ok", "uptimeSeconds": n }` |
| GET | `/version` | Version from `package.json` |

## Local development

```bash
npm ci
npm run lint
npm test
npm run test:coverage
npm start            # http://localhost:3000
```

### Docker

```bash
docker build -t devops-pipelines .
docker run --rm -p 3000:3000 devops-pipelines
```

Or pull the published image:

```bash
docker pull ghcr.io/mohammad-el-zein/devops-pipelines:latest
```

## Releasing

```bash
npm version patch    # bumps package.json and creates tag v1.0.1
git push --follow-tags
```
