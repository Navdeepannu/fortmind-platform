"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { caseSectionGroups, type CaseSectionId } from "@/lib/case-sections";

export function SectionNavigation({
  sections,
  counts,
  caseId,
  status,
}: {
  sections: readonly CaseSectionId[];
  counts: Partial<Record<CaseSectionId, number>>;
  caseId: string;
  status: string;
}) {
  const [active, setActive] = useState<CaseSectionId>(sections[0]);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const targets = sections
      .map((id) => document.getElementById(id))
      .filter((item): item is HTMLElement => Boolean(item));
    let frame = 0;
    const update = () => {
      frame = 0;
      const boundary = nav.getBoundingClientRect().bottom + 70;
      const atEnd =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 3;
      const current = atEnd
        ? targets.at(-1)
        : (targets
            .filter((item) => item.getBoundingClientRect().top <= boundary)
            .at(-1) ?? targets[0]);
      if (current) setActive(current.id as CaseSectionId);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(queue, {
      rootMargin: "-120px 0px -55% 0px",
      threshold: [0, 1],
    });
    targets.forEach((target) => observer.observe(target));
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("hashchange", queue);
    queue();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      window.removeEventListener("hashchange", queue);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    const track = navRef.current?.querySelector<HTMLElement>(
      '[data-ui~="nav-groups"]',
    );
    const link = track?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!track || !link) return;
    const left = link.offsetLeft - track.clientWidth / 2 + link.clientWidth / 2;
    track.scrollTo({
      left,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [active]);

  const links: { id: CaseSectionId; label: string }[] = caseSectionGroups
    .flatMap((group) => [...group.sections])
    .filter((section) => sections.includes(section.id));
  return (
    <nav
      data-ui="page-nav"
      ref={navRef}
      className="sticky top-12 z-20 flex min-w-0 items-center gap-5.5 border-b bg-background px-9 @max-[641px]/case:px-5 @max-[501px]/case:px-4"
      aria-label="Case sections"
    >
      <div
        data-ui="nav-groups"
        className="flex-1 min-w-0 overflow-x-auto [scrollbar-width:thin] border-transparent [&_a:hover]:text-foreground [&_a[aria-current]]:text-foreground [&_a[aria-current]]:border-b-primary"
      >
        <ul className="flex items-stretch min-w-[max-content] gap-6.25">
          {links.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? "location" : undefined}
                onClick={(event) => {
                  const target = document.getElementById(section.id);
                  if (!target) return;
                  event.preventDefault();
                  if (location.hash !== `#${section.id}`)
                    history.pushState(null, "", `#${section.id}`);
                  setActive(section.id);
                  target.focus({ preventScroll: true });
                  target.scrollIntoView({
                    block: "start",
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  });
                }}
                className="inline-flex items-center gap-1.75 h-11.5 border-b-2 text-muted-foreground text-[13px] font-medium whitespace-nowrap"
              >
                {section.label}
                {counts[section.id] !== undefined && (
                  <span
                    data-ui="nav-count"
                    className="text-muted-foreground text-xs tabular-nums"
                  >
                    {counts[section.id]}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div
        data-ui="nav-context"
        className="flex items-center flex-none gap-2.5 pl-4 border-l border-border whitespace-nowrap text-xs @max-[861px]/case:hidden"
      >
        <code title={caseId}>{caseId.slice(0, 8)}</code>
        <span className="text-muted-foreground">{status}</span>
        {status === "Needs you" && (
          <a
            href="#decision-heading"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("decision-heading")?.scrollIntoView({
                block: "start",
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              });
            }}
            className="inline-flex items-center gap-1.25 pt-1.25 pr-2.25 pb-1.25 pl-2.25 rounded-sm bg-primary text-primary-foreground font-medium"
          >
            Review verdict{" "}
            <ArrowRight aria-hidden="true" className="w-3.25 h-3.25" />
          </a>
        )}
      </div>
    </nav>
  );
}
