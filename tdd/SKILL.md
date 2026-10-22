---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
license: Apache-2.0
metadata:
  author: edezacas
  version: "1.0"
---

TDD is the red → green loop. The failing test comes first, then only enough code to pass it.

Agree the seam before writing. With a user in the session, ask. In a headless run there is nobody
to ask, so the seam is the one the task or plan named. Test at that seam, through the public
interface. No mocking internal collaborators, no private methods, no asserting through a side
channel.

Expected values come from an independent source, a known-good literal, a worked example, the spec.
Never recompute them the way the code computes them.

Mock only what you don't own, such as network, time or the filesystem. Never your own modules.

One test, one seam, one implementation per cycle. Never all tests and then all code. Refactoring
isn't part of this loop.

Three things make a test worthless. It asserts how the code works instead of what it does, so a
refactor breaks it without changing behaviour. Its expected value is computed the way the code
computes it, so it passes by construction. It arrived in a batch before the code existed, so it
asserts imagined behaviour rather than what the task asked for.
