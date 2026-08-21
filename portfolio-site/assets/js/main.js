/* ==========================================================
   廖昌林 · 个人作品集 — 交互脚本
   ========================================================== */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. 预加载 ---------- */
  const preloader = document.getElementById("preloader");

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("is-done");
    document.body.classList.add("is-loaded");
  }

  if (prefersReducedMotion) {
    hidePreloader();
  } else {
    window.addEventListener("load", function () {
      setTimeout(hidePreloader, 700);
    });
    // 兜底：即使加载事件异常也不遮挡页面
    setTimeout(hidePreloader, 3200);
  }

  /* ---------- 2. 导航滚动状态 ---------- */
  const header = document.getElementById("siteHeader");

  function onScrollNav() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }

  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- 3. 移动端菜单 ---------- */
  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.classList.toggle("open", open);
    mobileMenu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("open"));
    });
    mobileMenu.querySelectorAll("a").forEach(function (link, i) {
      link.style.setProperty("--i", i);
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- 4. 锚点平滑滚动（带导航高度补偿） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = anchor.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion ? "auto" : "smooth" });
      try {
        history.replaceState(null, "", id);
      } catch (err) {
        /* file:// 等环境下忽略地址栏更新 */
      }
    });
  });

  /* ---------- 5. 导航高亮当前区块 ---------- */
  const navAnchors = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = ["about", "works", "strengths", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  const navSpy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach(function (section) { navSpy.observe(section); });

  /* ---------- 6. 滚动显现 ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- 7. 数据计数动画 ---------- */
  const counters = document.querySelectorAll("[data-count]");

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || "0", 10);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }

    requestAnimationFrame(tick);
  }

  const statsBox = document.getElementById("stats");
  if (statsBox && !prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counters.forEach(animateCounter);
          counterObserver.disconnect();
        });
      },
      { threshold: 0.4 }
    );
    counterObserver.observe(statsBox);
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- 8. Hero 粒子背景（视频可用时自动让位） ---------- */
  const canvas = document.getElementById("heroCanvas");
  const video = document.getElementById("heroVideo");
  let animId = null;

  function initParticles() {
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let particles = [];
    const mouse = { x: -9999, y: -9999 };

    const COLORS = ["255,59,59", "255,82,82", "163,18,18"];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(110, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, function () {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.5,
          c: COLORS[Math.floor(Math.random() * COLORS.length)]
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // 轻微吸引鼠标
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 160 * 160 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const force = (160 - dist) / 160 * 0.018;
          p.x += (dx / dist) * force * 30;
          p.y += (dy / dist) * force * 30;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.c + ",0.7)";
        ctx.fill();

        // 连线
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const lx = p.x - q.x;
          const ly = p.y - q.y;
          const d2 = lx * lx + ly * ly;
          if (d2 < 130 * 130) {
            const alpha = (1 - Math.sqrt(d2) / 130) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(240,240,236," + alpha + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
  }

  function initVideo() {
    if (!video) return;
    const onReady = function () {
      video.classList.add("is-ready");
      if (canvas && animId) {
        cancelAnimationFrame(animId);
        canvas.style.opacity = 0;
      }
      video.play().catch(function () { /* 自动播放被阻止时静默 */ });
    };

    if (video.readyState >= 2) {
      onReady();
    } else {
      video.addEventListener("loadeddata", onReady, { once: true });
      // 视频文件不存在时保持 Canvas 背景
      video.addEventListener("error", function () { canvas.style.opacity = 1; }, { once: true });
    }
  }

  initParticles();
  initVideo();

  /* ---------- 9. 自定义光标 ---------- */
  const cursor = document.getElementById("cursor");
  if (cursor && isFinePointer && !prefersReducedMotion) {
    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (dot) dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring) ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("a, button, [data-tilt]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
  }

  /* ---------- 10. 项目卡片微倾斜 ---------- */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + px * 4 + "deg) rotateX(" + py * -4 + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- 11. 页脚年份 ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
