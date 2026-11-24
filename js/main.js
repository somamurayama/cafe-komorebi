/* =========================================================
   森のカフェ こもれび — main.js（フレームワークなし）
   ========================================================= */
(() => {
  "use strict";

  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("globalNav");
  const hero = document.querySelector(".hero");
  const fixedCta = document.getElementById("fixedCta");

  /* ---------- ヘッダー：スクロールで背景をつける ---------- */
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- スマホメニュー ---------- */
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- スクロールでふわっと表示 ---------- */
  const fadeTargets = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window) {
    // 同じ親の中で並んでいる要素は、少しずつ遅らせて表示
    fadeTargets.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("fade-in"));
      const i = siblings.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 3) * 0.12}s`;
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    fadeTargets.forEach((el) => io.observe(el));
  } else {
    fadeTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- スマホ下部の固定予約ボタン ----------
     ファーストビューを過ぎたら表示し、予約セクション・フッターが見えている間は隠す */
  if ("IntersectionObserver" in window && fixedCta) {
    const state = { heroVisible: true, ctaAreaVisible: false };
    const ctaAreas = new Set();
    const update = () => {
      const show = !state.heroVisible && ctaAreas.size === 0;
      fixedCta.classList.toggle("is-show", show);
      fixedCta.setAttribute("aria-hidden", String(!show));
      fixedCta.querySelectorAll("a").forEach((a) => (a.tabIndex = show ? 0 : -1));
    };
    new IntersectionObserver(([entry]) => {
      state.heroVisible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 }).observe(hero);

    const areaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? ctaAreas.add(entry.target) : ctaAreas.delete(entry.target)));
      update();
    });
    document.querySelectorAll("#reserve, .footer").forEach((el) => areaObserver.observe(el));
  }

  /* ---------- 予約フォーム（デモ：送信はしない） ---------- */
  const form = document.getElementById("reserveForm");
  const done = document.getElementById("formDone");
  const doneText = document.getElementById("formDoneText");
  const resetBtn = document.getElementById("formReset");
  const dateInput = document.getElementById("date");

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // 選べる日付：今日〜3か月先
  const today = new Date();
  const maxDay = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
  dateInput.min = toISO(today);
  dateInput.max = toISO(maxDay);

  const parseDate = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // 冬季（12/1〜3/15）は土日のみ（祝日はお電話で）
  const isWinter = (d) => {
    const m = d.getMonth() + 1;
    return m === 12 || m === 1 || m === 2 || (m === 3 && d.getDate() <= 15);
  };

  const rules = {
    date: (v) => {
      if (!v) return "ご来店日を選択してください。";
      const d = parseDate(v);
      if (v < dateInput.min) return "本日以降の日付を選択してください。";
      if (v > dateInput.max) return "ご予約は3か月先まで承っています。";
      const day = d.getDay();
      if (day === 2 || day === 3) return "火曜・水曜は定休日です。別の日をお選びください。";
      if (isWinter(d) && day !== 0 && day !== 6) {
        return "冬季（12月〜3月中旬）は土日祝のみの営業です。祝日のご予約はお電話でお願いします。";
      }
      return "";
    },
    time: (v) => (v ? "" : "ご来店時間を選択してください。"),
    people: (v) => {
      if (!v) return "人数を選択してください。";
      if (v === "7+") return "7名以上のご予約はお電話（025-000-0000）で承ります。";
      return "";
    },
    name: (v) => (v.trim() ? "" : "お名前を入力してください。"),
    tel: (v) => {
      if (!v.trim()) return "電話番号を入力してください。";
      const digits = v.replace(/[-‐－ー\s()（）]/g, "");
      return /^0\d{9,10}$/.test(digits) ? "" : "電話番号の形式をご確認ください（例：090-0000-0000）。";
    },
    email: (v) => {
      if (!v.trim()) return "メールアドレスを入力してください。";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "メールアドレスの形式をご確認ください。";
    },
  };

  const validateField = (name) => {
    const field = form.elements[name];
    const message = rules[name](field.value);
    const errorEl = document.getElementById(`${name}Error`);
    errorEl.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (message) field.setAttribute("aria-describedby", errorEl.id);
    else field.removeAttribute("aria-describedby");
    return !message;
  };

  let submitted = false;
  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    const handler = () => submitted && validateField(name);
    field.addEventListener("input", handler);
    field.addEventListener("change", () => (name === "date" ? validateField(name) : handler()));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitted = true;
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const d = parseDate(form.elements.date.value);
    const week = "日月火水木金土"[d.getDay()];
    const data = new FormData(form);
    doneText.textContent =
      `${data.get("name").trim()} 様　${d.getMonth() + 1}月${d.getDate()}日（${week}）${data.get("time")}〜、` +
      `${data.get("people")}名様（${data.get("seat")}）でお席をお取りしました。森でお待ちしています。`;

    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    submitted = false;
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    form.querySelectorAll(".form__error").forEach((el) => (el.textContent = ""));
    done.hidden = true;
    form.hidden = false;
    form.elements.date.focus();
  });
})();
