# 11. Store sessions in signed cookies

Date: 2025-09-18
Status: accepted

## Context

Logging out had to survive a restart of the web tier, and the JWT from ADR-0003 could not
be revoked before it expired.

## Decision

Keep the session identifier in a signed cookie and validate its signature on every request.

## Consequences

Logout still cannot invalidate a stolen cookie until it expires.
