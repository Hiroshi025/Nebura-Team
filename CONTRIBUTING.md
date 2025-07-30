# Contributing to Nebura Control

Thank you for your interest in contributing to **Nebura Control**!  
We welcome all kinds of contributions: bug reports, feature requests, documentation improvements, and code.

---

## 📝 Table of Contents

- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Community & Help](#community--help)
- [Resources](#resources)

---

## How to Contribute

1. **Fork** the repository.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/Nebura-AI.git
   cd Nebura-AI
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/my-feature
   ```
4. **Make your changes** (see [Code Style Guide](#code-style-guide)).
5. **Test** your changes (see [Testing](#testing)).
6. **Commit** with a descriptive message (see [Commit Message Guidelines](#commit-message-guidelines)).
7. **Push** to your fork:
   ```bash
   git push origin feat/my-feature
   ```
8. **Open a Pull Request** on GitHub.

---

## Development Workflow

- All development happens on feature branches (`feat/`, `fix/`, `docs/`, etc.).
- The `main` branch is protected and only maintainers can merge.
- Pull Requests are reviewed and must pass CI before merging.

### Example: Adding a New API Endpoint

1. Create a controller in `src/interfaces/http/routes/your-feature/controllers/`.
2. Add service logic in `src/interfaces/http/routes/your-feature/service/`.
3. Register your module in `src/app.module.ts`.
4. Add tests in `test/` or alongside your feature.
5. Document your endpoint in Swagger decorators.

---

## Code Style Guide

- **Language:** TypeScript (strict mode)
- **Formatting:** [Prettier](https://prettier.io/)
- **Linting:** [ESLint](https://eslint.org/)
- **Naming:** Use `camelCase` for variables, `PascalCase` for classes/types, `UPPER_SNAKE_CASE` for constants.
- **Imports:** Use absolute imports with path aliases (e.g., `#entity/users/user.entity`).
- **Comments:** Use JSDoc for public classes and methods.

### Example

```typescript
/**
 * Returns a greeting for the given user.
 * @param name The user's name.
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

Run formatting and linting before committing:

```bash
npm run format
npm run lint
```

---

## Commit Message Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for build or tooling changes

### Example

```
feat(auth): add JWT refresh token endpoint

fix(users): correct email validation regex

docs(readme): update installation instructions
```

---

## Pull Request Process

- Ensure your branch is up to date with `main`.
- All checks (CI, tests, lint) must pass.
- Provide a clear description of your changes.
- Reference related issues (e.g., `Closes #42`).
- Add screenshots or code snippets if relevant.

---

## Testing

- **Unit tests:** Place in `src/**/__tests__` or `*.spec.ts`.
- **E2E tests:** Place in `test/` or `_test_/`.
- Use [Jest](https://jestjs.io/) for all tests.

### Running Tests

```bash
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run test:cov     # Coverage report
```

### Example Test

```typescript
import { greet } from "./greet";

describe("greet", () => {
  it("should greet the user by name", () => {
    expect(greet("Nebura")).toBe("Hello, Nebura!");
  });
});
```

---

## Documentation

- Use [Swagger decorators](https://docs.nestjs.com/openapi/types-and-parameters) for API docs.
- Update the [README.md](README.md) and add usage examples if you change public APIs.
- For complex features, add markdown docs in a `/docs` folder.

---

## Reporting Issues

- Use [GitHub Issues](https://github.com/Hiroshi025/Nebura-AI/issues).
- Include steps to reproduce, expected behavior, and screenshots/logs if possible.
- For security issues, please email [alchemistdevs@gmail.com](mailto:alchemistdevs@gmail.com) instead of opening a public issue.

---

## Community & Help

- **Help Center:** [https://help.hiroshi-dev.me/](https://help.hiroshi-dev.me/)
- **Discord:** [https://discord.gg/G7Qnnhy](https://discord.gg/G7Qnnhy)
- **Discussions:** Use GitHub Discussions for questions and ideas.

---

## Resources

- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io/)
- [Discord.js Docs](https://discord.js.org/#/docs)
- [WhatsApp Web.js Docs](https://wwebjs.dev/guide/)
- [Swagger/OpenAPI](https://swagger.io/docs/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)

---

<p align="center">
  <b>Thank you for making Nebura Control better! 🚀</b>
</p>
