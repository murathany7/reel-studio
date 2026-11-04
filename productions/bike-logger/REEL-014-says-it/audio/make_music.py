"""Build REEL-014's music and SFX: REEL-008's synth track at 120 BPM, 9 bars (18 s), made only with ffmpeg's
aevalsrc, so it is ours to use anywhere. Run from the repo root:

    python3 productions/bike-logger/REEL-014-says-it/audio/make_music.py

Writes music.wav (the bed) and sfx.wav (cut glitches and per-beat sounds), mixed by audio/cues.json.
Bed (D minor: Dm Bb F C): bar 0 a sub hit, a 16th-note pulse and the pad; bars 1-6 add a kick on every beat and a
bass; bar 7 (the timeline) adds off-beat hats and a clap on 2 and 4; bar 8 (end card) one last sub hit, the pad rings
out. Rain (filtered noise) runs under everything.
SFX: a glitch burst on every bar start 1-8, a power-on rise in bar 1, a shutter tick in bar 2, data blips in bar 3,
a whoosh in bar 4, a tick per beat in bar 5 (the Hall pulses), sonar pings in bar 6.
"""
import os
import subprocess

here = os.path.dirname(os.path.abspath(__file__))
P = 60 / 120          # one beat
B = 4 * P             # one bar (2.0 s)
END = 9 * B           # 18 s
END_CARD = 8 * B
DROP = 7 * B

m = f"mod(t,{P})"                         # time since the last beat
s16 = f"mod(t,{P / 4})"                   # time since the last 16th
k = f"mod(floor(t/{B}),4)"                # bar in the chord loop
bar = lambda n: f"between(t,{n * B},{(n + 1) * B - 1e-4})"
pick = lambda vals: f"if(eq({k},0),{vals[0]},if(eq({k},1),{vals[1]},if(eq({k},2),{vals[2]},{vals[3]})))"
duck = f"(1-0.7*exp(-9*{m}))"

# Bed
sub = f"(lt(t,{P})+between(t,{END_CARD},{END_CARD + 2 * P}))*sin(2*PI*(38+90*exp(-14*mod(t,{END_CARD})))*mod(t,{END_CARD}))*exp(-2.2*mod(t,{END_CARD}))"
kick = f"between(t,{B},{END_CARD})*sin(2*PI*(42+130*exp(-30*{m}))*{m})*exp(-9*{m})"
root = pick([73.42, 58.27, 87.31, 65.41])          # D2 Bb1 F2 C2
bass = f"between(t,{B},{END_CARD})*0.32*{duck}*(sin(2*PI*{root}*t)+0.5*sin(4*PI*{root}*t)+0.25*sin(6*PI*{root}*t)+0.12*sin(8*PI*{root}*t))"
pulse = f"lt(t,{END_CARD})*0.09*{duck}*exp(-14*{s16})*(sin(2*PI*{root}*4*t)+0.5*sin(2*PI*{root}*6*t))"
chords = [(293.66, 349.23, 440), (233.08, 293.66, 349.23), (349.23, 440, 523.25), (261.63, 329.63, 392)]
pad = "+".join(f"sin(2*PI*{pick([c[i] for c in chords])}*t)+0.6*sin(2*PI*{pick([c[i] * 1.006 for c in chords])}*t)" for i in range(3))
pad = f"0.045*if(lt(t,{END_CARD}),{duck},exp(-0.8*(t-{END_CARD})))*({pad})"
hat = f"between(t,{DROP},{END_CARD})*(random(0)-0.5)*1.2*exp(-80*mod(t-{P / 2},{P}))"
clap = f"between(t,{DROP},{END_CARD})*eq(mod(floor(t/{P}),2),1)*(random(1)-0.5)*1.6*exp(-30*{m})"
rain = "0.10*(random(2)-0.5)"

# SFX
glitch = "+".join(f"between(t,{n * B},{n * B + 0.14})*(random(3)-0.5)*1.3*sin(2*PI*{900 + 230 * n}*t)" for n in range(1, 9))
hum = f"{bar(1)}*0.35*sin(2*PI*(55+70*(t-{B})/{B})*t)*(1-exp(-6*(t-{B})))*exp(-1.4*(t-{B}))"
shutter = f"between(t,{2 * B + P},{2 * B + P + 0.05})*(random(4)-0.5)*2*exp(-90*(t-{2 * B + P}))"
blips = f"{bar(3)}*0.25*sin(2*PI*1760*t)*exp(-60*mod(t,{P / 2}))"
whoosh = f"{bar(4)}*(random(5)-0.5)*0.5*sin(PI*(t-{4 * B})/{B})^2"
ticks = f"{bar(5)}*0.5*sin(2*PI*2600*t)*exp(-120*{m})"
sonar = f"{bar(6)}*0.4*sin(2*PI*1180*t)*exp(-7*{m})"


def render(name, low, high=None):
    out = os.path.join(here, name)
    parts = [f"aevalsrc='{low}':s=48000:d={END}[a]"]
    if high:
        parts.append(f"aevalsrc='{high}':s=48000:d={END},highpass=f=5000[b]")
        parts.append("[a][b]amix=inputs=2:normalize=0,lowpass=f=15000,alimiter=limit=0.8,aformat=channel_layouts=stereo[out]")
    else:
        parts.append("[a]lowpass=f=14000,alimiter=limit=0.8,aformat=channel_layouts=stereo[out]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-filter_complex", ";".join(parts), "-map", "[out]", out], check=True)
    print(out)


render("music.wav", f"{sub}+{kick}+{bass}+{pulse}+{pad}", f"{hat}+{clap}+{rain}")
render("sfx.wav", f"{glitch}+{hum}+{shutter}+{blips}+{whoosh}+{ticks}+{sonar}")
