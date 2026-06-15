## Visual Direction

AgentGuard should feel like an editorial developer infrastructure website built around safety, control, and risk visibility.

The design should not look like a normal Web3 dApp, trading bot, or cyberpunk AI dashboard. It should feel like a premium control room for autonomous trading systems: calm, technical, structured, and serious.

The interface language should borrow from:

* trading terminals
* flight safety dashboards
* incident logs
* developer SDK pages
* risk operations control rooms

The visual story is simple:

trades move through a pipeline.
AgentGuard sits at the checkpoint.
Every trade is either approved, resized, reduced, blocked, flattened, or logged.

Use black-on-black layering, thin bordered panels, restrained glow, editorial display type, terminal-style code surfaces, status chips, policy cards, event timelines, safety gates, and audit trails.

The design should feel:

* precise
* premium
* infrastructural
* developer-native
* safety-first
* calm under pressure
* editorial, but not decorative

## Typography System

AgentGuard uses a three-font system: an editorial serif for high-impact narrative moments, a neutral sans-serif for product clarity, and a developer mono for logs, code, policies, and risk data.

### Font Families

| Role              | Font          | Usage                                                                                  |
| ----------------- | ------------- | -------------------------------------------------------------------------------------- |
| Editorial Display | Editorial New | Hero headlines, manifesto lines, section openers, high-conviction statements           |
| Product Sans      | Georama       | Navigation, body text, buttons, cards, product UI, labels                              |
| Developer Mono    | Geist Mono    | Code blocks, trade IDs, logs, policy rules, JSON, addresses, timestamps, event streams |

### Typography Rules

* Use Editorial New only for large brand/narrative moments. Never use it inside dense product UI.
* Use Satoshi as the default interface font across the website.
* Use Geist Mono anywhere the content represents system behaviour, execution, code, audit trails, or risk data.
* Keep body text calm and readable. Avoid oversized marketing copy in product sections.
* Use mono numbers for risk scores, limits, logs, policy thresholds, trade sizes, and timestamps.
* Avoid using more than 3 weights on one page. The system should feel controlled, not noisy.

### Suggested Scale

| Role            | Font          |    Size |  Weight | Line Height | Notes                              |
| --------------- | ------------- | ------: | ------: | ----------: | ---------------------------------- |
| Hero Display    | Editorial New | 72–96px |     400 |   0.95–1.05 | Tight, cinematic, used sparingly   |
| Section Heading | Satoshi       | 44–56px | 500/600 |   1.05–1.15 | Clean product confidence           |
| Subheading      | Satoshi       | 22–28px | 400/500 |        1.35 | Use muted gray                     |
| Body            | Satoshi       | 16–18px |     400 |     1.6–1.7 | Main reading text                  |
| UI Label        | Satoshi       | 11–13px | 500/600 |         1.2 | Uppercase, slight tracking         |
| Code / Logs     | Geist Mono    | 13–15px | 400/500 |        1.55 | Use tabular numbers                |
| Metrics         | Geist Mono    | 32–48px | 600/700 |         1.0 | For risk scores and state counters |

## Color System

AgentGuard uses a dark operational palette built around risk states. The colours are functional first. They should communicate system status before they decorate the interface.

### Core Palette

| Token          | Hex                          | Usage                                           |
| -------------- | ---------------------------- | ----------------------------------------------- |
| Obsidian Black | `#080A0C`                    | Main background                                 |
| Soft White     | `#F5F7FA`                    | Primary text                                    |
| Muted Gray     | `#8A94A6`                    | Secondary text, descriptions, inactive labels   |
| Panel Black    | `#0D1115`                    | Raised surfaces, cards, console panels          |
| Elevated Black | `#121820`                    | Hover surfaces, active cards, modal backgrounds |
| Border Dark    | `#1F2933`                    | Default borders, dividers, card outlines        |
| Border Soft    | `rgba(245, 247, 250, 0.08)`  | Subtle panel borders                            |
| Grid Line      | `rgba(245, 247, 250, 0.035)` | Background grid / control-room structure        |

