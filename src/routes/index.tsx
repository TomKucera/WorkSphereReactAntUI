import { createBrowserRouter } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';

import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ApplicationPage from '@/features/applications/pages/ApplicationPage';
import ApplicationDetailPage from '@/features/applications/pages/ApplicationDetailPage';
import WorkPage from '@/features/works/pages/WorkPage';

import ContactsPage from '@/features/contacts/pages/ContactsPage';
import EmailInboxPage from '@/features/inbox/pages/EmailInboxPage';
import CvListPage from '@/features/cvs/pages/CvListPage';
import CvEditPage from '@/features/cvs/pages/CvEditPage';
import ScanListPage from '@/features/scans/pages/ScanListPage';
import WorkListPage from '@/features/works/pages/WorkListPage';
import ApplicationListPage from '@/features/applications/pages/ApplicationListPage';

import LoginPage from '@/features/auth/pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />, // 👈 wrapper
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'scans', element: <ScanListPage /> },
          { path: 'works', element: <WorkListPage /> },
          { path: 'applications', element: <ApplicationListPage /> },
          { path: 'applications/:id', element: <ApplicationDetailPage /> },
          { path: 'cvs', element: <CvListPage /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'contacts/:contactId/inbox', element: <EmailInboxPage /> },
          { path: 'cvs/:id', element: <CvEditPage /> },
          { path: 'works/:id/apply', element: <ApplicationPage /> },
          { path: 'works/:id', element: <WorkPage /> },
        ],
      },
    ],
  },
]);
