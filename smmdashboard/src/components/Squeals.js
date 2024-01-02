import React, { useState, useEffect, Fragment } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Title from './Title';
import { useAccount } from '../context/CurrentAccountContext';

import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip } from 'react-leaflet';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import dayjs from 'dayjs';
import Spinner from './Spinner';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Pagination, TableContainer } from '@mui/material';
import { useManagedAccounts } from '../context/ManagedAccountsContext';
import { useSocket } from '../context/SocketContext';
import authorizedRequest from '../utils/authorizedRequest';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';
import MapIcon from '@mui/icons-material/Map';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocationOffOutlinedIcon from '@mui/icons-material/LocationOffOutlined';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ReactPlayer from 'react-player';
import { Tooltip as TooltipMui } from '@mui/material';

import _ from 'underscore';

// TODO add inert polyfill to squeal locations map

export default function Squeals({ managed }) {

    const messagesPerPage = 25;

    const [page, setPage] = useState(1);
    const [messages, setMessages] = useState([]);
    const [fetchingMessages, setFetchingMessages] = useState(true);
    const [maxPages, setMaxPages] = useState(null);

    const [openImageModal, setOpenImageModal] = useState(false);
    const [openVideoModal, setOpenVideoModal] = useState(false);
    const [mediaUrl, setMediaUrl] = useState(null);

    const [openGeoModal, setOpenGeoModal] = useState(false);
    const [geo, setGeo] = useState(null);

    const smm = useAccount();
    
    const socket = useSocket();

    const fetchMessages = () => {
        setFetchingMessages(true);

        authorizedRequest({
            endpoint: `messages/user/${managed}`,
            token: smm.token,
            query: { page: page, results_per_page: messagesPerPage }
        })
            .then(res => res.json())
            .then(res => ({
                results: res.results.map(parseMessage),
                pages: res.pages
            }))
            .then(res => {
                setMessages(res.results);
                
                if (res.pages !== maxPages) {
                    setMaxPages(res.pages)
                }
                setFetchingMessages(false);
            })
    }

    useEffect(() => {
        if (managed) {
            fetchMessages();
        }
    }, [page, managed]);

    useEffect(() => {
        if ((!(messages?.length || fetchingMessages)) && managed) {
            fetchMessages();
        }
    }, [managed])

    useEffect(() => {

        socket.on('message:created', (message) => {
            if ((message.author === managed) && (page === 1)) {
                // Add it to the currently displayed messages
                let newMessages = [ parseMessage(message), 
                    ...messages.slice(0, messagesPerPage - 1) ];
                setMessages(newMessages);
            }
        });

        socket.on('message:changed', (message) => {
            if (messages.length) {
                // for now refetch messages
                const ind = messages.findIndex(m => m.id === message.id)

                if (ind > -1) {
                    let newMessages = [...messages];
                    
                    newMessages[ind] = {
                        ...newMessages[ind],
                        ...message,
                    };

                    newMessages[ind] = parseMessage(newMessages[ind])

                    setMessages(newMessages);
                }
            }
        });

        socket.on('message:deleted', (data) => {
            if (messages.find(m => m.id === data.id)) {
                setMessages(messages.filter(m => m.id !== data.id));
            }
        })

        return () => {
            socket?.off('message:created');
            socket?.off('message:changed');
            socket?.off('message:deleted');
        }
    }, [socket, messages])


    const handleCloseImageModal = () => {
        setOpenImageModal(false);
    }

    const handleCloseGeoModal = () => {
        setOpenGeoModal(false);
    }

    return (
        <Fragment>

            <Dialog
                fullWidth={true}
                maxWidth={'md'}
                open={openImageModal}
                onClose={handleCloseImageModal}
                aria-labelledby="squeal-image-title"
            >
                <DialogTitle>
                    <Typography id="squeal-image-title" variant="h5" component='h2'>
                        Squeal Image Content
                    </Typography>
                </DialogTitle>
                <DialogContent>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        >

                        <img src={mediaUrl} alt={'Squeal image'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                            }}
                         />

                    </Box>
                    

                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={handleCloseImageModal}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                fullWidth={true}
                maxWidth={'md'}
                open={openVideoModal}
                onClose={() => setOpenVideoModal(false)}
                aria-labelledby='squeal-video-title'
            >
                <DialogTitle>
                    <Typography id="squeal-video-title" variant="h5" component='h2'>
                        Squeal Video Content
                    </Typography>
                </DialogTitle>
                <DialogContent>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                    >

                        <ReactPlayer url={mediaUrl} playing={true}/>

                    </Box>


                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => setOpenVideoModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                fullWidth={true}
                maxWidth={'md'}
                open={openGeoModal}
                onClose={handleCloseGeoModal}
                aria-labelledby='squeal-location-title'
            >
                <DialogTitle>
                    <Typography id="squeal-location-title" variant="h5" component='h2'>
                        Squeal's Location
                    </Typography>
                </DialogTitle>
                <DialogContent>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        sx={{ mt: 1 }}
                    >
                            <MapContainer
                                center={[geo?.coordinates[1], geo?.coordinates[0]]}
                                zoom={13}
                                style={{ height: '50vh' }}
                                touchZoom
                                doubleClickZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[geo?.coordinates[1], geo?.coordinates[0]]}>
                                </Marker>
                            </MapContainer>

                    </Box>


                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={handleCloseGeoModal}>Close</Button>
                </DialogActions>
            </Dialog>

            <Title>Squeals</Title>
            {getMessagesTable()}
            <Box 
                display='flex' 
                justifyContent='center'>

                <Pagination 
                    color='primary'
                    count={maxPages || 1}
                    onChange={(_, p) => setPage(p)}
                    sx={{ mt: 2 }}/>
            </Box>
        </Fragment>
    );

    function getMessagesTable() {
        if (fetchingMessages) {
            return (
                <Fragment>
                    <Spinner />
                </Fragment>)
        } else {
            return (
                <TableContainer component={'paper'}>
                    <Table aria-label='Squeals Table'>
                        <caption>Squeals by @{managed}.</caption>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography sx={{
                                        fontWeight: 'bold'
                                    }}>
                                        Published
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{
                                        fontWeight: 'bold'
                                    }}>
                                        Text
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{
                                        fontWeight: 'bold'
                                    }}>
                                        Channels
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{
                                        fontWeight: 'bold'
                                    }}>
                                        Users
                                    </Typography>
                                </TableCell>
                                <TableCell aria-label='Likes'>
                                    <ThumbUpAltIcon />
                                </TableCell>
                                <TableCell aria-label='Dislikes'>
                                    <ThumbDownAltIcon />
                                </TableCell>
                                <TableCell aria-label='Media Content'>
                                    <PhotoLibraryIcon />
                                </TableCell>
                                <TableCell aria-label='Geolocation'>
                                    <MapIcon />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messages.map(makeMessageRow)}
                        </TableBody>
                    </Table>
                </TableContainer>
            )
        }
    }

    function makeMessageRow(m) {
        const destChannel = m.dest.filter(d => d.charAt(0) === '§');
        const destUser = m.dest.filter(d => d.charAt(0) === '@');

        //console.log(m.content.image)

        return (
            <Fragment>
                <TableRow key={`squeal-${m.id}`}>
                    <TableCell>{m.meta.created.format('YYYY/MM/DD, HH:mm')}</TableCell>
                    <TableCell>
                        {getArrayField(m.content.text)}
                    </TableCell>
                    <TableCell >
                        {getArrayField(destChannel.join(', '))}
                    </TableCell>
                    <TableCell>
                        {getArrayField(destUser.join(', '))}
                    </TableCell>
                    <TableCell>{m.reactions.positive}</TableCell>
                    <TableCell>{m.reactions.negative}</TableCell>
                    
                    {getMediaTableCell(m)}

                    <TableCell>{(m.content.geo) ?
                        (<IconButton
                            aria-label='Show Squeal Geolocalization'
                            onClick={() => {
                                setGeo(m.content.geo);
                                setOpenGeoModal(true);
                            }}>
                            <LocationOnOutlinedIcon />
                        </IconButton>
                        ) :
                        (<LocationOffOutlinedIcon
                            aria-label='No Squeal Image'
                            sx={{
                                ml: 1,
                            }} />)}</TableCell>
                    </TableRow>
                </Fragment>
            );
    }

    function getArrayField(data) {
        if (data.length) {
            return <TooltipMui title={data} arrow>
                <Typography sx={{
                    maxWidth: '150px'
                }}
                    noWrap>
                    {data}
                </Typography>
            </TooltipMui>
        } else {
            return '-'
        }
    }

    function getMediaTableCell(m) {

        if (m.content.image) {
            return (<TableCell>
                <IconButton
                    aria-label='Show Squeal Image'
                    onClick={() => {
                        console.log(`Clicked on: ${m.content.image}`)
                        setMediaUrl(m.content.image);
                        setOpenImageModal(true);
                    }}>
                    <ImageIcon />
                </IconButton>
            </TableCell>);
        } else if (m.content.video) {
            return (<TableCell>
                <IconButton
                    aria-label='Show Squeal Video'
                    onClick={() => {
                        console.log(`Clicked on: ${m.content.video}`)
                        setMediaUrl(m.content.video);
                        setOpenVideoModal(true);
                    }}>
                    <PlayCircleFilledIcon />
                </IconButton>
            </TableCell>);
        } else {
            return (<TableCell>
                <HideImageOutlinedIcon
                    aria-label='No Squeal Image'
                    sx={{
                        ml: 1,
                    }} />
            </TableCell>);
        }
    }

    function parseMessage(message) {
        message.meta = {
            ...message.meta,
            created: new dayjs(message.meta.created),
            lastModified: new dayjs(message.meta.lastModified)
        }

        message.content = _.defaults(message.content, { text: '', image: null, video: null, geo: null })

        return message;
    }
}