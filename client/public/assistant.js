(function () {
  const script = document.currentScript;
  const userId = script?.dataset?.userId;

  // Default theme: "light" | "dark" | "glass" | "neon"
  const defaultTheme = "light";

  // Inject CSS Stylesheet
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://webmate-ai-hepn.onrender.com/assistant.css";
  document.head.appendChild(link);

  let assistantConfig = null;

  const getValidTheme = (theme) => {
    const validThemes = ["light", "dark", "glass", "neon"];
    return validThemes.includes(theme) ? theme : defaultTheme;
  };

  const popup = document.createElement("div");
  popup.className = `echo-popup theme-${defaultTheme}`;

  popup.innerHTML = `
    <div class="echo-content">

      <!-- Top Navigation Header -->
      <div class="echo-header">
        <div class="echo-header-left">
          <div class="echo-header-icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </div>

          <div class="echo-header-info">
            <span class="echo-header-title">Echo AI</span>
            <div class="echo-header-status">
              <span class="echo-status-dot"></span>
              <span class="echo-status-text">Live Audio</span>
            </div>
          </div>
        </div>

        <div class="echo-header-badge">
          Interactive
        </div>
      </div>

      <!-- Main Assistant Layout Body -->
      <div class="echo-body">

        <!-- Central Glowing Animated Orb -->
        <div class="echo-orb-wrap">
          <div class="echo-orb-glow"></div>
          <div class="echo-orb">
            <svg
              class="echo-orb-sparkle"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0 -13l2.1 2.1m8.8 8.8l2.1 2.1"></path>
            </svg>
          </div>
        </div>

        <!-- Title & Subtitle Headings -->
        <h2 class="echo-title">
          Hello! I'm Echo AI
        </h2>

        <p class="echo-sub">
          Your smart voice assistant.<br />
          Ask anything about your website.
        </p>

        <!-- Audio Wave Visualizer Bars -->
        <div class="echo-wave">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <!-- Conversational Transcript Areas -->
        <div class="echo-transcript-container">
          <div class="echo-user-text"></div>
          <div class="echo-ai-text"></div>
        </div>

        <!-- Status Bar Banner -->
        <div class="echo-status">
          Tap button to Speak or type below
        </div>

        <!-- Integrated Chat Input Bar -->
        <div class="echo-chat-input-bar">
          <input 
            type="text" 
            class="echo-chat-input" 
            placeholder="Type your message..." 
          />
          <button 
            class="echo-chat-send" 
            aria-label="Send message"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        <!-- Microphone Action Button -->
        <div class="echo-button">
          <button
            class="echo-mic"
            aria-label="Toggle Microphone"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // --------------------------------------------------
  // Floating Launcher Toggle Button
  // --------------------------------------------------
  const button = document.createElement("button");
  button.className = `echo-btn theme-${defaultTheme}`;
  button.setAttribute("aria-label", "Toggle AI Assistant");

  button.innerHTML = `
    <img
      src="https://webmate-ai-hepn.onrender.com/logo.svg"
      alt="Echo AI"
    />
  `;

  document.body.appendChild(button);

  let open = false;

  button.addEventListener("click", () => {
    open = !open;
    popup.classList.toggle("echo-open", open);
    button.classList.toggle("echo-active", open);
  });

  const applyConfig = () => {
    if (!assistantConfig) return;

    const theme = getValidTheme(assistantConfig.theme);

    popup.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-glass",
      "theme-neon"
    );

    button.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-glass",
      "theme-neon"
    );

    popup.classList.add(`theme-${theme}`);
    button.classList.add(`theme-${theme}`);

    const assistantName = assistantConfig.assistantName?.trim() || "Echo AI";
    const title = popup.querySelector(".echo-title");
    if (title) title.textContent = `Hello! I'm ${assistantName}`;

    const headerTitle = popup.querySelector(".echo-header-title");
    if (headerTitle) headerTitle.textContent = assistantName;

    const businessName = assistantConfig.businessName?.trim() || "my website";
    const subTitle = popup.querySelector(".echo-sub");
    if (subTitle) {
      subTitle.innerHTML = `
        Welcome to <span class="echo-accent">${businessName}</span>.
      `;
    }
  };

  const loadAssistant = async () => {
    try {
      if (!userId) {
        console.warn(
          "Echo AI: userId is missing from the script data-user-id attribute."
        );
        return;
      }

      const res = await fetch(
        `https://webmate-ai-server.onrender.com/api/assistant/config/${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        throw new Error(`Failed to load assistant config: ${res.status}`);
      }

      const data = await res.json();
      if (!data?.user) return;

      assistantConfig = data.user;
      applyConfig();
    } catch (error) {
      console.error("Echo AI: Assistant load error:", error);
    }
  };

  loadAssistant();

  const status = popup.querySelector(".echo-status");
  const wave = popup.querySelector(".echo-wave");
  const userText = popup.querySelector(".echo-user-text");
  const aiText = popup.querySelector(".echo-ai-text");
  const mic = popup.querySelector(".echo-mic");
  const chatInput = popup.querySelector(".echo-chat-input");
  const chatSendBtn = popup.querySelector(".echo-chat-send");

  // speak
  const speak = (text) => {
    window.speechSynthesis.cancel();

    aiText.innerHTML = text;
    status.innerHTML = "AI Speaking...";
    wave.style.opacity = "1";

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = () => {
      status.innerHTML = "Tap button to Speak or type below";
      wave.style.opacity = "0";
    };

    speech.onerror = () => {
      status.innerHTML = "Tap button to Speak or type below";
      wave.style.opacity = "0";
    };

    window.speechSynthesis.speak(speech);
  };

  // Reusable backend query sender
  const sendQueryToBackend = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    userText.innerHTML = "You: " + queryText;
    status.innerHTML = "Thinking...";
    wave.style.opacity = "0";

    try {
      const res = await fetch("http://localhost:3000/api/assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: queryText,
          userId: userId,
          currentPath: window.location.pathname,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.action === "navigate") {
          speak(data.response || data.aiResponse || "Navigating...");
          setTimeout(() => {
            window.location.href = data.path;
          }, 1500);
        } else {
          speak(data.aiResponse || data.response || "Here is your answer.");
        }
      } else {
        speak("Check Your Plan");
      }
    } catch (error) {
      console.error("Echo AI ask endpoint error:", error);
      speak("Failed to reach assistant server.");
    }
  };

  // Text Chat Event Handlers
  chatSendBtn.addEventListener("click", () => {
    const val = chatInput.value;
    chatInput.value = "";
    sendQueryToBackend(val);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = chatInput.value;
      chatInput.value = "";
      sendQueryToBackend(val);
    }
  });

  // Speech Recognition Logic
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    mic.onclick = () => {
      window.speechSynthesis.cancel();
      wave.style.opacity = "1";
      status.innerHTML = "Listening...";
      userText.innerHTML = "";
      aiText.innerHTML = "";

      try {
        recognition.start();
      } catch (err) {
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.warn("Speech recognition restart prevented:", e);
          }
        }, 100);
      }
    };

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      recognition.stop();
      sendQueryToBackend(text);
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      status.innerHTML = "Tap to Speak";
      wave.style.opacity = "0";
    };

    recognition.onend = () => {
      if (status.innerHTML === "Listening...") {
        wave.style.opacity = "0";
        status.innerHTML = "Tap button to Speak or type below";
      }
    };
  } else {
    status.innerHTML = "Speech recognition not supported";
    mic.disabled = true;
  }
})();
