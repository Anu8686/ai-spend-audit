# User Interviews — AI Spend Audit

Three interviews conducted with startup founders and engineering leads prior to building the product. Used to validate the problem, understand the current solution, and identify the right product direction.

---

## Interview 1 — Jordan L., CTO, B2B SaaS Startup (8 people)

**Background:** Jordan is CTO of a Series A company building a project management tool. The engineering team is 5 developers. They've been using AI tools since ChatGPT Plus launched.

---

**Tell me about your AI tool usage right now.**

"We have a bunch of stuff running. ChatGPT Team, Claude for — I think some of the team uses it. Cursor, which is the main one developers use. GitHub Copilot which we set up before Cursor and nobody told me we stopped using it. And we have an OpenAI API integration we built for a feature that got cut from the roadmap."

**How much are you spending monthly?**

"I'd have to check. Maybe $400? I don't actually know. It comes out of the company credit card, my ops person handles it, and it's never been big enough to flag. But now that you mention it..."

**What's your current process for managing AI tool costs?**

"There isn't one. Honestly. I approved ChatGPT Team when someone asked, I approved Cursor when someone asked. I don't think we ever turned off Copilot when we switched. It just... keeps getting charged."

**What would it look like for this to be solved?**

"Someone just telling me: here's what you're paying for, here's what you're actually using, here's what you should cancel. I don't need a dashboard with 17 charts. I need a list of things to do."

**If you saw a free tool that did this audit in 2 minutes, would you use it?**

"Right now. Seriously. Can I use it right now? [laughs] Yes, 100%. No login, you said? Yeah, I'd do it immediately."

**What would make you distrust such a tool?**

"If the recommendations felt generic. Like 'consider whether you need this tool' — that tells me nothing. I want it to say 'you have Copilot at $19/seat for 5 people and nobody is using it because you switched to Cursor. Cancel it. Save $95/month.'"

**Key insights:**
- ✅ Problem confirmed: unmanaged, invisible AI spend
- ✅ Decision-maker does the audit impulsively (no process)
- ✅ Specificity is the product: generic recs = no value
- ✅ "No login" removes the biggest adoption barrier
- ❌ "17 charts" signal: don't over-engineer the results page

---

## Interview 2 — Priya M., Solo Founder, AI Writing Tool

**Background:** Priya is building an AI-assisted content tool, solo. Has been indie hacking for 14 months. Revenue is $2,400/mo MRR.

---

**Walk me through what AI tools you're paying for right now.**

"ChatGPT Plus, Claude Pro, Gemini — the paid one, I can't remember which tier. Cursor Pro because I code some things myself. And I have OpenAI API access that I use for my product's backend. So five things I think."

**What do you spend monthly on this?**

"Maybe $80? No wait — ChatGPT is $20, Claude is $20, Gemini is... $22? Cursor is $20. And the API is variable, usually $30–50. So like $110–130. I haven't added it up recently."

**Do you use all of them equally?**

"[pause] No. Honestly I mostly use Claude. I like it for writing. ChatGPT I use maybe once a week when Claude is rate-limiting me. Gemini... I signed up when they had a promotion and I don't think I've logged in this month."

**What would you ideally want a tool like this to tell you?**

"That I'm paying for Gemini for no reason [laughs]. And maybe which of ChatGPT and Claude I should keep if I had to pick one. Like, validate my instinct."

**What concerns would you have about a tool like this?**

"I'd want to make sure it's not just telling me to cancel everything. Like, having a backup model is genuinely useful. If Claude is down, I need something. So I'd want it to account for that."

**What would make you share it with others?**

"If it showed a big number. Like if I share a link and the preview says '$264/year wasted' people will click that. My Twitter followers are mostly founders and devs. They'd care."

**Would you pay for a more advanced version?**

"If it could monitor my API spend and alert me when it spikes, yes. That's the thing I actually worry about — my OpenAI API bill jumping randomly. I'd pay $10–15/month for that."

