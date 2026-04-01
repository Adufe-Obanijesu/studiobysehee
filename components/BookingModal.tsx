"use client";

import { useBookingModal } from "@/hooks/useBookingModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HiOutlineX } from "react-icons/hi";

export function BookingModal() {
  const {
    scopeRef,
    circleRef,
    panelRef,
    close,
    name,
    setName,
    email,
    setEmail,
    dateTime,
    setDateTime,
    location,
    setLocation,
    discovery,
    setDiscovery,
    message,
    setMessage,
    handleSubmit,
  } = useBookingModal();

  return (
    <div
      ref={scopeRef}
      className="fixed inset-0 z-10000 invisible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div
          ref={circleRef}
          className={cn(
            "h-4 w-4 shrink-0 rounded-full bg-background border border-border",
            "will-change-transform"
          )}
        />
      </div>

      <div
        ref={panelRef}
        className="absolute inset-0 flex flex-col overflow-y-auto overscroll-contain"
      >
        <div className="pointer-events-auto relative mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 pb-16 pt-20 md:px-8 md:pt-24">
          <div className="booking-form-field space-y-2">
            <h2
              id="booking-modal-title"
              className="font-cormorant text-3xl font-semibold text-foreground md:text-4xl"
            >
              Book a session
            </h2>
            <p className="text-sm text-muted-foreground">
              Share a few details and we will follow up shortly.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="booking-form-field space-y-2">
              <Label htmlFor="booking-name">Name</Label>
              <Input
                id="booking-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="booking-form-field space-y-2">
              <Label htmlFor="booking-email">Email</Label>
              <Input
                id="booking-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="booking-form-field space-y-2">
              <Label htmlFor="booking-datetime">Preferred date and time</Label>
              <Input
                id="booking-datetime"
                name="datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
            </div>

            <div className="booking-form-field space-y-2">
              <Label htmlFor="booking-location">Where would you like to shoot?</Label>
              <Input
                id="booking-location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. studio, city, or outdoor"
                required
              />
            </div>

            <div className="booking-form-field space-y-2">
              <Label htmlFor="booking-discovery">How did you hear about me?</Label>
              <Input
                id="booking-discovery"
                name="discovery"
                value={discovery}
                onChange={(e) => setDiscovery(e.target.value)}
                placeholder="e.g. Instagram, friend referral"
                required
              />
            </div>

            <div className="booking-form-field space-y-2">
              <Label htmlFor="booking-message">Message</Label>
              <Textarea
                id="booking-message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project or ideas"
                rows={4}
              />
            </div>

            <div className="booking-form-field flex flex-wrap gap-3 pt-2">
              <Button type="submit">Send request</Button>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={close}
        className={cn(
          "pointer-events-auto fixed right-4 top-4 z-10001 inline-flex size-10 items-center justify-center rounded-full",
          "text-foreground transition transition-ease-200 hover:bg-muted"
        )}
        aria-label="Close booking form"
      >
        <HiOutlineX className="size-6" aria-hidden />
      </button>
    </div>
  );
}
