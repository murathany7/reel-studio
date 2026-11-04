# Text QA: productions/bike-logger/REEL-014-says-it/composition/index.html

1080x1920, sampled every 0.25 s. Sizes are per 1080 px of the short side. Size: ❌ under 28 px, ⚠️ under 40 px. Contrast: 3:1 at 48 px and up, 4.5:1 below. A problem fails (❌) when it lasts 0.5 s or more; shorter ones warn (⚠️).

| Check | Value | Result |
|---|---|---|
| Hook by 3 s (≥ 56 px, ≥ 3:1, clear of the Reels UI) | "MY BIKE" at 0.25 s | ✅ |
| Text blocks | 57 | — |
| Too small | 0 fail, 35 warn | ⚠️ |
| Low contrast | 0 fail, 0 warn | ✅ |
| In the Reels UI | 0 fail, 1 warn | ⚠️ |

## Blocks to fix

| Text | On screen | Size (typical) | Contrast (worst) | Reels UI | Evidence |
|---|---|---|---|---|---|
| "02:47 · ride 01 · recording" | 0.25–1.75 s | ⚠️ 34 px | ✅ 7.38:1, needs 4.5 | ✅ | `flagged/text_0_t0.25.jpg` |
| "01 · brain · raspberry pi 5" | 2.25–3.75 s | ⚠️ 34 px | ✅ 12.04:1, needs 4.5 | ✅ | `flagged/text_4_t2.25.jpg` |
| "8 GB" | 2.75–3.75 s | ⚠️ 32 px | ✅ 10.9:1, needs 4.5 | ✅ | `flagged/text_6_t2.75.jpg` |
| "IP65" | 3–3.75 s | ⚠️ 32 px | ✅ 12.93:1, needs 4.5 | ✅ | `flagged/text_8_t3.jpg` |
| "200 × 120 × 75 mm" | 3.25–3.75 s | ⚠️ 32 px | ✅ 13.08:1, needs 4.5 | ✅ | `flagged/text_9_t3.25.jpg` |
| "02 · camera · module 3 wide" | 4.25–5.75 s | ⚠️ 34 px | ✅ 11.46:1, needs 4.5 | ✅ | `flagged/text_10_t4.25.jpg` |
| "102° wide" | 4.75–5.75 s | ⚠️ 32 px | ✅ 11.93:1, needs 4.5 | ✅ | `flagged/text_12_t4.75.jpg` |
| "rear-facing" | 5–5.75 s | ⚠️ 32 px | ✅ 12.18:1, needs 4.5 | ✅ | `flagged/text_13_t5.jpg` |
| "102°" | 5.25–5.75 s | ⚠️ 31 px | ✅ 6.04:1, needs 4.5 | ⚠️ paid @ 5.25 s | `flagged/text_14_t5.25.jpg` |
| "sealed window" | 5.25–5.75 s | ⚠️ 32 px | ✅ 12.32:1, needs 4.5 | ✅ | `flagged/text_15_t5.25.jpg` |
| "03 · position · usb gps" | 6.25–7.75 s | ⚠️ 34 px | ✅ 11.84:1, needs 4.5 | ✅ | `flagged/text_17_t6.25.jpg` |
| "u-blox" | 6.75–7.75 s | ⚠️ 32 px | ✅ 11.59:1, needs 4.5 | ✅ | `flagged/text_20_t6.75.jpg` |
| "antenna up" | 7–7.75 s | ⚠️ 32 px | ✅ 12.95:1, needs 4.5 | ✅ | `flagged/text_21_t7.jpg` |
| "04 · motion · bno085" | 8.25–9.75 s | ⚠️ 34 px | ✅ 11.72:1, needs 4.5 | ✅ | `flagged/text_22_t8.25.jpg` |
| "9-axis" | 8.75–9.75 s | ⚠️ 32 px | ✅ 11:1, needs 4.5 | ✅ | `flagged/text_26_t8.75.jpg` |
| "lean" | 9–9.75 s | ⚠️ 32 px | ✅ 11.18:1, needs 4.5 | ✅ | `flagged/text_27_t9.jpg` |
| "pitch" | 9.25–9.75 s | ⚠️ 32 px | ✅ 12.89:1, needs 4.5 | ✅ | `flagged/text_28_t9.25.jpg` |
| "acceleration" | 9.25–9.75 s | ⚠️ 32 px | ✅ 13.03:1, needs 4.5 | ✅ | `flagged/text_29_t9.25.jpg` |
| "05 · wheel · a3144 hall" | 10.25–11.75 s | ⚠️ 34 px | ✅ 11.57:1, needs 4.5 | ✅ | `flagged/text_30_t10.25.jpg` |
| "1 pulse per turn" | 10.75–11.75 s | ⚠️ 32 px | ✅ 12.62:1, needs 4.5 | ✅ | `flagged/text_34_t10.75.jpg` |
| "speed without GPS" | 11–11.75 s | ⚠️ 32 px | ✅ 11.99:1, needs 4.5 | ✅ | `flagged/text_35_t11.jpg` |
| "06 · behind · ultrasonic" | 12.25–13.75 s | ⚠️ 34 px | ✅ 11.43:1, needs 4.5 | ✅ | `flagged/text_36_t12.25.jpg` |
| "waterproof probes" | 12.75–13.75 s | ⚠️ 32 px | ✅ 12.52:1, needs 4.5 | ✅ | `flagged/text_39_t12.75.jpg` |
| "logged in metres" | 13–13.75 s | ⚠️ 32 px | ✅ 12.58:1, needs 4.5 | ✅ | `flagged/text_40_t13.jpg` |
| "with the video" | 13.25–13.75 s | ⚠️ 32 px | ✅ 12.56:1, needs 4.5 | ✅ | `flagged/text_41_t13.25.jpg` |
| "CAMERA" | 14–15.75 s | ⚠️ 31 px | ✅ 9.26:1, needs 4.5 | ✅ | `flagged/text_42_t14.jpg` |
| "GPS" | 14–15.75 s | ⚠️ 31 px | ✅ 8.61:1, needs 4.5 | ✅ | `flagged/text_43_t14.jpg` |
| "MOTION" | 14–15.75 s | ⚠️ 31 px | ✅ 9.69:1, needs 4.5 | ✅ | `flagged/text_44_t14.jpg` |
| "WHEEL" | 14–15.75 s | ⚠️ 31 px | ✅ 8.83:1, needs 4.5 | ✅ | `flagged/text_45_t14.jpg` |
| "BEHIND" | 14–15.75 s | ⚠️ 31 px | ✅ 8.59:1, needs 4.5 | ✅ | `flagged/text_46_t14.jpg` |
| "all sensors · logging" | 14.25–15.75 s | ⚠️ 34 px | ✅ 11.61:1, needs 4.5 | ✅ | `flagged/text_47_t14.25.jpg` |
| "dashboard" | 14.75–15.75 s | ⚠️ 32 px | ✅ 12.1:1, needs 4.5 | ✅ | `flagged/text_49_t14.75.jpg` |
| "Android + iPhone app" | 15–15.75 s | ⚠️ 32 px | ✅ 12.36:1, needs 4.5 | ✅ | `flagged/text_50_t15.jpg` |
| "runs offline · your rides stay with you" | 16–17.75 s | ⚠️ 30 px | ✅ 6.56:1, needs 4.5 | ✅ | `flagged/text_54_t16.jpg` |
| "murathanyildirim.com/bike-logger" | 16.75–17.75 s | ⚠️ 36 px | ✅ 10.38:1, needs 4.5 | ✅ | `flagged/text_56_t16.75.jpg` |

Only DOM text is measured (HTML, SVG `<text>`). Check text drawn in canvas engines or baked into plates by eye. Decoration not meant to be read can opt out with `data-qa-skip`.
