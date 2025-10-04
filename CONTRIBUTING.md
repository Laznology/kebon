# Contributing to Kebon

Thank you for your interest in contributing to Kebon! We welcome contributions from everyone. This document outlines the process for contributing to this project.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in your interactions.

## How to Contribute

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Run tests and linting
5. Commit your changes with conventional commit messages
6. Push to your fork
7. Create a Pull Request

## Development Setup

### Prerequisites

- Node.js LTS Version (18+)
- PNPM package manager
- PostgreSQL database

### Installation

1. Clone your fork:

   ```bash
   git clone https://github.com/your-username/kebon.git
   cd kebon
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other required variables
   ```

4. Set up the database:

   ```bash
   pnpm prisma migrate deploy
   pnpm db:seed
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

## Code Style

This project uses ESLint and Prettier for code formatting and linting.

### Linting

Run the linter:

```bash
pnpm lint
```

### Formatting

Format code with Prettier:

```bash
pnpm format
```

Make sure your code passes both linting and formatting checks before submitting a PR.

## Commit Message Convention

This project follows the [Conventional Commits](https://conventionalcommits.org/) specification.

## Pull Request Process

1. Ensure your PR includes a clear description of the changes
2. Reference any related issues
3. Make sure all tests pass
4. Update documentation if needed
5. Request review from maintainers

## Reporting Issues

When reporting bugs, please include:

- A clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.