### Risk State Accents

| Token           | Hex       | Usage                                      |
| --------------- | --------- | ------------------------------------------ |
| Policy Green    | `#4ADE80` | Approved trades, healthy state, safe mode  |
| Risk Amber      | `#FBBF24` | Resize, warnings, elevated volatility      |
| Kill Switch Red | `#F43F5E` | Blocked trades, flat mode, drawdown breach |
| Audit Blue      | `#38BDF8` | Logs, links, developer docs, replay mode   |

### Color Usage Rules

* Obsidian Black is the default environment. Do not drift into navy, purple, or generic gradient dark mode.
* Accent colours represent system states. Do not use them randomly for decoration.
* Policy Green should feel safe and controlled, not “crypto neon.”
* Risk Amber is for caution, resizing, elevated risk, and human review.
* Kill Switch Red is reserved for serious states: blocked orders, drawdown breaches, flat mode, emergency pause.
* Audit Blue is for developer actions: logs, replay mode, documentation links, API references, and traceability.
* Most sections should remain black, white, gray, and border-led. Accent colour should appear as signal.
* Use glow carefully. A tiny status glow is good. A cyberpunk glow storm is not.

## Layout System

AgentGuard uses a structured control-room layout system. Every section should feel like part of an operational interface, not a generic SaaS landing page.

The layout should be built around:

* wide editorial hero sections
* black-on-black interface panels
* product-led dashboard previews
* policy cards
* incident logs
* horizontal trade pipelines
* risk state timelines
* SDK/code windows
* controlled grid alignment

### Page Width

* Max content width: 1200px–1280px.
* Hero content can stretch wider when showing product mockups or dashboard previews.
* Text-heavy sections should stay narrower, around 680px–760px, for readability.
* Product UI sections can use full-width panels inside the max-width container.

### Grid

Use a 12-column grid on desktop.

Common layouts:

* Hero: 5 columns text / 7 columns product visual.
* Product explanation: 4 columns narrative / 8 columns interface preview.
* Feature sections: asymmetric 2-column layouts, not equal generic cards.
* Logs and policy sections: dense grid with timeline or table-based structure.
* CTA sections: centered but restrained, never overly salesy.

### Section Rhythm

* Hero sections should feel spacious and cinematic.
* Product sections should feel denser and operational.
* Educational sections should use more breathing room.
* Dashboard/interface sections should use tighter spacing, like real software.

Suggested spacing:

* Hero padding: 120px–160px top, 100px–140px bottom.
* Major section padding: 96px–128px vertical.
* Dense product sections: 64px–88px vertical.
* Card gaps: 20px–28px.
* Panel padding: 24px–32px.
* Compact UI padding: 12px–16px.

### Composition Rules

* Avoid centered text on every section.
* Avoid repetitive 3-card feature grids.
* Use product visuals as proof, not decoration.
* Every major section should have one clear dominant element.
* Use empty space intentionally. The interface should feel calm, not sparse.
* Keep visual weight low until a risk moment appears, then use colour and hierarchy to create tension.

## Surface System

AgentGuard surfaces should feel like operational panels inside a risk control room.

The design should rely on thin borders, black-on-black depth, soft inner gradients, subtle glow, and functional colour states.

### Surface Tokens

| Token           | Value                       | Usage                                  |
| --------------- | --------------------------- | -------------------------------------- |
| Main Background | `#080A0C`                   | Global page background                 |
| Panel Surface   | `#0D1115`                   | Cards, dashboard sections, SDK windows |
| Raised Surface  | `#121820`                   | Active panels, hover cards, modals     |
| Deep Surface    | `#050607`                   | Hero depth, footer, dark visual wells  |
| Border Default  | `#1F2933`                   | Cards, panels, dividers                |
| Border Soft     | `rgba(245, 247, 250, 0.08)` | Subtle outlines                        |
| Border Active   | `rgba(74, 222, 128, 0.35)`  | Safe/approved active surfaces          |
| Glow Green      | `rgba(74, 222, 128, 0.16)`  | Healthy system glow                    |
| Glow Amber      | `rgba(251, 191, 36, 0.16)`  | Warning glow                           |
| Glow Red        | `rgba(244, 63, 94, 0.18)`   | Blocked/critical glow                  |
| Glow Blue       | `rgba(56, 189, 248, 0.16)`  | Audit/replay/log glow                  |

