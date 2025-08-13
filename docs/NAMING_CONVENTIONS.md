# Naming Conventions

This document outlines the naming conventions used throughout the vanilla-bean-components library. Consistent naming improves code readability, maintainability, and helps contributors understand the codebase structure at a glance.

The library follows modern JavaScript conventions with some specific patterns that reflect its component-based architecture and options-first philosophy. These conventions ensure that the API feels natural to developers while maintaining internal consistency.

## Casing & Separation Overview

The library uses different casing patterns to signal the type and scope of identifiers:

- **PascalCase** :: Classes, components, constructors, and types that represent instantiable entities
- **camelCase** :: Variables, functions, methods, and properties that represent actions or state
- **SCREAMING_SNAKE_CASE** :: Constants and enums that represent immutable configuration values
- **snake_case** :: Test files and utility files (used sparingly for specific cases)
- **kebab-case** :: CSS classes, HTML attributes, URL slugs, and external identifiers

## Files & Directories

File naming follows a hierarchical approach where the casing indicates the file's primary purpose and scope within the library architecture.

**Component Architecture Files:**

- **Component files**: PascalCase matching the exported class name (e.g., `Button.js`, `Input.js`, `TooltipWrapper.js`)
- **Demo files**: Always named `demo.js` within component directories to provide consistent discovery
- **Index files**: Always `index.js` for clean module exports and directory-level API definition

**Supporting Files:**

- **Utility files**: camelCase reflecting their functional purpose (e.g., `class.js` for class utilities, `element.js` for DOM utilities)
- **Configuration files**: kebab-case with descriptive suffixes (e.g., `eslint.config.cjs`, `prettier.config.cjs`, `spellcheck.config.cjs`)
- **Test files**: Source filename + `.test.js` to maintain clear associations (e.g., `Button.test.js`, `color.test.js`)

This structure makes it immediately clear whether a file contains a component, utility functions, configuration, or tests just from its name.

## Variables & Functions

Variable and function naming emphasizes readability and clearly communicates intent, scope, and mutability.

**Standard Identifiers:**

- **Local variables**: camelCase with descriptive names (e.g., `userName`, `isValid`, `currentValue`)
- **Function names**: camelCase verbs that describe the action (e.g., `buildClassName`, `hydrateUrl`, `updateValidationErrors`)
- **Default options**: Always `defaultOptions` as a camelCase object containing component defaults

**Special Naming Patterns:**

- **Constants**: SCREAMING_SNAKE_CASE for values that never change (e.g., `type_enum` for HTML input types)
- **Private methods**: Underscore prefix to indicate internal use (e.g., `_setOption`, `_updateAutoHeight`)
- **Cleanup functions**: Prefixed with `__` for internal lifecycle methods (e.g., `__debouncedUpdateAutoHeight`)

These patterns help distinguish between public APIs, private implementation details, and immutable configuration values.

## Classes & Components

Component and class naming follows the library's hierarchical architecture, where names reflect both purpose and inheritance relationships.

**Core Architecture Classes:**

- **Base classes**: Single descriptive nouns (e.g., `Component`, `Context`, `Elem`)
- **Component classes**: Descriptive nouns matching UI elements (e.g., `Button`, `Input`, `Dialog`)
- **Wrapper classes**: Compound names ending in "Wrapper" (e.g., `TooltipWrapper`)

**Inheritance and Composition:**

- **Component exports**: Always PascalCase matching the filename exactly for predictable imports
- **Extended components**: Names that clearly indicate their enhanced functionality (e.g., `TooltipWrapper` extends `Component` with tooltip behavior)
- **Styled components**: Often prefixed with "Styled" when created via the `styled` function (e.g., `StyledButton`, `UserCard`)

This naming strategy makes the component hierarchy and relationships immediately apparent to developers using the library.

## Object Properties & Methods

Property and method naming prioritizes clarity and follows established web platform conventions while maintaining the library's reactive patterns.

**Standard Properties:**

- **Object properties**: camelCase matching DOM/web standards where applicable (e.g., `textContent`, `className`, `innerHTML`)
- **CSS properties**: camelCase when used in JavaScript objects (e.g., `backgroundColor`, `fontSize`, `borderRadius`)
- **Configuration options**: camelCase descriptive names (e.g., `placeholder`, `initialValue`, `syntaxHighlighting`)

**Special Method Patterns:**

- **Event handlers**: `on` prefix + PascalCase event name following DOM conventions (e.g., `onPointerPress`, `onChange`, `onConnected`)
- **Boolean properties**: Prefixed with `is` or `has` to clearly indicate true/false values (e.g., `isDirty`, `hasClass`, `isValid`)
- **Getter methods**: Descriptive verbs without `get` prefix (e.g., `validate()` rather than `getValidation()`)

These conventions align with native DOM APIs and modern JavaScript patterns, making the library feel familiar to web developers.

## CSS & Styling

CSS naming follows web standards and BEM-like principles, with clear separation between component styles and application styles.

**CSS Class Names:**

- **Component classes**: kebab-case reflecting component state or variant (e.g., `primary-btn`, `user-online`, `validation-errors`)
- **Utility classes**: kebab-case descriptive names (e.g., `syntax-highlighting`, `auto-height`)
- **State classes**: kebab-case with clear boolean meaning (e.g., `active`, `disabled`, `selected`)

**CSS Variables and Properties:**

- **CSS custom properties**: kebab-case with `--` prefix following CSS standards
- **Styled component names**: PascalCase when created programmatically (e.g., `StyledButton`, `UserCard`, `LoadingSpinner`)

The library's scoped CSS system automatically generates unique class names, so these conventions primarily apply to manually authored CSS and component state classes.

## Package & Module Names

Package and module naming follows NPM conventions and JavaScript module standards, emphasizing discoverability and consistency with the broader ecosystem.

**Package Identity:**

- **Package name**: kebab-case following NPM conventions (`vanilla-bean-components`)
- **Module exports**: Naming matches internal conventions-PascalCase for classes, camelCase for functions
- **File extensions**: Always lowercase following Unix conventions (`.js`, `.cjs`, `.mjs`)

**Module Structure:**

- **Export paths**: Follow the internal file structure (e.g., `vanilla-bean-components/Context`, `vanilla-bean-components/utils`)
- **Named exports**: Match the internal class or function names exactly for predictable imports

## Special Cases

Certain file types and contexts have specific naming requirements that override the general patterns:

**Documentation and Metadata:**

- **README files**: Always UPPERCASE (`README.md`) following repository conventions
- **License files**: UPPERCASE for legal documents (`LICENSE`, `NOTICES.md`)
- **Configuration metadata**: Descriptive kebab-case (`TODO.md`, `context.txt`)

**Test and Development:**

- **Test descriptions**: sentence case with spaces for readability in test output
- **Enum values**: Context-dependent-lowercase for HTML attributes (matching web standards), SCREAMING_SNAKE_CASE for internal constants

**Context-Sensitive Naming:**

- **HTML attributes**: Always lowercase following HTML5 standards
- **Event names**: lowercase following DOM event conventions
- **API endpoints**: kebab-case for RESTful consistency

These special cases ensure the library integrates smoothly with existing web standards and development tooling while maintaining internal consistency.
