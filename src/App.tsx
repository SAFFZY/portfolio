import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import NeuralField from "./components/NeuralField";
import ProjectArt from "./components/ProjectArt";
import { Cursor, Loader, Scramble, TokenStream, useIstTime } from "./components/fx";
import { capabilities, certifications, education, experience, profile, projects, skills, stats, type Project } from "./data/profile";
import portrait from "./assets/saffran.webp";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navigation: [string, string][] = [
  ["About", "#about"],
  ["Expertise", "#expertise"],
  ["Work", "#work"],
  ["Experience", "#experience"],
  ["Contact", "#contact"],
];

const epochs = [
  ["Epoch 01", "Understand the data.", "Sit with the people and the workflow first. Find where the real friction is before touching a model."],
  ["Epoch 02", "Prototype fast.", "Smallest working pipeline, real inputs, honest outputs. A rough agent today beats a perfect plan next month."],
  ["Epoch 03", "Evaluate. Ship. Repeat.", "Measure against a baseline, harden the edges, deploy — then keep the loss going down."],
];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M8 6h10v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 0c3 27 23 47 50 50-27 3-47 23-50 50-3-27-23-47-50-50C27 47 47 27 50 0Z" />
    </svg>
  );
}

/** One masked heading line, animated in by GSAP. */
function L({ children }: { children: React.ReactNode }) {
  return (
    <span className="line-mask">
      <span className="line">{children}</span>
    </span>
  );
}

