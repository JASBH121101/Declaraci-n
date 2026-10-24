(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const screens = Array.from(document.querySelectorAll(".screen"));
  const canvas = $("particles");
  const ctx = canvas.getContext("2d");
  let width = 0, height = 0, dpr = 1, animationFrame = 0;
  let particles = [];
  let heartMode = false;

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

  let selectedStyle = "A";
  let activeStyle = null;
  let musicOn = false;
  let musicNodes = [];
  let musicMaster = null;
  let musicVolume = 0.8;
  let transportEventId = null;
  let songStep = 0;
  let musicRequestId = 0;

  const soundtrack = {
    A: {
      name: "Romance de película", bpm: 72,
      chords: [
        ["C3","G3","B3","E4","G4"], ["B2","G3","A3","D4","G4"],
        ["A2","E3","G3","C4","E4"], ["G2","D3","G3","B3","D4"],
        ["F2","C3","E3","A3","C4"], ["E2","C3","E3","G3","C4"],
        ["D2","A2","C3","F3","A3"], ["G2","D3","F#3","A3","D4"]
      ],
      arpeggios: [
        ["C3","E4","G3","B4","G4","E4","B3","G4"],
        ["B2","D4","G3","A4","G4","D4","A3","G4"],
        ["A2","C4","E3","G4","E4","C4","G3","E4"],
        ["G2","B3","D3","G4","D4","B3","G3","D4"],
        ["F2","A3","C3","E4","C4","A3","E3","C4"],
        ["E2","G3","C3","E4","C4","G3","E3","C4"],
        ["D2","F3","A2","C4","A3","F3","C3","A3"],
        ["G2","B3","D3","F#4","D4","B3","A3","D4"]
      ],
      melody: [
        ["G4",null,"B4","C5",null,"B4","G4",null],
        ["F#4",null,"A4","B4",null,"A4","F#4",null],
        ["E4",null,"G4","A4","B4",null,"A4",null],
        ["D4",null,"G4","A4",null,"G4","D4",null],
        ["C4",null,"E4","G4",null,"E4","C4",null],
        ["B3",null,"E4","G4",null,"E4","B3",null],
        ["A3",null,"D4","F#4",null,"E4","D4",null],
        ["B3",null,"D4","G4",null,"F#4","D4",null]
      ]
    },
    B: {
      name: "Balada ochentera", bpm: 96,
      chords: [["A3","C4","E4","G4"],["F3","A3","C4","E4"],["C3","E3","G3","C4"],["G3","B3","D4","G4"]],
      bass: ["A1","F1","C2","G1"],
      melody: [
        ["E5",null,"G5","A5",null,"G5","E5",null],
        ["C5",null,"E5","G5",null,"E5","C5",null],
        ["G4",null,"C5","E5",null,"D5","C5",null],
        ["D5",null,"G5","A5",null,"G5","D5",null]
      ]
    }
  };

  function selectMusicStyle(style) {
    selectedStyle = style;
    $("music-option-a").classList.toggle("selected", style === "A");
    $("music-option-b").classList.toggle("selected", style === "B");
    $("select-a").setAttribute("aria-pressed", String(style === "A"));
    $("select-b").setAttribute("aria-pressed", String(style === "B"));
    updatePreviewButtons();
  }

  function updatePreviewButtons() {
    ["A", "B"].forEach(style => {
      const button = $("preview-" + style.toLowerCase());
      const playing = musicOn && activeStyle === style;
      button.classList.toggle("is-playing", playing);
      button.textContent = playing ? "■ Detener opción " + style : "▶ Escuchar opción " + style;
    });
  }

  function trackNode(node) { musicNodes.push(node); return node; }

  function makeSynthPad(destination, type, envelope, volume) {
    const synth = trackNode(new Tone.PolySynth(Tone.Synth, { oscillator: { type }, envelope }));
    synth.volume.value = volume;
    synth.connect(destination);
    return synth;
  }

  async function stopMusic(label = "Música apagada", invalidatePending = true) {
    if (invalidatePending) musicRequestId += 1;
    musicOn = false;
    activeStyle = null;
    if (window.Tone) {
      try { Tone.Transport.stop(); Tone.Transport.cancel(0); } catch (_) {}
    }
    if (musicMaster && window.Tone) {
      try { musicMaster.gain.setValueAtTime(0.0001, Tone.now()); } catch (_) {}
    }
    musicNodes.forEach(node => { try { if (node && typeof node.dispose === "function") node.dispose(); } catch (_) {} });
    musicNodes = [];
    musicMaster = null;
    transportEventId = null;
    songStep = 0;
    $("music-toggle").setAttribute("aria-pressed", "false");
    $("music-label").textContent = label;
    updatePreviewButtons();
  }

  async function startMusic(style) {
    if (!window.Tone) { $("music-label").textContent = "No se pudo cargar el audio"; return false; }
    if (musicOn && activeStyle === style) return true;
    const requestId = ++musicRequestId;
    await stopMusic("Preparando música…", false);
    selectMusicStyle(style);
    $("music-label").textContent = "Cargando " + soundtrack[style].name + "…";
    try {
      await Tone.start();
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      Tone.Transport.position = "0:0:0";
      Tone.Transport.bpm.value = soundtrack[style].bpm;

      const master = trackNode(new Tone.Gain(0.0001).toDestination());
      musicMaster = master;
      const reverb = trackNode(new Tone.Reverb({ decay: style === "A" ? 4.5 : 2.8, wet: style === "A" ? 0.32 : 0.22 }));
      await reverb.ready;
      reverb.connect(master);

      if (style === "A") {
        const delay = trackNode(new Tone.FeedbackDelay("8n", 0.12));
        delay.connect(reverb);
        const piano = trackNode(new Tone.Sampler({
          urls: {
            C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3",
            C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3",
            C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", A5: "A5.mp3"
          },
          baseUrl: "https://tonejs.github.io/audio/salamander/",
          attack: 0.02, release: 1.1
        }));
        piano.volume.value = -1;
        piano.connect(delay);
        const strings = makeSynthPad(reverb, "triangle", { attack: 1.15, decay: 0.4, sustain: 0.65, release: 2.2 }, -20);
        const highPad = makeSynthPad(reverb, "sine", { attack: 1.4, decay: 0.4, sustain: 0.5, release: 2.5 }, -27);
        $("music-label").textContent = "Cargando piano…";
        await Tone.loaded();
        if (requestId !== musicRequestId || document.hidden) {
          await stopMusic("Música pausada", false);
          return false;
        }
        const track = soundtrack.A;
        transportEventId = Tone.Transport.scheduleRepeat((time) => {
          const step = songStep % 64, bar = Math.floor(step / 8), slot = step % 8;
          const chord = track.chords[bar];
          if (slot === 0) {
            strings.triggerAttackRelease(chord.slice(1), "1m", time, 0.17);
            highPad.triggerAttackRelease([chord[2], chord[4]], "1m", time, 0.08);
          }
          piano.triggerAttackRelease(track.arpeggios[bar][slot], "8n", time, slot === 0 || slot === 4 ? 0.78 : 0.58);
          const topNote = track.melody[bar][slot];
          if (topNote) piano.triggerAttackRelease(topNote, "4n", time, 0.55);
          songStep = (songStep + 1) % 64;
        }, "8n", 0);
      } else {
        const chorus = trackNode(new Tone.Chorus(2.2, 2.8, 0.34).start());
        chorus.connect(reverb);
        const filter = trackNode(new Tone.Filter({ frequency: 1800, type: "lowpass", rolloff: -24 }));
        filter.connect(chorus);
        const pad = makeSynthPad(filter, "fatsawtooth", { attack: 0.35, decay: 0.35, sustain: 0.55, release: 1.5 }, -22);
        const electricPiano = makeSynthPad(reverb, "square", { attack: 0.012, decay: 0.22, sustain: 0.12, release: 0.28 }, -13);
        const bass = trackNode(new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          filter: { type: "lowpass", frequency: 260, Q: 1.1 },
          envelope: { attack: 0.02, decay: 0.2, sustain: 0.24, release: 0.12 },
          filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.08, release: 0.1, baseFrequency: 75, octaves: 2 }
        }));
        bass.volume.value = -8; bass.connect(master);
        const lead = trackNode(new Tone.Synth({ oscillator: { type: "fatsawtooth" }, envelope: { attack: 0.025, decay: 0.14, sustain: 0.3, release: 0.35 } }));
        lead.volume.value = -9; lead.connect(chorus);
        const kick = trackNode(new Tone.MembraneSynth({ pitchDecay: 0.035, octaves: 5, envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.01 } }));
        kick.volume.value = -6; kick.connect(master);
        const snare = trackNode(new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.11, sustain: 0 } }));
        snare.volume.value = -19; snare.connect(master);
        const hat = trackNode(new Tone.MetalSynth({
          frequency: 360, envelope: { attack: 0.001, decay: 0.065, release: 0.015 },
          harmonicity: 5.1, modulationIndex: 28, resonance: 2600, octaves: 1.4
        }));
        hat.volume.value = -25; hat.connect(master);
        const track = soundtrack.B;
        const roots = track.bass;
        transportEventId = Tone.Transport.scheduleRepeat((time) => {
          const step = songStep % 64, bar = Math.floor(step / 8), slot = step % 8;
          const chord = track.chords[bar % track.chords.length];
          if (slot === 0) pad.triggerAttackRelease(chord, "1m", time, 0.18);
          if ([0,3,4,7].includes(slot)) electricPiano.triggerAttackRelease(chord.slice(1), "8n", time, slot === 0 || slot === 4 ? 0.5 : 0.34);
          if ([0,3,4,7].includes(slot)) bass.triggerAttackRelease(roots[bar % roots.length], "8n", time, slot === 0 || slot === 4 ? 0.72 : 0.52);
          const leadNote = track.melody[bar % track.melody.length][slot];
          if (leadNote) lead.triggerAttackRelease(leadNote, "8n", time, 0.34);
          if ([0,4].includes(slot)) kick.triggerAttackRelease("C1", "8n", time, 0.78);
          if ([2,6].includes(slot)) snare.triggerAttackRelease("16n", time, 0.46);
          hat.triggerAttackRelease("16n", time, slot % 2 ? 0.18 : 0.25);
          songStep = (songStep + 1) % 64;
        }, "8n", 0);
      }

      if (requestId !== musicRequestId || document.hidden) {
        await stopMusic("Música pausada", false);
        return false;
      }
      musicOn = true;
      activeStyle = style;
      musicMaster.gain.setValueAtTime(0.0001, Tone.now());
      musicMaster.gain.linearRampToValueAtTime(0.85 * musicVolume, Tone.now() + 0.6);
      Tone.Transport.start("+0.08");
      $("music-toggle").setAttribute("aria-pressed", "true");
      $("music-label").textContent = "Escuchando opción " + style;
      updatePreviewButtons();
      return true;
    } catch (error) {
      console.error("No se pudo iniciar la música:", error);
      await stopMusic("No se pudo cargar; revisá la conexión", false);
      return false;
    }
  }

  function previewStyle(style) {
    if (musicOn && activeStyle === style) stopMusic();
    else startMusic(style);
  }

  const volumeSlider = $("music-volume");
  const volumeValue = $("volume-value");
  if (volumeSlider && volumeValue) {
    musicVolume = Number(volumeSlider.value) / 100;
    volumeValue.value = volumeSlider.value + "%";
    volumeSlider.addEventListener("input", () => {
      musicVolume = Number(volumeSlider.value) / 100;
      volumeValue.value = volumeSlider.value + "%";
      if (musicMaster && window.Tone) musicMaster.gain.rampTo(0.85 * musicVolume, 0.1);
    });
  }

  $("select-a").addEventListener("click", () => selectMusicStyle("A"));
  $("select-b").addEventListener("click", () => selectMusicStyle("B"));
  $("preview-a").addEventListener("click", () => previewStyle("A"));
  $("preview-b").addEventListener("click", () => previewStyle("B"));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopMusic("Música pausada", true);
  });
  window.addEventListener("pagehide", () => {
    stopMusic("Música pausada", true);
  });

  $("begin-button").addEventListener("click", () => showScreen("music-screen"));
  $("music-yes").addEventListener("click", async () => {
    if (!musicOn || activeStyle !== selectedStyle) await startMusic(selectedStyle);
    showScreen("question-screen");
    questionIndex = 0;
    renderQuestion();
  });
  $("music-no").addEventListener("click", async () => {
    if (musicOn) await stopMusic();
    showScreen("question-screen");
    questionIndex = 0;
    renderQuestion();
  });
  $("music-toggle").addEventListener("click", () => {
    if (musicOn) stopMusic();
    else startMusic(selectedStyle);
  });
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