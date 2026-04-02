---
name: trade-launch-intelligence
description: >
  Trade and export business intelligence for entrepreneurs anywhere in the world. Covers product
  discovery, market research, financial modelling, compliance, sourcing, risk, negotiation,
  legal contracts, funding, digital presence, and post-launch monitoring. Produces 13 branded
  documents: research reports (Market Intelligence, Strategy Brief, Financial Model, Compliance,
  Supply Chain, Risk Report), master docs (Executive HTML Dashboard, Investor Pitch Pack), and
  outreach materials (One-Page Snapshot, cold emails, WhatsApp scripts, LinkedIn messages,
  elevator pitch). Has a Product Discovery Engine — suggests popular and hidden-gem products
  when the user has no product in mind. Always trigger for: export, import, trade research,
  product idea, business plan, pitch email, WhatsApp pitch, one-pager, financial model,
  compliance checklist, sourcing strategy, funding options, contract template, negotiation help,
  business is struggling, pitch to investors, start a trading business, or any trade/export task.
---

## MULTI-AGENT COORDINATION PROTOCOL
*This skill is designed for a specialist team. Follow these coordination rules:*

1. **The Shared Intelligence Ledger**: All agents must use `.trade_intel_audit.md` as the "Single Source of Truth."
   - **READ FIRST**: Before starting any phase, read the current ledger.
   - **WRITE LAST**: After finishing a phase, append your structured findings to the ledger.
2. **Specialist Roles**:
   - `market-analyst`: Phase 0A, 1, 2, 3, 5
   - `finance-advisor`: Phase 7, 9
   - `compliance-expert`: Phase 6, 8
   - `business-strategist`: Phase 4, 10, 11, 12
3. **Delegation**: On platforms supporting sub-agents (like Claude Code), use the `[DELEGATE: agent-name]` marker. On single-agent platforms, adopt the persona described in the agent's `CLAUDE.md`.

---

# Trade Launch Intelligence Skill — Global Edition

## Overview

This skill turns either a **product idea** OR **no idea at all** into a complete, investor-ready business intelligence package — for any entrepreneur, anywhere in the world.

**Who uses this type of intelligence professionally:**
- Export/Import Consultants & Trade Advisors
- Commodity Traders & Agro-processors
- Business Development Managers
- Market Entry Strategists
- Investment Analysts & VC Associates
- International Trade Finance Officers
- Procurement & Supply Chain Officers
- SME Development Advisors (government or NGO)
- Entrepreneurship Coaches & Business Incubators

---

## QUICK-ACCESS MENU
*Returning user or partial request? Jump directly to the right phase.*

```
What do you need?
│
├─► No product yet — need ideas
│       └─► PHASE 0A: Product Discovery Engine
│
├─► Have a product, need full research
│       └─► PHASE 0B → PHASES 1–9 → PHASE 10 (full run)
│
├─► Have research, need documents only
│       └─► PHASE 10: Document Generation (Tier 1–3)
│
├─► Need outreach materials only (emails, WhatsApp, pitch scripts)
│       └─► PHASE 10: Tier 3 (DOC 9–13)
│
├─► Need funding options
│       └─► Read references/funding-directory.md → present top 3–5 matches
│
├─► Need negotiation help
│       └─► Read references/negotiation-playbook.md → apply to situation
│
├─► Need a contract template
│       └─► Read references/legal-contracts.md → select correct template
│
├─► Need to set up digital presence
│       └─► Read references/digital-presence.md → step-by-step guide
│
├─► Something changed — need to update the package
│       └─► PHASE 11: Change Management
│
├─► Business is live — need to track performance
│       └─► PHASE 12: Performance Monitoring
│
└─► Business is struggling or need to exit
        └─► PHASE 12: Read references/failure-exit-protocol.md
```

---

## MASTER EXECUTION FLOW

```
START
  │
  ├─► Does the user have a product in mind?
  │       │
  │       ├─► NO  → PHASE 0A: PRODUCT DISCOVERY ENGINE
  │       │              └─► Recommended products → User selects → PHASE 0B
  │       │
  │       └─► YES → PHASE 0B: CONTEXT INTAKE
  │
  └─► PHASE 0B → PHASES 1–9 → PHASE 10 → PHASE 11 (ongoing) → PHASE 12 (post-launch)
```

---

## PHASE 0A — PRODUCT DISCOVERY ENGINE
**[ACT: market-analyst]**

**Trigger this phase ONLY when the user has no specific product in mind.**

Do NOT assume a product. Instead, ask all the following questions at once (not one by one):

### Discovery Intake Questions

Ask the user:

