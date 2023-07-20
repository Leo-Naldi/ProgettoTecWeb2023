import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Theme } from './ThemeContext';
import AccountContextProvider from './CurrentAccountContext';
import { ManagedAccountsContextProvider } from './ManagedAccountsContext';
import { CssBaseline } from '@mui/material';
import SocketContextProvider from './SocketContext';


export default function AppContext({ children }) {
    return (
        <ThemeProvider theme={Theme}>
            <AccountContextProvider>
                <ManagedAccountsContextProvider>
                    <SocketContextProvider>
                        <CssBaseline />
                        {children}
                    </SocketContextProvider>
                </ManagedAccountsContextProvider>
            </AccountContextProvider>
        </ThemeProvider>
    );
}