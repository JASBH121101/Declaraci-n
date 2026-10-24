(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const screens = Array.from(document.querySelectorAll(".screen"));
  const canvas = $("particles");
  const ctx = canvas.getContext("2d");
  let width = 0, height = 0, dpr = 1, animationFrame = 0;
  let particles = [];
  let heartMode = false;
  let audioContext = null, musicNodes = [], musicOn = false;

  const questions = [
    {
      eyebrow: "PREGUNTA 1 DE 3",
      title: "Si pudieras escaparte un día,<br><em>¿qué elegirías?</em>",
      copy: "A veces una respuesta pequeña cuenta algo bonito de una persona.",
      answers: [
        ["⛰", "Un volcán o un cerro"],
        ["🌊", "Una playa o una piscina"],
        ["🍃", "Un lugar tranquilo con buena compañía"],
        ["🍜", "Un sitio nuevo con buena comida"]
      ],
      replies: [
        "Suena a una aventura que vale la pena recordar.",
        "A veces, cambiar de paisaje lo mejora todo.",
        "La compañía puede convertir cualquier lugar en algo especial.",
        "Descubrir sabores nuevos también es una forma de viajar."
      ]
    },
    {
      eyebrow: "PREGUNTA 2 DE 3",
      title: "Si eligieras una cena especial,<br><em>¿qué se te antoja?</em>",
      copy: "No hay respuesta correcta; solamente curiosidad por tus gustos.",
      answers: [
        ["🍣", "Sushi, siempre"],
        ["🍱", "Algo de comida japonesa"],
        ["🌮", "Comida local"],
        ["♡", "Lo importante es la compañía"]
      ],
      replies: [
        "Una elección que merece disfrutarse con calma.",
        "Hay mucho por descubrir en la cocina japonesa.",
        "A veces lo conocido es justo lo que apetece.",
        "Esa respuesta tiene algo bonito: compartir el momento."
      ]
    },
    {
      eyebrow: "PREGUNTA 3 DE 3",
      title: "Si tu historia fuera un anime,<br><em>¿qué tipo sería?</em>",
      copy: "Última pregunta. Después te espera una pequeña pista.",
      answers: [
        ["✧", "Aventura y descubrimientos"],
        ["♡", "Romance y momentos tranquilos"],
        ["☻", "Comedia y muchas risas"],
        ["✦", "Una mezcla de todo"]
      ],
      replies: [
        "Las mejores historias suelen empezar dando un paso.",
        "Los momentos sencillos también pueden ser inolvidables.",
        "Reír juntos es una forma preciosa de conectar.",
        "Una mezcla inesperada puede ser la mejor historia."
      ]
    }
  ];
  let questionIndex = 0;

  function showScreen(id) {
    screens.forEach(screen => {
      const active = screen.id === id;
      screen.classList.toggle("active", active);
      screen.setAttribute("aria-hidden", String(!active));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id === "reveal-screen") {
      heartMode = true;
      $("heart-stage").classList.add("celebrate");
      createHeartParticles();
    }
  }

  function renderQuestion() {
    const q = questions[questionIndex];
    $("question-eyebrow").textContent = q.eyebrow;
    $("question-title").innerHTML = q.title;
    $("question-copy").textContent = q.copy;
    $("question-count").textContent = String(questionIndex + 2).padStart(2, "0");
    $("progress-fill").style.width = ((questionIndex + 1) / questions.length * 100) + "%";
    $("answer-feedback").textContent = "";
    const list = $("answer-list");
    list.replaceChildren();
    q.answers.forEach(([symbol, label], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      const icon = document.createElement("span");
      icon.className = "answer-symbol";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = symbol;
      const text = document.createElement("span");
      text.textContent = label;
      const arrow = document.createElement("span");
      arrow.className = "answer-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      button.append(icon, text, arrow);
      button.addEventListener("click", () => chooseAnswer(index));
      list.append(button);
    });
  }

  function chooseAnswer(index) {
    const q = questions[questionIndex];
    const feedback = $("answer-feedback");
    feedback.textContent = q.replies[index];
    Array.from($("answer-list").children).forEach((button, i) => {
      button.disabled = true;
      if (i === index) button.style.borderColor = "#f47d91";
      else button.style.opacity = ".5";
    });
    window.setTimeout(() => {
      questionIndex += 1;
      if (questionIndex < questions.length) {
        renderQuestion();
      } else {
        showScreen("clue-screen");
      }
    }, 1250);
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: width < 600 ? 48 : 85 }, () => makeParticle());
  }

  function makeParticle(target) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .22,
      vy: -.08 - Math.random() * .25,
      radius: .5 + Math.random() * 1.8,
      alpha: .12 + Math.random() * .55,
      phase: Math.random() * Math.PI * 2,
      target: target || null
    };
  }

  function heartPoint(t, scale) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return { x: width / 2 + x * scale, y: height * .49 + y * scale };
  }

  function createHeartParticles() {
    const total = width < 600 ? 360 : 620;
    const scale = Math.min(width / 39, height / 37, 12.5);
    particles = [];
    for (let i = 0; i < total; i++) {
      const t = Math.random() * Math.PI * 2;
      const spread = Math.sqrt(Math.random());
      const point = heartPoint(t, scale * spread);
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * 1.1,
        vy: (Math.random() - .5) * 1.1,
        radius: .6 + Math.random() * 1.7,
        alpha: .25 + Math.random() * .7,
        phase: Math.random() * Math.PI * 2,
        target: point
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const time = performance.now() * .001;
    for (const p of particles) {
      if (heartMode && p.target) {
        p.x += (p.target.x - p.x) * .025;
        p.y += (p.target.y - p.y) * .025;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
      }
      const pulse = .6 + .4 * Math.sin(time * 1.6 + p.phase);
      ctx.beginPath();
      ctx.fillStyle = heartMode ? `rgba(255, ${65 + Math.floor(pulse*80)}, ${100 + Math.floor(pulse*80)}, ${p.alpha})` : `rgba(239, 75, 103, ${p.alpha * pulse})`;
      ctx.shadowBlur = heartMode ? 10 : 5;
      ctx.shadowColor = "#ed3157";
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    animationFrame = window.requestAnimationFrame(animate);
  }

  let melodyTimer = null;
  let melodyStep = 0;
  let masterGainNode = null;
  let musicVolume = 0.85;
  let noiseBuffer = null;

  function createNoiseBuffer() {
    if (!audioContext) return null;
    const samples = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, samples, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / samples * 0.22);
    return buffer;
  }

  function playTone(frequency, startAt, duration, volume, type, cutoff, attack) {
    if (!audioContext || !masterGainNode) return;
    const osc = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    osc.type = type || "triangle";
    osc.frequency.setValueAtTime(frequency, startAt);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff || 2200, startAt);
    filter.Q.value = 0.45;
    const attackTime = Math.min(attack || 0.025, duration * 0.35);
    const endAt = startAt + duration;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), startAt + Math.max(attackTime, 0.008));
    gain.gain.setValueAtTime(Math.max(volume * 0.62, 0.0002), startAt + duration * 0.62);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainNode);
    osc.start(startAt);
    osc.stop(endAt + 0.025);
  }

  function playKick(startAt, volume) {
    if (!audioContext || !masterGainNode) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(125, startAt);
    osc.frequency.exponentialRampToValueAtTime(48, startAt + 0.13);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.19);
    osc.connect(gain);
    gain.connect(masterGainNode);
    osc.start(startAt);
    osc.stop(startAt + 0.21);
  }

  function playNoise(startAt, duration, volume, cutoff) {
    if (!audioContext || !masterGainNode || !noiseBuffer) return;
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = noiseBuffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(cutoff, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), startAt + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainNode);
    source.start(startAt, 0, duration);
    source.stop(startAt + duration + 0.015);
  }

  function scheduleMusic() {
    if (!musicOn || !audioContext || audioContext.state !== "running") return;

    // Original retro-romantic synth-pop with a subtle Latin urban syncopation.
    const bpm = 96;
    const beat = 60 / bpm;
    const eighth = beat / 2;
    const loopDuration = beat * 16;
    const now = audioContext.currentTime + 0.10;
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [123.47, 146.83, 196.00, 220.00], // Gadd9/B
      [110.00, 130.81, 164.81, 196.00], // Am7
      [87.31, 130.81, 174.61, 220.00]   // Fmaj7
    ];
    const bassline = [
      65.41, 0, 98.00, 65.41, 0, 82.41, 65.41, 0,
      61.74, 0, 92.50, 61.74, 0, 77.78, 61.74, 0,
      55.00, 0, 82.41, 55.00, 0, 69.30, 55.00, 0,
      43.65, 0, 65.41, 43.65, 0, 58.27, 43.65, 0
    ];
    const lead = [
      523.25, 0, 659.25, 587.33, 0, 523.25, 659.25, 0,
      493.88, 0, 587.33, 523.25, 0, 493.88, 440.00, 0,
      440.00, 0, 523.25, 587.33, 0, 523.25, 440.00, 0,
      392.00, 0, 440.00, 493.88, 0, 440.00, 392.00, 0
    ];
    const kickSteps = [0, 5, 8, 13, 16, 21, 24, 29, 31];
    const clapSteps = [2, 6, 10, 14, 18, 22, 26, 30];

    for (let bar = 0; bar < 4; bar++) {
      const barStart = now + bar * beat * 4;
      chords[bar].forEach((frequency, index) => {
        playTone(frequency, barStart, beat * 3.85, index === 0 ? 0.048 : 0.035, "sawtooth", 1050, 0.20);
      });
      playTone(chords[bar][2] * 2, barStart + beat * 1.5, beat * 2.1, 0.027, "triangle", 2500, 0.06);
    }

    for (let step = 0; step < 32; step++) {
      const at = now + step * eighth;
      if (bassline[step]) playTone(bassline[step], at, eighth * 1.55, 0.18, "sawtooth", 340, 0.018);
      if (lead[step]) playTone(lead[step], at + (step % 4 === 2 ? eighth * 0.12 : 0), eighth * 1.25, 0.115, "triangle", 2600, 0.025);
      if (kickSteps.includes(step)) playKick(at, 0.28);
      if (clapSteps.includes(step)) playNoise(at, 0.13, 0.105, 1500);
      if (step % 2 === 1) playNoise(at, 0.045, step % 4 === 3 ? 0.026 : 0.014, 6200);
    }

    melodyStep += 1;
    melodyTimer = window.setTimeout(scheduleMusic, loopDuration * 1000 - 80);
  }

  async function toggleMusic(force) {
    const next = typeof force === "boolean" ? force : !musicOn;
    if (next === musicOn) return;

    if (next) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) throw new Error("Audio no disponible");
        if (audioContext && audioContext.state !== "closed") await audioContext.close();
        audioContext = new AudioCtx();
        await audioContext.resume();
        masterGainNode = audioContext.createGain();
        masterGainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
        masterGainNode.gain.setTargetAtTime(0.68 * musicVolume, audioContext.currentTime, 0.35);
        masterGainNode.connect(audioContext.destination);
        noiseBuffer = createNoiseBuffer();
        musicOn = true;
        melodyStep = 0;
        scheduleMusic();
        $("music-toggle").setAttribute("aria-pressed", "true");
        $("music-label").textContent = "Música activada";
      } catch (error) {
        musicOn = false;
        $("music-toggle").setAttribute("aria-pressed", "false");
        $("music-label").textContent = "Audio no disponible";
      }
    } else {
      musicOn = false;
      if (melodyTimer !== null) {
        window.clearTimeout(melodyTimer);
        melodyTimer = null;
      }
      if (audioContext && audioContext.state !== "closed") {
        try { await audioContext.close(); } catch (_) {}
      }
      audioContext = null;
      masterGainNode = null;
      noiseBuffer = null;
      melodyStep = 0;
      $("music-toggle").setAttribute("aria-pressed", "false");
      $("music-label").textContent = "Música apagada";
    }
  }

  const volumeSlider = $("music-volume");
  const volumeValue = $("volume-value");
  if (volumeSlider && volumeValue) {
    musicVolume = Number(volumeSlider.value) / 100;
    volumeValue.value = volumeSlider.value + "%";
    volumeSlider.addEventListener("input", () => {
      musicVolume = Number(volumeSlider.value) / 100;
      volumeValue.value = volumeSlider.value + "%";
      if (masterGainNode && audioContext && audioContext.state === "running") {
        masterGainNode.gain.setTargetAtTime(0.68 * musicVolume, audioContext.currentTime, 0.08);
      }
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && musicOn) {
      toggleMusic(false).then(() => {
        $("music-label").textContent = "Música pausada";
      });
    }
  });
  window.addEventListener("pagehide", () => {
    if (melodyTimer !== null) window.clearTimeout(melodyTimer);
    melodyTimer = null;
    musicOn = false;
    if (audioContext && audioContext.state !== "closed") {
      try { audioContext.close(); } catch (_) {}
    }
    audioContext = null;
    masterGainNode = null;
    noiseBuffer = null;
  });


  $("begin-button").addEventListener("click", () => showScreen("music-screen"));
  $("music-yes").addEventListener("click", async () => { await toggleMusic(true); showScreen("question-screen"); questionIndex = 0; renderQuestion(); });
  $("music-no").addEventListener("click", () => { if (musicOn) toggleMusic(false); showScreen("question-screen"); questionIndex = 0; renderQuestion(); });
  $("music-toggle").addEventListener("click", () => toggleMusic());
  $("brand-home").addEventListener("click", (event) => { event.preventDefault(); heartMode = false; questionIndex = 0; showScreen("welcome"); });
  $("clue-continue").addEventListener("click", () => showScreen("reveal-screen"));
  $("letter-button").addEventListener("click", () => showScreen("letter-screen"));
  $("response-yes").addEventListener("click", (event) => {
    event.preventDefault();
    $("closing-note").textContent = "Esta página no envía mensajes automáticamente. Si te nace conversar, podés escribirle a JB por TikTok.";
  });
  $("response-thanks").addEventListener("click", () => {
    $("closing-note").textContent = "Gracias por leer hasta aquí. Espero que te haya regalado una sonrisa. 🌹";
    $("response-thanks").textContent = "Gracias por leer 🌹";
  });
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  animate();
  renderQuestion();
})();