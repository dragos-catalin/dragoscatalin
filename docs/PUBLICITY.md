# Publicity plan — dragoscatalin.ro

Working list of outlets, what to pitch to each, and two press-release templates
(RO + EN). Press kit lives at `/press`; everything there may be quoted.

## Ground rules

- One launch, one story. Brivio (Q4 2026) is the business story; codai desktop
  0.3 is the developer story. Do not pitch both to the same editor in one mail.
- Lead with a number or a concrete capability, never with "AI-powered".
- Every pitch links to `/press` and to a live URL that works without login.
- Romanian outlets: write in Romanian, include the EN kit as a courtesy.
- Log every send (date, outlet, contact, result) in `docs/tracker.csv` under
  area `publicity`.

## Outlets

### Romanian business & tech press

| Outlet                              | Pitch                                                                                                                    | Format                                                    | Link                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------- |
| start-up.ro                         | Brivio: un ERP românesc construit de un singur developer cu agenți AI; e-Factura, SAF-T, contabilitate în partidă dublă. | Interviu / articol de lansare, 600–900 cuvinte, 2 capturi | https://start-up.ro/contact        |
| wall-street.ro (IT&C)               | Costul real al conformării ANAF pentru IMM-uri și cum îl reduce Brivio.                                                  | Op-ed sau știre de lansare                                | https://www.wall-street.ro/contact |
| Ziarul Financiar (ZF IT Generation) | Un fondator tehnic care lansează un ERP fără finanțare, cu infrastructură proprie; unghiul "solo founder + AI agents".   | Interviu ZF IT Generation (podcast/video)                 | https://www.zf.ro/zf-it-generation |
| Economica.net                       | Cifre: cât costă e-Factura pentru un IMM și ce automatizează Brivio.                                                     | Știre + citat                                             | https://www.economica.net/contact  |
| Adevărul Tech                       | codai: un gateway AI românesc cu prețuri transparente și aplicație desktop cu computer-use pe Windows.                   | Articol explicativ pentru public larg                     | https://adevarul.ro/contact        |
| Profit.ro                           | Brivio ca alternativă românească la SaaS-urile străine de facturare; model de preț.                                      | Știre business                                            | https://www.profit.ro/contact      |

### Product & developer communities (EN)

| Outlet                | Pitch                                                                                                                                                                   | Format                                                  | Link                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| Product Hunt          | codai desktop 0.3 — one model name, every provider, Windows computer-use. Launch Tuesday–Thursday, 00:01 PT.                                                            | Listing + maker comment + 4 screenshots + 30 s video    | https://www.producthunt.com/posts/new       |
| Hacker News — Show HN | "Show HN: codai – an OpenAI-compatible gateway with a single model name and spend caps". Lead with architecture and pricing transparency; answer every comment for 6 h. | Text post, link to GitHub, no marketing tone            | https://news.ycombinator.com/submit         |
| dev.to                | Series: "Shipping a Tauri 2 desktop app with signed auto-updates", "Hash-chained audit logs in PostgreSQL", "Rules, skills and hooks for coding agents".                | 3 technical articles, canonical URL on dragoscatalin.ro | https://dev.to/new                          |
| Hashnode              | Cross-post the dev.to series with canonical link.                                                                                                                       | Articles                                                | https://hashnode.com                        |
| Indie Hackers         | Build-in-public post: revenue model of codai, why a gateway, self-hosted CI on a workstation.                                                                           | Post + milestone updates                                | https://www.indiehackers.com/post/new       |
| Reddit r/Romania      | Brivio: "Am construit un ERP cu e-Factura; feedback de la antreprenori?" Ask, do not sell.                                                                              | Text post, RO                                           | https://www.reddit.com/r/Romania/submit     |
| Reddit r/SideProject  | codai desktop: what it does, what it cost to build, what is next.                                                                                                       | Text post + 1 screenshot                                | https://www.reddit.com/r/SideProject/submit |

### Sequence

1. Week −2: dev.to article #1 live, `/press` verified, Product Hunt "coming soon" page.
2. Week −1: RO press embargoed mails (start-up.ro, ZF, Economica) with the kit.
3. Launch day: Product Hunt + Show HN (codai) **or** RO press (Brivio) — never both.
4. Day +1…+7: Reddit, Indie Hackers, remaining outlets, follow-up mails.

## Press-release template — Brivio launch

### RO

**PENTRU PUBLICARE IMEDIATĂ**

**Brivio lansează platforma de facturare și contabilitate cu e-Factura pentru IMM-urile din România**

