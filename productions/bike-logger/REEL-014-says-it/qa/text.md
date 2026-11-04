# Text QA: productions/bike-logger/REEL-014-says-it/composition/index.html

1080x1920, sampled every 0.25 s. Sizes are per 1080 px of the short side. Size: ❌ under 28 px, ⚠️ under 40 px. Contrast: 3:1 at 48 px and up, 4.5:1 below. A problem fails (❌) when it lasts 0.5 s or more; shorter ones warn (⚠️).

| Check | Value | Result |
|---|---|---|
| Hook by 3 s (≥ 56 px, ≥ 3:1, clear of the Reels UI) | "MY BIKE" at 0.25 s | ✅ |
| Text blocks | 57 | — |
| Too small | 6 fail, 29 warn | ❌ |
| Low contrast | 0 fail, 0 warn | ✅ |
| In the Reels UI | 11 fail, 1 warn | ❌ |

## Blocks to fix

| Text | On screen | Size (typical) | Contrast (worst) | Reels UI | Evidence |
|---|---|---|---|---|---|
| "02:47 · ride 01 · recording" | 0.25–1.75 s | ⚠️ 34 px | ✅ 7.41:1, needs 4.5 | ✅ | `flagged/text_0_t0.25.jpg` |
| "MY BIKE" | 0.25–1.75 s | ✅ 124 px | ✅ 7.89:1, needs 3 | ⚠️ organic @ 0.75 s | `flagged/text_1_t0.75.jpg` |
| "REMEMBERS EVERY" | 0.25–1.75 s | ✅ 124 px | ✅ 6.76:1, needs 3 | ❌ organic @ 0.25 s | `flagged/text_2_t0.25.jpg` |
| "RIDE." | 0.25–1.75 s | ✅ 124 px | ✅ 7.45:1, needs 3 | ❌ organic @ 0.5 s | `flagged/text_3_t0.5.jpg` |
| "01 · brain · raspberry pi 5" | 2.25–3.75 s | ⚠️ 34 px | ✅ 12.06:1, needs 4.5 | ✅ | `flagged/text_4_t2.25.jpg` |
| "8 GB" | 2.75–3.75 s | ⚠️ 32 px | ✅ 10.38:1, needs 4.5 | ✅ | `flagged/text_6_t2.75.jpg` |
| "IP65" | 3–3.75 s | ⚠️ 32 px | ✅ 13.08:1, needs 4.5 | ✅ | `flagged/text_8_t3.jpg` |
| "200 × 120 × 75 mm" | 3.25–3.75 s | ⚠️ 32 px | ✅ 12.95:1, needs 4.5 | ✅ | `flagged/text_9_t3.25.jpg` |
| "02 · camera · module 3 wide" | 4.25–5.75 s | ⚠️ 34 px | ✅ 11.51:1, needs 4.5 | ✅ | `flagged/text_10_t4.25.jpg` |
| "A WIDE CAMERA," | 4.25–4.75 s | ✅ 124 px | ✅ 12.05:1, needs 3 | ❌ organic @ 4.25 s | `flagged/text_11_t4.25.jpg` |
| "102° wide" | 4.75–5.75 s | ⚠️ 32 px | ✅ 11.66:1, needs 4.5 | ✅ | `flagged/text_12_t4.75.jpg` |
| "rear-facing" | 5–5.75 s | ⚠️ 32 px | ✅ 12.27:1, needs 4.5 | ✅ | `flagged/text_13_t5.jpg` |
| "102°" | 5.25–5.75 s | ❌ 24.4 px | ✅ 8.19:1, needs 4.5 | ❌ organic @ 5.25 s | `flagged/text_14_t5.25.jpg` |
| "sealed window" | 5.25–5.75 s | ⚠️ 32 px | ✅ 12.24:1, needs 4.5 | ✅ | `flagged/text_15_t5.25.jpg` |
| "03 · position · usb gps" | 6.25–7.75 s | ⚠️ 34 px | ✅ 11.78:1, needs 4.5 | ✅ | `flagged/text_17_t6.25.jpg` |
| "u-blox" | 6.75–7.75 s | ⚠️ 32 px | ✅ 11.1:1, needs 4.5 | ✅ | `flagged/text_20_t6.75.jpg` |
| "antenna up" | 7–7.75 s | ⚠️ 32 px | ✅ 12.94:1, needs 4.5 | ✅ | `flagged/text_21_t7.jpg` |
| "04 · motion · bno085" | 8.25–9.75 s | ⚠️ 34 px | ✅ 11.83:1, needs 4.5 | ✅ | `flagged/text_22_t8.25.jpg` |
| "A MOTION SENSOR" | 8.25–10 s | ✅ 124 px | ✅ 12.28:1, needs 3 | ❌ organic @ 8.25 s | `flagged/text_23_t8.25.jpg` |
| "FEELS EVERY" | 8.25–10 s | ✅ 124 px | ✅ 12.46:1, needs 3 | ❌ organic @ 8.25 s | `flagged/text_24_t8.25.jpg` |
| "LEAN." | 8.25–10 s | ✅ 124 px | ✅ 11.53:1, needs 3 | ❌ organic @ 8.25 s | `flagged/text_25_t8.25.jpg` |
| "9-axis" | 8.75–9.75 s | ⚠️ 32 px | ✅ 10.48:1, needs 4.5 | ✅ | `flagged/text_26_t8.75.jpg` |
| "lean" | 9–9.75 s | ⚠️ 32 px | ✅ 11.21:1, needs 4.5 | ✅ | `flagged/text_27_t9.jpg` |
| "pitch" | 9.25–9.75 s | ⚠️ 32 px | ✅ 12.84:1, needs 4.5 | ✅ | `flagged/text_28_t9.25.jpg` |
| "acceleration" | 9.25–9.75 s | ⚠️ 32 px | ✅ 13.04:1, needs 4.5 | ✅ | `flagged/text_29_t9.25.jpg` |
| "05 · wheel · a3144 hall" | 10.25–11.75 s | ⚠️ 34 px | ✅ 11.64:1, needs 4.5 | ✅ | `flagged/text_30_t10.25.jpg` |
| "A MAGNET COUNTS" | 10.25–11.75 s | ✅ 124 px | ✅ 12.09:1, needs 3 | ❌ organic @ 10.25 s | `flagged/text_31_t10.25.jpg` |
| "EVERY WHEEL" | 10.25–11.75 s | ✅ 124 px | ✅ 12.29:1, needs 3 | ❌ organic @ 10.25 s | `flagged/text_32_t10.25.jpg` |
| "1 pulse per turn" | 10.75–11.75 s | ⚠️ 32 px | ✅ 12.71:1, needs 4.5 | ✅ | `flagged/text_34_t10.75.jpg` |
| "speed without GPS" | 11–11.75 s | ⚠️ 32 px | ✅ 11.99:1, needs 4.5 | ✅ | `flagged/text_35_t11.jpg` |
| "06 · behind · ultrasonic" | 12.25–13.75 s | ⚠️ 34 px | ✅ 11.86:1, needs 4.5 | ✅ | `flagged/text_36_t12.25.jpg` |
| "waterproof probes" | 12.75–13.75 s | ⚠️ 32 px | ✅ 12.53:1, needs 4.5 | ✅ | `flagged/text_39_t12.75.jpg` |
| "logged in metres" | 13–13.75 s | ⚠️ 32 px | ✅ 12.59:1, needs 4.5 | ✅ | `flagged/text_40_t13.jpg` |
| "with the video" | 13.25–13.75 s | ⚠️ 32 px | ✅ 12.49:1, needs 4.5 | ✅ | `flagged/text_41_t13.25.jpg` |
| "CAMERA" | 14–15.75 s | ❌ 24.4 px | ✅ 9.1:1, needs 4.5 | ✅ | `flagged/text_42_t14.jpg` |
| "GPS" | 14–15.75 s | ❌ 24.4 px | ✅ 8.05:1, needs 4.5 | ✅ | `flagged/text_43_t14.jpg` |
| "MOTION" | 14–15.75 s | ❌ 24.4 px | ✅ 8.58:1, needs 4.5 | ✅ | `flagged/text_44_t14.jpg` |
| "WHEEL" | 14–15.75 s | ❌ 24.4 px | ✅ 8.8:1, needs 4.5 | ✅ | `flagged/text_45_t14.jpg` |
| "BEHIND" | 14–15.75 s | ❌ 24.4 px | ✅ 8.02:1, needs 4.5 | ✅ | `flagged/text_46_t14.jpg` |
| "all sensors · logging" | 14.25–15.75 s | ⚠️ 34 px | ✅ 11.7:1, needs 4.5 | ✅ | `flagged/text_47_t14.25.jpg` |
| "dashboard" | 14.75–15.75 s | ⚠️ 32 px | ✅ 11.77:1, needs 4.5 | ✅ | `flagged/text_49_t14.75.jpg` |
| "Android + iPhone app" | 15–15.75 s | ⚠️ 32 px | ✅ 12.34:1, needs 4.5 | ✅ | `flagged/text_50_t15.jpg` |
| "Bike Logger" | 16–17.75 s | ✅ 200 px | ✅ 8.26:1, needs 3 | ❌ organic @ 16 s | `flagged/text_53_t16.jpg` |
| "runs offline · your rides stay with you" | 16–17.75 s | ⚠️ 30 px | ✅ 6.56:1, needs 4.5 | ✅ | `flagged/text_54_t16.jpg` |
| "Wire it yourself." | 16.25–17.75 s | ✅ 112 px | ✅ 6.49:1, needs 3 | ❌ organic @ 16.25 s | `flagged/text_55_t16.25.jpg` |
| "murathanyildirim.com/bike-logger" | 16.75–17.75 s | ⚠️ 36 px | ✅ 10.34:1, needs 4.5 | ✅ | `flagged/text_56_t16.75.jpg` |

Only DOM text is measured (HTML, SVG `<text>`). Check text drawn in canvas engines or baked into plates by eye. Decoration not meant to be read can opt out with `data-qa-skip`.
