# Contributing

## Getting Started

```sh
git clone https://github.com/fatlard1993/vanilla-bean-components.git
cd vanilla-bean-components
bun install
bun run build && bun run dev
```

`bun install` also runs `prepare`, which installs the git hooks from `.githooks/`.

## Development

`bun run dev` starts the component playground at `http://localhost:3000` with hot reload via `bun --hot`.

To rebuild the bundle on file changes without starting the dev server:

```sh
bun run build:watch
```

`build` runs three steps: cleans old build artifacts, regenerates `index.js` via `devTools/updateComponentIndex.js`, then runs the main bundler at `devTools/build.js`.

## Creating Components

Scaffold a new component with:

```sh
bun run create:component ComponentName
```

This creates `components/ComponentName/` containing:

| File               | Purpose                  |
| ------------------ | ------------------------ |
| `ComponentName.js` | Component implementation |
| `index.js`         | Named re-export          |
| `demo.js`          | Live playground entry    |
| `.test.js`         | Test suite skeleton      |
| `README.md`        | Documentation template   |

The generated component extends `Component` and includes a `build()` hook and a `_setOption()` override ready to fill in.

### The `build()` / `render()` contract

- `render()` orchestrates the full lifecycle: `empty() → build() → _processOptions()`.
- `build()` is the subclass hook for creating child structure. It runs before options are applied, so the DOM is ready when `_setOption()` fires.
- Override `build()` in subclasses, not `render()`. If your subclass itself has subclasses that also define `build()`, call `super.build()` explicitly — it does not chain automatically.

## Testing

```sh
bun test              # run all tests once
bun test --watch      # re-run on file changes
bun test components   # run only component tests
```

Test files follow the `.test.js` naming convention (components use `.test.js` at the folder level). The `bunfig.toml` points Bun at `test-setup.js` as the preload file, which:

- Registers happy-dom via `@happy-dom/global-registrator` (1920x1080 viewport)
- Extends `expect` with `@testing-library/jest-dom` matchers
- Exposes `container` as `document.body` — use it as the `appendTo` target in tests
- Resets `document.body` and restores mocks in `beforeEach`

Tests use `@testing-library/dom` query patterns (`getByRole`, `getByText`, etc.).

### Known happy-dom limitations

The following browser APIs are stubbed in `test-setup.js` and behave minimally:

- `HTMLDialogElement.showModal` / `show` / `close`
- `HTMLElement.showPopover` / `hidePopover`
- `HTMLCanvasElement.getContext` (returns a no-op drawing context)
- `document.evaluate` (partial XPath support)
- `XPathResult` constants

Some tests that depend on stubbed browser APIs may have limited coverage due to these constraints.

## Code Style

```sh
bun run format   # eslint --fix + prettier --write
bun run lint     # lint only, no auto-fix
```

The pre-commit hook (`.githooks/pre-commit`) runs targeted tests for every changed directory (e.g. editing a file in `Context/` runs `bun test Context`) then runs `bun run format`. The commit is aborted if any step fails.

ESLint is configured in `eslint.config.cjs` with these active plugins: `jsdoc`, `compat`, `import`, `spellcheck`, and `testing-library` (test files only).

## Architecture Quick Reference

See `docs/ARCHITECTURE.md` for a full writeup and `docs/ETHOS.md` for the design philosophy behind the library.

At a glance:

- **`Elem`** — thin `EventTarget` subclass wrapping an `HTMLElement`
- **`Component`** — extends `Elem`, adds `Context`-backed reactive options, style processing via `styled()`, and the `build()` / `render()` lifecycle
- **`Context`** — Proxy-based reactive state; property assignments emit change events that components subscribe to for targeted DOM updates

Styling flows through `styled(Component, ({colors}) => css)` → PostCSS (autoprefixer + nested syntax) → scoped `<style>` tag injected into the document.
