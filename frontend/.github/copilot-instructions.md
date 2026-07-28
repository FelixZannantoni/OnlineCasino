
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Testing

- Use Angular's configured test framework (Jasmine/Karma by default, or Jest if configured in `package.json`)
- Write unit tests for all components, services, and pipes
- Test components in isolation; mock injected dependencies (services, HTTP client)
- Use `TestBed` for component/service test setup
- Prefer testing behavior (inputs → outputs, user interactions) over internal implementation details
- Use `async`/`fakeAsync`/`tick()` for testing asynchronous code and observables
- Keep tests fast and isolated — no reliance on real network calls or shared mutable state between tests
- Aim for meaningful coverage of edge cases (empty states, error states, loading states), not just the happy path
- Run the full test suite before committing changes: `ng test` (or the project's configured test command)

## Error Handling & Loading States

- Every component that makes an async call (HTTP request, observable subscription) MUST handle three states: loading, success, and error
- Represent loading/error state with signals (e.g. `isLoading = signal(false)`, `error = signal<string | null>(null)`) rather than boolean flags scattered across the template
- Never let an unhandled observable error silently fail — use the `catchError` operator or a `try`/`catch` around async/await calls
- Show user-friendly error messages in the UI; never expose raw error objects, stack traces, or backend error codes directly to the user
- Log errors to the console (or a logging service, if one exists) with enough context to debug, without exposing sensitive data
- Use the async pipe with an `@if`/`@else` block (or equivalent signal-based pattern) to cleanly render loading/error/success states in templates
- On failed HTTP requests, prefer graceful degradation (e.g. show a retry button) over crashing the component or leaving it in a stuck loading state