---
name: tdd
description: Apply test driven development when planning or implementing features, bug fixes, or behavior changes. Plan the test approach first, then follow red green refactor cycles during implementation.
license: Apache-2.0
metadata:
  author: edezacas
  version: "1.2"
---

# Test-driven development

Red → green, one cycle at a time: the failing test comes first, then only enough code to pass it.

Use it without being asked whenever the work develops or changes behaviour. That covers a feature, a bug fix, a rule or a response that was not there before.

Not for work with no behaviour to change. That covers answering a question, reviewing code without touching it, and an edit that only touches documentation.

## Planning

Before implementing, say what the behaviour is and how a test will observe it. The plan names the seam and the first test, not a set of test files. The rest arrives one cycle at a time.

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
