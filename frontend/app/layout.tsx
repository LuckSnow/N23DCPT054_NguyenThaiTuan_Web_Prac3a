import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'HAGUE — Clean News & Editorial Magazine',
  description: 'Báo điện tử HAGUE - Dự án Fullstack Integration: NextJS + Express',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              padding: '12px 18px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
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