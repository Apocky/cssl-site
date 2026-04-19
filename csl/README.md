# /csl — CSL-Encoded Page Representations

This directory contains CSL-encoded versions of each page on cssl.dev. CSL (Caveman Spec Language) is the formal specification notation documented at [cssl.dev/CSLv3](https://cssl.dev/CSLv3).

## Files

| File | Source page | Description |
|------|-------------|-------------|
| [`index.csl`](index.csl) | [cssl.dev/](https://cssl.dev/) | Homepage — Sigil language overview |
| [`spec.csl`](spec.csl) | [cssl.dev/CSLv3](https://cssl.dev/CSLv3) | CSL specification notation (self-encoded) |
| [`sigil.csl`](sigil.csl) | [cssl.dev/sigil](https://cssl.dev/sigil) | Sigil (CSSL) technical reference |

## What are these files?

Each `.csl` file encodes the information content of its corresponding HTML page using CSL notation — the same facts and relationships expressed formally rather than in prose. They serve as:

- **Machine-readable representations** — any system that parses CSL can extract structured facts without scraping HTML
- **LLM-optimized summaries** — compressed 5–6× versus the English equivalent; suitable for injection into context windows
- **Reference documents** — authoritative structured encoding of what each page says

The `.csl` format uses a 74-glyph inventory with mandatory ASCII aliases. An LL(2) parser and full spec are at [github.com/Apocky/CSLv3](https://github.com/Apocky/CSLv3).

## CSL notation quick reference

```
§         section / module boundary
→         then / yields / maps-to
←         from / sourced / derives
W!        MUST (hard requirement)
N!        MUST NOT (prohibition)
R!        SHOULD
M?        MAY
✓         confirmed / verified
◐         partial / in-progress
○         pending / unknown
✗         failed / rejected
.         tatpurusha compound (Y of X)
+         dvandva compound (X and Y)
-         karmadhāraya compound (Y that is X)
⊗         bahuvrihi compound (having X-Y)
@         avyayibhava (at / per / in scope of)
⟨ ⟩       tuple / record
⌈ ⌉       constraint / upper-bound / invariant
⌊ ⌋       floor / lower-bound / precondition
t∞:       invariant that holds for all time
∀         for all
∃         exists
∈         member-of
¬         not / negation
∵         because
∴         therefore
∎         end-of-block / QED
```

Full glyph inventory and grammar: [cssl.dev/CSLv3](https://cssl.dev/CSLv3) or `specs/01_GLYPHS.csl` in the repo.

## Usage

**For LLMs:** Read the `.csl` files directly. They are valid UTF-8 plain text. The density is approximately 5–6× over equivalent English prose on spec content, so they fit substantially more information per context window token.

**For parsers:** Target the [CSLv3 LL(2) grammar](https://github.com/Apocky/CSLv3/blob/main/specs/02_GRAMMAR.csl). The files use canonical Unicode glyphs; the ASCII alias table in `specs/12_TOKENIZER.csl` maps every glyph to its BPE-friendly fallback.

**For humans:** Read top-to-bottom. Each `§ SECTION` is a named block. Indentation is semantic — deeper indent = nested scope. Defaults are silent; only deviations from the slot grammar are written.

---

*Content licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · Code licensed MIT*
