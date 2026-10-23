---
name: decision-records
description: Write decision records (ADR) for what the code cannot explain (business rules, rejected options, trade-offs, workarounds). Use when writing or editing one, or after implementing any of those. Not for documenting how the code works.
license: Apache-2.0
metadata:
  author: edezacas
  version: "1.0"
---

# Decision records

A record exists so that someone who arrives later understands a decision without reading the code and without asking anyone. Anything that does not serve that is out.

## The budget

**One decision, 20 lines.** If the title needs an "and", it is two records. If it does not fit, the excess is detail that belongs in the code, the commit or the ticket. When one decision inside changes, rewrite that part, never append to it.

## The four things it says

- **Decision:** one sentence, and it is the title.
- **Reason:** why, when the code cannot show it. If the code already shows it, there is no record. Never invented: if nobody said it, write `not stated`.
- **Rejected:** the real option that lost, and why not.
- **Cost:** what it makes harder or more expensive.

Anything else is out.

## What is always out

- **Names from the code.** Class, method, constant, file, query, internal key. If the sentence only says where the decision is enforced, it is not the decision. Test: would it still be true if the code were rewritten from scratch respecting the decision?
- **History.** What it used to be, an "Amendment" block, "this replaces". The record is true today; the past is in git and the commit message.
- **Cross-references.** Numbers of other records, spec sections, tickets. They rot.
- **Anything a reader gets from the code in a minute.**

## Where it goes

The project's structure if it has one: numbering, file or section, its status field. If not, `docs/decisions/<NNNN>-<slug>.md`. Never a second structure.

## When it is written

On request, always. On your own initiative, only after changing code, in a repo, for the user's decision of this session. Report it in one line.