_București, [ZI LUNĂ 2026]_ — Brivio ([brivio.ro](https://brivio.ro)), un ERP SaaS pentru firmele din România și Uniunea Europeană, este disponibil public începând de astăzi. Platforma acoperă facturarea cu e-Factura și e-Transport ANAF, contabilitatea în partidă dublă cu note contabile imutabile și jurnal de audit înlănțuit criptografic, raportarea SAF-T D406, importul bancar, salarizarea, stocurile și POS.

„[CITAT DESPRE PROBLEMĂ ȘI SOLUȚIE — 1–2 propoziții]", spune Dragos Catalin Vladulescu, fondatorul Brivio.

Brivio este construit ca monorepo Next.js 16 pe PostgreSQL, cu autentificare prin passkeys, facturare Stripe, un API public cu SDK-uri TypeScript, PHP și Go, un server MCP pentru agenți AI și aplicații desktop pentru Windows, macOS și Linux. Cursul BNR este persistat per document, iar toate ecranele sunt disponibile în română și engleză.

**Prețuri:** [PLAN / PREȚ]. **Disponibilitate:** [ZI LUNĂ 2026], la brivio.ro.

**Despre Brivio.** Brivio este succesorul Datuvia, o platformă de management de business dezvoltată pentru un client între 2024 și 2026. Este dezvoltat în România de Dragos Catalin Vladulescu, developer full-stack și autorul codai, StudiAI și MixAI.

**Contact presă:** contact@dragoscatalin.ro · Kit de presă: https://dragoscatalin.ro/ro/press

### EN

**FOR IMMEDIATE RELEASE**

**Brivio launches invoicing and accounting with ANAF e-Factura for Romanian SMEs**

_Bucharest, [DAY MONTH 2026]_ — Brivio ([brivio.ro](https://brivio.ro)), a SaaS ERP for Romanian and EU businesses, is publicly available today. The platform covers invoicing with ANAF e-Factura and e-Transport, double-entry accounting with immutable journal entries and a hash-chained audit log, SAF-T D406 reporting, bank imports, payroll, inventory and POS.

"[QUOTE ON PROBLEM AND SOLUTION — 1–2 sentences]," said Dragos Catalin Vladulescu, founder of Brivio.

Brivio is built as a Next.js 16 monorepo on PostgreSQL, with passkey authentication, Stripe billing, a public API with TypeScript, PHP and Go SDKs, an MCP server for AI agents, and desktop apps for Windows, macOS and Linux. The BNR exchange rate is persisted per document, and every screen ships in Romanian and English.

**Pricing:** [PLAN / PRICE]. **Availability:** [DAY MONTH 2026], at brivio.ro.

**About Brivio.** Brivio succeeds Datuvia, a business-management platform built for a client between 2024 and 2026. It is developed in Romania by Dragos Catalin Vladulescu, a full-stack developer and the author of codai, StudiAI and MixAI.

**Press contact:** contact@dragoscatalin.ro · Press kit: https://dragoscatalin.ro/press

## Press-release template — codai desktop 0.3

### RO

**codai desktop 0.3: un singur nume de model, toți furnizorii AI, acum cu computer-use pe Windows**

_[ZI LUNĂ 2026]_ — codai ([codai.ro](https://codai.ro)) lansează versiunea 0.3 a aplicației desktop. codai este un gateway compatibil OpenAI și Anthropic care expune un singur nume de model, `codai`, rutat către Google Vertex (Anthropic Claude) și Azure AI Foundry, cu plafoane de cost, prompt caching și prețuri transparente.

Noutăți în 0.3: [LISTĂ 3–5 FUNCȚIONALITĂȚI — computer-use Windows, sesiuni partajate, actualizări semnate etc.].

„[CITAT]", spune Dragos Catalin Vladulescu, autorul codai.

codai include o consolă web, aplicația desktop (Tauri), un agent Android on-device și SDK-uri TypeScript și Python publicate pe npm și PyPI. Codul surselor deschise este la github.com/codai-ro.

**Contact presă:** contact@dragoscatalin.ro · https://dragoscatalin.ro/ro/press

### EN

**codai desktop 0.3: one model name, every AI provider, now with Windows computer-use**

_[DAY MONTH 2026]_ — codai ([codai.ro](https://codai.ro)) releases version 0.3 of its desktop app. codai is an OpenAI- and Anthropic-compatible gateway that exposes a single model name, `codai`, routed across Google Vertex (Anthropic Claude) and Azure AI Foundry with spend caps, prompt caching and transparent pricing.

New in 0.3: [LIST 3–5 FEATURES — Windows computer-use, shared sessions, signed auto-updates, etc.].

"[QUOTE]," said Dragos Catalin Vladulescu, author of codai.

codai ships as a web console, the desktop app (Tauri), an on-device Android agent, and TypeScript and Python SDKs on npm and PyPI. Open-source code is at github.com/codai-ro.

**Press contact:** contact@dragoscatalin.ro · https://dragoscatalin.ro/press