function SectionLabel({ index, title, tag }: { index: string; title: string; tag: string }) {
  return (
    <div className="section-label" data-reveal>
      <Scramble text={`${index} / ${title}`} />
      <span>( {tag} )</span>
    </div>
  );
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [active, setActive] = useState<Project | null>(null);
  const [copy, setCopy] = useState("Copy email");
  const time = useIstTime(profile.timezone);
  const onLoaded = useCallback(() => setReady(true), []);

  useEffect(() => {
    document.documentElement.dataset.motion = motionPaused ? "paused" : "on";
  }, [motionPaused]);

  useEffect(() => {
    document.body.style.overflow = ready ? "" : "hidden";
  }, [ready]);

  const openProject = (p: Project) => {
    setActive(p);
    dialogRef.current?.showModal();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopy("Copied ✓");
    } catch {
      setCopy("Select it below");
    }
    setTimeout(() => setCopy("Copy email"), 2500);
  };

  useGSAP(
    () => {
      if (!ready) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Reading progress
      gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

      if (reduced) {
        gsap.set(".line, [data-reveal]", { clearProps: "all", opacity: 1, y: 0 });
        return;
      }

      // Hero entrance
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from(".hero .line", { yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.09 })
        .from(".hero [data-hero]", { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, "-=0.9")
        .from(".site-header > *", { y: -30, opacity: 0, duration: 0.9, stagger: 0.06 }, "<")
        .from(".neural-canvas", { opacity: 0, scale: 1.08, duration: 2 }, "<");

      // Hero drifts away as you scroll
      gsap.to(".hero-copy", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".neural-canvas", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

      // Headings outside the hero
      gsap.utils.toArray<HTMLElement>("main section:not(.hero) h2, .contact-title").forEach((h) => {
        gsap.from(h.querySelectorAll(".line"), {
          yPercent: 115,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: h, start: "top 85%" },
        });
      });

      // Generic fade-ups
      ScrollTrigger.batch("[data-reveal]:not(.hero [data-reveal])", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.08 }),
      });
      gsap.set("[data-reveal]:not(.hero [data-reveal])", { opacity: 0 });

      // Ticker skews with scroll velocity
      const skew = gsap.quickTo(".ticker-track", "skewX", { duration: 0.4, ease: "power3" });
      ScrollTrigger.create({
        onUpdate: (self) => skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)),
      });

      // Portrait: wipe in, then parallax
      gsap.fromTo(".portrait-frame", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: ".portrait", start: "top 80%" } });
      gsap.fromTo(".portrait-frame img", { scale: 1.3, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: "none", scrollTrigger: { trigger: ".portrait", start: "top bottom", end: "bottom top", scrub: true } });

      // Counters
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, { v: target, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = String(Math.round(obj.v))) });
      });

      // Horizontal work rail on wide screens
      const mm = gsap.matchMedia();
      mm.add("(min-width: 960px)", () => {
        const rail = document.querySelector<HTMLElement>(".work-rail")!;
        const distance = () => rail.scrollWidth - window.innerWidth + 48;
        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: ".work-pin", start: "top top", end: () => `+=${distance()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        gsap.to(".work-counter-fill", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".work-pin", start: "top top", end: () => `+=${distance()}`, scrub: true } });
        gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
          gsap.from(card.querySelector(".project-visual"), { scale: 0.85, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "left 40%", scrub: true } });
        });
      });

      // Experience timeline line draws as you scroll
      gsap.fromTo(".timeline-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true } });
      gsap.utils.toArray<HTMLElement>(".job").forEach((job) => {
        ScrollTrigger.create({ trigger: job, start: "top 65%", end: "bottom 35%", toggleClass: "is-active" });
      });

      // Loss curve
      const path = document.querySelector<SVGPathElement>(".loss-path");
      if (path) {
        const len = path.getTotalLength();
        // Pin each epoch marker onto the curve (the SVG is stretched, so place them as HTML).
        document.querySelectorAll<HTMLElement>(".loss-dot").forEach((dot) => {
          const target = Number(dot.dataset.x);
          let lo = 0;
          let hi = len;
          for (let k = 0; k < 24; k++) {
            const mid = (lo + hi) / 2;
            if (path.getPointAtLength(mid).x < target) lo = mid;
            else hi = mid;
          }
          const pt = path.getPointAtLength(lo);
          dot.style.left = `${pt.x / 10}%`;
          dot.style.top = `${(pt.y / 300) * 100}%`;
        });
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".training", start: "top 65%", end: "bottom 75%", scrub: 0.6 } });
        tl.to(path, { strokeDashoffset: 0, ease: "none" }).from(".loss-dot", { scale: 0, stagger: 0.3, ease: "back.out(3)" }, 0.15);
      }

      // Contact: giant text slides in from opposite sides
      gsap.from(".contact-row.a", { xPercent: -12, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "center center", scrub: true } });
      gsap.from(".contact-row.b", { xPercent: 12, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "center center", scrub: true } });

      // Magnetic buttons
      gsap.utils.toArray<HTMLElement>(".magnetic").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1,0.4)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1,0.4)" });
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.3);
          yTo((e.clientY - r.top - r.height / 2) * 0.4);
        });
        el.addEventListener("pointerleave", () => {
          xTo(0);
          yTo(0);
        });
      });

      // Capability cards tilt toward the pointer
      gsap.utils.toArray<HTMLElement>(".capability").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
          gsap.to(card, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 8, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 8, duration: 0.5 });
        });
        card.addEventListener("pointerleave", () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" }));
      });

      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [ready] },
  );

  const closeMenu = () => menuRef.current?.close();

  return (
    <div ref={root}>
      <Loader onDone={onLoaded} />
      <Cursor />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="progress" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#home" aria-label={`${profile.name} — home`}>
          <span className="monogram">
            S<Spark />M
          </span>
          <span className="wordmark-text">
            SAFFRAN MAKKAR
            <small>{profile.role.toUpperCase()}</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main">
          {navigation.slice(0, 4).map(([label, href]) => (
            <a key={href} href={href}>
              <span data-text={label}>{label}</span>
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="pill small magnetic" href="#contact">
            Let's talk <Arrow />
          </a>
          <button className="menu-button" onClick={() => menuRef.current?.showModal()} aria-haspopup="dialog" aria-label="Open menu">
            <i />
            <i />
          </button>
        </div>
      </header>

      <dialog className="menu" ref={menuRef} onClick={(e) => e.target === e.currentTarget && closeMenu()}>
        <div className="menu-inner">
          <div className="menu-top">
            <span className="mono">INDEX</span>
            <button className="circle" onClick={closeMenu} aria-label="Close menu">
              ×
            </button>
          </div>
          <nav aria-label="Menu">
            {navigation.map(([label, href], i) => (
              <a key={href} href={href} onClick={closeMenu} style={{ "--i": i } as React.CSSProperties}>
                <small>0{i + 1}</small>
                {label}
                <Arrow />
              </a>
            ))}
          </nav>
          <div className="menu-bottom mono">
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a href={profile.resume} target="_blank" rel="noreferrer">
              Resume ↗
            </a>
          </div>
        </div>
      </dialog>

      <main id="main">
        {/* HERO */}
        <section className="hero" id="home" aria-labelledby="hero-title">
          <NeuralField moving={!motionPaused} />
          <div className="hero-top mono" data-hero>
            <span>
              <i className="pulse" /> OPEN TO AI / ML ROLES
            </span>
            <span>{profile.location.toUpperCase()}</span>
            <span className="hide-sm">PORTFOLIO — {new Date().getFullYear()}</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow mono" data-hero>
              {profile.role.toUpperCase()} · {profile.tagline.toUpperCase()}
            </p>
            <h1 id="hero-title" aria-label="Teaching machines to think.">
              <L>TEACHING</L>
              <L>MACHINES</L>
              <L>
                TO <em>think.</em>
              </L>
            </h1>
            <div data-hero>
              <TokenStream
                start={ready}
                text="Hi, I'm Saffran — I build LLM agents, RAG pipelines and automations that plug into real businesses and quietly do the work."
              />
            </div>
            <div className="hero-ctas" data-hero>
              <a className="pill accent magnetic" href="#work">
                See the work <Arrow />
              </a>
              <a className="pill ghost magnetic" href={profile.resume} target="_blank" rel="noreferrer">
                Resume ↓
              </a>
            </div>
          </div>
          <div className="hero-bottom mono" data-hero>
            <a href="#about" className="scroll-cue">
              <span className="mouse">
                <i />
              </span>
              SCROLL — CLICK THE NETWORK TO FIRE IT
            </a>
            <span className="hero-time">
              IST <b>{time}</b>
            </span>
            <button className="motion-toggle" onClick={() => setMotionPaused((v) => !v)} aria-pressed={motionPaused}>
              {motionPaused ? "▶ Resume motion" : "❚❚ Pause motion"}
            </button>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((k) => (
              <div className="ticker-group" key={k}>
                {["LLM AGENTS", "RAG PIPELINES", "WORKFLOW AUTOMATION", "FASTAPI", "PROMPT ENGINEERING", "N8N", "GENERATIVE AI", "DATA PIPELINES"].map((t) => (
                  <span key={t}>
                    {t} <Spark />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <section className="about section" id="about" aria-labelledby="about-title">
          <SectionLabel index="01" title="THE HUMAN IN THE LOOP" tag="ABOUT" />
          <div className="about-grid">
            <div className="about-copy">
              <h2 id="about-title">
                <L>Curious about</L>
                <L>
                  how things <em>think.</em>
                </L>
              </h2>
              <p className="lead" data-reveal>
                I'm Saffran Makkar, an AI/ML engineer from Delhi NCR. I like taking the messy, repetitive parts of a business and handing them to systems that never get tired.
              </p>
              <p data-reveal>
                Over the last year I've shipped agentic workflows, RAG pipelines and LLM-powered automations for enterprise teams — from picking the model, to wiring it into live APIs, to keeping it running in production. Currently at <b>Alletec</b>, building AI for travel and sales operations.
              </p>
              <p data-reveal>
                I studied <b>{education.degree}</b> at {education.school}. Off the keyboard, I'm usually somewhere old and beautiful — like this hall of mirrors.
              </p>
              <div className="stats" data-reveal>
                {stats.map((s) => (
                  <div key={s.label}>
                    <strong>
                      <span data-count={s.value}>0</span>
                      {s.suffix}
                    </strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <figure className="portrait" data-cursor="hello!">
              <div className="portrait-frame">
                <img src={portrait} alt="Saffran Makkar standing in the mirrored Sheesh Mahal at Amer Fort, Jaipur" width="900" height="1200" loading="lazy" />
              </div>
              <Spark className="portrait-spark" />
              <figcaption className="mono">
                <span>SHEESH MAHAL, JAIPUR</span>
                <span>A THOUSAND MIRRORS, ONE FLAME.</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* EXPERTISE */}
        <section className="expertise section" id="expertise" aria-labelledby="expertise-title">
          <SectionLabel index="02" title="WHAT I BRING" tag="EXPERTISE" />
          <div className="section-head">
            <h2 id="expertise-title">
              <L>From prompt</L>
              <L>
                to <em>production.</em>
              </L>
            </h2>
            <p data-reveal>Models are the easy part. The value is in connecting them to data, people and systems — and making it hold up on a Monday morning.</p>
          </div>
          <div className="capability-grid">
            {capabilities.map((c, i) => (
              <article className="capability" key={c.title} data-reveal>
                <div className="cap-top mono">
                  <span>0{i + 1}</span>
                  <span className="cap-icon">{["⌁", "⟲", "▣", "◫"][i]}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <div className="tags">
                  {c.tools.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* WORK */}
        <section className="work" id="work" aria-labelledby="work-title">
          <div className="work-pin">
            <div className="work-head section-pad">
              <SectionLabel index="03" title="SELECTED WORK" tag="PROJECTS" />
              <div className="work-title-row">
                <h2 id="work-title">
                  <L>Things I've</L>
                  <L>
                    <em>shipped.</em>
                  </L>
                </h2>
                <div className="work-counter mono" aria-hidden="true">
                  <span>{String(projects.length).padStart(2, "0")} PROJECTS</span>
                  <div className="work-counter-track">
                    <i className="work-counter-fill" />
                  </div>
                  <span className="hide-sm">SCROLL →</span>
                </div>
              </div>
            </div>
            <div className="work-rail">
              {projects.map((p, i) => (
                <article className="project-card" key={p.id}>
                  <button className="project-hit" onClick={() => openProject(p)} data-cursor="open" aria-label={`Open case study: ${p.title}`}>
                    <div className="project-visual">
                      <ProjectArt art={p.art} seed={i + 1} />
                      <span className="project-index">{p.index}</span>
                    </div>
                    <div className="project-meta mono">
                      <span>{p.kind}</span>
                      <span>{p.year}</span>
                    </div>
                    <h3>
                      {p.title} <Arrow />
                    </h3>
                    <p>{p.summary}</p>
                    <div className="tags">
                      {p.stack.slice(0, 4).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </button>
                </article>
              ))}
              <a className="project-card more-card" href={profile.github} target="_blank" rel="noreferrer" data-cursor="github">
                <span className="mono">MORE ON</span>
                <strong>GitHub</strong>
                <Arrow />
              </a>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="experience section" id="experience" aria-labelledby="experience-title">
          <SectionLabel index="04" title="WHERE I'VE BEEN TRAINING" tag="EXPERIENCE" />
          <div className="section-head">
            <h2 id="experience-title">
              <L>Real clients.</L>
              <L>
                <em>Real systems.</em>
              </L>
            </h2>
            <a className="pill ghost magnetic" href={profile.resume} target="_blank" rel="noreferrer" data-reveal>
              Full resume <Arrow />
            </a>
          </div>
          <div className="timeline">
            <div className="timeline-line" aria-hidden="true">
              <i className="timeline-fill" />
            </div>
            {experience.map((job) => (
              <article className="job" key={job.company} data-reveal>
                <span className="job-dot" aria-hidden="true" />
                <div className="job-when mono">{job.period}</div>
                <div className="job-body">
                  <h3>
                    {job.role} <span>@ {job.company}</span>
                  </h3>
                  <ul>
                    {job.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
            <article className="job edu" data-reveal>
              <span className="job-dot" aria-hidden="true" />
              <div className="job-when mono">{education.period}</div>
              <div className="job-body">
                <h3>
                  {education.degree} <span>@ {education.school}</span>
                </h3>
                <div className="tags">
                  {education.coursework.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* PROCESS — LOSS CURVE */}
        <section className="training section" aria-labelledby="training-title">
          <SectionLabel index="05" title="HOW I WORK" tag="TRAINING LOOP" />
          <div className="section-head">
            <h2 id="training-title">
              <L>Less guessing.</L>
              <L>
                Lower <em>loss.</em>
              </L>
            </h2>
            <p data-reveal>Every project runs like a training loop: look at the data, try something, measure it, adjust. Scroll to watch it converge.</p>
          </div>
          <div className="loss-chart" data-reveal>
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              {[60, 120, 180, 240].map((y) => (
                <line key={y} x1="0" x2="1000" y1={y} y2={y} className="grid-line" />
              ))}
              <path className="loss-path" d="M0 30 C 80 40, 120 140, 200 150 S 300 120, 360 175 S 470 200, 520 210 S 640 230, 700 238 S 860 252, 1000 256" />
            </svg>
            {[20, 52, 86].map((x, i) => (
              <span key={x} className="loss-dot" data-x={x * 10} aria-hidden="true">
                <b className="mono">E0{i + 1}</b>
              </span>
            ))}
            <span className="axis-y mono">LOSS</span>
            <span className="axis-x mono">ITERATIONS →</span>
          </div>
          <div className="epochs">
            {epochs.map(([n, t, d]) => (
              <article key={n} data-reveal>
                <span className="mono">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* STACK */}
        <section className="stack section" aria-labelledby="stack-title">
          <SectionLabel index="06" title="THE TOOLKIT" tag="SKILLS" />
          <div className="stack-grid">
            <h2 id="stack-title">
              <L>The</L>
              <L>
                <em>toolkit.</em>
              </L>
            </h2>
            <div className="stack-groups">
              {Object.entries(skills).map(([group, items]) => (
                <div className="stack-group" key={group} data-reveal>
                  <span className="mono">{group}</span>
                  <div className="chips">
                    {items.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="stack-group" data-reveal>
                <span className="mono">Certifications</span>
                <ul className="certs">
                  {certifications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <footer className="contact section" id="contact">
          <SectionLabel index="07" title="HAVE A PROBLEM WORTH AUTOMATING?" tag="CONTACT" />
          <a className="contact-title" href={`mailto:${profile.email}`} data-cursor="say hi">
            <span className="contact-row a">
              <L>LET'S BUILD</L>
            </span>
            <span className="contact-row b">
              <L>
                SOMETHING <em>smart.</em>
              </L>
            </span>
          </a>
          <div className="contact-grid">
            <div data-reveal>
              <p>Hiring for AI/ML, need an agent wired into your stack, or just want to talk models? My inbox is open.</p>
              <a className="email" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <button className="pill ghost small magnetic" onClick={copyEmail}>
                <span aria-live="polite">{copy}</span>
              </button>
            </div>
            <div className="socials" data-reveal>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <Arrow />
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub <Arrow />
              </a>
              <a href={profile.resume} target="_blank" rel="noreferrer">
                Resume <Arrow />
              </a>
            </div>
          </div>
          <div className="footer-bottom mono">
            <span>© {new Date().getFullYear()} SAFFRAN MAKKAR</span>
            <span className="hide-sm">DESIGNED & TRAINED IN DELHI · IST {time}</span>
            <a href="#home">BACK TO TOP ↑</a>
          </div>
        </footer>
      </main>

      <dialog className="project-dialog" ref={dialogRef} onClose={() => setActive(null)} onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}>
        {active && (
          <div className="dialog-inner">
            <button className="circle dialog-close" onClick={() => dialogRef.current?.close()} aria-label="Close">
              ×
            </button>
            <div className="dialog-visual">
              <ProjectArt art={active.art} seed={projects.indexOf(active) + 1} />
            </div>
            <div className="dialog-body">
              <div className="project-meta mono">
                <span>
                  {active.index} · {active.kind}
                </span>
                <span>{active.year}</span>
              </div>
              <h3>{active.title}</h3>
              <p className="dialog-summary">{active.summary}</p>
              <div className="dialog-cols">
                <div>
                  <span className="mono">THE PROBLEM</span>
                  <p>{active.problem}</p>
                  <span className="mono">THE OUTCOME</span>
                  <p className="outcome">{active.outcome}</p>
                </div>
                <div>
                  <span className="mono">THE APPROACH</span>
                  <ol>
                    {active.approach.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="tags">
                {active.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {active.link && (
                <a className="pill accent" href={active.link} target="_blank" rel="noreferrer">
                  View on GitHub <Arrow />
                </a>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
