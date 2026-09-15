# Wikidata item draft — Dragos Catalin Vladulescu

Wikidata accepts items about people who are referenced in at least one
serious, publicly available source (notability policy, criterion 2). A
Wikipedia article is a much higher bar — see the last section. Create the
Wikidata item only after at least one independent source below exists, and
cite it on every statement.

## Labels / descriptions / aliases

|             | en                                                                 | ro                                                             |
| ----------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| Label       | Dragos Catalin Vladulescu                                          | Dragoș Cătălin Vlădulescu                                      |
| Description | Romanian full-stack software developer, author of codai and Brivio | dezvoltator software full-stack român, autorul codai și Brivio |
| Aliases     | Dragos Catalin; dragoscv                                           | Dragos Catalin; dragoscv                                       |

## Statements

| Property                                  | Value                                                   | Notes                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| P31 instance of                           | Q5 human                                                |                                                                                                                     |
| P106 occupation                           | Q183888 software developer                              | also consider Q5482740 programmer                                                                                   |
| P27 country of citizenship                | Q218 Romania                                            |                                                                                                                     |
| P2037 GitHub username                     | `dragoscv`                                              | verifiable at https://github.com/dragoscv                                                                           |
| P856 official website                     | https://dragoscatalin.ro                                |                                                                                                                     |
| P1412 languages spoken, written or signed | Q7913 Romanian, Q1860 English                           |                                                                                                                     |
| P800 notable work                         | codai (needs its own item), Brivio (needs its own item) | create product items first: P31 Q7397 software, P178 developer → this item, P856 website, P277 programming language |
| P937 work location                        | Q218 Romania                                            | optional; keep at country level                                                                                     |

Do **not** add date of birth, place of birth or images without an explicit
decision and a source; personal data on Wikidata is public and permanent.

## Product items to create alongside (optional)

- **codai** — P31 Q7397 software; P178 developer → person item; P856
  https://codai.ro; P277 TypeScript, Rust; P275 license (per repo); P1324
  source code repository https://github.com/codai-ro.
- **Brivio** — P31 Q7397 software / Q1333808 ERP; P178 → person item; P856
  https://brivio.ro; P17 country Romania.

## Sources that would qualify as references

Wikidata references need to be independent of the subject. In rough order of
weight:

1. An article about the person or a product in a national outlet — ZF,
   wall-street.ro, Economica.net, Profit.ro, Adevărul (see `PUBLICITY.md`).
2. An interview or podcast episode at ZF IT Generation or start-up.ro.
3. Product coverage in a recognised international outlet (TechCrunch, The
   Register, Heise) — unlikely at this stage; listed for completeness.
4. A conference talk listed on the conference programme (e.g. DevTalks
   Romania, Codecamp).
5. A published paper or preprint (notalone methods paper on arXiv) —
   supports P106 and research statements, not notability on its own.

Not sufficient on their own: GitHub profile, npm/PyPI pages, own website,
Product Hunt page, Reddit or HN threads, dev.to articles written by the
subject. These may be used as references for identifier statements (P2037,
P856) but do not establish notability.

## Wikipedia

An English or Romanian Wikipedia biography requires **significant coverage in
multiple independent, reliable sources** (WP:GNG / WP:BIO). Self-published
material, press releases and interviews driven by the subject do not count
toward that threshold. Realistic path: two or more independent articles about
Brivio or codai in the outlets above, then a product article before a person
article. Draft nothing on Wikipedia until those exist; premature drafts are
deleted and make later attempts harder.