1. **Your Country / Region** — "What country are you based in, or planning to operate from?"
2. **Starting Capital** — "What is your approximate starting budget? (e.g., $500, $5,000, $50,000, $500,000 — or equivalent in your local currency)"
3. **Preference: Physical or Digital** — "Do you prefer physical products (things you can touch, store, ship) or are you open to digital/service-based trade?"
4. **Trade Direction** — "Are you more interested in: (a) Buying locally and selling internationally — export, (b) Buying internationally and selling locally — import, (c) Buying and selling within your own country, or (d) Open to all?"
5. **Skills & Background** — "What is your background or experience? (e.g., farming, manufacturing, logistics, retail, tech, no specific background)"
6. **Interests / Passions** — "Are there any industries, sectors, or product types you are naturally drawn to or have existing connections in?"
7. **Risk Appetite** — "Are you conservative (prefer stable, low-risk products) or aggressive (willing to take risks for higher returns)?"
8. **Timeline** — "When do you want to start generating revenue? (1 month / 3 months / 6 months / 1 year)"

### Product Discovery Research Protocol

Once intake answers are received, execute these steps:

**Step 1 — Web Search (run all simultaneously):**
- "most profitable export products from [country] [current year]"
- "best products to import into [country] [current year]"
- "hidden gem trading products [region/continent] [current year]"
- "high demand low competition products [country]"
- "fastest growing trade commodities [region] [current year]"
- "top commodities produced in [country]"

**Step 2 — Filter by User Profile:**
Cross-reference all results against: capital range, trade direction preference, skills/background, risk appetite, and timeline. Eliminate products that are out of reach for the user's capital or too complex for their experience level.

**Step 3 — Present Two Curated Lists:**

#### 🌟 Popular / Proven Products (5–7 items)
Well-established, high-demand products with a proven track record in the user's region. Lower risk, more competition, predictable returns.

| # | Product | Why It's Popular | Est. Entry Capital (USD) | Avg. Margin | Difficulty |
|---|---|---|---|---|---|
| 1 | | | | | 🟢 Easy / 🟡 Moderate / 🔴 Hard |

#### 💎 Hidden Gem Products (5–7 items)
Underserved, emerging, or overlooked products with strong upside. Less competition, slightly more research required, but higher reward potential.

| # | Product | Why It's a Hidden Gem | Est. Entry Capital (USD) | Avg. Margin | Difficulty |
|---|---|---|---|---|---|
| 1 | | | | | 🟢 Easy / 🟡 Moderate / 🔴 Hard |

#### 🔥 Top Pick Recommendation
Based on the user's full profile, boldly recommend ONE product as the ideal starting point. Write 3–5 sentences explaining why this specific product fits this specific person in this specific country right now.

**Step 4 — Ask User to Confirm:**
> "Here are your personalised product options. Which one would you like to deep-research? You can choose from the list above, combine two, or name a different product entirely."

**Step 5 — Surface the Free Export Support Agency:**
After presenting the product lists, always add:
> "One more thing before we dive in — [country]'s export promotion agency [search and name it]
> offers free coaching, market intelligence, and sometimes buyer introductions for exactly
> what you're doing. It's worth registering with them before your first shipment. I'll
> include their full details in your Trade Compliance Brief (DOC 4)."

Once a product is confirmed → proceed to **PHASE 0B**.

---

## PHASE 0B — CONTEXT INTAKE
**[ACT: business-strategist]**

*Run this even if the user already had a product. Gather all context needed before research begins.*

If not already captured in Phase 0A, ask the following all at once in a single friendly message:

**Business Context:**
1. **Country of Operation** — Where are you based / operating from?
2. **Target Market** — Local only / Export only / Both?
3. **Starting Capital** — Amount in local currency or USD
4. **Experience Level** — Beginner / Intermediate / Experienced
5. **Timeline to Launch** — 1 month / 3 months / 6 months / 1 year
6. **Business Structure** — Solo / Partnership / Company already registered?

**Brand Identity (for documents):**
7. **Company / Brand Name** — "What would you like your company or brand to be called? This will appear on every document cover, email signature, and your One-Page Snapshot. If you haven't decided yet, just say 'TBD' and we'll use a placeholder."
8. **Brand Initials / Logo Text** — "What 1–3 letters should appear as your logo mark on documents? (e.g. if your brand is 'AgroExport Ghana', your logo mark might be 'AEG')"
9. **Brand Colour Preference** — Ask this as a choice:
   > "Do you have brand colours in mind for your documents, or would you like to use our default professional palette?
   > - **A) Default** — Navy blue & gold (professional, trusted, globally credible)
   > - **B) Custom** — Tell me your preferred primary colour (e.g. 'dark green', 'burgundy', 'royal blue', '#2E4057') and I'll build a palette around it
   > - **C) Suggest one** — I'll pick the best colour for your product and market"

