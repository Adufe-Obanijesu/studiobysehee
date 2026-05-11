import { Cormorant_Garamond, DM_Sans, Geist } from "next/font/google";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { PreloaderProvider } from "@/context/PreloaderContext";
import { BookingProvider } from "@/context/BookingContext";
import { PageTransitionProvider } from "@/context/PageTransitionContext";
import { cn } from "@/lib/utils";
import Preloader from "@/components/Preloader";
import QueryProvider from "@/components/QueryProvider";
import { BookingModal } from "@/components/BookingModal";
import Navbar from "@/components/Navbar";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import { buildRootLayoutMetadata } from "@/data/seo";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// import CustomCursor from "@/components/CustomCursor";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return buildRootLayoutMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("SBS_preferred_theme");
  const initialIsDark = themeCookie
    ? themeCookie.value === "dark"
    : true;

  return (
    <html lang="en" className={cn(initialIsDark ? "dark" : "", "font-sans", geist.variable)}>
      <body
        className={`relative ${cormorant.variable} ${dmSans.variable} font-dm antialiased`}
      >
        <SiteJsonLd />
        <PageTransitionProvider>
          <PageTransitionLoader />
          <BookingProvider>
            <PreloaderProvider>
              <ThemeProvider initialIsDark={initialIsDark}>
                <Navbar />
                <QueryProvider>
                  <Preloader />
                  <div id="page-content" className="invisible">
                    {children}
                  </div>
                  {/* <CustomCursor /> */}
                </QueryProvider>
              </ThemeProvider>
            </PreloaderProvider>
            <BookingModal />
          </BookingProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}
