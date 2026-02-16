import { ReactNode } from 'react';
import TopNav from './TopNav';
import Footer from './Footer';
import BottomAd from '../ads/BottomAd';

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1">{children}</main>
      <BottomAd />
      <Footer />
    </div>
  );
}
