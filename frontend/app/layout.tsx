import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  title: 'HAGUE — Clean News Website & Magazine',
  description: 'Báo điện tử toà soạn HAGUE - Lab 3 Fullstack Integration: NextJS + Express',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-[#111111] antialiased selection:bg-[#0073e6] selection:text-white">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#111827',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              padding: '12px 18px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
              zIndex: 999999,
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}