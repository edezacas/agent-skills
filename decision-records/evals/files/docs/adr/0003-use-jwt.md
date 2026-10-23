# 3. Use JWT access tokens

Date: 2025-06-02
Status: superseded by ADR-0011

## Context

The API needed stateless authentication that would survive a web tier restart.

## Decision

Issue a signed JWT access token and validate it on every request without a database lookup.

## Consequences

No session store. Revoking a token before it expires is not possible.
