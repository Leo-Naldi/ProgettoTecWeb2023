import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useTheme, TextField, Alert, FormControlLabel, Checkbox } from '@mui/material';
import { useManagedAccounts } from '../context/ManagedAccountsContext';
import { MapContainer, TileLayer, Popup, Marker, useMapEvents, Tooltip } from 'react-leaflet';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import FetchOptionsAutocomplete from './FetchOptionsAutocomplete';
import { useAccount } from '../context/CurrentAccountContext';


function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click: (e) => {
            setPosition(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        },
        load: () => {
            map.locate();
        },
        locationfound: (loc) => {
            map.flyTo(loc, map.getZoom())
        }
    })

    return position === null ? null : (
        <Marker 
            position={position} 
            eventHandlers={{ click: () => setPosition(null) }}>
            <Tooltip>Click on the marker to delete it.</Tooltip>
        </Marker>
    )
}

export default function SquealFormModal({ managed, open, setOpen }) {
    

    const users = Array.from({ length: 500 }, (v, i) => ({handle: `handle${i}`}));

    const theme = useTheme();
    const smm = useAccount();
    const managedAccounts = useManagedAccounts()
    const managedAccount = managedAccounts.find(u => u.handle === managed);
    const maxLength = Math.min(...Object.values(managedAccount.charLeft));
    
    const [usedChars, setUsedChars] = useState(0);
    const [position, setPosition] = useState(null);
    const [posting, setPosting] = useState(false);
    const [destUsers, setDestUsers] = useState(null);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setUsedChars(0);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
    };

    const hadleValueChanged = (e) => {

        const l = e.target.value.replace(/\s+/g, '').length; // Remove all whitespaces
        setUsedChars(l)
    };

    //useEffect(() => { console.log(destUsers) }, [destUsers]);

    return (
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    position: 'absolute',
                    [theme.breakpoints.up('sm')]: { left: '12%',},
                    [theme.breakpoints.up('lg')]: {left: '25%',},
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
                        <FetchOptionsAutocomplete 
                            optionsPromise={getUserHandlesFetch}
                            id="select-fetched-handles"
                            getOptionLabel={(u) => u.handle}
                            textLabel="User Destinations"
                            onChange={(e, v) => setDestUsers(v)}
                            />
                        <Box sx={{ mt: 1 }}>
                            <MapContainer 
                                center={[51.505, -0.09]} 
                                zoom={13} 
                                style={{ height: '50vh' }}
                                touchZoom
                                doubleClickZoom={false}
                                >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={position} setPosition={setPosition}/>
                            </MapContainer>
                        </Box>

                        <FormControlLabel
                            sx={{ width: '100%', mt: 1 }}
                            control={<Checkbox value="location" id="location" color="primary" />}
                            label="Geolocate Squeal"
                            disabled={position === null}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 1, mb: 2 }}
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

    function getUserHandlesFetch() {

        // Define the base URL
        const baseUrl = `http://localhost:8000/users/`;

        // Create a new URL object
        const url = new URL(baseUrl);

        // Create a new URLSearchParams object
        const params = new URLSearchParams();

        // Add query parameters
        params.append('handleOnly', "true");

        // Attach the query parameters to the URL
        url.search = params.toString();

        return fetch(url.href, {
            headers: {
                'Authorization': 'Bearer ' + smm.token,
            }
        }).then(res => res.json())
    }
}