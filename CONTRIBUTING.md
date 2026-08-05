# Contributing to ATELIER

Thank you for your interest in contributing to **ATELIER**! We welcome contributions from developers of all skill levels.

---

## 🚀 How to Contribute

### 1. Reporting Bugs
- Open an issue on GitHub detailing the bug, environment (OS, Expo Go version), and steps to reproduce.
- Check existing issues before opening a new one to prevent duplicates.

### 2. Suggesting Enhancements
- Open a feature request issue explaining the motivation and proposed behavior.

### 3. Submitting Pull Requests
1. Fork the repository and create a feature branch (`git checkout -b feat/my-new-feature`).
2. Ensure your code passes all type checks and health checks:
   ```bash
   npx tsc --noEmit
   npx expo-doctor
   ```
3. Commit your changes using conventional commit messages (`feat: add new feature`, `fix: resolve bug`).
4. Push to your branch and open a Pull Request.

---

## 🎨 Code Style Guidelines

- **TypeScript:** Strict type checking enabled. Avoid using `any` unless strictly required for third-party library boundaries.
- **Theme Tokens:** Always use `useAppTheme()` to access colors, spacing, and border radii. Do not hardcode hex values.
- **Architecture:** Place code strictly in its appropriate layer (`core`, `design`, `experience`, `features`, `navigation`).
