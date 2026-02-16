import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import SiteLayout from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import LoadBoardPage from './pages/LoadBoardPage';
import TransporterRegistrationPage from './pages/TransporterRegistrationPage';
import ClientRegistrationPage from './pages/ClientRegistrationPage';
import ContactPage from './pages/ContactPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const rootRoute = createRootRoute({
  component: () => (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
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

const transporterRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transporter-registration',
  component: TransporterRegistrationPage,
});

const clientRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client-registration',
  component: ClientRegistrationPage,
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

export const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  servicesRoute,
  loadBoardRoute,
  transporterRegistrationRoute,
  clientRegistrationRoute,
  contactRoute,
  adminRoute,
]);
