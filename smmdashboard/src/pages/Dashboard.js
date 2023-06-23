import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../context/CurrentAccountContext";
import Dashboard from "../components/Dashboard";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ListItemButton, ListItemText } from '@mui/material';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import { useManagedAccounts, useManagedAccountsDispatch } from "../context/ManagedAccountsContext";
import Spinner from "../components/Spinner";



export default function DashboardPage() {

    const num_checkpoints = 8;
    
    const [toggleSideDrawer, setOpenToggleSideDrawer] = useState(true);

    const [managed, setManaged] = useState(null);

    const smm = useAccount();
    const managedAccountsDispatch = useManagedAccountsDispatch();
    const managedAccount = useManagedAccounts();

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
                        aria-label="open drawer"
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
                    <IconButton color="inherit">
                        <Badge badgeContent={4} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>
                <Drawer open={toggleSideDrawer}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: [1],
                    }}
                >
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                    >
                        Managed Users
                    </Typography>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    {getManagedUserList()}
                </List>
            </Drawer>
            {(managed) ? (<Dashboard managed={managed}/>): (
                <Box>
                    <Typography variant="h2">
                        Choose a User to manage...
                    </Typography>
                </Box>
            )}
        </Box>
    );

    function getManagedUserList() {
        if (managedAccount?.length) {
            return (
                <>
                    {managedAccount.map((account) => (
                        <ListItemButton
                            key={account.handle}
                            selected={account.handle === managed}
                            onClick={() => {
                                setManaged(account.handle);
                                setOpenToggleSideDrawer(false)
                            }}
                        >
                            <ListItemText primary={account.handle} />
                        </ListItemButton>
                    ))}
                </>
            )
        }else {
            return <Spinner />
        }
    }
}
