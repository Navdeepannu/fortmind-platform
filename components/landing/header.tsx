"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Mark } from "../fortmind/brand-logo";

const navigation = [
  {
    label: "Product",
    items: [
      {
        label: "Platform Overview",
        href: "/product",
        description: "Explore the autonomous SOC platform",
      },
      {
        label: "How It Works",
        href: "/product/how-it-works",
        description: "Follow an OSCAR investigation",
      },
      {
        label: "Autonomy Levels",
        href: "/product/autonomy",
        description: "Choose your degree of automation",
      },
    ],
  },
  {
    label: "Solutions",
    items: [
      {
        label: "For CISOs",
        href: "/solutions/role/ciso",
        description: "Security leadership and visibility",
      },
      {
        label: "For SOC Managers",
        href: "/solutions/role/soc-manager",
        description: "Operations and analyst capacity",
      },
      {
        label: "For Analysts",
        href: "/solutions/role/analyst",
        description: "Evidence-backed investigations",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Documentation",
        href: "/resources/docs",
        description: "Explore product documentation",
      },
      {
        label: "Case Studies",
        href: "/resources/case-studies",
        description: "See FortMind use cases",
      },
      {
        label: "Blog",
        href: "/resources/blog",
        description: "Insights and product updates",
      },
    ],
  },
  {
    label: "Company",
    items: [
      {
        label: "About",
        href: "/company/about",
        description: "Our team and mission",
      },
      {
        label: "Security & Trust",
        href: "/company/security",
        description: "How FortMind protects your data",
      },
      {
        label: "Careers",
        href: "/company/careers",
        description: "Build with us",
      },
      {
        label: "Contact",
        href: "/company/contact",
        description: "Talk to the FortMind team",
      },
    ],
  },
] as const;

type HeaderProps = {
  logo?: ReactNode;
};

function DesktopNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center justify-center
        gap-1 lg:flex"
    >
      {navigation.map((section) => {
        const isActive = section.items.some(
          (item) =>
            pathname === item.href || pathname.startsWith(`${item.href}/`),
        );

        return (
          <DropdownMenu key={section.label} modal={false}>
            <DropdownMenuTrigger>
              <button
                type="button"
                className={`group inline-flex h-9
                  items-center gap-1.5 rounded-full
                  px-3.5 text-[13px] font-medium
                  outline-none transition-colors
                  focus-visible:ring-2
                  focus-visible:ring-[#30D398]
                  data-[state=open]:bg-[#1A1D1C]
                  data-[state=open]:text-white
                  ${
                    isActive
                      ? "text-[#F4F5F4]"
                      : "text-[#A1AAA6] hover:text-[#F4F5F4]"
                  }`}
              >
                {section.label}

                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 text-[#858D89]
                    transition-transform duration-200
                    group-data-[state=open]:rotate-180"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="center"
              sideOffset={12}
              className="w-[310px] rounded-xl
                border border-[#252727]
                bg-[#101212] p-1.5
                text-[#F4F5F4]
                shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
            >
              {section.items.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  className="cursor-pointer rounded-lg
                    p-0 focus:bg-[#1D211F]
                    focus:text-white"
                >
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex w-full flex-col
                      items-start gap-0.5
                      px-3.5 py-3 outline-none"
                  >
                    <span
                      className="text-sm font-medium
                        text-[#EBEFEC]"
                    >
                      {item.label}
                    </span>

                    <span
                      className="text-xs leading-5
                        text-[#919B95]"
                    >
                      {item.description}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
}

function MobileNavigation({
  pathname,
  open,
  onOpenChange,
}: {
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger>
        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex size-10 items-center
            justify-center rounded-lg
            text-[#E8EBE9]
            transition-colors hover:bg-[#191C1B]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#30D398]
            lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(90vw,380px)]
          overflow-y-auto border-[#252727]
          bg-[#080A0A] p-0
          text-[#F4F5F4]"
      >
        <SheetTitle className="sr-only">FortMind navigation</SheetTitle>

        <div className="px-6 pb-8 pt-16">
          <SheetClose>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg
                font-semibold tracking-tight"
            >
              <Mark className="size-6 shrink-0 text-[#30D398]" />
              <span>FortMind</span>
            </Link>
          </SheetClose>

          <nav aria-label="Mobile navigation" className="mt-8 space-y-7">
            {navigation.map((section) => (
              <div key={section.label}>
                <p
                  className="mb-2 text-xs font-medium
                    uppercase tracking-[0.1em]
                    text-[#79847D]"
                >
                  {section.label}
                </p>

                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <SheetClose key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          pathname === item.href ? "page" : undefined
                        }
                        className="block rounded-lg
                          px-3 py-2.5 text-sm
                          text-[#E2E7E3]
                          transition-colors
                          hover:bg-[#1A1D1C]
                          focus-visible:outline-2
                          focus-visible:outline-[#30D398]"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            ))}

            <SheetClose>
              <Link
                href="/book-demo"
                className="inline-flex h-11 w-full
                  items-center justify-center gap-2
                  rounded-full bg-[#F4F5F4]
                  text-sm font-medium text-[#080A0A]
                  transition-colors hover:bg-white
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#30D398]"
              >
                Book a demo
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </SheetClose>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header({ logo }: HeaderProps) {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 8);
    };

    updateScrolled();

    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolled);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full
        border-b
        transition-[border-color,background-color]
        duration-200
        ${
          scrolled
            ? "border-[#252727] bg-[#080A0A]/95 backdrop-blur-xl"
            : "border-transparent bg-[#080A0A]"
        }`}
    >
      <div
        className="mx-auto grid h-16 w-full
          max-w-7xl grid-cols-[1fr_auto]
          items-center gap-4 px-5
          sm:px-6 lg:grid-cols-[1fr_auto_1fr]
          lg:gap-6 lg:px-8"
      >
        {/* Left: logo */}
        <div className="flex min-w-0 justify-start">
          <Link
            href="/"
            aria-label="FortMind home"
            className="inline-flex shrink-0
              items-center gap-2.5 rounded-md
              text-xl font-medium
              text-[#F4F5F4]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-[#30D398]"
          >
            <Mark className="size-6 shrink-0 text-[#30D398]" />
            {logo ?? <span className="">FORTMIND</span>}
          </Link>
        </div>

        {/* Center: navigation */}
        <DesktopNavigation pathname={pathname} />

        {/* Right: CTA / mobile menu */}
        <div className="flex items-center justify-end">
          <Link
            href="/book-demo"
            className="hidden h-9 shrink-0
              items-center justify-center gap-2
              rounded-full bg-[#F4F5F4]
              px-4 text-[12px] font-medium
              text-[#080A0A]
              transition-colors hover:bg-white
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#30D398]
              lg:inline-flex"
          >
            Book a demo
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>

          <MobileNavigation
            pathname={pathname}
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          />
        </div>
      </div>
    </header>
  );
}
