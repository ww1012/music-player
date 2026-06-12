import './globals.css';
import { PlayerProvider } from '../store/playerStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-dark-bg text-white min-h-screen">
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
