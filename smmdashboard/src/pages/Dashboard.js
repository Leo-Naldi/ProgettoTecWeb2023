import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../context/CurrentAccountContext";
import Dashboard from "../components/Dashboard";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import { useManagedAccounts, useManagedAccountsFetching } from "../context/ManagedAccountsContext";
import PersonIcon from '@mui/icons-material/Person';
import LogoutListButton from "../components/LogoutListButton";


export default function DashboardPage() {
    
    
    const smm = useAccount();
    const managedAccount = useManagedAccounts();
    const managedAccountsFetching = useManagedAccountsFetching();
    
    const [toggleSideDrawer, setOpenToggleSideDrawer] = useState(true);
    const [managed, setManaged] = useState(null);

    const toggleDrawer = () => {
        setOpenToggleSideDrawer(!toggleSideDrawer);
    };

    return !smm.loggedIn ? (
        <Navigate to="/" />
    ) : (
        <Box display="flex">
            <AppBar position="absolute" open={true}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="Open Select Managed Users Menu"
                        onClick={toggleDrawer}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1, ml: 3 }}
                    >
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
                <Drawer 
                    open={toggleSideDrawer} 
                    aria-labelledby="managed-user-select"
                    >
                    <Box
                        width={'auto'}
                        sx={{
                            m: 1,
                        }}>
                        <Typography id="managed-user-select" variant="h5" sx={{
                            m:1,
                        }} component="h2">
                            Managed Users
                        </Typography>

                        <Divider sx={{ mt: 1 }}/>
                        
                        <List 
                            role="menu" 
                            aria-live="assertive"
                            aria-busy={`${managedAccountsFetching}`}>
                            {getManagedUserList()}

                            <Divider aria-hidden="true" />
                            
                            <LogoutListButton />
                        </List>
                    </Box>
                </Drawer>
            {(managed) && (<Dashboard managed={managed}/>)}
        </Box>
    );

    function getManagedUserList() {
        if (managedAccount?.length) {
            return (
                <>
                    {managedAccount.map((account) => (
                        <ListItem key={account.handle} role="menuitem">
                            <ListItemButton
                                key={account.handle}
                                selected={account.handle === managed}
                                onClick={() => {
                                    setManaged(account.handle);
                                    setOpenToggleSideDrawer(false)
                                }}
                                >
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText primary={account.handle} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </>
            )
        } else {
            return <Box sx={{
                textAlign: 'center',
                p: 5,
                maxWidth: 200,
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: 'text.disabled',
                    }}>
                    {(managedAccountsFetching) ? 
                        "Fetching Managed Accounts..." : 
                        `No users managed by @${smm.handle}`}
                </Typography>
            </Box>
        }
    }
}
