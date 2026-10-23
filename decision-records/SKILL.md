---
name: decision-records
description: Review decisions after every implementation and create an ADR when significant business decisions need to be preserved. Record decisions and their rationale without inventing information.
license: Apache-2.0
metadata:
  author: edezacas
  version: "1.1"
---

# Decision records

A record exists so that someone who arrives later understands a decision without reading the code and without asking anyone. Anything that does not serve that is out.

## The budget

**One decision, 20 lines.** If the title needs an "and", it is two records. If it does not fit, the excess is detail that belongs in the code, the commit or the ticket. When one decision inside changes, rewrite that part, never append to it.

## The four things it says

- **Decision:** one sentence, and it is the title.
- **Reason:** why, when the code cannot show it. If the code already shows it, there is no record. Never invented. If no one stated it, including you, write `not stated`.
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

Closing any implementation, before reporting it done, review the work for decisions worth preserving. Report the outcome in one line. Say the record you wrote, or say that none qualified.

A decision qualifies when it is significant business or product behaviour whose reasoning would otherwise be lost. Such a decision changes what the product does, or it constrains the decisions that come after it. It may be the user's, or one you took during the work, as long as its reasoning can be stated.

Routine changes, implementation details and anything a reader gets from the code do not qualify, and then no record is written. Neither does documenting how the code works.
