"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=160&h=160&q=80`;

/** Illustrative quotes for the MVP landing — replace with real testimonials when you have them. */
const testimonials: Testimonial[] = [
  {
    text: "The Sepolia demo made it click: you can keep leverage and size out of the public mempool narrative while still enforcing health onchain.",
    image: unsplash("photo-1494790108377-be9c29b29330"),
    name: "Jordan Lee",
    role: "DeFi researcher",
  },
  {
    text: "Chainlink pricing + a clean trading UI meant we could focus on the FHE integration path instead of rebuilding infra from scratch.",
    image: unsplash("photo-1507003211169-0a1dd7228f2d"),
    name: "Marcus Chen",
    role: "Protocol engineer",
  },
  {
    text: "CipherPerps nails the story: privacy for traders, transparency for the protocol rules. That balance is rare in perp MVPs.",
    image: unsplash("photo-1438761681033-6461ffad8d80"),
    name: "Elena Voss",
    role: "Product lead",
  },
  {
    text: "Liquidation still matters even when parameters are private — the MVP makes that constraint feel understandable, not hand-wavy.",
    image: unsplash("photo-1500648767791-00dcc994a43e"),
    name: "Samir Patel",
    role: "Risk analyst",
  },
  {
    text: "We used the repo as a hackathon base: contracts deploy cleanly, and the frontend already separates landing vs terminal.",
    image: unsplash("photo-1544005313-94ddf0286df2"),
    name: "Priya Nair",
    role: "Full-stack builder",
  },
  {
    text: "Zama-ready scaffolding in the repo saved time. The important part is the ABI evolution — but the UX direction is right.",
    image: unsplash("photo-1519345182560-3f2917c472ef"),
    name: "Noah Brooks",
    role: "Applied cryptography",
  },
  {
    text: "Single-market MVP is a feature: fewer moving parts while you prove encrypted parameters + oracle-driven pricing.",
    image: unsplash("photo-1580489944761-15a19d654956"),
    name: "Avery Kim",
    role: "DAO contributor",
  },
  {
    text: "The position card + oracle read path made it easy to sanity-check our deployment addresses on Sepolia.",
    image: unsplash("photo-1534528741775-53994a69daeb"),
    name: "Riley Santos",
    role: "DevRel",
  },
  {
    text: "If you want confidential perps that still feel like trading software, this is one of the clearest starting points I’ve seen.",
    image: unsplash("photo-1506794778202-cad84cf45f1d"),
    name: "Chris Dalton",
    role: "Trader / reviewer",
  },
];

function TestimonialCard({ text, image, name, role }: Testimonial) {
  return (
    <div className="w-full max-w-xs rounded-3xl border border-border bg-card/70 p-8 shadow-lg shadow-primary/10 backdrop-blur">
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
      <div className="mt-5 flex items-center gap-2">
        <Image
          src={image}
          alt={name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <div className="text-sm font-medium leading-5 tracking-tight">{name}</div>
          <div className="text-sm leading-5 tracking-tight text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsColumn(props: { className?: string; testimonials: Testimonial[]; duration?: number }) {
  const duration = props.duration ?? 10;

  return (
    <div className={props.className}>
      <motion.div
        animate={{ y: ["0%", "-50%"] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {props.testimonials.map((t, i) => (
          <TestimonialCard key={`a-${i}`} {...t} />
        ))}
        {props.testimonials.map((t, i) => (
          <TestimonialCard key={`b-${i}`} {...t} />
        ))}
      </motion.div>
    </div>
  );
}

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection({ className }: { className?: string }) {
  return (
    <section id="testimonials" className={cn("relative my-16 bg-background", className)}>
      <div className="relative z-10 mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border border-border px-4 py-1 text-xs font-medium text-muted-foreground">
              Testimonials
            </div>
          </div>

          <h2 className="mt-5 text-center text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            What builders say
          </h2>
          <p className="mt-5 text-center text-sm text-muted-foreground sm:text-base">
            Representative quotes for the MVP — swap in real users as you ship to production.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
