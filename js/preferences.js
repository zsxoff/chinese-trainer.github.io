(function () {
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

  initTheme();
  initAccent();
})();
