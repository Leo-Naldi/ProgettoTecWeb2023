import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useTheme, TextField, Alert } from '@mui/material';
import { useManagedAccounts } from '../context/ManagedAccountsContext';


export default function SquealFormModal({ managed, open, setOpen }) {
    
    const theme = useTheme();
    
    const managedAccounts = useManagedAccounts()
    const managedAccount = managedAccounts.find(u => u.handle === managed);
    const maxLength = Math.min(...Object.values(managedAccount.charLeft));
    
    let [usedChars, setUsedChars] = useState(0);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setUsedChars(0);
    }
    
    const handleSubmit = (e) => {};

    const hadleValueChanged = (e) => {

        const l = e.target.value.replace(/\s+/g, '').length; // Remove all whitespaces

        setUsedChars(l)
    };

    return (
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    position: 'absolute',
                    [theme.breakpoints.up('sm')]: {left: '25%',},
                    maxWidth: 'lg',
                    p: 1,
                }}
            >
            <Box sx={{
                maxWidth: 'md',
                bgcolor: '#fff',
                boxShadow: 20,
                borderRadius: 2,
                p: 3,
                mt: 4,
                position: 'static',

            }}>
                    <Typography id="modal-modal-title" variant="h5">
                        Post a Squeal for {managed}
                    </Typography>

                    <Alert 
                        severity={getSeverity()}
                        sx={{ mt: 1, ml: 1 }}>
                        
                            Currently using {usedChars} characters out of the {maxLength} available.
                    </Alert>
                    <Box component="form" onSubmit={(e) => handleSubmit(e)} noValidate sx={{ mt: 1, ml: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            multiline
                            id="content"
                            label="Squeal Contents"
                            name="content"
                            autoFocus
                            onChange={(e) => hadleValueChanged(e)}
                        />
                        <Button
                            type="submit"
                            //fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={usedChars > maxLength}
                        >
                            Post Squeal
                        </Button>
                    </Box>
                </Box>
            </Modal>
    );

    function getSeverity() {
        if (usedChars > maxLength) {
            return 'error';
        } else if (usedChars > maxLength - Math.ceil(maxLength / 6)) {
            return 'warning';
        }

        return 'info'
    }
}