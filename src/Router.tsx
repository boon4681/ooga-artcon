import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page.tsx';
import { LoginPage } from './pages/Login.page.tsx';
import { DiscoveryPage } from './pages/Discovery.page.tsx';
import { ViewImagePage } from './pages/View.page.tsx';
import { UploadPage } from './pages/Upload.page.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/discovery',
        element: <DiscoveryPage />,
    },
    {
        path: '/view/:id',
        element: <ViewImagePage />
    },
    {
        path: '/upload',
        element: <UploadPage />
    }
]);

export function Router() {
    return <RouterProvider router={router} />;
}