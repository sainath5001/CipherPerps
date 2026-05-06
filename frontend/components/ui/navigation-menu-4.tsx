"use client";

import { BookOpenIcon, InfoIcon, LifeBuoyIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type SimpleItem = { href: string; label: string };
type DescriptionItem = { href: string; label: string; description: string };
type IconItem = { href: string; label: string; icon: "BookOpenIcon" | "LifeBuoyIcon" | "InfoIcon" };

type TopLink = { href: string; label: string; submenu?: false } | ({ label: string; submenu: true } & (
  | { type: "description"; items: DescriptionItem[] }
  | { type: "simple"; items: SimpleItem[] }
  | { type: "icon"; items: IconItem[] }
));

type FlatTopLink = Extract<TopLink, { href: string }>;

function isTopLevelHrefLink(link: TopLink): link is FlatTopLink {
  return "href" in link;
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function NavAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

const navigationLinks: TopLink[] = [
  { href: "/", label: "Home" },
  { href: "/faucet", label: "Faucet" },
  {
    label: "Product",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/#why",
        label: "Why CipherPerps",
        description: "Confidential perpetuals with encrypted position parameters.",
      },
      {
        href: "/app",
        label: "Trading terminal",
        description: "Open the demo app: chart, margin, long/short.",
      },
      {
        href: "/#faq",
        label: "FAQ",
        description: "Common questions about privacy, oracle pricing, and MVP limits.",
      },
    ],
  },
  {
    label: "Protocol",
    submenu: true,
    type: "simple",
    items: [
      { href: "/#features", label: "Features" },
      { href: "/#roadmap", label: "Roadmap" },
      {
        href: "https://sepolia.etherscan.io/address/0xFe97B52dC4219979e5524D244B8D8C0A39879B5F",
        label: "Contracts (Sepolia)",
      },
      { href: "https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1", label: "Chainlink feeds" },
    ],
  },
  {
    label: "About",
    submenu: true,
    type: "icon",
    items: [
      { href: "/#footer", label: "Credits & status", icon: "InfoIcon" },
      { href: "/app", label: "Try the demo", icon: "LifeBuoyIcon" },
      { href: "https://docs.zama.org/", label: "Zama docs", icon: "BookOpenIcon" },
    ],
  },
];

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/40 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/30 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="group size-8 md:hidden" variant="ghost" size="icon">
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-in-out group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-out group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-in-out group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      {"submenu" in link && link.submenu ? (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{link.label}</div>
                          <ul>
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink asChild>
                                  <NavAnchor href={item.href} className="py-1.5">
                                    {item.label}
                                  </NavAnchor>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : isTopLevelHrefLink(link) ? (
                        <NavigationMenuLink asChild>
                          <NavAnchor href={link.href} className="py-1.5">
                            {link.label}
                          </NavAnchor>
                        </NavigationMenuLink>
                      ) : null}
                      {index < navigationLinks.length - 1 && (
                        <div
                          role="separator"
                          aria-orientation="horizontal"
                          className="-mx-1 my-1 h-px w-full bg-border"
                        />
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
              <span className="grid size-8 place-items-center rounded-lg border border-border bg-secondary text-xs font-semibold text-secondary-foreground">
                CP
              </span>
              <span className="hidden font-semibold tracking-tight sm:inline">CipherPerps</span>
            </Link>

            <div className="max-md:hidden">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      {"submenu" in link && link.submenu ? (
                        <>
                          <NavigationMenuTrigger className="bg-transparent px-2 py-1.5 font-medium text-muted-foreground hover:text-primary">
                            {link.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul
                              className={cn(
                                "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]",
                                link.type === "description" && "md:grid-cols-1",
                              )}
                            >
                              {link.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <NavigationMenuLink asChild>
                                    <NavAnchor
                                      href={item.href}
                                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                    >
                                      {link.type === "icon" && "icon" in item && (
                                        <div className="flex items-center gap-2">
                                          {item.icon === "BookOpenIcon" && (
                                            <BookOpenIcon size={16} className="text-foreground opacity-60" aria-hidden="true" />
                                          )}
                                          {item.icon === "LifeBuoyIcon" && (
                                            <LifeBuoyIcon size={16} className="text-foreground opacity-60" aria-hidden="true" />
                                          )}
                                          {item.icon === "InfoIcon" && (
                                            <InfoIcon size={16} className="text-foreground opacity-60" aria-hidden="true" />
                                          )}
                                          <div className="text-sm font-medium leading-none">{item.label}</div>
                                        </div>
                                      )}

                                      {link.type === "description" && "description" in item && (
                                        <>
                                          <div className="text-sm font-medium leading-none">{item.label}</div>
                                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{item.description}</p>
                                        </>
                                      )}

                                      {link.type === "simple" && <div className="text-sm font-medium leading-none">{item.label}</div>}
                                    </NavAnchor>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : isTopLevelHrefLink(link) ? (
                        <NavigationMenuLink asChild>
                          <NavAnchor
                            href={link.href}
                            className="px-2 py-1.5 font-medium text-muted-foreground hover:text-primary"
                          >
                            {link.label}
                          </NavAnchor>
                        </NavigationMenuLink>
                      ) : null}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
                <NavigationMenuViewport />
              </NavigationMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectButton chainStatus="icon" showBalance={false} />
          <Button asChild size="sm" className="text-sm">
            <Link href="/app">Open App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
