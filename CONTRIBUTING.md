# Contributing to VERSE

Thank you for considering contributing to VERSE! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Electron version, etc.)

### Suggesting Features

1. Check [Issues](../../issues) for existing feature requests
2. Create a new issue with:
   - Clear feature description
   - Use cases and benefits
   - Possible implementation approach (optional)

### Code Contributions

#### Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test thoroughly: `npm run dev`
7. Commit with clear messages: `git commit -m "feat: add new feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a Pull Request

#### Code Style

- Follow existing code patterns
- Use TypeScript types/interfaces
- Follow Clean Code principles (see user rules)
- Run `npm run lint` before committing
- Run `npm run format` to format code

#### Commit Messages

Follow Conventional Commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code restructuring
- `test:` adding tests
- `chore:` maintenance tasks

Examples:

```
feat: add trade route calculator
fix: resolve rate limiting issue
docs: update README installation steps
```

#### Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Update documentation if needed
- Add tests for new features
- Ensure all tests pass
- Reference related issues

### Project Structure

```
src/
├── main/          # Electron main process (Node.js)
├── preload/       # Bridge between main and renderer
└── renderer/      # React app (browser context)
    ├── api/       # API services
    ├── components/# Reusable UI components
    ├── hooks/     # Custom React hooks
    ├── stores/    # Zustand state management
    └── views/     # Page components
```

### Development Tips

- Use React DevTools for debugging renderer
- Use Electron DevTools for main process
- Check console for API rate limit warnings
- Test with both app token and user token scenarios

### Questions?

Feel free to ask in [Discussions](../../discussions) or create an issue.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help newcomers learn

Thank you for contributing! 🚀