**How to handle brand colour responses:**
- **Option A (Default):** Use `Primary: #1B2E4B` | `Accent: #C8A951` — no changes to styling
- **Option B (Custom):** User provides a colour → derive the full palette using the rules in `document-styling.md` Section 1B
- **Option C (Suggest):** Auto-select based on product type using the palette map in `document-styling.md` Section 1C

**Build and store the complete User Context Profile:**

```
USER CONTEXT PROFILE
────────────────────────────────────────────────────────────
Product:              [confirmed product]
Country:              [country]
Region/Continent:     [auto-derive]
Local Currency:       [auto-derive from country]
FX Rate (USD):        [search current rate]
Market Focus:         [local / export / import / hybrid]
Starting Capital:     [local currency amount] = [USD equivalent]
Experience Level:     [beginner / intermediate / experienced]
Launch Timeline:      [X months]
Business Structure:   [solo / partnership / registered company]
────────────────────────────────────────────────────────────
BRAND PROFILE
Company/Brand Name:   [name — or "TBD" if not decided]
Logo Mark (initials): [1–3 letters]
Brand Primary Colour: [hex code]
Brand Accent Colour:  [hex code — derived or default gold]
Colour Theme Name:    [e.g. "Default Navy/Gold" / "Forest Green" / "Custom #2E4057"]
────────────────────────────────────────────────────────────
```

**If the user says "TBD" for brand name:** Use `[YOUR BRAND NAME]` as a placeholder throughout all documents. Remind them at the end of Phase 9 (Action Plan) to finalise their brand name before sending any documents externally.

**Currency & Localisation Rule:** All financial figures must be shown in BOTH local currency AND USD. Use the current exchange rate (search if needed). All regulatory references must be specific to the user's declared country.

---

## PHASE 1 — Product Intelligence Report
**[ACT: market-analyst]**

### 1.1 Product Overview
- Full description, variants, and industrial classifications
- HS Code — search and confirm correct 6-digit Harmonized System code
- NAICS/SIC/SITC category
- Seasonal availability (if applicable)
- Shelf life, storage, and handling requirements
- Processing stages (raw → value-added opportunities)

### 1.2 Market Viability Score
Rate the product out of 100 across 10 dimensions:

| Dimension | Score /10 | Justification |
|---|---|---|
| Global Demand | | |
| Local Demand (user's country) | | |
| Profit Margin Potential | | |
| Ease of Sourcing (from user's location) | | |
| Regulatory Complexity (user's country) | | |
| Market Saturation | | |
| Entry Barrier | | |
| Scalability | | |
| Export / Cross-border Potential | | |
| Stability / Seasonality | | |

**Overall Viability Score: X/100** — Verdict: 🟢 High / 🟡 Moderate / 🔴 Low

### 1.3 Market Size & Trends
Search and report:
- Global market size (USD) — current year + 5-year CAGR
- Regional market size (user's continent)
- Local market size (user's country, if data available)
- Key trends driving growth or decline
- Demand forecast next 3–5 years
- Top consuming countries globally

### 1.4 Lucrativeness Analysis
- Average local selling price in user's country
- Average export/import price (FOB/CIF)
- Price trend last 3 years (rising / falling / stable)
- Typical gross margin range globally and locally
- Comparison with 2–3 alternative products in same category

---

## PHASE 2 — Competitive Intelligence

### 2.1 Top Global Players
Search and list **Top 5–10 international companies** dominating this product:
- Company | Country | Revenue/share | Key competitive advantage

### 2.2 Top Players in User's Country/Region
Search and list **Top 5–10 local businesses or individuals**:
- Name | Location | Scale of operation | Why they are successful

### 2.3 Competitive Gap Analysis
Identify:
- Underserved customer segments
- Quality or processing gaps
- Geographic gaps (areas not served)
- Certification gaps (products sold without premium certifications)
- Price positioning opportunities

### 2.4 "Why You Can Win" Section
3–5 bullet points on specific, actionable entry advantages available to this user in their country.

---

## PHASE 3 — Sourcing Strategy

Read `references/sourcing-guide.md` for detailed frameworks. Apply to user's country context.
Read `references/negotiation-playbook.md` Section 2 when helping the user negotiate with suppliers.
Read `references/legal-contracts.md` Template 1 (Supply Agreement) when the user needs a supplier contract.

### 3.1 Local Sourcing (User's Country)
- Primary sourcing regions, states, provinces, or districts
- Specific markets, cooperatives, commodity boards, trade associations
- Sourcing seasons (if commodity)
- Price range at source
- Quality grading standards to check
- Supplier due diligence checklist (5–8 criteria)

### 3.2 International Sourcing (if importing or supplementing locally)
- Top global source countries for this product
- Recommended B2B platforms: Alibaba, Global Sources, TradeIndia, TradeKey, EC21, Made-in-China, Europages, SEAIR
- Typical MOQ (Minimum Order Quantities)
- Lead times
- Incoterms to negotiate — explain FOB, CIF, DDP simply
- Red flags when sourcing internationally

### 3.3 Sourcing Risk Assessment
- Supply chain disruption risks specific to user's country
- Adulteration / quality fraud risks
- Currency / payment risks for this region
- Infrastructure / logistics challenges specific to country
- Mitigation strategies for each

---

## PHASE 4 — Trade Direction Decision Framework

Adapt matrix to user's country context:

| Factor | Export | Domestic Sale | Import + Resell |
|---|---|---|---|
| Price Premium | Higher (forex) | Lower (local) | Depends on product |
| Volume Required | Larger MOQ | Flexible | Medium |
| Regulatory Burden | Higher | Moderate | Moderate–High |
| Payment Risk | LC / TT | Cash / local transfer | Advance to supplier |
| Profit Margin | 30–60% higher | Moderate | Variable |
| Setup Time | 3–6 months | 1–3 months | 2–4 months |
| Capital Required | Higher | Lower | Medium |

**Recommendation** — aligned to User Context Profile:
- Option A: Start domestic, scale to export (beginner / low capital)
- Option B: Export from day one (experienced / high capital)
- Option C: Import and sell locally (arbitrage model)
- Option D: Hybrid — domestic sales fund export growth

---

## PHASE 5 — Export / Import Intelligence

Read `references/global-trade-compliance.md` for country-by-country frameworks.
Read `references/funding-directory.md` Section matching user's region for trade finance and incentive options.
Read `references/negotiation-playbook.md` Section 3 for buyer negotiation and Section 5 for LC/bank negotiation.
Read `references/legal-contracts.md` Template 2 (Sales/Purchase Contract) for export deal documentation.

### 5.1 Applicable Trade Framework
Determine and clearly state for user's country:
- Main export/import promotion agency
- Customs authority
- Key product standards/quality body
- Applicable regional trade bloc (EU / AfCFTA / ASEAN / USMCA / Mercosur / ECOWAS / GCC / SADC / COMESA / CPTPP / etc.)
- Currency considerations and forex mechanism for trade payments

### 5.2 Top Destination / Source Markets
Search and rank **Top 5 countries**:
- Country | Import/export volume | Duties on origin country goods | Trade agreement benefit | Key entry requirements

### 5.3 Target Companies to Sell To / Buy From
Search and identify **10–15 international companies** for this product:
- Company | Country | What they buy or sell | How to contact them
- Use: Kompass, Alibaba, PANJIVA, ImportGenius, EC21, Europages, Global Sources, TradeKey

### 5.4 Export/Import Process — Step by Step (Country-Adapted)
1. Business/company registration ([country's authority])
2. Product certification / standards compliance ([country's body])
3. Export/import agency registration ([country's agency])
4. Customs export/import declaration
5. Quality inspection and pre-shipment inspection
6. Freight booking (sea / air / road / rail — whichever is primary for this country)
7. Payment instrument (LC / TT / open account — recommend by buyer risk level)
8. Cargo insurance
9. Final customs clearance at destination

### 5.5 Trade Incentives Available
Search: "export incentives [user's country] [current year]"
Report:
- Export credit / pre-finance programs
- Duty drawback / rebate schemes
- Export grants or matching fund programs
- Tax exemptions on export income
- Government trade promotion initiatives
- Regional trade agreement tariff preferences

### 5.6 Free Market Intelligence Resources
Always present the following free resources relevant to the user's target market:

**If targeting EUROPE:**
- **CBI (Centre for the Promotion of Imports)** — cbi.eu
  Free market studies, buyer introductions, and export coaching for exporters from
  developing countries. Covers 100+ products: moringa, avocado, cocoa, herbs, spices,
  cosmetics, coffee, and more. Search "[product] CBI market entry" for free PDF guides.
  CBI also runs coaching programmes — apply at cbi.eu/for-exporters.

**If targeting USA:**
- **USDA FAS (Foreign Agricultural Service)** — fas.usda.gov — free market reports
- **US Commercial Service** — export.gov — buyer matching for eligible countries
- **AGOA.info** — for African exporters: check duty-free eligibility by product

**If targeting CHINA:**
- **GACC registration guide** — gacc.gov.cn — mandatory for food exporters
- **CCPIT (China Council for Promotion of International Trade)** — buyer matching

**Always recommend:**
- **ITC Trade Map** — trademap.org — free trade statistics by product and country
- **Market Access Map** — macmap.org — tariff rates by product and destination (WTO/ITC, free)
- **User's national export promotion agency** — see global-trade-compliance.md for country-specific agency

---

## PHASE 6 — Regulatory & Licensing Checklist

Read `references/global-trade-compliance.md` for region-specific regulatory detail.

### 6.1 Business Registration (Country-Specific)
- Registration authority, process, cost, timeline
- Tax ID / VAT registration
- Business bank account requirements
- Industry-specific licences (food, health, mining, pharma, etc.)

### 6.2 Product Certifications (Country + Product Type)
- Food/beverage: local food safety authority + international (FDA / EU SPS / GACC)
- Manufactured goods: local standards body + ISO / CE / UKCA as applicable
- Agricultural: phytosanitary authority + fumigation + quarantine
- Cosmetics: local health authority + destination country rules
- Minerals: mining licence + export permit

### 6.3 Destination Country Requirements
For each top target market:
- Certificate of origin requirements
- Phytosanitary / SPS / food safety compliance
- Labelling and packaging rules
- Import restrictions or bans
- Halal / Kosher / Organic / Fair Trade certifications where relevant

### 6.4 Full Compliance Cost & Timeline Summary

| License / Cert | Authority | Cost (local + USD) | Timeline | Renewal |
|---|---|---|---|---|
| Business registration | | | | |
| Tax ID / VAT | | | | |
| Product safety/quality cert | | | | |
| Export/import agency reg. | | | | |
| Phytosanitary (if agro) | | | | |
| Pre-shipment inspection | | | | |

**Total Compliance Budget: [local currency] / USD X,XXX**
**Estimated Time to Full Compliance: X weeks**

---

## PHASE 7 — Financial Model
**[ACT: finance-advisor]**

Read `references/financial-model.md` for calculation formulas and frameworks.
Read `references/funding-directory.md` Sections 7 & 8 for funding type matching and application tips.
Present the top 3 most relevant funding options for the user's country, stage, and capital need.

Show all figures in **local currency AND USD**.

### 7.1 Startup Cost Breakdown

| Category | Item | Local Currency | USD | Notes |
|---|---|---|---|---|
| Legal & Compliance | Registration, licences | | | |
| Infrastructure | Warehouse, equipment | | | |
| Inventory | First order | | | |
| Packaging & Branding | | | | |
| Marketing | B2B portals, trade fairs | | | |
| Working Capital | 3-month reserve | | | |
| Contingency | 10% buffer | | | |
| **TOTAL** | | | | |

### 7.2 Unit Economics
- All-in cost per unit
- Selling price (local + international)
- Gross margin per unit and %
- Break-even volume and revenue

### 7.3 Revenue Projections (3 Years)

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Volume | | | |
| Revenue (local currency) | | | |
| Revenue (USD) | | | |
| COGS | | | |
| Gross Profit | | | |
| Operating Expenses | | | |
| EBITDA | | | |
| Net Profit | | | |
| ROI % | | | |

### 7.4 ROI & Payback
- Payback period (months)
- 3-year cumulative ROI %
- Sensitivity: Conservative / Base / Optimistic

### 7.5 Country-Specific Cost Factors
Search and include:
- Port / border crossing fees
- Local transport costs
- Government levies / export taxes
- Banking / FX transaction costs
- Power / infrastructure costs
- Labour rates (skilled and unskilled)
- Warehousing costs (per sqm or per ton)

---

## PHASE 8 — Risk Assessment Report

Read `references/risk-assessment.md` for scoring methodology.

### 8.1 Universal Risk Register

| Risk | Likelihood (1–5) | Impact (1–5) | Score | Mitigation |
|---|---|---|---|---|
| FX / Currency Risk | | | | |
| Commodity Price Volatility | | | | |
| Regulatory/Policy Change | | | | |
| Buyer / Seller Default | | | | |
| Supply Chain Disruption | | | | |
| Logistics / Infrastructure Risk | | | | |
| Product Quality Rejection | | | | |
| Political / Security Risk | | | | |
| Increased Competition | | | | |
| Demand Shift / Market Change | | | | |
| Country-Specific Risk 1 | | | | |
| Country-Specific Risk 2 | | | | |

**Overall Risk Rating:** 🟢 Low / 🟡 Medium / 🔴 High

### 8.2 Country-Specific Risk Narrative
Search: "business environment risks [user's country] [current year]"
Summarise top 3–5 country-specific risks and how successful traders there manage them. Never use generic text — always adapt to the declared country.

---

## PHASE 9 — 30/60/90-Day Action Plan

Adapt every action item to the user's country and regulatory environment.
Read `references/digital-presence.md` for the Week 1 and Month 1 digital setup steps — include relevant ones.
Read `references/legal-contracts.md` to include the correct contract templates the user needs at each stage.
Read `references/negotiation-playbook.md` Section 9 (preparation checklist) — embed into Month 1 sourcing steps.

### Month 1 — Foundation
- [ ] Register business entity at [country's registration authority]
- [ ] Obtain tax ID / VAT number
- [ ] Open dedicated business bank account + forex/international account
- [ ] Begin product certification applications ([relevant body]) — start early, they take time
- [ ] Visit 3+ sourcing locations, collect and test samples at accredited lab
- [ ] Score and select primary + backup suppliers using scoring matrix (`sourcing-guide.md` §3.2)
- [ ] Negotiate supply agreement terms — read `negotiation-playbook.md` §2 before meeting suppliers
- [ ] Sign Supply Agreement with primary supplier using template in `legal-contracts.md` §1
- [ ] Set up storage / warehouse at suitable location
- [ ] Register domain + set up professional email (read `digital-presence.md` §1 — Week 1 steps)
- [ ] Download and configure WhatsApp Business (`digital-presence.md` §3)

### Month 2 — Preparation
- [ ] Finalise all licences and certifications — use regulatory consultant if behind schedule
- [ ] Place first inventory order — pay max 30% advance (see `negotiation-playbook.md` §2)
- [ ] Build 5-page website: Home, Products, About, Certifications, Contact (`digital-presence.md` §2)
- [ ] Create LinkedIn personal + company page (`digital-presence.md` §4)
- [ ] Register on 2+ B2B trade portals — Alibaba + one region-specific (`digital-presence.md` §5)
- [ ] Identify 10 target buyers — use DOC 5 (Sourcing Plan) buyer target list
- [ ] Draft and send first cold outreach using DOC 10 email templates
- [ ] Apply for trade finance / export credit — see `funding-directory.md` for country options
- [ ] Apply for export promotion agency grants (if available in your country)

### Month 3 — Launch
- [ ] Receive, inspect, and test first inventory batch against agreed spec
- [ ] Execute first sale (domestic or export) — sign Sales Contract (`legal-contracts.md` §2)
- [ ] Negotiate payment terms with first buyer — read `negotiation-playbook.md` §3 first
- [ ] Attend 1 trade fair or business matching event — memorise elevator pitch from DOC 13
- [ ] Collect quality certificates / buyer testimonials after first delivery
- [ ] Run first Monthly Business Review using `performance-monitoring.md` §1 template
- [ ] Review all outreach performance — which DOC 10/11/12 templates got replies?
- [ ] Plan Month 4 scale-up: which lever to pull first (volume / new buyer / new market)

---

## PHASE 10 — Role-Based Document Generation
**[ACT: business-strategist] (Lead Orchestrator)**

Read `references/document-templates.md` before generating any document.
Read `references/document-styling.md` for visual styling — EVERY document
must be visually professional. Plain text is not acceptable.

**Format rules by document:**
- DOC 1–6, DOC 8, DOC 10–13 → Generate as styled **.docx** files
  Read docx SKILL.md (`/mnt/skills/public/docx/SKILL.md`) before generating
- DOC 7 (Executive Master Summary) → Generate as **single HTML file**
  (self-contained, browser-viewable dashboard with CSS charts)
- DOC 9 (One-Page Snapshot) → Generate as **single HTML file**
  (print-ready A4, all metrics visible above the fold)

**Visual minimum standard:** Every .docx must have: navy cover page,
colour-coded tables, traffic-light status cells, call-out boxes for
key insights, and a professional footer. See `document-styling.md`.

### TIER 1 — ROLE-SPECIFIC DELIVERABLES

**DOC 1 — Market Intelligence Report** `[Market Research Analyst voice]`
→ Data-led, cited, analytical. Tables and benchmarks dominate.
→ Draws from: Phase 1 (product + market data), Phase 2 (competitive landscape)
→ Audience: Business owner, investors, strategic partners

**DOC 2 — Business Strategy Brief** `[Business Strategist voice]`
→ Decisive, framework-driven. SWOT + 3 strategic options + recommendation.
→ Draws from: Phase 1 (market), Phase 2 (competitive), Phase 4 (trade direction)
→ Audience: Founder, board, strategic investors

**DOC 3 — Financial Model & Projections** `[Financial Analyst voice]`
→ Numbers-first, conservative, scenario-based. All assumptions stated explicitly.
→ Draws from: Phase 7 (all financial data)
→ Audience: Banks, investors, grant bodies, business owner

**DOC 4 — Trade Compliance Brief** `[Regulatory / Compliance Advisor voice]`
→ Procedural, authoritative, checklist-driven. Official/legal tone.
→ Draws from: Phase 5 (export/import intelligence), Phase 6 (regulatory checklist)
→ Audience: Business owner, customs agent, freight forwarder, compliance officer

**DOC 5 — Sourcing & Supply Chain Plan** `[Supply Chain Specialist voice]`
→ Operational, step-by-step. Process flows and supplier scoring matrices.
→ Draws from: Phase 3 (sourcing strategy)
→ Audience: Operations team, procurement manager, business owner

**DOC 6 — Risk Assessment Report** `[Risk Advisor voice]`
→ Risk register, scenario analysis, contingency plans. Structured, evidence-based.
→ Draws from: Phase 8 (risk assessment) + risks surfaced across all phases
→ Audience: Management, investors, insurance brokers, lenders

### TIER 2 — MASTER DOCUMENTS

**DOC 7 — Executive Master Summary** `[CEO-level synthesis]`
→ 6–8 pages maximum. Synthesises DOC 1–6 into one at-a-glance brief.
→ Includes: dashboard snapshot, key findings per domain, top 10 action list.
→ Generate ONLY after DOC 1–6 are complete.
→ Audience: Business owner, senior investors, strategic partners

**DOC 8 — Investor & Bank Pitch Pack** `[Investor Relations voice]`
→ 15-slide persuasive narrative deck.
→ Draws on: DOC 2 (strategy), DOC 3 (financials), DOC 7 (summary).
→ Generate ONLY after DOC 7 is complete.
→ Audience: Investors, bank loan officers, grant bodies, strategic partners

### TIER 3 — OUTREACH & COMMUNICATION PACK

Generate Tier 3 only after DOC 7 is complete. All facts and numbers
in Tier 3 must be pulled directly from DOC 7 — never from memory.
Tone shifts here: analytical → executive → **human and conversational**.

**DOC 9 — One-Page Business Snapshot** `[Universal first impression]`
→ Single A4 page. Product photo, 6 key numbers, the opportunity in
  one sentence, a specific Ask, contact details. Print-ready.
→ Audience: Anyone — buyer, investor, partner — within 30 seconds

**DOC 10 — Cold Email Templates** `[Business Development voice]`
→ 3 variants: Buyer outreach, Investor pitch, Bank/Grant application.
→ Each under 200 words. Subject line + 4 paragraphs + one clear ask.
→ Includes a follow-up email for each variant (no reply after 7 days).

**DOC 11 — WhatsApp & Direct Message Templates** `[Mobile-first outreach]`
→ 5 message templates: Cold intro, Warm intro, Buyer follow-up,
  Partner outreach, Check-in for gone-quiet leads.
→ Includes WhatsApp Business profile setup checklist.

**DOC 12 — LinkedIn & B2B Portal Messages** `[Professional digital outreach]`
→ 4 templates: LinkedIn connection note, LinkedIn first message,
  B2B portal intro message, portal follow-up after no reply.
→ Adapted for Alibaba, Kompass, TradeKey, EC21, Europages inboxes.

**DOC 13 — Trade Fair & Elevator Pitch Scripts** `[In-person sales]`
→ 3 scripts: 30-second opener, 60-second follow-through, 2-minute
  deep dive. Written to be memorised and spoken — not read.
→ Includes full trade fair preparation checklist (before / during / after).

### Full Generation Sequence (Non-Negotiable)
```
TIER 1: DOC 1 → DOC 2 → DOC 3 → DOC 4 → DOC 5 → DOC 6
TIER 2: DOC 7 (needs DOC 1–6) → DOC 8 (needs DOC 7)
TIER 3: DOC 9 → DOC 10 → DOC 11 → DOC 12 → DOC 13 (all need DOC 7)
```
Numbers in DOC 9–13 must match DOC 3 exactly. If they conflict, trust DOC 3.

---

## PHASE 11 — Change Management

Read `references/change-management.md` before handling any update request.

### When a User Reports a Change

First, classify the change using the decision tree in `change-management.md`:

**Amendment** (small, targeted) → update only affected documents,
add an Amendment Note block at the top of each, log in CHANGE-LOG.

**Full Revision** (major pivot) → re-run only affected phases,
regenerate affected documents with Revision Cover Sheet, produce
updated DOC 7 and DOC 9, log as new version in CHANGE-LOG.

### Change Log
Every project must have a `CHANGE-LOG.md` file. When producing
the initial package (Phase 10), create the CHANGE-LOG with v1.0
entry. Update it for every subsequent amendment or revision.

### Document Sync Rule
When any document changes, check the sync dependency table in
`change-management.md` to identify which other documents must
also be reviewed and updated. Numbers in DOC 9–13 must always
match DOC 3 and DOC 7 — this is the golden sync rule.

### Never Change Without User Confirmation
These 5 items require explicit user sign-off before any update:
1. The product itself
2. Financial projection figures
3. The target country
4. The funding ask amount (in DOC 8, 9, 10)
5. Overall risk rating (especially if moving to 🔴 High)

---

## PHASE 12 — Post-Launch Monitoring & Business Health

This phase activates after the business has launched (Month 3+).
It is also triggered directly via the Quick-Access Menu for returning users.

Read `references/performance-monitoring.md` for full monthly review templates and KPI frameworks.
Read `references/failure-exit-protocol.md` if the user reports the business is struggling.

### 12.1 Monthly Business Review
When user asks "how is my business doing?" or "help me review my numbers":
→ Use the Monthly Business Review template from `performance-monitoring.md`
→ Fill in actual vs. plan from DOC 3 (Financial Model)
→ Apply the Traffic Light System: 🟢 On Track / 🟡 Watch / 🔴 Act / ⚫ Crisis
→ Produce a 1-page review summary with next month's targets

### 12.2 Scaling Decision
When user asks "should I scale?" or "I want to grow":
→ Run through the Scale Signal Checklist from `performance-monitoring.md`
→ Present the scaling options table in risk order
→ Recommend the lowest-risk scaling option that fits their current metrics

### 12.3 Pivot Decision
When business is consistently 🔴 for 2+ months:
→ Run the Pivot Diagnosis from `performance-monitoring.md`
→ Identify root cause: market / supply / sales / financial
→ Present 3 specific rescue options before any exit discussion

### 12.4 Exit / Wind-Down
When user indicates the business cannot continue:
→ Read `references/failure-exit-protocol.md` fully before responding
→ Run through the Triage Protocol (5 steps) with the user
→ Guide through the Graceful Wind-Down checklist
→ End every exit conversation with the Lessons Captured template
→ Close with the Starting Again — Reset Playbook

### 12.5 Annual Review
→ Trigger when user asks for end-of-year review
→ Use the Annual Review Checklist from `performance-monitoring.md`
→ Update DOC 3 (Financial Model) with actuals vs. projections
→ Trigger Change Management (Phase 11) for any strategy updates
→ Produce an updated DOC 7 (Executive Master Summary) for Year [N+1]

---

## Output Format Rules

1. Always begin with a **one-page Executive Summary**
2. Always display the **User Context Profile** at the top of every research output
3. All financial figures shown in **local currency AND USD**
4. Use tables for all comparisons
5. Use ✅ / ❌ / ⚠️ for compliance indicators
6. Use 🟢 / 🟡 / 🔴 for risk and viability ratings
7. Cite all web-searched data with source and date
8. End every report with a **"Verdict & Recommendation"** section
9. **Never produce country-specific content that doesn't match the user's declared country**

---

## Quality Standards

- Every price, market size, and regulatory claim must be sourced (web search preferred)
- Never fabricate company names, regulatory fees, or statistics
- Financial projections must be conservative
- If data is unavailable for a specific country or product, say so and provide the closest benchmark
- All documents must be professional enough to show to a bank, investor, or government trade agency
- The skill must fully adapt regulatory, currency, sourcing, and market content to each user's declared country
- Never output Nigeria-specific content for non-Nigerian users — always adapt fully
- Numbers in DOC 9–13 must always match DOC 3 exactly
- DOC 7 is INTERNAL only — never suggest sending it to external parties
- DOC 8 is story-driven — it selects from DOC 7, it does not copy it

---

## Reference File Index

| File | Contents | Used In |
|---|---|---|
| `document-templates.md` | All 13 document templates (Tier 1–3) | Phase 10 |
| `global-trade-compliance.md` | 50+ countries: agencies, regulations, ports, trade blocs | Phase 5, 6 |
| `financial-model.md` | Startup costs, unit economics, P&L, ROI formulas | Phase 7 |
| `sourcing-guide.md` | Global sourcing maps, supplier due diligence | Phase 3 |
| `risk-assessment.md` | Risk scoring, country risks, contingency plans | Phase 8 |
| `change-management.md` | Version control, amendment notes, change log | Phase 11 |
| `funding-directory.md` | 50+ funders by region, grant programs, finance types | Phase 5, 7 |
| `digital-presence.md` | Domain, website, WhatsApp, LinkedIn, B2B portals | Phase 9 |
| `negotiation-playbook.md` | Supplier, buyer, freight, bank, investor negotiation | Phase 3, 5 |
| `legal-contracts.md` | Supply agreement, export contract, NDA, LOI templates | Phase 3, 5, 9 |
| `performance-monitoring.md` | Monthly review, KPIs, scaling, pivot frameworks | Phase 12 |
| `failure-exit-protocol.md` | Triage, wind-down, asset recovery, reset playbook | Phase 12 |
