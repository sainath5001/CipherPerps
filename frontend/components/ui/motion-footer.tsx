"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SEPOLIA_CONTRACTS =
  "https://sepolia.etherscan.io/address/0xFe97B52dC4219979e5524D244B8D8C0A39879B5F";
const CHAINLINK_FEEDS =
  "https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1";
const ZAMA_DOCS = "https://docs.zama.org/";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: color-mix(in hsl, hsl(var(--foreground)) 5%, transparent);
  --pill-bg-2: color-mix(in hsl, hsl(var(--foreground)) 2%, transparent);
  --pill-shadow: color-mix(in hsl, hsl(var(--background)) 50%, transparent);
  --pill-highlight: color-mix(in hsl, hsl(var(--foreground)) 12%, transparent);
  --pill-inset-shadow: color-mix(in hsl, hsl(var(--background)) 80%, transparent);
  --pill-border: color-mix(in hsl, hsl(var(--foreground)) 10%, transparent);

  --pill-bg-1-hover: color-mix(in hsl, hsl(var(--foreground)) 10%, transparent);
  --pill-bg-2-hover: color-mix(in hsl, hsl(var(--foreground)) 4%, transparent);
  --pill-border-hover: color-mix(in hsl, hsl(var(--foreground)) 22%, transparent);
  --pill-shadow-hover: color-mix(in hsl, hsl(var(--background)) 70%, transparent);
  --pill-highlight-hover: color-mix(in hsl, hsl(var(--foreground)) 22%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in hsl, hsl(var(--destructive)) 50%, transparent)); }
  15%, 45% { transform: scale(1.18); filter: drop-shadow(0 0 10px color-mix(in hsl, hsl(var(--destructive)) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in hsl, hsl(var(--foreground)) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in hsl, hsl(var(--foreground)) 4%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in hsl, hsl(var(--primary)) 18%, transparent) 0%,
    color-mix(in hsl, hsl(var(--secondary)) 14%, transparent) 42%,
    transparent 72%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: hsl(var(--foreground));
}

.footer-giant-bg-text {
  font-size: clamp(12rem, 26vw, 22rem);
  line-height: 0.78;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in hsl, hsl(var(--foreground)) 8%, transparent);
  background: linear-gradient(180deg, color-mix(in hsl, hsl(var(--foreground)) 12%, transparent) 0%, transparent 62%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(
    180deg,
    hsl(var(--foreground)) 0%,
    color-mix(in hsl, hsl(var(--foreground)) 45%, transparent) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px color-mix(in hsl, hsl(var(--foreground)) 14%, transparent));
}
`;

export type MagneticButtonProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLElement> & {
    as?: React.ElementType;
    className?: string;
    href?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit" | "reset";
  }
>;

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.35,
            y: y * 0.35,
            rotationX: -y * 0.12,
            rotationY: x * 0.12,
            scale: 1.04,
            ease: "power2.out",
            duration: 0.35,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.4)",
            duration: 1.1,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as EventListener);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as EventListener);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef && typeof forwardedRef === "object")
            (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Private size & leverage</span> <span className="text-primary/60">✦</span>
    <span>ETH / USDC perpetuals</span> <span className="text-secondary-foreground/50">✦</span>
    <span>Chainlink oracle</span> <span className="text-primary/60">✦</span>
    <span>Sepolia demo</span> <span className="text-secondary-foreground/50">✦</span>
    <span>Zama FHE-ready</span> <span className="text-primary/60">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.82, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 42%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        id="footer"
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          <div className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap" ref={giantTextRef}>
            PERPS
          </div>

          <div className="absolute left-0 top-12 z-10 w-full origin-center scale-110 -rotate-2 overflow-hidden border-y border-border/50 bg-background/60 py-4 shadow-2xl backdrop-blur-md">
            <div className="animate-footer-scroll-marquee flex w-max text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2 ref={headingRef} className="footer-text-glow mb-10 text-center text-5xl font-black tracking-tighter md:mb-12 md:text-8xl">
              Trade with privacy-first defaults?
            </h2>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-4">
                <MagneticButton
                  as={Link}
                  href="/app"
                  className="footer-glass-pill flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-foreground md:px-10 md:py-5 md:text-base"
                >
                  Open trading app
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href={SEPOLIA_CONTRACTS}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-glass-pill flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-foreground md:px-10 md:py-5 md:text-base"
                >
                  View contracts (Sepolia)
                </MagneticButton>
              </div>

              <div className="mt-1 flex w-full flex-wrap justify-center gap-3 md:gap-6">
                <MagneticButton
                  as={Link}
                  href="/#faq"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  FAQ
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/#features"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Features
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href={ZAMA_DOCS}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Zama docs
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href={CHAINLINK_FEEDS}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Chainlink feeds
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:order-1 md:text-xs">
              © {new Date().getFullYear()} CipherPerps •{" "}
              <a
                href="https://www.zama.ai/"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Powered by Zama FHE
              </a>
            </div>

            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full border-border/50 px-6 py-3 md:order-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">Built with</span>
              <span className="animate-footer-heartbeat text-sm text-destructive md:text-base">❤</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">for confidential DeFi</span>
            </div>

            <MagneticButton
              as="button"
              type="button"
              onClick={scrollToTop}
              className="footer-glass-pill group order-3 flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <svg
                className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-y-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
