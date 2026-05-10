(function () {
  const YAML_FILES = ["static/06.yaml", "static/07.yaml", "static/08.yaml", "static/09.yaml", "static/10.yaml"];

  let allWords = [];
  let verbWords = [];
  let lessonWords = [];
  let currentIndex = 0;
  let currentMode = "ru";
  let answerShown = false;

  const lessonSelect = document.getElementById("lesson");
  const modeSelect = document.getElementById("mode");
  const card = document.getElementById("card");
  const displayEl = document.getElementById("display");
  const answerEl = document.getElementById("answer");
  const answerContent = document.getElementById("answer-content");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const showBtn = document.getElementById("show-answer");
  const counterEl = document.getElementById("counter");

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function render() {
    if (!lessonWords.length) {
      displayEl.textContent = "← выберите урок";
      answerEl.hidden = true;
      showBtn.disabled = true;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      counterEl.textContent = "";
      return;
    }

    const word = lessonWords[currentIndex];
    const text = word[currentMode];
    displayEl.textContent = text;

    displayEl.className = "";
    if (currentMode === "ru") displayEl.classList.add("lang-ru");
    if (currentMode === "pn") displayEl.classList.add("lang-pn");

    if (answerShown) {
      answerContent.innerHTML =
        "<p><strong>Иероглиф:</strong> " +
        word.ch +
        "</p>" +
        "<p><strong>Пиньинь:</strong> " +
        word.pn +
        "</p>" +
        "<p><strong>Русский:</strong> " +
        word.ru +
        "</p>";
      answerEl.hidden = false;
      showBtn.textContent = "Продолжить →";
    } else {
      answerEl.hidden = true;
      showBtn.textContent = "Показать ответ";
    }

    showBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    counterEl.textContent = currentIndex + 1 + " / " + lessonWords.length;
  }

  function showAnswer() {
    if (!lessonWords.length) return;
    if (answerShown) {
      nextWord();
      return;
    }
    answerShown = true;
    render();
  }

  function prevWord() {
    if (!lessonWords.length) return;
    currentIndex = (currentIndex - 1 + lessonWords.length) % lessonWords.length;
    answerShown = false;
    render();
  }

  function nextWord() {
    if (!lessonWords.length) return;
    currentIndex = (currentIndex + 1) % lessonWords.length;
    answerShown = false;
    render();
  }

  function selectLesson(lesson) {
    if (lesson === "verbs") {
      lessonWords = shuffle(verbWords.slice());
    } else {
      const filtered = allWords.filter(function (w) {
        return w.lesson === lesson;
      });
      lessonWords = shuffle(filtered.slice());
    }
    currentIndex = 0;
    answerShown = false;
    render();
  }

  function populateLessons() {
    var seen = {};
    var lessons = [];
    allWords.forEach(function (w) {
      if (!seen[w.lesson]) {
        seen[w.lesson] = true;
        lessons.push(w.lesson);
      }
    });
    lessons.sort(function (a, b) {
      return a - b;
    });

    lessons.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l;
      opt.textContent = "Урок " + l;
      lessonSelect.appendChild(opt);
    });

    var verbOpt = document.createElement("option");
    verbOpt.value = "verbs";
    verbOpt.textContent = "Глаголы";
    lessonSelect.appendChild(verbOpt);

    if (lessons.length > 0) {
      lessonSelect.value = lessons[0];
      selectLesson(lessons[0]);
    }
  }

  async function loadData() {
    for (const file of YAML_FILES) {
      try {
        const resp = await fetch(file);
        if (!resp.ok) continue;
        const text = await resp.text();
        const data = jsyaml.load(text);
        if (Array.isArray(data)) {
          allWords = allWords.concat(data);
        }
      } catch (_) {
        // skip unavailable files
      }
    }
    try {
      const resp = await fetch("static/verb.yaml");
      if (resp.ok) {
        const text = await resp.text();
        const data = jsyaml.load(text);
        if (Array.isArray(data)) {
          verbWords = data;
        }
      }
    } catch (_) {}
    populateLessons();
  }

  lessonSelect.addEventListener("change", function () {
    var val = this.value;
    selectLesson(val === "verbs" ? "verbs" : Number(val));
  });

  modeSelect.addEventListener("change", function () {
    currentMode = this.value;
    answerShown = false;
    render();
  });

  showBtn.addEventListener("click", showAnswer);
  card.addEventListener("click", showAnswer);
  prevBtn.addEventListener("click", prevWord);
  nextBtn.addEventListener("click", nextWord);

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "SELECT") return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevWord();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextWord();
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      showAnswer();
    }
  });

  function initTheme() {
    const btn = document.getElementById("theme-btn");
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      btn.classList.add("active");
      btn.setAttribute("aria-label", "Включить светлую тему");
    }
    btn.addEventListener("click", function () {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const theme = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      this.classList.toggle("active");
      this.setAttribute("aria-label", isDark ? "Включить тёмную тему" : "Включить светлую тему");
    });
  }

  function initAccent() {
    const btn = document.getElementById("accent-btn");
    const labels = {
      blue: "Сменить акцент на зелёный",
      green: "Сменить акцент на красный",
      red: "Сменить акцент на синий",
    };
    const order = ["blue", "green", "red"];
    const saved = localStorage.getItem("accent") || "blue";
    if (saved !== "blue") {
      document.documentElement.setAttribute("data-accent", saved);
      btn.setAttribute("aria-label", labels[saved]);
    }
    btn.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-accent") || "blue";
      const next = order[(order.indexOf(current) + 1) % order.length];
      if (next === "blue") {
        document.documentElement.removeAttribute("data-accent");
        localStorage.setItem("accent", "blue");
      } else {
        document.documentElement.setAttribute("data-accent", next);
        localStorage.setItem("accent", next);
      }
      this.setAttribute("aria-label", labels[next]);
    });
  }

  loadData();
  initTheme();
  initAccent();
})();
