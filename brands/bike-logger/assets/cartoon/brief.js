/* Bike Logger brief for the ad kit: every fact from brands/bike-logger/README.md ("Facts that can be shown",
 * taken from the live page). Two voices: "fun" (warm, bouncy) and "adult" (dry, deadpan). Same facts in both.
 *   const brief = BL.brief("adult");  AdKit.pattern("ikea", brief) */
(function () {
  const SRC = "brands/bike-logger/README.md · Facts (live page)";
  window.BL.brief = function (style = "fun") {
    const A = style === "adult";
    const say = (fun, adult) => (A ? adult : fun);
    const features = [
      { actor: "pi", eyebrow: "The brain", title: say("Runs the show.", "Does the thinking."), chips: ["Raspberry Pi 5", "8 GB", "active cooler"], act: [["fan", 0.2], ["wave", 0.8]] },
      { actor: "cam", eyebrow: "Camera", title: say("Watches behind.", "Only looks back."), chips: ["Camera Module 3 Wide", "102°"], act: [["look", 0.5]] },
      { actor: "gps", eyebrow: "GPS", title: say("Knows where.", "Always knows where."), chips: ["USB GPS", "u-blox", "antenna up"], act: [["arcs", 0.3]] },
      { actor: "imu", eyebrow: "9-axis IMU", title: say("Feels every lean.", "Takes every corner personally."), chips: ["BNO085", "lean", "pitch", "acceleration"], act: [["tilt", 0.4]] },
      { actor: "sonar", eyebrow: "Ultrasonic", title: say("Measures behind.", "Keeps tabs on who's behind."), chips: ["waterproof probes", "in metres"], act: [["ping", 0.3]] },
      { actor: "hall", eyebrow: "Hall sensor", title: say("Counts the wheel.", "Counts. That's it."), chips: ["A3144", "spoke magnet", "1 pulse per turn"], act: [["count", 0.2]] },
    ];
    const crew = ["pi", "cam", "gps", "imu", "sonar", "hall"];
    const brand = { wordmark: "Bike Logger", line: "Build your own ride recorder.", cta: "murathanyildirim.com/bike-logger", eyebrow: "Robotics starter kit" };
    const replay = { type: "replay", dur: 3.4, eyebrow: "Code it", title: say("Scrub once. Everything moves.", "One timeline. Scrub once.") };
    return {
      brand, crew, features, endActors: ["pi", "gps", "hall"],
      hooks: {
        A: { eyebrow: "Build your own ride recorder", title: say("Meet the crew.", "They work under the rack."), actor: "box", act: [["rattle", 0.4], ["open", 1.2]] },
        B: { eyebrow: "Robotics starter kit", title: say("Five sensors. One Pi.", "Five sensors. One sealed box."), actor: "pi", act: [["fan", 0.2]] },
        C: { eyebrow: "Robotics starter kit", title: say("Who's in the box?", "Something's in the box."), actor: "box", act: [["rattle", 0.3], ["rattle", 0.9]] },
      },
      listHook: { title: say("Five sensors, five skills.", "Five sensors. Five skills."), actor: "box", act: [["open", 0.6]] },
      problem: { eyebrow: "Robotics kits", title: say("Another blinking LED?", "Another kit that ends in a blinking LED."), actor: "pi", act: [["shake", 0.8]] },
      agitate: { eyebrow: "And then", title: say("Five logs. None line up.", "Five sensors. Five logs. Nothing lines up."), actor: "cam" },
      solution: { ...features[0] },
      payoff: replay,
      steps: [
        { label: "Wire it.", sub: "five sensors to one Pi", actor: "pi" },
        { label: "Code it.", sub: "read every sensor", actor: "imu" },
        { label: "Ride.", sub: "replay on one timeline", actor: "cam" },
      ],
      stepsTitle: say("Three steps.", "Three steps. No shortcuts."),
      mystery: { eyebrow: "Under the rack", title: say("What's in the box?", "What lives under the rack?"), answer: say("A Raspberry Pi 5.", "A Raspberry Pi 5. And friends."), chips: ["IP65 box", "200 × 120 × 75 mm"], actor: "pi", reveal: 1.7 },
      interrupt: { title: say("Wait.", "Hold on."), sub: say("Your bike can learn robotics.", "Your bike could be a robotics lab.") },
      before: { eyebrow: "Before", title: say("Five sensors. Five logs.", "Five logs. No story.") },
      after: { eyebrow: "After", title: say("One timeline.", "One timeline. One story.") },
      mess: ["video", "GPS", "lean", "behind", "wheel speed"],
      myth: { fact: say("Speed works without GPS.", "Speed doesn't need the sky."), myth: say("You need GPS for speed.", "You need GPS for speed."), chips: ["A3144 Hall", "spoke magnet", "1 pulse per turn"], source: SRC, actor: "hall" },
      tip: { eyebrow: "Free tip · Hall sensors", title: say("Speed from one magnet.", "Speed from one magnet. Really."), lines: ["1 magnet on a spoke", "1 pulse per wheel turn", "speed = turns × wheel size ÷ time"], actor: "hall" },
      tipFollow: { title: say("Want to wire it up?", "Want to wire it yourself?"), eyebrow: "Bike Logger", actor: "hall", act: [["wave", 0.4]] },
      loss: { eyebrow: say("Every ride you don't record", "Every ride you don't record"), title: say("is gone.", "is just gone."), items: ["the corner", "the pothole", "the overtake", "the route"], after: say("Record the next one.", "Record the next one.") },
      progress: { eyebrow: "Your build", title: say("Wire one. Then the next.", "One part at a time."), items: ["Raspberry Pi 5", "Camera", "GPS", "BNO085 IMU", "Ultrasonic", "Hall sensor"], done: 0 },
      compare: { eyebrow: "Robotics kits", title: say("Blink vs build.", "Blink. Or build."), left: { label: "Blinking LED kit", rows: ["one LED", "stays on the desk", "nothing to replay"] }, right: { label: "Bike Logger", rows: ["five sensors + camera", "rides on your bike", "one synced replay"] } },
      numbers: [
        { eyebrow: "Camera", value: 102, suffix: "°", label: say("of rear view.", "of rear view. Wide."), source: SRC, actor: "cam" },
        { eyebrow: "BNO085", value: 9, suffix: "-axis", label: say("lean, pitch, acceleration.", "lean, pitch, acceleration."), source: SRC, actor: "imu" },
        { eyebrow: "Sealed box", value: 65, prefix: "IP", label: "200 × 120 × 75 mm", source: SRC, actor: "box" },
      ],
      faq: [
        { q: say("No GPS in a tunnel?", "Tunnel. No GPS."), a: say("The wheel still counts.", "The wheel keeps counting."), chips: ["A3144", "1 pulse per turn"], actor: "hall" },
        { q: say("Where do rides go?", "Where do the rides go?"), a: say("Your rides stay with you.", "Nowhere. They stay with you."), chips: ["runs offline"], actor: "pi" },
      ],
      ikea: {
        hook: { eyebrow: "Robotics starter kit", title: say("Don't buy a recorder.", "Don't buy a ride recorder."), actor: "box" },
        eyebrow: "You", stepsTitle: say("Build one.", "Build one."),
        pride: { eyebrow: "Made by you", title: say("You built that.", "You built that. Every wire."), actor: "pi" },
      },
      foot: {
        first: { eyebrow: "Start small", title: say("Start with one sensor.", "Start with one sensor."), actor: "hall" },
        feature: { ...features[5] },
        then: { eyebrow: "Then", title: say("Add the next.", "Then the rest.") },
      },
      story: [
        { type: "boxHook", dur: 2.2, eyebrow: "Under the rack", title: say("Every crew has a job.", "Every crew has a job.") },
        { type: "ride", dur: 6.4, beats: [{ at: 0.1, eyebrow: "A pothole", title: say("Tilt felt it.", "Tilt felt that.") }, { at: 2.2, eyebrow: "A car", title: say("Ping measured it.", "Ping took notes.") }, { at: 4.3, eyebrow: "The wheel", title: say("Spin kept count.", "Spin kept count.") }],
          events: [{ type: "pothole", at: 0.6 }, { type: "overtake", at: 2.6 }, { type: "wheel", at: 4.6 }] },
        replay,
      ],
      unbox: { type: "boxHook", dur: 2.2, eyebrow: "Robotics starter kit", title: say("What's inside?", "What's inside.") },
      lineupTitle: say("The whole crew.", "The whole crew."),
    };
  };
})();
