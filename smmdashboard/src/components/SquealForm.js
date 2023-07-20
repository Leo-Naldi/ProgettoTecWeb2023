import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useTheme, TextField, Alert, FormControlLabel, Checkbox } from '@mui/material';
import { useManagedAccounts, useManagedAccountsDispatch } from '../context/ManagedAccountsContext';
import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip } from 'react-leaflet';
import FetchOptionsAutocomplete from './FetchOptionsAutocomplete';
import { useAccount } from '../context/CurrentAccountContext';
import Spinner from './Spinner';


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

    const theme = useTheme();
    const smm = useAccount();
    const managedAccounts = useManagedAccounts()
    const managedAccountsDispatch = useManagedAccountsDispatch()

    const managedAccount = managedAccounts.find(u => u.handle === managed);
    const maxLength = Math.min(...Object.values(managedAccount.charLeft));
    

    const [usedChars, setUsedChars] = useState(0);
    const [position, setPosition] = useState(null);
    const [posting, setPosting] = useState(false);
    const [destUsers, setDestUsers] = useState([]);
    const [destChannels, setDestChannels] = useState([]);
    const [text, setText] = useState('');
    const [geolocate, setGeolocate] = useState(false);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setUsedChars(0);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();

        let body = {
            content: {
                text: text,
            },
            dest: destUsers.map(u => '@' + u.handle).concat(destChannels.map(c => '§' + c))
        };

        if (geolocate) {
            body.meta = {
                geo: {
                    type: 'Point',
                    coordinates: [position.lng, position.lat]
                }
            }
        }

        console.log(body);

        setPosting(true);
        postSqueal(body)
        .then(res => {
            if (res.ok) {
                return res.json().then(res => {
                    
                    managedAccountsDispatch({
                        type: 'CHANGE_CHARLEFT',
                        payload: {
                            handle: managed,
                            charLeft: res.charLeft,
                        }
                    })

                    setPosting(false);
                    handleClose();
                })
            } else {
                console.log(`Posting Squeal failed with code: ${res.status}`);
            }

        })
        .catch(err => console.log(err));
    };

    const hadleValueChanged = (e) => {
        const l = e.target.value.replace(/\s+/g, '').length; // Remove all whitespaces
        setUsedChars(l);
        setText(e.target.value);
    };


    useEffect(() => {
        if (position === null) {
            setGeolocate(false);
        }
    }, [position])

    return (
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="Squeal-Form"
                sx={{
                    position: 'absolute',
                    [theme.breakpoints.up('sm')]: { left: '12%',},
                    [theme.breakpoints.up('lg')]: {left: '25%',},
                    maxWidth: 'lg',
                    p: 1,
                }}
            >
                {getModalContents()}
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

    function getChannelNamesFetch() {

        // Define the base URL
        const baseUrl = `http://localhost:8000/channels/`;

        // Create a new URL object
        const url = new URL(baseUrl);

        // Create a new URLSearchParams object
        const params = new URLSearchParams();

        // Add query parameters
        params.append('namesOnly', "true");

        // Attach the query parameters to the URL
        url.search = params.toString();

        return fetch(url.href, {
            headers: {
                'Authorization': 'Bearer ' + smm.token,
            }
        }).then(res => res.json())
    }

    function postSqueal(body) {

        // Define the base URL
        const baseUrl = `http://localhost:8000/messages/${managed}/messages`;

        // Create a new URL object
        const url = new URL(baseUrl);

        console.log(body)

        return fetch(url.href, {
            headers: {
                'Authorization': 'Bearer ' + smm.token,
                'Content-Type': 'application/json'
            }, 
            method: 'POST',
            body: JSON.stringify(body)
        })
    }

    function getModalContents() {
        if (posting) {
            return (<Spinner />)
        } else {
            return (
                <Box sx={{
                    maxWidth: 'md',
                    bgcolor: '#fff',
                    boxShadow: 20,
                    borderRadius: 2,
                    p: 3,
                    mt: 2,
                    position: 'static',
                    overflowY: 'scroll',
                    maxHeight: '95%',
                }}>
                    <Typography id="modal-modal-title" variant="h5">
                        Post a Squeal for <span
                            sx={{ fontWeight: theme.typography['fontWeightBold'] }}
                        >{managed}</span>
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

                        <Box sx={{ my: 3 }}>
                            <FetchOptionsAutocomplete
                                margin="normal"
                                optionsPromise={getUserHandlesFetch}
                                id="select-fetched-handles"
                                getOptionLabel={(u) => u.handle}
                                textLabel="User Destinations"
                                onChange={(e, v) => setDestUsers(v)}
                            />
                        </Box>

                        <Box sx={{ my: 2 }}>
                            <FetchOptionsAutocomplete
                                margin="normal"
                                optionsPromise={getChannelNamesFetch}
                                id="select-fetched-channels"
                                getOptionLabel={(u) => u}
                                textLabel="Channel Destinations"
                                onChange={(e, v) => setDestChannels(v)}
                                sx={{ mt: 2 }}
                            />
                        </Box>

                        <Box sx={{ mt: 1 }}>
                            <MapContainer
                                center={[41.9027, 12.4963]}
                                zoom={13}
                                style={{ height: '50vh' }}
                                touchZoom
                                doubleClickZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={position} setPosition={setPosition} />
                            </MapContainer>
                        </Box>

                        <FormControlLabel
                            sx={{ width: '100%', mt: 1 }}
                            control={
                                <Checkbox
                                    value="location"
                                    id="location"
                                    color="primary"
                                    onChange={(e) => setGeolocate(e.target.checked)}
                                    checked={geolocate} />
                            }
                            label="Geolocate Squeal"
                            disabled={position === null}
                            name='geolocate'
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
            );
        }
    }
}