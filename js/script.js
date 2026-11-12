(function () {
  let allWords = [];
  let qaItems = [];
  let lessonWords = [];
  let currentIndex = 0;
  let currentMode = "ru";
  let currentQuizMode = "words";
  let answerShown = false;

  const lessonSelect = document.getElementById("lesson");
  const quizModeBtn = document.getElementById("quiz-mode");
  const modeSelect = document.getElementById("mode");
  const card = document.getElementById("card");
  const displayEl = document.getElementById("display");
  const answerEl = document.getElementById("answer");
  const answerContent = document.getElementById("answer-content");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const showBtn = document.getElementById("show-answer");
  const difficultyEl = document.getElementById("difficulty");
  const easyBtn = document.getElementById("easy-btn");
  const hardBtn = document.getElementById("hard-btn");
  const counterEl = document.getElementById("counter");

  const sessionStorageKey = "trainerSession";

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionStorageKey));
    } catch (_) {
      return null;
    }
  }

  function saveSession() {
    const session = {
      mode: currentMode,
      quizMode: currentQuizMode,
      lesson: Number(lessonSelect.value),
      index: currentIndex,
      answerShown: answerShown,
      order:
        currentQuizMode === "words"
          ? lessonWords.map(function (item) {
              return item.ch;
            })
          : [],
    };
    try {
      localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } catch (_) {}
  }

  function render() {
    if (!lessonWords.length) {
      displayEl.textContent = currentQuizMode === "qa" ? "← нет вопросов" : "← выберите урок";
      answerEl.hidden = true;
      showBtn.disabled = true;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      difficultyEl.hidden = true;
      showBtn.hidden = false;
      counterEl.textContent = "";
      return;
    }

    const item = lessonWords[currentIndex];
    displayEl.className = "";

    if (currentQuizMode === "qa") {
      displayEl.classList.add("qa");
      displayEl.textContent = item.q;
      showBtn.hidden = false;
      difficultyEl.hidden = true;
      if (answerShown) {
        answerContent.innerHTML = "<p>" + item.a + "</p>";
        answerEl.hidden = false;
        showBtn.textContent = "Продолжить →";
      } else {
        answerEl.hidden = true;
        showBtn.textContent = "Показать ответ";
      }
    } else {
      const text = item[currentMode];
      displayEl.textContent = text;
      displayEl.classList.add("accent-text");
      if (currentMode === "ru") displayEl.classList.add("lang-ru");
      if (currentMode === "pn") displayEl.classList.add("lang-pn");

      if (answerShown) {
        const example = item.example
          ? "<p><strong>Пример:</strong> " +
            item.example.replace(/\[\[(.*?)\]\]/g, '<span class="example-zh">$1</span>') +
            "</p>"
          : "";
        answerContent.innerHTML =
          "<p><strong>Иероглиф:</strong> " +
          item.ch +
          "</p>" +
          "<p><strong>Пиньинь:</strong> " +
          item.pn +
          "</p>" +
          "<p><strong>Русский:</strong> " +
          item.ru +
          "</p>" +
          example;
        answerEl.hidden = false;
        showBtn.hidden = true;
        difficultyEl.hidden = false;
      } else {
        answerEl.hidden = true;
        showBtn.hidden = false;
        difficultyEl.hidden = true;
        showBtn.textContent = "Показать ответ";
      }
    }

    showBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    counterEl.textContent = currentIndex + 1 + " / " + lessonWords.length;
    card.setAttribute("aria-label", answerShown ? "Перейти к следующей карточке" : "Показать ответ");
    saveSession();
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

  function markHard() {
    if (!lessonWords.length) return;
    lessonWords.push(lessonWords[currentIndex]);
    nextWord();
  }

  function selectLesson(lesson) {
    const filtered = allWords.filter(function (w) {
      return w.lesson === lesson;
    });
    lessonWords = shuffle(filtered.slice());
    currentIndex = 0;
    answerShown = false;
    render();
  }

  function restoreWordOrder(filtered, order) {
    const pools = new Map();
    filtered.forEach(function (item) {
      if (!pools.has(item.ch)) pools.set(item.ch, []);
      pools.get(item.ch).push(item);
    });

    const restored = [];
    if (Array.isArray(order)) {
      order.forEach(function (ch) {
        const pool = pools.get(ch);
        if (pool && pool.length) restored.push(pool.shift());
      });
    }

    const remaining = [];
    pools.forEach(function (pool) {
      remaining.push(...pool);
    });
    return restored.concat(shuffle(remaining));
  }

  function restoreSession(session) {
    if (!session || typeof session !== "object") return;

    if (session.quizMode === "qa") {
      if (!qaItems.length) return;
      currentQuizMode = "qa";
      quizModeBtn.textContent = "Вопрос-Ответ";
      lessonSelect.parentElement.style.visibility = "hidden";
      modeSelect.parentElement.style.visibility = "hidden";
      lessonWords = qaItems.slice();
    } else {
      if (session.quizMode !== "words") return;
      const lesson = Number(session.lesson);
      const filtered = allWords.filter(function (item) {
        return item.lesson === lesson;
      });
      if (!filtered.length) return;
      lessonSelect.value = lesson;
      lessonWords = restoreWordOrder(filtered, session.order);
    }

    if (["ch", "pn", "ru"].includes(session.mode)) {
      currentMode = session.mode;
      modeSelect.value = currentMode;
    }
    currentIndex =
      Number.isInteger(session.index) && session.index >= 0 && session.index < lessonWords.length
        ? session.index
        : 0;
    answerShown = session.answerShown === true;
    render();
  }

  function populateLessons() {
    var seen = {};
    var lessons = [];
    var lessonNames = {};
    allWords.forEach(function (w) {
      if (!seen[w.lesson]) {
        seen[w.lesson] = true;
        lessons.push(w.lesson);
        lessonNames[w.lesson] = w.lesson_name;
      }
    });
    lessons.sort(function (a, b) {
      return a - b;
    });

    lessons.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l;
      opt.textContent = lessonNames[l];
      lessonSelect.appendChild(opt);
    });

    if (lessons.length > 0) {
      lessonSelect.value = lessons[0];
      selectLesson(lessons[0]);
    }
  }

  async function loadData() {
    const session = loadSession();
    try {
      const resp = await fetch("static/dictionary.json");
      if (resp.ok) {
        allWords = await resp.json();
      }
    } catch (_) {}
    try {
      const resp = await fetch("static/questions.json");
      if (resp.ok) {
        qaItems = await resp.json();
      }
    } catch (_) {}
    populateLessons();
    restoreSession(session);
  }

  lessonSelect.addEventListener("change", function () {
    selectLesson(Number(this.value));
  });

  quizModeBtn.addEventListener("click", function () {
    if (currentQuizMode === "words") {
      currentQuizMode = "qa";
      this.textContent = "Вопрос-Ответ";
      lessonSelect.parentElement.style.visibility = "hidden";
      modeSelect.parentElement.style.visibility = "hidden";
      lessonWords = qaItems.slice();
      currentIndex = 0;
      answerShown = false;
      render();
    } else {
      currentQuizMode = "words";
      this.textContent = "Слова";
      lessonSelect.parentElement.style.visibility = "visible";
      modeSelect.parentElement.style.visibility = "visible";
      lessonSelect.value = lessonSelect.options[0].value;
      selectLesson(Number(lessonSelect.options[0].value));
    }
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
  easyBtn.addEventListener("click", nextWord);
  hardBtn.addEventListener("click", markHard);

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "SELECT" || e.target.tagName === "BUTTON") return;
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

  loadData();
})();
