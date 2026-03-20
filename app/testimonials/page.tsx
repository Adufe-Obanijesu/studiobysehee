"use client"

import { Card, CardContent } from '@/components/ui/card'
import testimonials from "@/data/testimonials.json"

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

export default function TestimonialsPage() {
  return (
    <section id="testimonials" className="py-12">
      <div className="container mx-auto px-8 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Happy Clients
          </h2>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 xl:columns-4 lg:gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="mb-6 break-inside-avoid shadow-none lg:mb-4">
              <CardContent>
                <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold hover:text-primary transition-colors">{testimonial.name}</h3>
                    </div>
                </div>

                <blockquote className="mt-4">
                  <p className="text-sm leading-relaxed text-balance">{testimonial.text}</p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}