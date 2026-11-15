import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "../ui/button";
import { cn } from "cn";

type HeroSectionProps = {
  demoHref?: string;
  howItWorksHref?: string;
  productImageSrc?: string;
};

function PixelField({ side }: { side: "left" | "right" }) {
  const columns = 25;
  const rows = 35;

  const pixels = Array.from({ length: columns * rows }, (_, index) => {
    const x = index % columns;
    const y = Math.floor(index / columns);

    // Deterministic noise: consistent on server/client.
    const noise = ((x * 73 + y * 139 + x * y * 17) % 101) / 100;

    // Fade towards the center of the page.
    const edge = side === "left" ? 1 - x / (columns - 1) : x / (columns - 1);

    // Soft elliptical silhouette.
    const vertical = Math.max(0, 1 - Math.pow((y - 17) / 19, 2));

    const density = edge * vertical;

    const visible = noise < density * 0.86;

    const opacity = visible ? Math.min(0.6, 0.06 + density * noise * 0.55) : 0;

    const delay = ((x * 11 + y * 7) % 31) * 130;

    return { index, opacity, delay };
  });

  return (
    <div
      aria-hidden="true"
      className={`fm-pixel-field pointer-events-none absolute
        top-16 hidden h-115 w-85
        grid-cols-25
        grid-rows-35
        gap-1 lg:grid
        ${side === "left" ? "-left-20 xl:-left-8" : "-right-20 xl:-right-8"}`}
    >
      {pixels.map(({ index, opacity, delay }) => (
        <span
          key={index}
          className="fm-field-pixel aspect-square bg-brand"
          style={
            {
              "--pixel-opacity": opacity,
              "--pixel-delay": `${delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function HeroArchitecture() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0
        overflow-hidden"
    >
      <PixelField side="left" />
      <PixelField side="right" />
    </div>
  );
}

const Box = () => {
  return (
    <div
      aria-hidden="true"
      className="z-10 absolute  flex gap-px items-center justify-center inset-y-0 size-9 flex-col bg-brand 
      left-0.5 rounded-[8px] my-auto group-hover:left-[calc(100%-2.3rem-1px)] 
      transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-180"
    >
      {[
        [false, false, true, false, false],
        [false, false, false, true, false],
        [true, true, true, true, true],
        [false, false, false, true, false],
        [false, false, true, false, false],
      ].map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-px">
          {row.map((highlight, columnIndex) => (
            <Bubble key={columnIndex} highlight={highlight} />
          ))}
        </div>
      ))}
    </div>
  );
};

const Bubble = ({ highlight }: { highlight?: boolean }) => {
  return (
    <span
      className={cn(
        "inline-block size-1 shrink-0 animate-none rounded-full",
        "bg-white/25",
        highlight && "bg-white animate-pulse",
      )}
    />
  );
};

function HeroActions({
  demoHref,
  howItWorksHref,
}: {
  demoHref: string;
  howItWorksHref: string;
}) {
  return (
    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="outline"
        className="relative h-11 rounded-[10px] border border-border
          bg-transparent hover:bg-transform pl-12 pr-4
          text-sm font-medium text-foreground
          transition-colors hover:text-foreground group overflow-hidden"
      >
        <Link href={demoHref}>
          <Box />
          <div className="absolute inset-0 bg-border-secondary [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] transition-[clip-path]" />
          <span className="inline-block group-hover:-translate-x-8 transition-transform duration-600 ease-[cubic-bezier(0.76,0,0.24,1)]">
            Book a demo
          </span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="h-11 rounded-xl px-5 text-sm font-medium
          text-foreground transition-colors
          hover:bg-border-secondary hover:text-foreground"
      >
        <Link href={howItWorksHref}>How it works</Link>
      </Button>
    </div>
  );
}

export function HeroSection({
  demoHref = "/book-demo",
  howItWorksHref = "#how-it-works",
  productImageSrc = "/app.png",
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden
        bg-background"
    >
      <HeroArchitecture />
      <div
        className="relative mx-auto max-w-7xl
        px-5 pb-20 pt-24 sm:px-6 sm:pt-32
        lg:px-8 lg:pt-36"
      >
        <div
          className="relative z-10 mx-auto flex
          max-w-[900px] flex-col items-center text-center"
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2
            bg-[#0F1010] px-3.5 py-2
            text-xs font-medium text-[#B4BDB8]"
          >
            <span aria-hidden="true" className="relative flex size-2">
              <span
                className="fm-status-ring absolute inset-0
                  rounded-full bg-[#30D398]"
              />
              <span
                className="relative size-2 rounded-full
                  bg-[#30D398]"
              />
            </span>
            Autonomous security investigation
          </div>

          {/* Headline */}
          <h1
            id="hero-title"
            className="mt-7 max-w-[850px]
              text-balance xl:text-7xl lg:text-6xl text-5xl
              font-medium leading-[1.08]
              tracking-[-0.055em]"
          >
            Every alert investigated
            <span className="block text-[#B9C0BC]">
              Every decision explained
            </span>
          </h1>

          {/* Description */}
          <p
            className="mt-6 max-w-[610px]
              text-pretty text-[15px] leading-7
              text-[#A1AAA6] sm:text-base"
          >
            Meet OSCAR, FortMind&apos;s autonomous AI investigator. From
            security signals to evidence-backed verdicts, every investigation is
            handled with clarity.
          </p>

          <HeroActions demoHref={demoHref} howItWorksHref={howItWorksHref} />
        </div>

        {/* Product preview */}
        <figure
          className="relative z-10 mx-auto mt-16
            max-w-[1120px] sm:mt-20 lg:mt-24"
        >
          <div
            className="absolute -inset-8 -z-10
              rounded-[40px]
              bg-[radial-gradient(ellipse_at_center,rgba(48,211,152,0.055),transparent_70%)]
              blur-3xl"
            aria-hidden="true"
          />

          <div
            className="overflow-hidden rounded-xl
              border border-[#252727] bg-[#0F1010]
              p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.32)]
              sm:rounded-2xl"
          >
            <div
              className="overflow-hidden rounded-lg
                border border-white/5 sm:rounded-xl"
            >
              <Image
                src={productImageSrc}
                alt="FortMind platform displaying security cases,
                  investigation priorities, verdicts and
                  OSCAR workflow status"
                width={1600}
                height={1000}
                sizes="(max-width: 1280px) 100vw, 1120px"
                className="block h-auto w-full"
                priority
              />
            </div>
          </div>

          <figcaption className="sr-only">
            FortMind security operations platform.
          </figcaption>
        </figure>
      </div>

      <style>{`
        @keyframes fm-pixel-pulse {
          0%, 100% { opacity: var(--min-opacity); }
          50% { opacity: 1; }
        }

        @keyframes fm-field-breathe {
          0%, 100% {
            opacity: calc(var(--pixel-opacity) * 0.55);
          }
          50% {
            opacity: var(--pixel-opacity);
          }
        }

        @keyframes fm-status-pulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }

        .fm-pixel {
          opacity: var(--min-opacity);
          animation: fm-pixel-pulse 2.4s ease-in-out
            var(--delay) infinite;
        }

        .fm-field-pixel {
          opacity: var(--pixel-opacity);
          animation: fm-field-breathe 5s ease-in-out
            var(--pixel-delay) infinite;
        }

        .fm-status-ring {
          animation: fm-status-pulse 2.8s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .fm-pixel,
          .fm-field-pixel,
          .fm-status-ring {
            animation: none !important;
          }

          .fm-pixel {
            opacity: 0.65;
          }

          .fm-status-ring {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