**Key insights:**
- ✅ Solo founders often pay for redundant chat tools
- ✅ "Validate my instinct" — users often know they're overpaying, want confirmation
- ⚠️ Don't recommend canceling everything — having a backup has value
- ✅ Shareable link with savings number = social currency for founders
- 💡 API spend monitoring = future Pro feature
- 💡 Price sensitivity: $10–15/mo for monitoring is viable

---

## Interview 3 — Marcus T., Engineering Manager, Growth-Stage Startup (45 people)

**Background:** Marcus manages a 12-person engineering team at a Series B fintech company. Reports to the VP Engineering. AI tools budget is now a quarterly line item.

---

**How does AI tool procurement work at your company?**

"It's messy. Engineers sign up for things individually with company cards. I get a monthly expense report and approve things retroactively. We do a quarterly review with finance where we try to rationalize it."

**What does that quarterly review look like?**

"Someone goes through the credit card statements, makes a spreadsheet, and we try to figure out what's still active. Last quarter we found 3 subscriptions to tools nobody remembered signing up for. Canceled those. But it's manual, slow, and we do it once a quarter so there's always 3 months of waste."

**What's your current total AI tool spend?**

"Across the engineering team, about $2,800/month. Mix of Copilot Enterprise, Cursor Business, some individual Claude subscriptions people expense, and our OpenAI API bill which is like $600/month."

**Is that spend justified?**

"I think most of it. But I'm not confident. The Cursor Business vs individual — I know some engineers prefer Cursor Pro, some use VS Code + Copilot. We're paying Business for everyone. That might be overkill."

**What would an ideal audit tool do for you?**

"Give me a report I can take into a finance meeting. Not a link to a web page — an actual document. Show the current spend, what we could cut, why, and an estimate of savings. One page ideally."

**Would you use a self-serve tool or want white-glove service?**

"Self-serve is fine to start. If it's good I'd want it to run automatically every month. That's the thing — doing it once is useful. Having it monitor automatically is actually valuable."

**How much would you pay for an ongoing monitoring service?**

"For a 12-person engineering team? If it saved us $500/month reliably, I'd pay $50–100/month without thinking twice. The ROI math is obvious."

**What would prevent you from adopting it?**

"If I had to put our actual API keys or billing credentials in somewhere, absolutely not. Too much security risk. But if I can just enter what we're paying manually, that's fine. It's not sensitive data."

**Key insights:**
- ✅ Larger teams have real quarterly review pain — product fits into this workflow
- 💡 PDF/document export is critical for enterprise buyers (take to finance meetings)
- 💡 Monthly automated monitoring is the Enterprise/Pro unlock
- ✅ Security concern about credentials — confirmed: manual input is correct approach
- 💡 Price point: $50–100/mo for 10+ person teams is viable
- 📊 Total spend at this stage: $2,800/mo → even 10% savings = $280/mo, $3,360/yr

---

## Synthesis: Key Themes

**Pain:** AI tool spend is invisible and accumulating. Nobody owns it, nobody reviews it, and it's never big enough to force action until it is.

**Behavior:** Users roughly know they're overpaying but haven't done the math. They want the math done for them.

**Trust signal:** Specificity. Generic recommendations ("consider downgrading") signal the tool doesn't know what it's talking about. Dollar amounts and specific plan names signal real expertise.

**Growth mechanic:** The savings number is social currency. Founders share things that make them look smart/savvy. "I saved $2,160/year using this free tool" is shareable; "I found I was slightly overpaying" is not.

**Monetization ladder:**
1. Free: instant audit (acquires everyone)
2. $15–20/mo: scheduled re-audits + monitoring (individual power users)
3. $50–100/mo: team dashboards + export + alerts (engineering managers)
4. Custom: enterprise with SSO + integrations (finance teams)

**Critical non-requirement:** No credential/API access. Every user interviewed immediately flagged this as a trust barrier. Manual input is correct.
