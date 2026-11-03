#!/usr/bin/env bash
# Rebuild the demo's music (a synthetic 120 BPM loop: kick on the beat, louder on the downbeat, hat on the
# off-beat) and its beat grid. Run from the repo root: examples/reel-layer/make-audio.sh
set -euo pipefail
d=examples/reel-layer/audio
o=0.25; P=0.5
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.8*(gte(t,$o)*((1+1.2*lt(mod(t-$o,4*$P),0.05))*sin(2*PI*(50+120*exp(-30*mod(t-$o,$P)))*mod(t-$o,$P))*exp(-12*mod(t-$o,$P)) + 0.25*(random(0)-0.5)*exp(-60*mod(t-$o-$P/2,$P))*gte(t,$o+$P/2)) + 0.12*sin(2*PI*110*t)*(0.6+0.4*sin(2*PI*t/4)))':s=44100:d=8" \
  -af "afade=t=out:st=7.4:d=0.6" -c:a libmp3lame -b:a 128k "$d/music.mp3"
node scripts/beats.mjs "$d/music.mp3" "$d/beats.json"
