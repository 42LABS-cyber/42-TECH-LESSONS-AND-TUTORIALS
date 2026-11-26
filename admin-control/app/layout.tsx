import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "42 TECH | Admin Control Centre", description: "Secure 42 TECH administrator control centre for courses, learning materials, students and payments.", applicationName: "42 TECH" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
