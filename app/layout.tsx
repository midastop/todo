import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "미니 할일",
  description: "할일을 관리하는 미니 앱",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <main className="flex min-h-screen w-screen justify-center bg-gray-100">
          <div className="relative flex w-full max-w-md flex-col bg-white">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
