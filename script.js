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
    if (id === "music-screen") {
      movePlayerToMusicScreen();
      initializeAudioSystem();
    }
    if (id === "letter-screen") {
      fadeOutOnLetter();
    }
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

  const SPOTIFY_TRACK_URI = "spotify:track:3sk1Pl8mAIv1GtIpea2Jwn";
  // Path for an authorized full-track file, if one may be published in this public site.
  // The commercial recording is intentionally not included in this repository.
  const LOCAL_AUDIO_URL = "./assets/audio/por-amarte-asi.mp3";
  const ROMANTIC_START_SECONDS = 27; // begin at 0:27 of the supplied audio file
  const FADE_IN_MS = 3500;
  const FADE_OUT_MS = 5000;
  const TARGET_VOLUME = 0.65;

  let spotifyApiRequested = false;
  let spotifyController = null;
  let spotifyReady = false;
  let spotifyPlaying = false;
  let nativeAudio = null;
  let nativeAudioAvailable = false;
  let nativeAudioStarted = false;
  let nativeAudioMode = false;
  let audioFadeFrame = 0;
  let endFadeStarted = false;
  let desiredVolume = TARGET_VOLUME;
  const playerShell = $("spotify-player-shell");
  const playerSlot = $("spotify-player-slot");
  const nativeAudioPanel = $("local-audio-controls");
  const nativeAudioButton = $("local-audio-play");
  const localVolumeSlider = $("local-audio-volume");
  const localVolumeValue = $("local-audio-volume-value");

  function updateMusicUI() {
    const playing = nativeAudioMode
      ? Boolean(nativeAudio && !nativeAudio.paused)
      : spotifyPlaying;
    $("music-toggle").setAttribute("aria-pressed", String(playing));
    $("music-label").textContent = playing ? "Música sonando ♪" : "Música apagada";
    if (nativeAudioButton) {
      nativeAudioButton.textContent = playing ? "■ Pausar canción" : "▶ Escuchar fragmento romántico";
      nativeAudioButton.classList.toggle("is-playing", playing);
    }
  }

  function movePlayerToFloating() {
    // No floating player UI: music should accompany the story without covering it.
    // Native audio is controlled by the header; Spotify remains in the music screen.
    return;
  }

  function movePlayerToMusicScreen() {
    if (!playerShell || !playerSlot) return;
    if (playerShell.parentElement !== playerSlot) playerSlot.appendChild(playerShell);
    playerShell.classList.remove("is-floating");
    document.body.classList.remove("music-floating");
  }

  function fadeNativeAudio(target, durationMs, pauseAtEnd) {
    if (!nativeAudio) return;
    if (audioFadeFrame) cancelAnimationFrame(audioFadeFrame);
    const audio = nativeAudio;
    const from = Math.max(0, Math.min(1, audio.volume));
    const startTime = performance.now();
    const targetVolume = Math.max(0, Math.min(1, target));
    const tick = now => {
      const progress = durationMs <= 0 ? 1 : Math.min(1, (now - startTime) / durationMs);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = Math.max(0, Math.min(1, from + (targetVolume - from) * eased));
      if (progress < 1) {
        audioFadeFrame = requestAnimationFrame(tick);
      } else {
        audioFadeFrame = 0;
        if (pauseAtEnd) {
          audio.pause();
          nativeAudioStarted = false;
          endFadeStarted = false;
          updateMusicUI();
        }
      }
    };
    audioFadeFrame = requestAnimationFrame(tick);
  }

  async function startNativeAudio() {
    if (!nativeAudioAvailable || !nativeAudio) return false;
    nativeAudioMode = true;
    if (!nativeAudioStarted) {
      try {
        if (nativeAudio.readyState < 1) {
          await new Promise((resolve, reject) => {
            const timer = window.setTimeout(() => reject(new Error("audio metadata timeout")), 8000);
            nativeAudio.addEventListener("loadedmetadata", () => { clearTimeout(timer); resolve(); }, { once: true });
            nativeAudio.addEventListener("error", () => { clearTimeout(timer); reject(new Error("audio could not load")); }, { once: true });
            nativeAudio.load();
          });
        }
        nativeAudio.currentTime = Math.min(ROMANTIC_START_SECONDS, Math.max(0, nativeAudio.duration - 1));
        nativeAudio.volume = 0;
        await nativeAudio.play();
        nativeAudioStarted = true;
        endFadeStarted = false;
        fadeNativeAudio(desiredVolume, FADE_IN_MS, false);
        $("music-status").textContent = "La música entra suavemente desde el fragmento romántico.";
        updateMusicUI();
        return true;
      } catch (error) {
        $("music-status").textContent = "No se pudo reproducir el archivo de audio autorizado.";
        console.warn("Could not start local audio:", error);
        return false;
      }
    }
    if (nativeAudio.paused) {
      try {
        await nativeAudio.play();
        fadeNativeAudio(desiredVolume, 900, false);
      } catch (error) {
        $("music-status").textContent = "No se pudo reanudar la canción en este navegador.";
        return false;
      }
    } else {
      if (audioFadeFrame) cancelAnimationFrame(audioFadeFrame);
      nativeAudio.pause();
    }
    updateMusicUI();
    return true;
  }

  function pauseMusic() {
    if (nativeAudioMode && nativeAudio) {
      if (audioFadeFrame) cancelAnimationFrame(audioFadeFrame);
      nativeAudio.pause();
      nativeAudio.volume = 0;
      nativeAudioStarted = false;
      endFadeStarted = false;
    } else {
      try { if (spotifyController) spotifyController.pause(); } catch (_) {}
      spotifyPlaying = false;
    }
    updateMusicUI();
  }

  function fadeOutOnLetter() {
    if (nativeAudioMode && nativeAudio && !nativeAudio.paused) {
      fadeNativeAudio(0, FADE_OUT_MS, true);
      $("music-status").textContent = "La música se desvanece suavemente mientras leés la carta.";
    } else if (spotifyController && spotifyPlaying) {
      // Spotify's embed does not expose a volume method for a gradual fade.
      try { spotifyController.pause(); } catch (_) {}
      spotifyPlaying = false;
      updateMusicUI();
    }
  }

  function initializeSpotifyPlayer() {
    if (spotifyApiRequested || spotifyController || nativeAudioAvailable) return;
    spotifyApiRequested = true;
    window.onSpotifyIframeApiReady = IFrameAPI => {
      const mount = $("spotify-embed");
      if (!mount) return;
      IFrameAPI.createController(mount, {
        uri: SPOTIFY_TRACK_URI,
        width: "100%",
        height: "80"
      }, controller => {
        spotifyController = controller;
        controller.addListener("ready", () => {
          spotifyReady = true;
          $("music-yes").disabled = false;
          $("music-status").textContent = "Spotify está listo. Al continuar, la canción se solicitará desde 0:27; la reproducción completa puede depender de tu cuenta y dispositivo.";
        });
        controller.addListener("playback_started", () => {
          spotifyPlaying = true;
          $("music-status").textContent = "Reproduciendo desde Spotify.";
          updateMusicUI();
        });
        controller.addListener("playback_update", event => {
          spotifyPlaying = Boolean(event && event.data && !event.data.isPaused && !event.data.isBuffering);
          updateMusicUI();
        });
      });
    };
    const apiScript = document.createElement("script");
    apiScript.src = "https://open.spotify.com/embed/iframe-api/v1";
    apiScript.async = true;
    apiScript.onerror = () => {
      $("music-status").textContent = "No se pudo cargar el reproductor. Podés abrir la canción oficial en Spotify.";
      const link = document.createElement("a");
      link.href = "https://open.spotify.com/track/3sk1Pl8mAIv1GtIpea2Jwn";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Abrir Por amarte así en Spotify";
      $("music-status").append(" ", link);
    };
    document.head.appendChild(apiScript);
  }

  async function initializeAudioSystem() {
    if (nativeAudioAvailable || spotifyController || spotifyApiRequested) return;
    $("music-yes").disabled = true;
    $("music-status").textContent = "Preparando la música…";
    try {
      const response = await fetch(LOCAL_AUDIO_URL, { method: "HEAD", cache: "no-store" });
      const type = response.headers.get("content-type") || "";
      if (response.ok && (!type || type.startsWith("audio/") || type === "application/octet-stream")) {
        nativeAudio = new Audio(LOCAL_AUDIO_URL);
        nativeAudio.preload = "auto";
        nativeAudio.volume = 0;
        nativeAudio.addEventListener("loadedmetadata", () => {
          $("music-yes").disabled = false;
          $("music-status").textContent = "Audio listo. Al continuar, comenzará desde 0:27 con entrada gradual.";
        }, { once: true });
        nativeAudio.addEventListener("timeupdate", () => {
          if (!endFadeStarted && Number.isFinite(nativeAudio.duration) &&
              nativeAudio.duration - nativeAudio.currentTime <= FADE_OUT_MS / 1000 &&
              nativeAudio.duration - nativeAudio.currentTime > 0 && !nativeAudio.paused) {
            endFadeStarted = true;
            fadeNativeAudio(0, Math.min(FADE_OUT_MS, (nativeAudio.duration - nativeAudio.currentTime) * 1000), true);
          }
        });
        nativeAudio.addEventListener("ended", () => {
          nativeAudioStarted = false;
          endFadeStarted = false;
          updateMusicUI();
        });
        nativeAudio.addEventListener("error", () => {
          $("music-status").textContent = "No se pudo cargar el archivo de audio.";
        });
        nativeAudioAvailable = true;
        nativeAudioMode = true;
        nativeAudio.load();
        $("music-yes").disabled = nativeAudio.readyState < 1;
        nativeAudioPanel.hidden = false;
        playerSlot.hidden = true;
        $("music-status").textContent = nativeAudio.readyState >= 1
          ? "Audio listo para iniciar desde 0:27."
          : "Preparando el archivo de audio…";
        return;
      }
    } catch (_) {
      // No local audio asset: fall back to Spotify's official player.
    }
    nativeAudioMode = false;
    nativeAudioPanel.hidden = true;
    playerSlot.hidden = false;
    initializeSpotifyPlayer();
  }

  nativeAudioButton.addEventListener("click", () => {
    if (nativeAudio && !nativeAudio.paused) {
      if (audioFadeFrame) cancelAnimationFrame(audioFadeFrame);
      nativeAudio.pause();
      updateMusicUI();
    } else {
      startNativeAudio();
    }
  });

  if (localVolumeSlider && localVolumeValue) {
    desiredVolume = Number(localVolumeSlider.value) / 100;
    localVolumeValue.value = localVolumeSlider.value + "%";
    localVolumeSlider.addEventListener("input", () => {
      desiredVolume = Number(localVolumeSlider.value) / 100;
      localVolumeValue.value = localVolumeSlider.value + "%";
      if (nativeAudio && !audioFadeFrame) nativeAudio.volume = nativeAudio.paused ? 0 : desiredVolume;
    });
  }

  $("music-yes").addEventListener("click", async () => {
    if (nativeAudioAvailable) {
      const started = await startNativeAudio();
      if (!started) return;
    } else {
      // Keep this action inside the user's click: Spotify may block programmatic autoplay otherwise.
      if (!spotifyController || !spotifyReady) {
        $("music-status").textContent = "El reproductor todavía se está preparando. Esperá a que esté listo para continuar con música.";
        $("music-yes").disabled = true;
        return;
      }
      try {
        spotifyController.loadEntity(SPOTIFY_TRACK_URI, false, ROMANTIC_START_SECONDS);
        spotifyController.play();
        $("music-status").textContent = "Solicitando reproducción desde 0:27…";
      } catch (error) {
        $("music-status").textContent = "Spotify no pudo iniciar la canción. Podés volver a intentarlo o continuar sin música.";
        console.warn("Could not start Spotify playback:", error);
        return;
      }
    }
    movePlayerToFloating();
    showScreen("question-screen");
    questionIndex = 0;
    renderQuestion();
  });

  $("music-no").addEventListener("click", () => {
    pauseMusic();
    movePlayerToMusicScreen();
    showScreen("question-screen");
    questionIndex = 0;
    renderQuestion();
  });

  $("music-toggle").addEventListener("click", () => {
    if (nativeAudioAvailable) {
      startNativeAudio();
      return;
    }
    if (!spotifyController || !spotifyReady) {
      $("music-label").textContent = "Preparando Spotify…";
      initializeAudioSystem();
      $("music-status").textContent = "Spotify todavía se está preparando; cuando esté listo, tocá el botón de música de nuevo.";
      return;
    }
    try { spotifyController.togglePlay(); } catch (_) {}
  });

  $("begin-button").addEventListener("click", () => showScreen("music-screen"));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseMusic();
  });
  window.addEventListener("pagehide", pauseMusic);

  $("brand-home").addEventListener("click", (event) => {
    event.preventDefault();
    pauseMusic();
    movePlayerToMusicScreen();
    heartMode = false;
    questionIndex = 0;
    showScreen("welcome");
  });
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