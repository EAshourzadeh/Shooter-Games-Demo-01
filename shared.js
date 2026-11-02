/* Shooter Games engine. Each game page calls SSG.createGame(config).
   Created by Ehsan Ashour Zadeh (SMART English). Vanilla JS, no dependencies. */
(function (global) {
  "use strict";
  const SSG = {};

  /* ---------- helpers ---------- */
  SSG.rand = (a, b) => a + Math.random() * (b - a);
  SSG.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  SSG.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- sound (tiny WebAudio synth, starts after first click) ---------- */
  let ac = null,
    muted = false;
  function audio() {
    if (!ac) {
      try {
        ac = new (global.AudioContext || global.webkitAudioContext)();
      } catch (e) {
        ac = null;
      }
    }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  }
  function beep(freq, dur, o) {
    o = o || {};
    const c = audio();
    if (!c || muted) return;
    const t = c.currentTime + (o.delay || 0),
      osc = c.createOscillator(),
      g = c.createGain();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide)
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq + o.slide),
        t + dur,
      );
    g.gain.setValueAtTime(o.vol || 0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  function noise(dur, vol) {
    const c = audio();
    if (!c || muted) return;
    const n = Math.floor(c.sampleRate * dur),
      buf = c.createBuffer(1, n, c.sampleRate),
      d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(),
      g = c.createGain(),
      f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 900;
    g.gain.value = vol || 0.2;
    s.buffer = buf;
    s.connect(f);
    f.connect(g);
    g.connect(c.destination);
    s.start();
  }
  SSG.sfx = {
    shot() {
      noise(0.05, 0.12);
      beep(900, 0.07, { type: "square", slide: -600, vol: 0.06 });
    },
    pop() {
      noise(0.09, 0.25);
      beep(560, 0.12, { type: "triangle", slide: -320, vol: 0.2 });
    },
    good() {
      beep(660, 0.12, { type: "triangle" });
      beep(880, 0.16, { type: "triangle", delay: 0.09 });
    },
    ouch() {
      beep(240, 0.3, { type: "sawtooth", slide: -140, vol: 0.18 });
    },
    miss() {
      beep(170, 0.05, { type: "square", vol: 0.04 });
    },
    tick() {
      beep(1000, 0.05, { vol: 0.07 });
    },
    click() {
      beep(500, 0.06, { type: "triangle", vol: 0.12 });
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) =>
        beep(f, 0.22, { type: "triangle", delay: i * 0.11, vol: 0.18 }),
      );
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) =>
        beep(f, 0.28, { type: "sine", delay: i * 0.15, vol: 0.18 }),
      );
    },
  };

  /* ---------- scene ---------- */
  function sceneHTML() {
    let flowers = "";
    const cols = ["#ff5a8a", "#ffd23d", "#ffffff", "#ff9a3d", "#b57bff"];
    for (let i = 0; i < 46; i++) {
      const x = SSG.rand(10, 1270),
        y = SSG.rand(250, 322),
        c = SSG.pick(cols),
        r = SSG.rand(3.5, 6.5);
      flowers += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0V${(r * 3).toFixed(0)}" stroke="#2f8a35" stroke-width="2"/><circle r="${r.toFixed(1)}" fill="${c}"/><circle r="${(r * 0.38).toFixed(1)}" fill="#ffe14d"/></g>`;
    }
    const clouds = [
      [60, 90, 38, 0],
      [320, 140, 52, -20],
      [700, 60, 46, -34],
    ]
      .map(
        (c) =>
          `<div class="cloud" style="top:${c[1]}px;animation-duration:${c[2] + 40}s;animation-delay:${c[3]}s;left:0"></div>`,
      )
      .join("");
    return `<div class="scene">
      <div class="sun"></div>${clouds}
      <svg viewBox="0 0 1280 330" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 120 C200 40 360 60 560 120 S980 150 1280 70 V330 H0Z" fill="#a8e68a"/>
        <path d="M0 170 C220 110 420 130 640 180 S1040 190 1280 130 V330 H0Z" fill="#7fd05c"/>
        <path d="M0 230 C260 190 480 210 700 240 S1080 250 1280 210 V330 H0Z" fill="#5db646"/>
        ${flowers}
        <path d="M0 305 H1280 V330 H0Z" fill="#3f9d3c"/>
      </svg>
      <span class="bee" style="left:1020px;top:130px">🐝</span><span class="bee" style="left:1100px;top:190px;animation-delay:-4s">🐝</span>
    </div>`;
  }

  /* starburst clip-path for comic bubbles */
  (function () {
    const pts = [];
    const n = 18;
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2,
        r = i % 2 ? 36 : 50;
      pts.push(
        (50 + r * Math.cos(a)).toFixed(1) +
          "% " +
          (50 + r * Math.sin(a)).toFixed(1) +
          "%",
      );
    }
    document.documentElement.style.setProperty(
      "--burst",
      "polygon(" + pts.join(",") + ")",
    );
  })();

  /* ---------- game shell ---------- */
  SSG.createGame = function (cfg) {
    const W = 1280,
      H = 720,
      FIELD_H = 594;
    const stage = document.getElementById("stage");
    const LIVES = cfg.lives || 5,
      TIME = cfg.time || 120;
    const items = cfg.items.map((it) => Object.assign({ status: "new" }, it));
    let cur = -1,
      lives = LIVES,
      time = TIME,
      running = false,
      last = 0,
      hooks = [],
      rafId = 0,
      scale = 1,
      guard = 0;

    stage.innerHTML =
      sceneHTML() +
      `
      <section class="screen menu on" id="s-menu">
        <div class="kicker">Let's Play</div>
        <h1 class="title">${cfg.title}</h1>
        <div class="tiles" id="tiles"></div>
        <button class="btn-howto" id="btn-howto">How To Play</button>
        <div class="progress" id="progress"></div>
        <!-- <div class="credit">© SMART ENGLISH · Created by Ehsan Ashour Zadeh</div> -->
      </section>
      <section class="screen play" id="s-play">
        <div class="hud">
          <div class="life">Life <b id="lifeN">5</b><span class="hearts" id="hearts"></span></div>
          <div class="time" id="timeBox">Time <b id="timeN">120</b></div>
        </div>
        <div class="timebar" id="timebar"></div>
        <div class="field" id="field"></div>
        <div class="bottom"><div class="banner" id="banner"></div></div>
      </section>
      <section class="screen result" id="s-result">
        <div class="hudbar">Life <b id="rLife">0</b></div>
        <div class="ribbon" id="rRibbon"></div>
        <div class="sign"><div class="lab">${cfg.answerLabel}</div><div class="ans" id="rAns"></div></div>
        <div class="acts"><button id="btn-again">Play again</button><button class="alt" id="btn-menu">Menu</button></div>
      </section>
      <div class="toast" id="toast"></div>
      <div class="fx" id="fx"></div>
      <div class="tools">
        ${cfg.hubUrl ? `<a href="${cfg.hubUrl}" title="All games" aria-label="All games">⌂</a>` : ""}
        <button id="btn-mute" title="Sound on/off (M)" aria-label="Sound on or off">🔊</button>
        <button id="btn-full" title="Full screen (F)" aria-label="Full screen">⛶</button>
      </div>
      <div class="modal" id="howto"><div class="card">
        <h2>${cfg.welcome}</h2>
        <ul class="rules">${cfg.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
        <div class="by"><strong>Created by Ehsan Ashour Zadeh</strong>© SMART ENGLISH, 2026 · All rights reserved.</div>
        <button class="close" id="btn-close">Got it</button>
      </div></div>`;
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="rotate">Please turn your device sideways to play.</div>',
    );

    const $ = (id) => document.getElementById(id);
    const field = $("field"),
      fx = $("fx");
    const sMenu = $("s-menu"),
      sPlay = $("s-play"),
      sResult = $("s-result");

    /* fit stage to window */
    function fit() {
      scale = Math.min(innerWidth / W, innerHeight / H);
      stage.style.transform = "scale(" + scale + ")";
    }
    addEventListener("resize", fit);
    fit();

    function toStage(e) {
      const r = stage.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / scale,
        y: (e.clientY - r.top) / scale,
      };
    }

    /* ----- effects ----- */
    function particles(x, y, colors, n) {
      for (let i = 0; i < n; i++) {
        const d = document.createElement("i"),
          a = Math.random() * Math.PI * 2,
          dist = SSG.rand(40, 120),
          s = SSG.rand(7, 15);
        d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;border-radius:${Math.random() < 0.5 ? "50%" : "3px"};background:${SSG.pick(colors)}`;
        fx.appendChild(d);
        d.animate(
          [
            { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
            {
              transform: `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist + 30}px) scale(.2) rotate(${SSG.rand(-200, 200)}deg)`,
              opacity: 0,
            },
          ],
          { duration: SSG.rand(450, 800), easing: "cubic-bezier(.2,.8,.3,1)" },
        ).onfinish = () => d.remove();
      }
    }
    function comic(x, y, text, good) {
      const c = document.createElement("div");
      c.className = "comic" + (good ? " good" : "");
      c.innerHTML = "<span>" + text + "</span>";
      c.style.left = clamp(x, 90, W - 90) + "px";
      c.style.top = clamp(y, 100, H - 90) + "px";
      fx.appendChild(c);
      c.animate(
        [
          { transform: "rotate(-8deg) scale(.2)", opacity: 0 },
          { transform: "rotate(-8deg) scale(1.2)", opacity: 1, offset: 0.25 },
          { transform: "rotate(-4deg) scale(1)", opacity: 1, offset: 0.7 },
          { transform: "rotate(-4deg) scale(1.05)", opacity: 0 },
        ],
        { duration: 850, easing: "ease-out" },
      ).onfinish = () => c.remove();
    }
    function confetti() {
      const cols = [
        "#ff5a5f",
        "#ffc83d",
        "#25b886",
        "#1d44e6",
        "#b57bff",
        "#ff9a3d",
      ];
      for (let i = 0; i < 90; i++) {
        const p = document.createElement("i"),
          x = SSG.rand(0, W),
          w = SSG.rand(8, 16);
        p.style.cssText = `position:absolute;left:${x}px;top:-20px;width:${w}px;height:${w * 0.6}px;background:${SSG.pick(cols)}`;
        fx.appendChild(p);
        p.animate(
          [
            { transform: "translateY(0) rotate(0)", opacity: 1 },
            {
              transform: `translate(${SSG.rand(-120, 120)}px,${H + 40}px) rotate(${SSG.rand(300, 900)}deg)`,
              opacity: 1,
            },
          ],
          {
            duration: SSG.rand(1600, 3000),
            delay: SSG.rand(0, 600),
            easing: "cubic-bezier(.3,.1,.6,1)",
          },
        ).onfinish = () => p.remove();
      }
    }
    function toast(text) {
      const t = $("toast");
      t.textContent = text;
      t.classList.remove("on");
      void t.offsetWidth;
      t.classList.add("on");
    }
    function shake() {
      stage.animate(
        [
          { transform: `scale(${scale}) translate(0,0)` },
          { transform: `scale(${scale}) translate(-9px,3px)` },
          { transform: `scale(${scale}) translate(8px,-4px)` },
          { transform: `scale(${scale}) translate(-5px,2px)` },
          { transform: `scale(${scale}) translate(0,0)` },
        ],
        { duration: 300 },
      );
    }

    /* ----- HUD ----- */
    function drawHud() {
      $("lifeN").textContent = lives;
      $("hearts").innerHTML = Array.from(
        { length: LIVES },
        (_, i) => `<i class="${i < lives ? "" : "off"}">❤️</i>`,
      ).join("");
      const t = Math.max(0, Math.ceil(time));
      $("timeN").textContent = t;
      $("timeBox").classList.toggle("low", t <= 15);
      const bar = $("timebar");
      bar.style.transform = `scaleX(${clamp(time / TIME, 0, 1)})`;
      bar.classList.toggle("low", t <= 15);
    }

    /* ----- menu ----- */
    function drawMenu() {
      $("tiles").innerHTML = items
        .map(
          (
            it,
            i,
          ) => `<button class="tile ${cfg.tileStyle} ${it.status}" data-i="${i}" aria-label="${cfg.tileName} ${i + 1}">
        <span class="face"><span><small>${cfg.tileName}</small><b>${i + 1}</b></span></span>
        <span class="mark">${it.status === "won" ? "✓" : "✗"}</span></button>`,
        )
        .join("");
      const won = items.filter((i) => i.status === "won").length;
      $("progress").innerHTML = `Solved <b>${won}</b> of ${items.length}`;
    }
    function show(screen) {
      [sMenu, sPlay, sResult].forEach((s) =>
        s.classList.toggle("on", s === screen),
      );
      stage.classList.toggle("playing", screen === sPlay);
    }
    function showMenu() {
      stopLoop();
      hooks = [];
      field.innerHTML = "";
      drawMenu();
      show(sMenu);
    }

    /* ----- round ----- */
    const api = {
      W,
      H: FIELD_H,
      field,
      rand: SSG.rand,
      pick: SSG.pick,
      shuffle: SSG.shuffle,
      clamp,
      get active() {
        return running;
      },
      pt(e) {
        return toStage(e);
      },
      setBanner(html) {
        $("banner").innerHTML = "<span>" + html + "</span>";
      },
      onFrame(fn) {
        hooks.push(fn);
      },
      toast,
      pop(x, y, colors) {
        SSG.sfx.pop();
        particles(x, y, colors || ["#fff", "#ffd23d", "#ff5a8a"], 14);
      },
      sparkle(x, y) {
        SSG.sfx.good();
        particles(x, y, ["#fff", "#ffd23d", "#52e08a"], 12);
      },
      hurt(x, y, text) {
        if (!running) return;
        lives--;
        drawHud();
        SSG.sfx.ouch();
        shake();
        comic(x, y, text || "OUCH!");
        if (lives <= 0) finish(false, "lives");
      },
      win(x, y) {
        if (!running) return;
        comic(x, y, "YES!", true);
        finish(true);
      },
      /* a shot that hit empty space */
      miss(e) {
        if (!running) return;
        const p = toStage(e);
        SSG.sfx.miss();
        particles(p.x, p.y, ["#ffffffaa"], 4);
      },
    };

    function startRound(i) {
      cur = i;
      lives = LIVES;
      time = TIME;
      running = true;
      hooks = [];
      guard++;
      field.innerHTML = "";
      fx.innerHTML = "";
      show(sPlay);
      drawHud();
      cfg.start(items[i], i, api);
      last = performance.now();
      stopLoop();
      loop(last);
    }
    function loop(ts) {
      const dt = Math.min(0.1, (ts - last) / 1000);
      last = ts;
      if (running) {
        const before = Math.ceil(time);
        time -= dt;
        if (Math.ceil(time) !== before) {
          drawHud();
          if (time <= 10 && time > 0) SSG.sfx.tick();
        }
        for (const h of hooks) h(dt, TIME - time);
        if (time <= 0) {
          time = 0;
          drawHud();
          finish(false, "time");
        }
      }
      rafId = requestAnimationFrame(loop);
    }
    function stopLoop() {
      cancelAnimationFrame(rafId);
    }

    function finish(win, reason) {
      if (!running) return;
      running = false;
      const it = items[cur],
        my = ++guard;
      if (win) it.status = "won";
      else if (it.status !== "won") it.status = "lost";
      if (win) {
        SSG.sfx.win();
        confetti();
      } else SSG.sfx.lose();
      setTimeout(
        () => {
          if (my !== guard) return;
          $("rLife").textContent = lives;
          const rb = $("rRibbon");
          rb.className = "ribbon" + (win ? " win" : "");
          rb.innerHTML = win
            ? "Well done! Your answer is correct."
            : `Sorry! You didn't find the answer.<small>${reason === "time" ? "Time's up." : "No lives left."}</small>`;
          $("rAns").innerHTML = cfg.answerHTML(it);
          show(sResult);
        },
        win ? 1100 : 900,
      );
    }

    /* ----- wiring ----- */
    $("tiles").addEventListener("click", (e) => {
      const b = e.target.closest(".tile");
      if (b) {
        audio();
        SSG.sfx.click();
        startRound(+b.dataset.i);
      }
    });
    $("btn-howto").addEventListener("click", () => {
      audio();
      SSG.sfx.click();
      $("howto").classList.add("on");
      $("btn-close").focus();
    });
    $("btn-close").addEventListener("click", () =>
      $("howto").classList.remove("on"),
    );
    $("howto").addEventListener("click", (e) => {
      if (e.target.id === "howto") $("howto").classList.remove("on");
    });
    $("btn-again").addEventListener("click", () => {
      SSG.sfx.click();
      startRound(cur);
    });
    $("btn-menu").addEventListener("click", () => {
      SSG.sfx.click();
      showMenu();
    });
    field.addEventListener("pointerdown", (e) => {
      if (e.target === field) {
        SSG.sfx.shot();
        api.miss(e);
      }
    });
    $("btn-mute").addEventListener("click", toggleMute);
    $("btn-full").addEventListener("click", toggleFull);
    function toggleMute() {
      muted = !muted;
      $("btn-mute").textContent = muted ? "🔇" : "🔊";
      if (!muted) SSG.sfx.click();
    }
    function toggleFull() {
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
      } catch (e) {
        /* not available here */
      }
    }
    addEventListener("keydown", (e) => {
      if (e.key === "m" || e.key === "M") toggleMute();
      else if (e.key === "f" || e.key === "F") toggleFull();
      else if (e.key === "Escape") {
        if ($("howto").classList.contains("on"))
          $("howto").classList.remove("on");
        else if (!sMenu.classList.contains("on")) {
          running = false;
          guard++;
          showMenu();
        }
      }
    });

    drawMenu();
    /* small hook for automated testing and demos */
    SSG.debug = {
      state: () => ({ cur, lives, time, running }),
      start: startRound,
    };
    return api;
  };

  global.SSG = SSG;
})(window);
