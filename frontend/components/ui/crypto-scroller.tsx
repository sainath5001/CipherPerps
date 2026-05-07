/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();
    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

interface CryptoLogo {
  id: string;
  name: string;
  image: string;
  className?: string;
}

interface CryptoScrollerProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  logos?: CryptoLogo[];
  className?: string;
}

const DEFAULT_LOGOS: CryptoLogo[] = [
  { id: "ethereum", name: "Ethereum", image: "https://cryptologos.cc/logos/ethereum-eth-logo.svg", className: "h-10 w-auto" },
  { id: "bitcoin", name: "Bitcoin", image: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg", className: "h-10 w-auto" },
  { id: "solana", name: "Solana", image: "https://cryptologos.cc/logos/solana-sol-logo.svg", className: "h-10 w-auto" },
  { id: "arbitrum", name: "Arbitrum", image: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg", className: "h-10 w-auto" },
  { id: "optimism", name: "Optimism", image: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg", className: "h-10 w-auto" },
  { id: "polygon", name: "Polygon", image: "https://cryptologos.cc/logos/polygon-matic-logo.svg", className: "h-10 w-auto" },
  { id: "avalanche", name: "Avalanche", image: "https://cryptologos.cc/logos/avalanche-avax-logo.svg", className: "h-10 w-auto" },
  { id: "cardano", name: "Cardano", image: "https://cryptologos.cc/logos/cardano-ada-logo.svg", className: "h-10 w-auto" },
];

export function CryptoScroller({
  eyebrow = "Roadmap",
  heading = "Markets we're rolling out",
  description = "Live today: ETH/USDC perpetuals on Sepolia. More markets unlock as encryption and the risk model harden toward mainnet.",
  logos = DEFAULT_LOGOS,
  className,
}: CryptoScrollerProps) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="flex flex-col items-center text-center">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-400">{eyebrow}</div>
        <h2 className="mt-3 text-pretty text-3xl font-semibold leading-tight md:text-4xl">{heading}</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">{description}</p>
      </div>

      <div className="pt-8 md:pt-12">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-10 flex shrink-0 items-center justify-center">
                    <div className="flex flex-col items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
                      <img src={logo.image} alt={logo.name} className={logo.className} loading="lazy" />
                      <span className="text-sm font-medium text-muted-foreground">{logo.name}</span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default CryptoScroller;
