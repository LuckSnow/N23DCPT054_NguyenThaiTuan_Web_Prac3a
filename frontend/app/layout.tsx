import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Fullstack Blog - Next.js & Express Integration',
  description: 'Thực hành Lab 3: Kết nối Frontend NextJS với Backend Express',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}