"use client";

import Footer from "@/components/Footer";
import { brands } from "@/data/brands";
import { cn } from "@/lib/utils";
import Image from "next/image";

const ABOUT_IMAGE_URL =
  "https://format.creatorcdn.com/ee685a19-5999-4b6a-a94f-5b004997a4ad/0/0/0/0,0,3643,2424,760,506/0-0-0/b5a2bc2e-c271-4479-9329-d3a9a19d7d2e/1/2/IMG_4193-1_PS.jpg?fjkss=exp=2089564646~hmac=87c366d326356c0a2749a6ee87dd8e51525d40fa8f44cb20e7cd69c04e0eb69d";

export default function About() {
  return (
    <section className="w-full -mt-14">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-[60vh] min-h-[420px] lg:h-auto">
          <div className="relative h-full w-full lg:sticky lg:top-0 lg:h-screen">
            <Image
              src={ABOUT_IMAGE_URL}
              alt="Portrait photography by Sehee"
              fill
              priority
              quality={100}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              About
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              I&apos;m a New York-based photographer and cinematographer working
              across both still and motion. I focus on creating images that
              feel cinematic, intentional, and visually strong - whether
              it&apos;s a single portrait or a moving sequence. Having grown up
              in Korea and spent many years in New York, I naturally blend both
              sensibilities into my work, bringing a perspective that feels
              both refined and culturally layered.
            </p>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              My work is rooted in strong visual instinct and a deep attention
              to composition, light, and tone. I&apos;m drawn to images that feel
              visually distinct and thoughtfully crafted, with a sense of mood
              and clarity that holds attention without trying too hard.
            </p>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Alongside client work, I operate camera on international tours
              with major K-pop artists, including BLACKPINK. Moving between
              cities, stages, and creative teams has sharpened my eye and
              pushed my aesthetic beyond the ordinary.
            </p>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              I&apos;m drawn to visuals that feel elevated but effortless -
              images that could live in a personal archive or on a luxury
              brand&apos;s campaign wall. The goal is always the same: create
              something visually distinct, emotionally grounded, and quietly
              powerful.
            </p>

            <p className="text-base leading-relaxed sm:text-lg">
              Let&apos;s bring your ideas to life - together.
            </p>
          </div>
          <div
            className="grid w-3xl mx-auto lg:grid-cols-3 md:grid-cols-4 grid-cols-3 gap-6"
          >
            {brands.map((brand, i) => {
              const Svg = brand.Svg;
              return (
                <div
                  key={`${brand.alt}-${i}`}
                  className={cn(
                    "grid-item flex items-center justify-center h-8 [&>svg]:h-full [&>svg]:w-auto",
                    brand.alt === brands[brands.length - 1].alt && "col-span-1", 
                  )}
                >
                  <Svg
                    width={96}
                    height={60}
                    className="h-full w-full object-contain"
                    aria-label={brand.alt}
                  />
                </div>
              );
            })}
          </div>
            <div className="mt-12">
              <Footer />
            </div>
        </div>
      </div>
    </section>
  );
}