### Panels

Panels should look like real product surfaces.

Default panel:

* Background: `#0D1115`
* Border: `1px solid #1F2933`
* Radius: 14px–16px
* Shadow: very subtle, mostly invisible on black
* Inner gradient: soft top-left highlight using `rgba(245,247,250,0.03)`
* Hover: border brightens slightly, no aggressive lift

### Product Preview Panels

Large product previews should feel like embedded software.

Use:

* top bars
* tabs
* status chips
* timestamps
* logs
* policy rows
* event timelines
* code snippets
* risk outcome labels

Avoid fake decorative cards with random icons.

### Black-on-Black Depth

Depth should come from:

* border contrast
* slight surface shifts
* low-opacity grid lines
* inner glows
* masked gradients
* subtle noise
* section darkness changes

Do not use bright shadows.
Do not use glassmorphism.
Do not use purple/blue cyberpunk gradients.

### Background Texture

Use a subtle control-room grid:

* thin grid lines at very low opacity
* optional radial spotlight behind hero product visual
* optional faint scanline texture inside logs/code panels only

The background should feel engineered, not decorative.

## Core Component Language

AgentGuard components should communicate risk decisions clearly. Every component should answer one question:

what happened to the trade?

### Status Chips

Status chips are central to the visual system.

Use Geist Mono or Satoshi Medium.

Radius: 6px-8px

Approved:

* Background: `rgba(74, 222, 128, 0.10)`
* Text: `#4ADE80`
* Border: `rgba(74, 222, 128, 0.28)`

Resized / Warning:

* Background: `rgba(251, 191, 36, 0.10)`
* Text: `#FBBF24`
* Border: `rgba(251, 191, 36, 0.28)`

Blocked / Kill Switch:

* Background: `rgba(244, 63, 94, 0.10)`
* Text: `#F43F5E`
* Border: `rgba(244, 63, 94, 0.30)`

Audit / Replay:

* Background: `rgba(56, 189, 248, 0.10)`
* Text: `#38BDF8`
* Border: `rgba(56, 189, 248, 0.28)`

### Policy Cards

Policy cards show deterministic rules.

Each card should include:

* policy name
* short explanation
* threshold or rule value
* current state
* action outcome

Examples:

* Max Position Size
* Daily Loss Limit
* Reduce-Only Mode
* Emergency Flatten
* Allowed Symbols
* Agent Pause Rule

Policy cards should use subtle borders and mono values.
The rule value should feel like the most important part of the card.

### Incident Log

Incident logs should feel serious and traceable.

Each log row should include:

* timestamp
* agent ID
* symbol
* requested action
* policy check
* final decision
* reason

Use Geist Mono for timestamps, IDs, symbols, and values.

Rows should be compact.
Critical rows can use a red left border.
Warnings can use amber.
Approved rows can use green.
Audit/replay rows can use blue.

### Trade Pipeline

The trade pipeline is a core visual metaphor.

Use horizontal or vertical step systems:

1. Agent Intent
2. Order Parsed
3. Policy Check
4. Risk Decision
5. Execution Action
6. Audit Log

Each step should feel like a checkpoint.

Approved paths continue cleanly.
Blocked paths stop sharply.
Resized paths branch into a smaller approved order.
Flatten mode should visibly override the pipeline.

### Buttons

Buttons should feel like console controls, not soft SaaS pills.

Primary button:

* Background: `#F5F7FA`
* Text: `#080A0C`
* Border: `1px solid rgba(245,247,250,0.18)`
* Radius: 0px
* Hover: slight brightness increase, subtle lift, no glow storm

