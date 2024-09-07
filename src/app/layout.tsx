import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "QuickPoll - Create and Share Polls Instantly",
  description: "Create, share, and participate in polls with ease. Get instant results and insights from your audience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex justify-center items-center min-h-screen">
        <main className="w-full max-w-4xl p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
