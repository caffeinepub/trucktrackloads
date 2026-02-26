import { createRootRoute, createRoute, createHashHistory, createRouter } from '@tanstack/react-router';
import SiteLayout from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import LoadBoardPage from './pages/LoadBoardPage';
import ContractsPage from './pages/ContractsPage';
import ClientRegistrationPage from './pages/ClientRegistrationPage';
import TransporterRegistrationPage from './pages/TransporterRegistrationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPasswordLoginPage from './pages/AdminPasswordLoginPage';
import DownloadPage from './pages/DownloadPage';
import ControlCenterPage from './pages/ControlCenterPage';

const rootRoute = createRootRoute({
  component: SiteLayout,
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

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const loadBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/load-board',
  component: LoadBoardPage,
});

const contractsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contracts',
  component: ContractsPage,
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

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download',
  component: DownloadPage,
});

const controlCenterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/control-center',
  component: ControlCenterPage,
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
  contactRoute,
  loadBoardRoute,
  contractsRoute,
  clientRegistrationRoute,
  transporterRegistrationRoute,
  downloadRoute,
  controlCenterRoute,
  adminRoute,
  adminLoginRoute,
]);

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
