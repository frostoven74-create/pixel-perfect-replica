import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, Asterisk, Globe2, Layers3 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/config/projects";
import { HeroScene } from "./HeroScene";
import { ProjectCta } from "./ProjectCta";
import { ProjectPanel } from "./ProjectPanel";
import { scrollToSection, SiteNav } from "./SiteNav";

function SectionLabel({ number, children }: { number: string; children: string }) {
  return <div className="tv-section-label"><span>{number}</span><span className="tv-label-line" />{children}</div>;
}

export function Exhibition() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".tv-hero-heading", { y: 22, opacity: 0, duration: 1.3, ease: "power3.out" });
        gsap.from(".tv-project-imagined", { x: -8, duration: 0.7, ease: "power3.out" });
        gsap.from(".tv-project-earth", { x: 8, duration: 0.7, ease: "power3.out" });
        gsap.utils.toArray<HTMLElement>(".tv-story-title").forEach((el) => {
          gsap.from(el, { y: 38, duration: 1.25, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" } });
        });
        gsap.to(".tv-connection-thread", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".tv-connection-intro", start: "top 85%", end: "center 45%", scrub: 0.6 } });
        gsap.to(".tv-vision-word", { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: "#vision", start: "top 70%", end: "center center", scrub: 0.5 } });
      });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="tv-exhibition">
      <a className="tv-skip-link" href="#main">Skip to exhibition</a>
      <SiteNav />
      <HeroScene />
      <main id="main">
        <section id="top" className="tv-hero" data-scene-range="0,0.07" aria-labelledby="hero-title">
          <div className="tv-hero-heading">
            <p className="tv-eyebrow"><span /> IMAGINATION × PLANETARY UNDERSTANDING</p>
            <h1 id="hero-title">TerraVision<span>OS</span><sup>®</sup></h1>
            <p className="tv-hero-subtitle">Two worlds. <em>One shared vision.</em></p>
          </div>
          <div className="tv-hero-projects">
            <ProjectPanel id="imagined" />
            <div className="tv-core-label" aria-hidden><span className="tv-crosshair">+</span> TV—OS / 001<span className="tv-core-status">A CONNECTED PERSPECTIVE</span></div>
            <ProjectPanel id="earth" />
          </div>
          <div className="tv-hero-footer">
            <span className="tv-coordinate">A DIGITAL EXHIBITION<br /><span>CREATIVITY · CONSCIOUSNESS · CONNECTION</span></span>
            <Button variant="exhibition" className="tv-scroll-button" onClick={() => scrollToSection("the-connection")}>
              <span>Enter the experience</span><ArrowDown aria-hidden />
            </Button>
            <span className="tv-edition">INDEPENDENT PROJECTS<br /><span>ONE FUTURE VISION</span></span>
          </div>
          <span className="tv-hero-edge" aria-hidden />
        </section>

        <section id="the-connection" className="tv-connection-intro tv-section" data-scene-range="0.07,0.24">
          <div className="tv-section-inner">
            <SectionLabel number="01">THE CONNECTION</SectionLabel>
            <h2 className="tv-story-title">Two different directions.<br /><em>One shared vision.</em></h2>
            <div className="tv-direction-rail"><span>IMAGINED</span><span className="tv-connection-thread" /><Asterisk aria-hidden /><span className="tv-connection-thread" /><span>EARTH//OS</span></div>
            <p className="tv-intro-copy">One looks at what we can create.<br />The other asks what the world needs.</p>
          </div>
        </section>

        <section id="imagined" className="tv-story tv-story-imagined" data-scene-range="0.24,0.42">
          <div className="tv-story-inner">
            <div className="tv-story-copy">
              <SectionLabel number="02">IMAGINED</SectionLabel>
              <span className="tv-story-icon"><Layers3 aria-hidden /></span>
              <h2 className="tv-story-title">Everything begins<br />with <em>an idea.</em></h2>
              <p className="tv-story-kicker">FROM AN IDEA TO UNDERSTANDING.</p>
              <p className="tv-body-copy">{PROJECTS.imagined.description}</p>
              <div className="tv-feature-list"><span>Components</span><span>Materials</span><span>Mechanisms</span><span>Processes</span></div>
              <ProjectCta project={PROJECTS.imagined} />
            </div>
            <div className="tv-scene-caption"><span>FIG. 02</span><span>AN IDEA, UNFOLDED.</span><span className="tv-caption-line" /></div>
          </div>
          <div className="tv-story-bottom"><span>IMAGINATION IS THE STARTING POINT.</span><span>↓</span></div>
        </section>

        <section id="earth" className="tv-story tv-story-earth" data-scene-range="0.42,0.68">
          <div className="tv-story-inner">
            <div className="tv-scene-caption"><span>FIG. 03</span><span>NOTHING EXISTS IN ISOLATION.</span><span className="tv-caption-line" /></div>
            <div className="tv-story-copy">
              <SectionLabel number="03">EARTH//OS</SectionLabel>
              <span className="tv-story-icon"><Globe2 aria-hidden /></span>
              <h2 className="tv-story-title">Our planet.<br /><em>Our perspective.</em></h2>
              <p className="tv-story-kicker">UNDERSTAND THE PLANET. REIMAGINE ITS FUTURE.</p>
              <p className="tv-body-copy">{PROJECTS.earth.description}</p>
              <div className="tv-sdg-line"><span className="tv-sdg-spectrum" aria-hidden /><span>17 GOALS. ONE INTERCONNECTED WORLD.</span></div>
              <ProjectCta project={PROJECTS.earth} />
            </div>
          </div>
          <div className="tv-story-bottom"><span>UNDERSTANDING IS THE NEXT STEP.</span><span>↓</span></div>
        </section>

        <section id="connection" className="tv-purpose tv-section" data-scene-range="0.68,0.82">
          <div className="tv-section-inner">
            <SectionLabel number="04">WHY THEY CONNECT</SectionLabel>
            <h2 className="tv-story-title">Imagination gives us<br /><em>possibility.</em><br />Understanding gives it<br /><em>purpose.</em></h2>
            <div className="tv-purpose-pair"><span>IMAGINED <ArrowUpRight aria-hidden /></span><span className="tv-purpose-bridge" aria-hidden /><span><Globe2 aria-hidden /> EARTH//OS</span></div>
            <p className="tv-intro-copy">Ideas and planetary challenges are not separate stories.<br />Together, they represent creativity guided by awareness<br className="hidden md:block" /> and responsibility.</p>
          </div>
        </section>

        <section id="vision" className="tv-vision tv-section" data-scene-range="0.82,0.91">
          <div className="tv-section-inner">
            <SectionLabel number="05">THE FUTURE VISION</SectionLabel>
            <p className="tv-concept-label"><span /> A PROPOSED FUTURE PLATFORM</p>
            <h2 className="tv-story-title">A more <em>connected</em><br />way to think.</h2>
            <p className="tv-vision-statement">{"TerraVisionOS is a vision of bringing idea exploration and planetary understanding into one connected experience.".split(" ").map((word, i) => <span className="tv-vision-word" key={i}>{word} </span>)}</p>
            <p className="tv-vision-note">Two independent projects today. A possible shared platform tomorrow.<br />The unified TerraVisionOS platform is a future concept — not a completed product.</p>
          </div>
        </section>

        <section className="tv-final tv-section" id="explore" data-scene-range="0.91,1">
          <div className="tv-section-inner">
            <SectionLabel number="06">YOUR NEXT PERSPECTIVE</SectionLabel>
            <h2 className="tv-story-title">Two worlds.<br /><em>One vision.</em></h2>
            <div className="tv-final-actions"><ProjectCta project={PROJECTS.imagined} /><ProjectCta project={PROJECTS.earth} /></div>
          </div>
        </section>
      </main>
      <footer className="tv-footer">
        <div className="tv-footer-brand">TERRAVISION<span>-OS</span><p>Connecting imagination with planetary understanding.</p></div>
        <div className="tv-footer-nav"><Button variant="navigation" onClick={() => scrollToSection("imagined")}>IMAGINED <ArrowUpRight aria-hidden /></Button><Button variant="navigation" onClick={() => scrollToSection("earth")}>EARTH//OS <ArrowUpRight aria-hidden /></Button></div>
        <div className="tv-footer-meta"><span>AN INDEPENDENT DIGITAL EXHIBITION</span><span>IDEAS FOR A WORLD WORTH UNDERSTANDING.</span></div>
      </footer>
    </div>
  );
}