import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "42 TECH | RIMURU TEMPEST Control Centre", description: "Private 42 TECH administrator control centre.", applicationName: "42 RIMURU TEMPEST" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }