/* Persuasion patterns: a brief → a list of scenes. Load after ad-kit.js and scenes.js.
 *
 *   const spec = AdKit.pattern("pas", brief, { hook: "B" });   // → { scenes, meta }
 *   AdKit.build({ ...spec, style, size, cast, forbid });
 *
 * Brief fields (use what a pattern needs; AdKit.pattern says which are missing):
 *   brand { wordmark, line, url, cta, eyebrow }   hooks { A: {eyebrow,title,actor}, B: ..., C: ... }
 *   crew [actor keys]  hero (actor key)  features [{ eyebrow, title, chips, actor, act, base, baseAct }]
 *   problem {title, eyebrow, actor}  agitate {title, actor}  solution {feature}  steps [{label, sub, actor}]
 *   mystery {title, answer, actor, chips}  interrupt {title, sub}  before/after {eyebrow,title}  mess [labels]
 *   myth {fact, myth, chips, source}  tip {title, lines, actor}  loss {title, items, after}
 *   progress {title, items, done}  compare {title, left, right}  numbers [{value, suffix, label, source}]
 *   faq [{ q, a, chips, actor }]  payoff (a scene, e.g. a brand's product demo)  quote / authority / urgency
 *
 * Ethics: patterns only arrange true material. social, authority and scarcity need real, sourced inputs and the
 * guarded scenes refuse to build without them. Every pattern ends on the end card (peak-end rule).
 */
