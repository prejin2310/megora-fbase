"use client"

import Image from "next/image"
import Link from "next/link"
import { FireIcon, GiftIcon } from "@heroicons/react/24/solid"

export default function HeroBannerDiwali() {
  return (
    <section className="relative min-h-[760px] w-full overflow-hidden bg-brand-light">
      {/* Background with zoom effect */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dxlfzftq9/image/upload/diwaliNew_e2tv4p.jpg"
          alt="Megora Diwali Sale"
          fill
          priority
          className="hero-banner-image object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-brand-dark via-black/40 to-transparent" />
      </div>

      {/* Floating Sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-300 opacity-70 animate-sparkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Diyas & Lanterns */}
      <div className="absolute bottom-2 left-12 animate-flicker">
        <Image src="/diya.png" alt="Diya" width={70} height={70} />
      </div>
      <div className="absolute bottom-2 right-16 animate-flicker delay-500">
        <Image src="/diya.png" alt="Diya" width={70} height={70} />
      </div>
      <div className="absolute top-20 left-1/4 animate-swing">
        <Image src="/lantern.png" alt="Lantern" width={80} height={100} />
      </div>
      <div className="absolute top-28 right-1/4 animate-swing delay-1000">
        <Image src="/lantern.png" alt="Lantern" width={80} height={100} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col justify-end gap-10 px-4 pb-16 pt-24 text-white md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-6">
          {/* Badge with Diya above */}
          <div className="relative inline-flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/70 bg-yellow-400/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300 animate-pulse">
              🎇 Diwali Special
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-playfair text-4xl leading-tight sm:text-5xl md:text-[52px] animate-glow">
              Light Up Your Diwali,<br /> Shine With Megora!
            </h1>
            <p className="text-sm text-white/85 sm:text-base">
              Celebrate the Festival of Lights with jewellery that reflects your glow 
              crafted with love, elegance, and festive sparkle
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:scale-105 hover:shadow-yellow-500/40"
            >
              <FireIcon className="h-5 w-5" />
              Shop Diwali Sale
            </Link>
            <Link
              href="/category/necklace"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300 px-6 py-3 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-200/10 hover:scale-105"
            >
              <GiftIcon className="h-5 w-5" />
              Explore Festive Picks
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes heroZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        .hero-banner-image {
          animation: heroZoom 20s ease-in-out infinite alternate;
        }

        @keyframes sparkle {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }
        .animate-sparkle { animation: sparkle linear infinite; }

        /* White → yellow glow for title */
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 6px rgba(255, 255, 255, 0.6),
                         0 0 12px rgba(255, 255, 255, 0.4);
            color: #ffffff;
          }
          50% {
            text-shadow: 0 0 14px rgba(255, 215, 0, 0.9),
                         0 0 28px rgba(255, 215, 0, 0.7);
            color: #ffe066;
          }
        }
        .animate-glow { animation: glow 3s ease-in-out infinite; }

        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.6; }
        }
        .animate-flicker { animation: flicker 2s infinite; }

        @keyframes swing {
          0% { transform: rotate(3deg); }
          50% { transform: rotate(-3deg); }
          100% { transform: rotate(3deg); }
        }
        .animate-swing {
          animation: swing 4s ease-in-out infinite;
          transform-origin: top center;
        }

        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </section>
  )
}
