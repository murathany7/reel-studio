# Kinetic type

**Feel:** type is the picture. Huge words filling the frame, two colours swapping on every beat, hard cuts. Loud.

| | |
|---|---|
| Good for | Hooks, announcements, sales, manifestos, music-led pieces, brands with a strong voice and little imagery |
| Not for | Showing a product's detail, gentle brands, long explanations |
| Palette | Exactly two colours: the brand accent (`--kt-a`) and a deep ink (`--kt-b`), inverted on every other slide (`.inv`) |
| Type | The heaviest display weight the brand has (`--font-display-heavy`), uppercase, tight tracking, set to fill the safe zone (the starter fits each word to the width and height) |
| Layout | One to four words per slide, flush left, nothing else. A meta line in mono at most |
| Motion | On the beat. One slide per beat (`Studio.beats` + `Studio.beat(n)` with music; the starter uses a 150 BPM grid). Lines slam up from masks in 0.2 s (`expo.out`), a slight scale settle. Hard cuts only |
| Texture | None |
| Engines | GSAP only. Optional: one Three.js or footage plate seen *through* the letters (`background-clip: text`) for the payoff |
| Sound | A track with a clear beat. Cuts land on it; the end card lands on a downbeat |
| Avoid | More than two colours, images behind text, words held under 0.3 s when they carry meaning (silent pieces: hold key lines ≥ 1.5 s), centred text |

Starter: `looks/kinetic-type/starter.html`.
