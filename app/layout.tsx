import { ProductosInspectorLoader } from "./productos-inspector-loader";
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
export const metadata: Metadata = {
  openGraph: {
    type: "website",
    siteName: "ProductOS",
    title: "Built with ProductOS",
    description: "AI-native product development platform",
    images: [{ url: "https://productos.dev/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Built with ProductOS",
    images: ["https://productos.dev/og-image.png"],
  },
 title: "42 TECH | Lessons & Tutorials",
 description: "Practical technology lessons, guided tutorials and resources from 42 TECH.",
 applicationName: "42 TECH",
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}<Script src="/productos-badge.js" strategy="afterInteractive"/><Script src="/productos-canvas-height.js" strategy="afterInteractive"/><Script src="/productos-error-overlay.js" strategy="afterInteractive"/><Script src="/productos-screenshot.js" strategy="afterInteractive"/>
        <ProductosInspectorLoader />
      </body></html>;
}