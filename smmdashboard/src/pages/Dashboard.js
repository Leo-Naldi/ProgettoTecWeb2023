import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../context/CurrentAccountContext";
import Dashboard from "../components/Dashboard";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import { useManagedAccounts, useManagedAccountsDispatch } from "../context/ManagedAccountsContext";
import Spinner from "../components/Spinner";
import { useSocket } from "../context/SocketContext";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutListButton from "../components/LogoutListButton";


export default function DashboardPage() {

    const num_checkpoints = 8;
    
    const [toggleSideDrawer, setOpenToggleSideDrawer] = useState(true);

    const [managed, setManaged] = useState(null);

    const smm = useAccount();
    const managedAccountsDispatch = useManagedAccountsDispatch();
    const managedAccount = useManagedAccounts();
    const socket = useSocket()

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
                </Toolbar>
            </AppBar>
                <Drawer open={toggleSideDrawer}>
                    <Box
                        role={'presentation'}
                        width={'auto'}
                        sx={{
                            m: 1,
                        }}>
                        <Typography variant="h5" sx={{
                            m:1,
                        }}>
                            Managed Users
                        </Typography>
                        <Divider sx={{ mt: 1 }}/>
                        {getManagedUserList()}
                        <Divider />
                        <LogoutListButton />
                    </Box>
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
                        <ListItem key={account.handle}>
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
        }else {
            return <Spinner />
        }
    }
}
