import React, { useState, Fragment } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';

/*
export default function ImageModal({ img_url, alt, open, onClose }) {

    return (   
        <Dialog
            open={open}
            onClose={onClose}
            aria-label='Squeal Image'
        >  
            <DialogContent>
                
            </DialogContent>
        </Dialog>
    );
}*/

export default function ImageModal({ image, alt, open, setOpen }) {
    
    const max_width = 'sm';
    const full_width = true;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    console.log(`Recived url: ${image}`)

    return (
        <Fragment>
            
        </Fragment>
    );
}