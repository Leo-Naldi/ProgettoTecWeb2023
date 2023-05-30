import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard';


export const routerData = [
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
    }
];

const router = createBrowserRouter(routerData);

export default router;