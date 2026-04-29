import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoomCraft — 3D Interior Design',
  description: 'Draw your floor plan, pick your style, and generate a 3D interior design.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Tailwind CSS CDN — perfect for local/personal projects */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {}
                }
              }
            `,
          }}
        />
      </head>
      <body className="h-full bg-[#0f1117] text-slate-200">{children}</body>
    </html>
  );
}
