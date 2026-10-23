---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
license: Apache-2.0
metadata:
  author: edezacas
  version: "1.1"
---

# Test-driven development

Red → green, one cycle at a time: the failing test comes first, then only enough code to pass it.

## The cycle

1. **Agree the seam** before writing. With a user in the session, ask. In a headless run there is nobody to ask, so the seam is the one the task or plan named.
2. **One failing test** at that seam.
3. **Only the code that passes it.**
4. **The next test** once the previous one is green. Never all tests and then all code.

Refactoring isn't part of this loop.

## The seam

Test through the public interface. No mocking internal collaborators, no private methods, no asserting through a side channel.

## Expected values

From an independent source: a known-good literal, a worked example, the spec. Never recompute them the way the code computes them.

## Mocks

Only what you don't own, such as network, time or the filesystem. Never your own modules.

## A test worth nothing

| Shape | Why it is worthless |
|---|---|
| It asserts how the code works, not what it does | a refactor breaks it without changing behaviour |
| Its expected value is computed the way the code computes it | it passes by construction |
| It arrived in a batch before the code existed | it asserts imagined behaviour, not what the task asked for |
