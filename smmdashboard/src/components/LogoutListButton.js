import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatchAccount } from '../context/CurrentAccountContext';

export default function LogoutListButton() {

    const navigate = useNavigate();
    const userDispatch = useDispatchAccount();

    const handle_click = () => {
        userDispatch({
            type: 'USER_LOGOUT'
        });

        navigate('/');
    }

    return <ListItem key={"logout-list-item"}>
        <ListItemButton
            key={"logout-button"}
            onClick={handle_click}
        >
            <ListItemIcon>
                <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={"Logout"} />
        </ListItemButton>
    </ListItem>

}