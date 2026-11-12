(function () {
  try {
    const theme = localStorage.getItem("theme");
    const accent = localStorage.getItem("accent");
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    if (accent === "green" || accent === "red") {
      document.documentElement.setAttribute("data-accent", accent);
    }
  } catch (_) {}
})();
