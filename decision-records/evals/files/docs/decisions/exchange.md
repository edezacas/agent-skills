# exchange — decision record

Domain: the outbound gateway to the exchange, plus the inbound moderation endpoint.

This document records the why the code cannot say on its own. It is a living document for this
domain: when a decision below stops holding, edit it here; do not append a new one.

---

## 1. 200 means "accepted for moderation", never PUBLISHED

On success the exchange keeps `SENT_FOR_PUBLICATION`; the publication state stays internal.

**Why:** the old Custom adapter treated 200 as "published", which is wrong against a moderating
portal — the platform would show ads as live that the portal had not approved.

The verdict then arrives from the moderation endpoint, which sets `PUBLISHED` +
`MOD_STATUS_APPROVED|REJECTED`. A 200 on POST/PUT still means accepted for moderation, never
PUBLISHED.

## 2. Credentials are central, not per-agency rows

`base_uri` / `api_key` live in the bundle configuration, mapped from environment variables.

**Why:** one portal, one shared secret agreed centrally; per-agency rows are the legacy model for
gateways where agencies bring their own accounts.

## 3. Unknown values fall back to other + label

**Why:** the contract marks the enums closed-but-extensible; emitting a plausible neighbour would
publish land as a housing listing with no way for anyone to notice.

## 4. The adapter owns the lifecycle

**Why:** unstamped rows were re-selected on every run, and `publishedAds` never left 0.

The agency sync logs the transport failure and rethrows it, so the command reports it through the
error system instead of swallowing it.