Secondary button:

* Background: transparent
* Text: `#F5F7FA`
* Border: `1px solid #1F2933`
* Hover: border shifts to `rgba(245,247,250,0.18)`

Danger button:

* Background: `rgba(244, 63, 94, 0.12)`
* Text: `#F43F5E`
* Border: `1px solid rgba(244, 63, 94, 0.32)`

Developer/link button:

* Text: `#38BDF8`
* No heavy background
* Use for docs, logs, replay, API references

### Component Rule

Every component should look like it belongs in a safety-critical trading system.

No playful icons.
No robot mascots inside the product UI.
No generic feature cards.
No random gradients.
No fake “AI magic” visuals.

## Hero Section Direction

The AgentGuard hero should feel like a safety-critical control room opening screen.

It should immediately communicate:

AgentGuard sits between autonomous AI trading agents and exchange execution APIs.
Every order passes through deterministic risk policies before it can touch the market.

The hero should not feel like a generic Web3 landing page, AI chatbot page, or neon trading bot interface.

It should feel like:

* a premium developer infrastructure homepage
* a risk operations console
* an incident command screen
* a trading safety checkpoint
* an SDK page with real product proof

### Hero Composition

Use a two-column layout on desktop.

Left side:

* small status/announcement pill
* large editorial serif headline
* short product explanation
* primary CTA
* secondary developer CTA
* small trust/status row

Right side:

* large product-console visual
* trade pipeline preview
* policy decision cards
* live incident/audit log
* code or SDK snippet

Suggested desktop split:

* Left content: 5 columns
* Right product visual: 7 columns

The left side should feel editorial and calm.
The right side should feel operational and alive.

### Hero Background

* Main background: Obsidian Black `#080A0C`
* Add a subtle control-room grid at very low opacity
* Add a faint radial spotlight behind the product console
* Add a soft bottom fade into deeper black
* Optional tiny scanline texture only inside code/log surfaces

Do not use bright gradient blobs.
Do not use cyberpunk purple lighting.
Do not use floating AI brains, robots, coins, or generic 3D cubes.

### Hero Typography

The main headline should use the editorial serif display font.

Use Editorial New, Canela, or Tiempos for the hero headline only.

The headline should be large, cinematic, and sharp.

Suggested size:

* Desktop: 76px–96px
* Tablet: 56px–72px
* Mobile: 44px–52px

Line-height:

* 0.95–1.05

The supporting text should use Satoshi.

Suggested size:

* 18px–20px desktop
* 16px–18px mobile

Use Muted Gray for the body copy.

## Hero Content Lock

The hero section should use this copy as the default landing page direction.

### Main Headline

The risk firewall for autonomous trading agents.

### Short Product Explanation

AgentGuard sits between autonomous agents and Bitget execution APIs, blocking unsafe trades before they reach the exchange.

### CTA Buttons

Primary CTA:

Run Demo

Secondary CTA:

View GitHub

### Hero Copy Rules

* Keep the headline short, serious, and infrastructure-first.
* Do not rewrite the headline into hype language.
* Do not describe AgentGuard as a trading bot, AI copilot, or alpha engine.
* The explanation should make the product flow obvious: agent → AgentGuard → Bitget execution API.
* CTA copy should feel practical and demo-ready, not salesy.
* “Run Demo” should point users toward the live product flow.
* “View GitHub” should reinforce that AgentGuard is open-source developer infrastructure.


## Hero Product Visual

The hero visual should be a live-looking trade checkpoint console.

It should show a trade moving through AgentGuard before execution.

The visual should include:

1. Incoming Agent Order
2. Policy Check
3. Risk Decision
4. Execution Action
5. Audit Log

### Main Console Layout

Create a large black-on-black dashboard panel with thin borders.

Panel style:

* Background: `#0D1115`
* Border: `1px solid #1F2933`
* Radius: 14px–16px
* Inner highlight: subtle top-left gradient using `rgba(245,247,250,0.035)`
* No heavy shadow
* No glassmorphism