(function () {
  const AK = window.AdKit;
  const P = (id, meta, build) => (AK.patterns[id] = { id, ...meta, build });
  const hook = (b, o, extra = {}) => ({ type: "title", dur: 2, ...(b.hooks?.[o.hook || "A"] || b.hooks?.A), ...extra });
  const end = (b, extra = {}) => ({ type: "endcard", dur: 2.6, ...b.brand, actors: b.endActors || b.crew?.slice(0, 3), ...extra });
  const feat = (f, dur = 1.9) => ({ type: "feature", dur, ...f });
  const payoff = (b) => b.payoff || feat(b.solution || b.features[0], 2.4);

  // ---- Classic ad structures -------------------------------------------------------------------
  P("pas", { name: "Problem → Agitate → Solve", scenario: "Pain-point ad", principle: "Problem awareness; relief after tension",
    basis: "Copywriting formula (Dan Kennedy); tension → resolution", needs: ["problem", "agitate", "brand"] },
    (b) => [{ type: "title", dur: 2.1, ...b.problem }, { type: "title", dur: 2.0, ...b.agitate, act: [["shake", 0.6]] },
      payoff(b), ...b.features.slice(0, 2).map((f) => feat(f)), end(b)]);

  P("bab", { name: "Before → After → Bridge", scenario: "Transformation ad", principle: "Contrast between two states; the product is the bridge",
    basis: "Copywriting formula; contrast effect", needs: ["before", "after", "mess", "brand"] },
    (b, o) => [hook(b, o), { type: "beforeAfter", dur: 4.4, before: b.before, after: b.after, items: b.mess }, payoff(b), end(b)]);

  P("listicle", { name: "N things", scenario: "Feature spotlight / listicle", principle: "Chunking; a promised count keeps people watching",
    basis: "Miller 1956 (chunking); open loop of a numbered list", needs: ["features", "brand"] },
    (b, o) => [hook(b, o, b.listHook || {}), ...b.features.map((f, i) => feat({ ...f, eyebrow: `${String(i + 1).padStart(2, "0")} · ${f.eyebrow}` }, 1.8)), end(b)]);

  P("spotlight", { name: "One-feature spotlight", scenario: "Single feature ad", principle: "Single-minded proposition",
    basis: "Rosser Reeves, unique selling proposition", needs: ["features", "brand"] },
    (b, o) => { const f = b.features[o.feature ?? 0]; return [hook(b, o, { title: f.title, eyebrow: f.eyebrow, actor: f.actor }), feat({ ...f, dur: 3.2 }), end(b)]; });

  P("demo", { name: "Product demo", scenario: "Demo / payoff ad", principle: "Show, don't tell; seeing the result",
    basis: "Demonstration advertising; processing fluency", needs: ["payoff", "brand"] },
    (b, o) => [hook(b, o), b.payoff, end(b)]);

  P("faq", { name: "Objection → answer", scenario: "FAQ / objection handling", principle: "Answer the doubt before it stops the viewer",
    basis: "Two-sided messaging (Hovland, Lumsdaine & Sheffield 1949)", needs: ["faq", "brand"] },
    (b) => [...b.faq.flatMap((q) => [{ type: "title", dur: 1.8, eyebrow: q.eyebrow || "Question", title: q.q, actor: q.actor, act: [["shake", 0.7, { amount: 8 }]] },
      feat({ eyebrow: "Answer", title: q.a, chips: q.chips, actor: q.actor, act: [["hop", 0.6]] }, 2.2)]), end(b)]);

  P("three", { name: "How it works in three", scenario: "How-it-works / explainer", principle: "Rule of three; processing fluency",
    basis: "Shu & Carlson 2014 (three claims persuade most)", needs: ["steps", "brand"] },
    (b, o) => [hook(b, o), { type: "steps", dur: 4.2, eyebrow: b.stepsEyebrow || "How it works", title: b.stepsTitle || "", items: b.steps.slice(0, 3) }, payoff(b), end(b)]);

  P("unboxing", { name: "What's inside", scenario: "Unboxing / kit contents", principle: "Anticipation; reveal",
    basis: "Anticipatory utility (Loewenstein 1987)", needs: ["crew", "brand"] },
    (b, o) => [b.unbox || hook(b, o), { type: "lineup", dur: 3, eyebrow: b.lineupEyebrow, title: b.lineupTitle || "Everything inside.", actors: b.crew, labels: b.lineupLabels }, end(b)]);

  // ---- Psychology-driven patterns -------------------------------------------------------------
  P("curiosity", { name: "Curiosity gap", scenario: "Hook-first teaser", principle: "An information gap people want to close",
    basis: "Loewenstein 1994, the information-gap theory of curiosity", needs: ["mystery", "brand"] },
    (b) => [{ type: "question", dur: 3.4, ...b.mystery }, ...b.features.slice(1, 3).map((f) => feat(f)), end(b)]);

  P("interrupt", { name: "Pattern interrupt", scenario: "Scroll-stopper", principle: "A break in the expected pattern triggers the orienting response",
    basis: "Orienting response (Sokolov 1963)", needs: ["interrupt", "brand"] },
    (b, o) => [{ type: "interrupt", dur: 1.6, ...b.interrupt }, hook(b, o, { dur: 1.8 }), ...b.features.slice(0, 2).map((f) => feat(f)), end(b)]);

  P("ikea", { name: "IKEA effect", scenario: "Build-it-yourself / kit ad", principle: "People value what they build themselves",
    basis: "Norton, Mochon & Ariely 2012, the IKEA effect", needs: ["steps", "ikea", "brand"] },
    (b, o) => [hook(b, o, b.ikea.hook || {}), { type: "steps", dur: 4, eyebrow: b.ikea.eyebrow || "You", title: b.ikea.stepsTitle || "", items: b.steps.slice(0, 3) },
      payoff(b), { type: "title", dur: 2, ...b.ikea.pride, act: [["hop", 0.5], ["wave", 0.9]] }, end(b)]);

  P("progress", { name: "Goal gradient", scenario: "Build-progress / onboarding ad", principle: "Effort speeds up as the goal gets closer; visible progress motivates",
    basis: "Kivetz, Urminsky & Zheng 2006 (goal gradient); Nunes & Drèze 2006 (endowed progress: pre-ticks must be true)", needs: ["progress", "brand"] },
    (b) => [{ type: "checklist", dur: 4.8, ...b.progress }, payoff(b), end(b)]);

  P("myth", { name: "Truth sandwich", scenario: "Myth-buster", principle: "State the fact, name the myth once, repeat the fact",
    basis: "Lewandowsky et al. 2020, The Debunking Handbook", needs: ["myth", "brand"] },
    (b) => [{ type: "mythFact", dur: 5.4, ...b.myth }, ...b.features.slice(0, 1).map((f) => feat(f)), end(b)]);

  P("reciprocity", { name: "Give first", scenario: "Educational / value-first ad", principle: "Useful help first makes people want to give back",
    basis: "Cialdini 1984, reciprocity", needs: ["tip", "brand"] },
    (b) => [{ type: "tip", dur: 4.4, ...b.tip }, { type: "title", dur: 1.8, ...(b.tipFollow || { title: "Want to build it?" }) }, end(b)]);

  P("foot", { name: "Foot in the door", scenario: "Low-commitment first step", principle: "A small first step makes the bigger one easier",
    basis: "Freedman & Fraser 1966", needs: ["foot", "brand"] },
    (b) => [{ type: "title", dur: 2, ...b.foot.first }, feat(b.foot.feature, 2.2), { type: "lineup", dur: 2.8, ...b.foot.then, actors: b.crew, labels: b.lineupLabels }, end(b)]);

  P("story", { name: "Mini story", scenario: "Character / narrative ad", principle: "Stories lower resistance (narrative transportation)",
    basis: "Green & Brock 2000", needs: ["story", "brand"] },
    (b) => [...b.story, end(b)]);

  P("loss", { name: "Loss framing", scenario: "What you'd miss", principle: "Losses loom larger than gains",
    basis: "Tversky & Kahneman 1981 (framing); keep it honest, no fear", needs: ["loss", "brand"] },
    (b) => [{ type: "vanish", dur: 3.8, ...b.loss }, payoff(b), end(b)]);

  P("contrast", { name: "Contrast", scenario: "Comparison ad (no competitor names)", principle: "Judgements are relative to what sits next to them",
    basis: "Contrast effect; Tversky & Kahneman 1974 (anchoring)", needs: ["compare", "brand"] },
    (b) => [{ type: "compare", dur: 4.2, ...b.compare }, payoff(b), end(b)]);

  P("specificity", { name: "Specific numbers", scenario: "Spec ad", principle: "Precise numbers read as more credible",
    basis: "Schindler & Yalch 2006 (precise claims); numbers only from sources", needs: ["numbers", "brand"] },
    (b) => [...b.numbers.slice(0, 3).map((n) => ({ type: "stat", dur: 2.2, ...n })), end(b)]);

  P("social", { name: "Social proof", scenario: "Testimonial / community ad", principle: "People follow what others like them do",
    basis: "Cialdini 1984; needs a real quote or count", needs: ["quote", "brand"] },
    (b) => [{ type: "quote", dur: 3.6, ...b.quote }, payoff(b), end(b)]);

  P("authority", { name: "Authority", scenario: "Expert / press ad", principle: "Credible sources persuade",
    basis: "Milgram 1963; Cialdini 1984; only real credentials", needs: ["authority", "brand"] },
    (b) => [{ type: "authority", dur: 2.6, ...b.authority }, payoff(b), end(b)]);

  P("scarcity", { name: "Real scarcity", scenario: "Offer / launch deadline", principle: "Limited things look more valuable",
    basis: "Worchel, Lee & Adewole 1975; only a real deadline or stock", needs: ["urgency", "brand"] },
    (b) => [{ type: "urgency", dur: 2.6, ...b.urgency }, payoff(b), end(b)]);

  /** Build a pattern from a brief. Throws with the missing brief fields so a variant matrix fails loudly. */
  AK.pattern = function (id, brief, opts = {}) {
    const p = AK.patterns[id];
    if (!p) throw new Error(`AdKit: unknown pattern "${id}" (have: ${Object.keys(AK.patterns).join(", ")})`);
    const missing = p.needs.filter((k) => brief[k] == null);
    if (missing.length) throw new Error(`AdKit: pattern "${id}" needs brief.${missing.join(", brief.")}`);
    return { scenes: p.build(brief, opts), meta: { pattern: id, name: p.name, principle: p.principle, basis: p.basis, scenario: p.scenario } };
  };
  /** Which patterns a brief can fill. */
  AK.patternsFor = (brief) => Object.values(AK.patterns).filter((p) => p.needs.every((k) => brief[k] != null)).map((p) => p.id);
})();
