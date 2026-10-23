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

  async function toggleMusic(force) {
    const next = typeof force === "boolean" ? force : !musicOn;
    if (next === musicOn) return;
    if (next) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) throw new Error("Audio no disponible");
        audioContext = audioContext || new AudioCtx();
        await audioContext.resume();
        const master = audioContext.createGain();
        master.gain.value = .035;
        master.connect(audioContext.destination);
        musicNodes = [master];
        // A soft, original ambient chord made in-browser; no external track is downloaded.
        [196, 246.94, 293.66].forEach((frequency, index) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = index === 1 ? "sine" : "triangle";
          osc.frequency.value = frequency;
          gain.gain.value = index === 0 ? .28 : .14;
          osc.connect(gain);
          gain.connect(master);
          osc.start();
          musicNodes.push(osc, gain);
        });
        musicOn = true;
        $("music-toggle").setAttribute("aria-pressed", "true");
        $("music-label").textContent = "Música activada";
      } catch (error) {
        $("music-label").textContent = "Audio no disponible";
      }
    } else {
      if (audioContext && audioContext.state !== "closed") {
        musicNodes.forEach(node => { try { if (node.stop) node.stop(); } catch (_) {} });
        try { audioContext.close(); } catch (_) {}
      }
      audioContext = null;
      musicNodes = [];
      musicOn = false;
      $("music-toggle").setAttribute("aria-pressed", "false");
      $("music-label").textContent = "Música apagada";
    }
  }

  $("begin-button").addEventListener("click", () => showScreen("music-screen"));
  $("music-yes").addEventListener("click", async () => { await toggleMusic(true); showScreen("question-screen"); questionIndex = 0; renderQuestion(); });
  $("music-no").addEventListener("click", () => { if (musicOn) toggleMusic(false); showScreen("question-screen"); questionIndex = 0; renderQuestion(); });
  $("music-toggle").addEventListener("click", () => toggleMusic());
  $("brand-home").addEventListener("click", (event) => { event.preventDefault(); heartMode = false; questionIndex = 0; showScreen("welcome"); });
  $("clue-continue").addEventListener("click", () => showScreen("reveal-screen"));
  $("letter-button").addEventListener("click", () => showScreen("letter-screen"));
  $("response-thanks").addEventListener("click", () => {
    $("closing-note").textContent = "Gracias por leer hasta aquí. Espero que te haya regalado una sonrisa. 🌹";
    $("response-thanks").textContent = "Gracias por leer 🌹";
  });
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  animate();
  renderQuestion();
})();