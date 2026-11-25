import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { id: "vision", label: "Vision" },
  { id: "imagined", label: "IMAGINED" },
  { id: "earth", label: "EARTH//OS" },
  { id: "connection", label: "The Connection" },
];

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="tv-nav-wrap">
      <nav className="tv-nav" aria-label="Main">
        <Button variant="wordmark" onClick={() => go("top")}>
          TERRAVISION<span className="tv-wordmark-dim">-OS</span>
        </Button>
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <Button variant="navigation" onClick={() => go(l.id)}>
                {l.label}
              </Button>
            </li>
          ))}
        </ul>
        <Button
          variant="navigation"
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <span className="tv-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
      </nav>
      {open && (
        <div id="mobile-menu" className="tv-mobile-menu md:hidden">
          {LINKS.map((l, i) => (
            <Button key={l.id} variant="mobile" style={{ animationDelay: `${i * 50}ms` }} onClick={() => go(l.id)}>
              <span className="tv-index">0{i + 1}</span>
              {l.label}
            </Button>
          ))}
        </div>
      )}
    </header>
  );
}