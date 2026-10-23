# 7. Store money as integer cents

Date: 2025-11-03
Type: architecture

## Context

Order totals were computed with floats and produced off-by-one cent errors on invoices.

## Decision

Store every monetary amount as an integer number of cents and format only at the edges.

## Consequences

Rounding bugs disappear. Every conversion point must be explicit.
