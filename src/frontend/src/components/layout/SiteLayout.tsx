import { Outlet } from '@tanstack/react-router';
import TopNav from './TopNav';
import Footer from './Footer';
import BottomAd from '../ads/BottomAd';

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomAd />
      <Footer />
    </div>
  );
}
