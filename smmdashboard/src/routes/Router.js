import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import Login from '../pages/Login'
import DashboardPage from '../pages/Dashboard';


export const routerData = [
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/dashboard',
        element: <DashboardPage />,
    }
];

const router = createBrowserRouter(routerData, {
    basename: '/frontend/smmdashboard/'
});


export default router;