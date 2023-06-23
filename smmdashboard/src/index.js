import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import router from './routes/Router';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { Theme } from './context/ThemeContext';
import AccountContextProvider from './context/CurrentAccountContext';
import { ManagedAccountsContextProvider } from './context/ManagedAccountsContext';
import { CssBaseline } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={Theme}>
        <AccountContextProvider>
          <ManagedAccountsContextProvider>
            <CssBaseline />
              <RouterProvider router={router} />
          </ManagedAccountsContextProvider>
        </AccountContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
