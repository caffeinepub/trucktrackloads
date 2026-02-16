import { createRootRoute, createRoute, createRouter, createHashHistory, Outlet } from '@tanstack/react-router';
import TopNav from './components/layout/TopNav';
import Footer from './components/layout/Footer';
import BottomAd from './components/ads/BottomAd';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import LoadBoardPage from './pages/LoadBoardPage';
import ClientRegistrationPage from './pages/ClientRegistrationPage';
import TransporterRegistrationPage from './pages/TransporterRegistrationPage';
import ContactPage from './pages/ContactPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPasswordLoginPage from './pages/AdminPasswordLoginPage';

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomAd />
      <Footer />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage,
});

const loadBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/load-board',
  component: LoadBoardPage,
});

const clientRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register/client',
  component: ClientRegistrationPage,
});

const transporterRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register/transporter',
  component: TransporterRegistrationPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminPasswordLoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  servicesRoute,
  loadBoardRoute,
  clientRegistrationRoute,
  transporterRegistrationRoute,
  contactRoute,
  adminRoute,
  adminLoginRoute,
]);

const hashHistory = createHashHistory();

export const router = createRouter({ 
  routeTree, 
  history: hashHistory,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