Inside the console, show a horizontal pipeline:

`Agent Intent → Policy Engine → Decision → Execution Wrapper → Audit Log`

Each checkpoint should be visually distinct.

Approved paths continue in Policy Green.
Resized paths branch in Risk Amber.
Blocked paths stop sharply in Kill Switch Red.
Audit/replay paths use Audit Blue.

### Example Console Content

Incoming order card:

* Agent ID: `agent_07`
* Market: `BTCUSDT-PERP`
* Action: `LONG`
* Size: `$42,000`
* Leverage: `8x`
* Requested route: `Bitget execution API`

Policy check cards:

* Max Position Size
* Daily Loss Limit
* Volatility Guard
* Reduce-Only Mode
* Kill Switch Rule

Decision card:

* Status: `RESIZED`
* Reason: `Position exceeds policy limit`
* Original size: `$42,000`
* Approved size: `$18,500`
* Action: `Downsize + Log`

Audit log row:

* Timestamp
* Agent ID
* Symbol
* Policy triggered
* Final action
* Replay link

### Motion Behaviour

Motion should feel like a system processing a trade, not a sci-fi animation.

Use:

* slow pipeline pulse
* status chip changes
* log rows appearing one by one
* thin line drawing between checkpoints
* subtle glow only around active risk state
* tiny blinking status dots

Avoid:

* spinning globes
* particle explosions
* overactive charts
* robot animations
* random neon beams
* fake “AI magic” effects

## Hero CTA System

The hero should have two main actions.

Primary CTA:

`Run Demo`


Use this when the landing page is developer-led.

Style:

* Background: `#F5F7FA`
* Text: `#080A0C`
* Border: `1px solid rgba(245,247,250,0.18)`
* Radius: 0px
* Hover: slight lift, subtle brightness increase
* No colourful glow

Secondary CTA:

`View GitHub`

Use Audit Blue for developer/documentation actions.

Style:

* Background: transparent
* Text: `#38BDF8`
* Border: `1px solid rgba(56,189,248,0.24)`
* Hover background: `rgba(56,189,248,0.08)`

### Hero Status Row

Below the CTAs, show a small system-status row.

Examples:

* `Open-source SDK`
* `Policy engine`
* `Bitget wrapper`
* `Replay logs`
* `No strategy custody`

Use small labels, thin dividers, and Geist Mono for technical terms.

### Hero Copy Direction

The hero copy should be direct and infrastructure-first.

Good headline directions:

* `The risk firewall for autonomous trading agents.`
* `Stop AI agents before they trade past your risk.`
* `A safety layer between agents and execution.`
* `Policy checks before every autonomous trade.`

Avoid:

* `Trade smarter with AI`
* `The future of AI trading is here`
* `Unleash autonomous trading`
* `Your AI trading copilot`
* `Next-gen Web3 AI bot`

The hero should create trust, not hype.

## Landing Page Structure

### Section 1: Hero — The Checkpoint

Purpose: make the category clear instantly.

Headline:

The risk firewall for autonomous trading agents.

Copy:

AgentGuard sits between autonomous agents and Bitget execution APIs, blocking unsafe trades before they reach the exchange.

Primary CTA:

Run Demo

Secondary CTA:

View GitHub

Visual:

Show a live-looking trade checkpoint console.

A trade enters from the left as an agent order, passes through policy checks, gets resized or blocked, then writes to an audit log.

Do not use abstract AI visuals.
Do not use generic crypto graphics.
Show the actual product story: order → policy → decision → execution action → log.

---

### Section 2: The Failure Mode

Purpose: make the danger feel real without sounding dramatic.

Title:

AI agents can reason. They can also trade past your risk.

Copy:

A trading agent can oversize a position, ignore volatility, over-leverage, or keep trading after a drawdown breach.

AgentGuard adds deterministic policy enforcement before execution, so unsafe orders are caught before they touch the market.

Visual:

Use a split operational panel.

