# ADR-0003: Commission is calculated on the closing price

Date: 2026-01-14
Type: business
Tags: commission, price, closing, seller

## Context

The platform charges the seller a commission on each sale. The price changes during the
listing lifetime, so the base had to be fixed.

## Decision

The commission is calculated on the closing price of the sale, not on the listing price.

## Reason

The seller only receives the money that was actually collected, so the fee has to match
the amount the buyer paid at closing.

## Consequences

- A price change during the auction changes the commission.
- Historical commissions stay valid, because each sale stores its closing price.
