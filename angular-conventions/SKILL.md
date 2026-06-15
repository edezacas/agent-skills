---
name: angular-conventions
description: Mandatory Angular conventions. Activate ALWAYS before writing, modifying, or reviewing any Angular code (.ts, .html, .scss) — components, services, modules, guards, pipes, interceptors, or forms. Also activate on any mention of NgModule, inject(), signal, takeUntilDestroyed, SharedModule, or any Angular stack element.
license: Apache-2.0
metadata:
  author: edezacas
  version: "1.1"
---

# Angular Conventions

**Mandatory** conventions. Apply always, even if existing code does not follow them.

## Modules

**NgModule** structure — never standalone components.
- **Feature modules** — one per feature
- **SharedModule** — reusable components, pipes, and directives

## Dependency Injection

Always `inject()`, never constructor injection.

```typescript
// ✅
private clientService = inject(ClientService);

// ❌
constructor(private clientService: ClientService) {}
```

## Local State

Use `signal()` for local state, never `BehaviorSubject` in components.

```typescript
// ✅
clients = signal<Client[]>([]);

// ❌
clients$ = new BehaviorSubject<Client[]>([]);
```

## Subscriptions

Always use `takeUntilDestroyed()`, never `ngOnDestroy` + `Subject`.

```typescript
private destroyRef = inject(DestroyRef);

this.myService.getData()
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(data => this.data.set(data));
```

## Control Flow

Use `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`.

- `@for` must always have a `track` on a unique property (e.g. `track item.id`); use `$index` only for static lists.
- Use `@empty` inside `@for` for the zero-items case.
- Prefer `as` in `@if` to avoid re-evaluating expensive expressions.

Reference: https://angular.dev/guide/templates/control-flow
