# Compliance: Bike Logger

Every piece is checked against this list before delivery. A ❌ blocks delivery.

## Always (every brand)

- No invented product facts, numbers, prices, reviews or testimonials. Each fact traces to a source in `README.md`.
- No competitor names, logos or copy. Reference ads are for structure only.
- No third-party logos, certifications or "as seen in" without written permission.
- AI-generated people, voices or footage are disclosed where the platform requires it.
- Text, logo and CTA sit inside the safe zone for the placement (paid vs organic).
- Music and SFX are licensed for commercial use (ElevenLabs output or a cleared library).

## This brand

| Rule | Why |
|---|---|
| **Blur faces and number plates** in any real road footage (camera recordings, replay renders) before publishing | GDPR; also stated in `../bikelog/site/video/render.py` |
| No safety promises: never "prevents accidents", "keeps you safe", "proof for insurance/police" | It records; it does not protect. Legal use of recordings varies by country |
| Close-pass numbers only from a real ride, labelled as one ride, never as typical or average | One ride is not a statistic |
| No prices, kit contents, skill level or age range until the user confirms them | Not on the live page (README *Not claimed*) |
| Part and bike brands (Raspberry Pi, Gazelle, u-blox) as plain text only, never their logos | Naming a part is factual; a logo implies endorsement |
| Riding shown follows traffic rules: no phone in hand, no riding against traffic | The brand should not model bad riding |