Left side:

Unsafe agent order.

Right side:

Policy failure report.

Show examples like:

* position too large
* leverage exceeds limit
* drawdown breach active
* reduce-only mode enabled
* symbol not allowed

This should feel like an incident report, not a marketing problem section.

---

### Section 3: The Trade Checkpoint Flow

Purpose: explain how it works without using generic cards.

Title:

Every order passes through a safety gate.

Layout:

Do not use three equal feature cards.

Use a horizontal pipeline or step-through console:

1. Agent submits order
2. AgentGuard intercepts request
3. Policy engine evaluates risk
4. Decision is returned
5. Wrapper executes, resizes, blocks, flattens, or logs

Visual behaviour:

* approved path continues in Policy Green
* resized path branches in Risk Amber
* blocked path stops sharply in Kill Switch Red
* audit trail appears in Audit Blue

This section should feel like watching a trade move through a control system.

---

### Section 4: Policy Engine

Purpose: make developers trust the system fast.

Title:

Risk rules your agent cannot talk its way around.

Visual:

Show a real JSON policy config in a code window.

Include policies like:

* maxPositionSize
* maxLeverage
* dailyLossLimit
* allowedSymbols
* volatilityGuard
* reduceOnlyMode
* killSwitch

Beside the JSON, show policy cards that translate config into human-readable rules.

This section should make the product feel deterministic, inspectable, and developer-native.

---

### Section 5: Live Decision Console

Purpose: show the dashboard as proof.

Title:

See every decision before and after execution.

Visual:

Show approved, resized, blocked, flattened, and logged event rows.

Each row should include:

* timestamp
* agent ID
* market
* requested action
* policy triggered
* final decision
* reason
* replay link

Use compact incident-log styling.

This should feel like an operations console, not an analytics dashboard.

---

### Section 6: Replay Mode

Purpose: create the “judges lean in” moment.

Title:

Prove what your agent would have done.

Copy:

Replay Mode lets developers inspect blocked or modified trades and see which policy fired, what the agent requested, and what AgentGuard allowed instead.

Visual:

Show a before/after replay panel.

Before:

Agent requested oversized trade.

After:

AgentGuard resized, blocked, or flattened the order.

Include a timeline:

Intent received → Policy triggered → Decision returned → Execution prevented → Audit log written

This is the demo section. Make it feel cinematic, but still restrained.

---

### Section 7: Developer Integration

Purpose: show low-friction adoption.

Title:

Wrap your execution call in five lines.

Visual:

Show a short SDK snippet using Geist Mono.

The code should show an agent order being passed through AgentGuard before reaching the Bitget execution API.

Beside the snippet, show a tiny result panel:

decision: resized
reason: max_position_size_exceeded
action: downsize_and_log

This section should feel like a clean developer docs page.

---

### Section 8: Final CTA — The Boundary

Purpose: end with a strong infrastructure message.

Title:

Give your trading agent a hard risk boundary.

Copy:

Autonomous agents should move fast.
They should not execute without limits.

AgentGuard gives developers a deterministic safety layer before trades reach the exchange.

CTA buttons:

Run Demo
View GitHub

Visual:

Show the pipeline one final time, but simplified:

Agent → AgentGuard → Bitget

With AgentGuard highlighted as the checkpoint.

## Navigation System

The AgentGuard navigation should feel minimal, technical, and developer-native.

It should not feel like a generic SaaS navbar.

### Desktop Navigation

Use a slim fixed or sticky top navigation.

Style:

* Background: `rgba(8, 10, 12, 0.72)`
* Backdrop blur: subtle, not glassy
* Border bottom: `1px solid rgba(245,247,250,0.06)`
* Height: 64px–72px
* Max width aligned with page container
* No heavy shadows

### Navigation Items

Suggested nav links:

* Problem
* Policy Engine
* Replay Mode
* SDK
* GitHub

Keep labels short.
No dropdowns unless absolutely necessary.

### Logo Area

The logo area should include:

* AgentGuard wordmark
* small status indicator or shield/checkpoint mark
* optional mono label: `risk firewall sdk`

The logo should feel like infrastructure branding, not mascot branding.

### Nav CTA

Primary nav CTA:

Run Demo

Secondary/link CTA:

GitHub

Do not use generic CTA copy like:

* Get Started
* Learn More
* Join Now
* Start Trading

AgentGuard is not selling a trading product. It is showing safety infrastructure.

### Mobile Navigation

Use a clean hamburger menu.

Mobile menu should:

* slide down or fade in from the top
* use full-width stacked links
* preserve the dark control-room feel
* keep `Run Demo` and `View GitHub` visible
* avoid playful animations

## Footer System

The footer should feel like the bottom of a developer infrastructure page, not a marketing brochure.

Use it to reinforce:

* open-source nature
* developer trust
* product clarity
* safety-first positioning

### Footer Layout

Use a restrained 3-column or 4-column layout.

Recommended columns:

1. Product

   * Policy Engine
   * Replay Mode
   * Live Dashboard
   * Bitget Wrapper

2. Developers

   * GitHub
   * SDK
   * Documentation
   * Example Config

3. System

   * Risk States
   * Audit Logs
   * Event Replay
   * Kill Switch

4. Project

   * About
   * Hackathon Demo
   * License
   * Contact

### Footer Visual Style

* Background: `#050607`
* Top border: `1px solid rgba(245,247,250,0.08)`
* Text primary: `#F5F7FA`
* Text muted: `#8A94A6`
* Links: muted by default, `#38BDF8` on hover
* Use Geist Mono for small system labels

### Footer Detail

Add a small system-status line:

`SYSTEM STATUS: SAFE MODE READY`

or

`OPEN-SOURCE RISK FIREWALL SDK`

Use Geist Mono, small uppercase, muted gray.

Optional footer microcopy:

AgentGuard does not trade for agents.
It enforces risk boundaries before execution.

This line helps prevent people from mistaking the product for a strategy bot.

## Responsive Rules

AgentGuard must feel polished on mobile, not like a desktop dashboard squeezed into a phone.

### Mobile Priorities

On mobile, prioritize:

1. Clear product category
2. Demo CTA
3. Trade checkpoint flow
4. Policy engine proof
5. Replay mode proof
6. GitHub link

### Hero Mobile Layout

* Stack hero content above product visual.
* Keep the headline large, but not cramped.
* Use 44px–52px for the hero headline.
* Keep the explanation copy under 4 lines.
* CTA buttons should stack or sit side by side depending on width.
* Product console should become horizontally scrollable if needed.

### Dashboard Preview Mobile

For dense product visuals:

* Use horizontal scroll for logs/tables.
* Keep status chips readable.
* Collapse secondary columns.
* Show fewer log rows.
* Never shrink mono text below 12px.
* Do not turn logs into generic cards unless needed.

### Spacing Mobile

* Section padding: 64px–88px vertical.
* Card padding: 18px–22px.
* Grid gap: 16px–20px.
* Body text: 16px minimum.
* Buttons: at least 44px height.

### Mobile Anti-Slop Rules

* No giant empty hero with tiny text.
* No crushed dashboard screenshots.
* No 3-card stacked generic feature section.
* No hamburger menu that hides the primary demo action.
* No decorative animations that slow the page down.

## Motion & Interaction System

AgentGuard motion should feel like a live safety console processing autonomous trade decisions.

Movement should be restrained, functional, and system-driven.

The goal is not to impress users with animation.
The goal is to make the product feel alive, inspectable, and trustworthy.

### Motion Principles

* Motion should explain state changes.
* Motion should make risk decisions easier to understand.
* Motion should feel calm under pressure.
* Motion should never feel playful, chaotic, magical, or decorative.
* Every animation should have a clear product reason.

Good motion:

* a trade moving through a checkpoint pipeline
* a policy card lighting up when triggered
* a log row appearing after a decision
* a blocked route stopping sharply
* a resized trade branching into a smaller approved path
* a replay timeline scrubbing through execution states

Bad motion:

* floating AI particles
* glowing robot brains
* spinning coins
* random orbiting shapes
* purple cyberpunk beams
* overactive particle explosions
* animated backgrounds that distract from the product

### Default Page Motion

Use subtle entrance animations:

* opacity: 0 → 1
* y: 16px → 0
* duration: 400ms–600ms
* easing: cubic-bezier(0.22, 1, 0.36, 1)
* stagger: 80ms–120ms between related elements

Avoid dramatic fly-ins, bounce effects, or excessive parallax.

### Hero Motion

The hero product console should feel like it is actively inspecting a trade.

Recommended sequence:

1. Incoming order appears.
2. Pipeline line draws from Agent Intent to Policy Engine.
3. Policy checks activate one by one.
4. One policy triggers.
5. Decision chip changes to Approved, Resized, Blocked, or Flattened.
6. Execution action updates.
7. Audit log row appears.

Keep the animation loop slow and readable.

Loop duration:

* 6s–10s for full trade checkpoint cycle

Nothing should flash aggressively.

### Pipeline Motion

Pipeline motion should communicate routing and control.

Approved:

* line continues smoothly in Policy Green
* status dot pulses once
* audit log writes normally

Resized:

* Risk Amber branch appears
* original order fades slightly
* approved downsized order appears
* audit log records policy reason

Blocked:

* Kill Switch Red stop marker appears
* route line terminates sharply
* execution node stays inactive
* audit log writes blocked reason

Flattened:

* red override state appears
* current position closes
* future execution pauses
* system state changes to flat mode

Replay:

* Audit Blue scrubber moves across timeline
* each event step highlights as replay progresses
* log and decision panel stay synced

### Microinteractions

Buttons:

* hover: slight lift or brightness increase
* active: compress by 1px
* no big glow except for dangerous or active system states

Cards:

* hover: border brightens slightly
* no heavy lift
* no oversized shadow

Status chips:

* can pulse once when state changes
* should not pulse forever unless representing live monitoring

Logs:

* new rows can slide in from top by 8px
* timestamps should update without flashy animation

Code windows:

* optional typing effect only for short snippets
* never type long code blocks slowly
* keep code readable first

### Performance Rules

* Keep animations lightweight.
* Prefer CSS transforms and opacity.
* Avoid heavy canvas effects unless absolutely necessary.
* Avoid full-page particle systems.
* Disable or reduce complex motion on mobile.
* Respect reduced motion preferences.

The site should feel fast, stable, and precise.

## Final Anti-Slop Rules

AgentGuard must never look like a generic AI trading website.

Before shipping any page, check it against these rules.

### Do Not Use

* generic gradient blob hero sections
* cartoon robots or AI mascots in the product UI
* crypto coin illustrations
* abstract floating cubes
* purple-blue neon cyberpunk backgrounds
* fake candlestick charts used as decoration
* generic 3-card feature grids
* vague AI words like “smarter trading” or “unlock alpha”
* stock photos of traders
* oversized rounded SaaS cards
* glassmorphism panels
* random accent colours outside the risk-state system

### Always Use

* product-led visuals
* code snippets
* policy configs
* trade pipelines
* incident logs
* decision states
* audit trails
* replay timelines
* thin borders
* black-on-black surfaces
* clear status chips
* controlled accent colour
* developer-native copy

### The AgentGuard Test

Every major section should answer one of these questions:

* What risk does AgentGuard prevent?
* Where does AgentGuard sit in the trade execution flow?
* What policy was checked?
* What decision was made?
* Why was the trade approved, resized, blocked, or flattened?
* Can a developer inspect and replay what happened?

If a section does not answer one of these, remove it or redesign it.

### Final Design Feeling

The finished site should feel like:

a developer SDK page
inside a trading safety console
with editorial restraint
and operational proof.

Not hype.
Not magic.
Not another AI bot.

Infrastructure.
