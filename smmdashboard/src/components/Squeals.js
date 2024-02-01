import React, { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useAccount } from '../context/CurrentAccountContext';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import dayjs from 'dayjs';
import { Box, Button, Card, CardContent, CardHeader, Collapse, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Skeleton, Stack, TableContainer, TablePagination, TableSortLabel, Toolbar } from '@mui/material';
import { useSocket } from '../context/SocketContext';
import authorizedRequest from '../utils/authorizedRequest';
import ReactPlayer from 'react-player';
import { Tooltip } from '@mui/material';

import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocationOffOutlinedIcon from '@mui/icons-material/LocationOffOutlined';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MapIcon from '@mui/icons-material/Map';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import _ from 'underscore';
import RepliesVarList from './RepliesVarList';



function TableToolbar({ popularity, setPopularity, period, setPeriod, risk, setRisk }) {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);


    const openMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const closeMenu = (new_popularity, new_risk, new_period) => {

        if (new_popularity) setPopularity(new_popularity);
        else if (new_risk) setRisk(new_risk);
        else if (new_period) setPeriod(new_period);

        setAnchorEl(null);
    }

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >

            <Menu
                id="filter-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => closeMenu()}
                MenuListProps={{
                    'aria-label': 'Squeal Popularity Filters',
                }}
                role='menu'
            >
                <MenuItem onClick={() => closeMenu('all')} role='menuitem'>
                    {(popularity === 'all') && <ListItemIcon>
                            <CheckIcon />
                        </ListItemIcon>}
                    <ListItemText inset={(popularity !== 'all')}>All Squeals</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu('popular')} role='menuitem'>
                    {(popularity === 'popular') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(popularity !== 'popular')}>Popular</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu('unpopular')} role='menuitem'>
                    {(popularity === 'unpopular') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(popularity !== 'unpopular')}>Unpopular</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu('controversial')} role='menuitem'>
                    {(popularity === 'controversial') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(popularity !== 'controversial')}>Controversial</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => closeMenu(null, 'popular')} role='menuitem'>
                    {(risk === 'popular') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(risk !== 'popular')}>Almost Popular</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu(null, 'unpopular')} role='menuitem'>
                    {(risk === 'unpopular') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(risk !== 'unpopular')}>Almost Unpopular</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu(null, 'controversial')} role='menuitem'>
                    {(risk === 'controversial') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(risk !== 'controversial')}>Almost Controversial</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => closeMenu(null, null, 'today')} role='menuitem'>
                    {(period === 'today') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(period !== 'today')}>Today</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu(null, null, 'week')} role='menuitem'>
                    {(period === 'week') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(period !== 'week')}>This Week</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu(null, null, 'month')} role='menuitem'>
                    {(period === 'month') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(period !== 'week')}>This Month</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu(null, null, 'year')} role='menuitem'>
                    {(period === 'year') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(period !== 'year')}>This Year</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => closeMenu(null, null, 'all')} role='menuitem'>
                    {(period === 'all') && <ListItemIcon>
                        <CheckIcon />
                    </ListItemIcon>}
                    <ListItemText inset={(period !== 'all')}>All Time</ListItemText>
                </MenuItem>

            </Menu>

            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                Squeals
            </Typography>

            <Tooltip title="Table Filters">
                <IconButton
                    id="open-filters-button"
                    aria-controls={'filter-menu'}
                    aria-haspopup="menu"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={openMenu}>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}

function TableModals({
    imageModalId,
    videoModalId,
    geoModalId,
    openImageModal,
    onCloseImageModal,
    openVideoModal,
    onCloseVideoModal,
    openGeoModal,
    onCloseGeoModal,
    mediaUrl,
    geo,
}) {


    return (
        <Fragment>

            <Dialog
                id={imageModalId}
                fullWidth={true}
                maxWidth={'md'}
                open={openImageModal}
                onClose={onCloseImageModal}
                aria-labelledby={`${imageModalId}-title`}
                role="dialog"
            >
                <DialogTitle>
                    <Typography id={`${imageModalId}-title`} variant="h5" component='h1'>
                        Squeal Image Content
                    </Typography>
                </DialogTitle>
                <DialogContent>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                    >

                        <img src={mediaUrl} alt={'Squeal Content'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                            }}
                        />

                    </Box>


                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={onCloseImageModal}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                id={videoModalId}
                fullWidth={true}
                maxWidth={'md'}
                open={openVideoModal}
                onClose={onCloseVideoModal}
                aria-labelledby={`${videoModalId}-title`}
            >
                <DialogTitle>
                    <Typography id={`${videoModalId}-title`} variant="h5" component='h1'>
                        Squeal Video Content
                    </Typography>
                </DialogTitle>
                <DialogContent>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                    >

                        <ReactPlayer url={mediaUrl} playing={true} />

                    </Box>


                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={onCloseVideoModal}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                id={geoModalId}
                fullWidth={true}
                maxWidth={'md'}
                open={openGeoModal}
                onClose={onCloseGeoModal}
                aria-labelledby={`${geoModalId}-title`}
            >
                <DialogTitle>
                    <Typography id={`${geoModalId}-title`} variant="h5" component='h1'>
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
                    <Button onClick={onCloseGeoModal}>Close</Button>
                </DialogActions>
            </Dialog>

        </Fragment>
    );

}

function Row({ 
    open,
    onOpen,
    onClose,
    message, 
    setMediaUrl, 
    setOpenImageModal, 
    imageModalId,
    openImageModal,
    setOpenVideoModal,
    openVideoModal,
    videoModalId, 
    setGeo,
    setOpenGeoModal,
    openGeoModal,
    geoModalId,
}) {

    const destChannel = message.dest.filter(d => d.charAt(0) === '§');
    const destUser = message.dest.filter(d => d.charAt(0) === '@');


    const [replies, setReplies] = useState(null);
    const [fetchingReplies, setFetchingReplies] = useState(false);
    const [page, setPage] = useState(1);
    const [maxPages, setMaxPages] = useState(null);


    const smm = useAccount();
    const socket = useSocket();

    const fetchReplies = (p) => {
        setFetchingReplies(true);
        authorizedRequest({
            endpoint: `/messages/`,
            token: smm.token,
            query: {
                page: p,
                answering: message.id,
                sort: '-positive',
                results_per_page: 100,
            }
        }).then(res => res.json())
            .then(answers => {
                setReplies(answers.results);
                setMaxPages(answers.pages)
                setFetchingReplies(false);
            })
    }

    const handleChangeOpen = (val) => {

        if (val) {
            onOpen();
            fetchReplies(1)
            setPage(1);
        } else {
            onClose();
            setReplies(null);
            setPage(1);
        }
    }

    useEffect(() => {

        let reply_deleted_cb = (data) => {
            if (replies) {
                let ind = replies.findIndex(m => m.id === data.id);
                if (ind >= 0) {
                    let new_replies = [...replies];
                    new_replies[ind].deleted = true;
                    setReplies(new_replies);
                }
            }
        }

        let reply_changed_cb = (data) => {
            if (replies) {
                let ind = replies.findIndex(m => m.id === data.id);
                if (ind >= 0) {
                    let new_replies = [...replies];
                    new_replies[ind] = {
                        ...replies[ind],
                        ...data,
                    };
                    setReplies(new_replies);
                }
            }
        }

        let reply_created_cb = (data) => {
            if ((replies) && (replies.length < 100)) {
                let new_replies = [
                    ...replies,
                    data,
                ]
                setReplies(new_replies)
            } else {
                setReplies([data]);
            }
        }

        socket.on('message:deleted', reply_deleted_cb);
        socket.on('message:changed', reply_changed_cb);
        socket.on('message:created', reply_created_cb);

        return () => {
            socket.off('message:deleted', reply_deleted_cb);
            socket.off('message:changed', reply_changed_cb);
            socket.off('message:created', reply_created_cb);

        }

    }, []);

    if (message.deleted) {
        return (<Fragment>
            <TableRow key={`squeal-${message.id}`}>
                <TableCell>
                    <IconButton
                        aria-label="View Replies"
                        size="small"
                        disabled>
                        <KeyboardArrowDownIcon />
                    </IconButton>
                </TableCell>
                <TableCell>{message.meta.created.format('DD/MM/YYYY, HH:mm')}</TableCell>
                <TableCell>
                    [deleted]
                </TableCell>
                <TableCell >
                    -
                </TableCell>
                <TableCell>
                    -
                </TableCell>
                <TableCell>{message.reactions.positive}</TableCell>
                <TableCell>{message.reactions.negative}</TableCell>

                <TableCell>
                    <HideImageOutlinedIcon
                        aria-label='No Squeal Media'
                        sx={{
                            ml: 1,
                        }} />
                </TableCell>

                <TableCell>
                    <LocationOffOutlinedIcon
                        aria-label='No Squeal Geolocation'
                        sx={{
                            ml: 1,
                        }} />
                </TableCell>
            </TableRow>
        </Fragment>);
    }

    return (<Fragment>
        <TableRow key={`squeal-${message.id}`}>
            <TableCell>
                <Tooltip title={`${open ? "Hide": "Show"} Replies`}>
                    <IconButton
                        aria-label={`${open ? "Hide" : "Show"} Replies`}
                        size="small"
                        onClick={() => handleChangeOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </Tooltip>
            </TableCell>
            <TableCell>{message.meta.created.format('DD/MM/YYYY, HH:mm')}</TableCell>
            <TableCell>
                {getArrayField(message.content.text)}
            </TableCell>
            <TableCell >
                {getArrayField(destChannel.join(', '))}
            </TableCell>
            <TableCell>
                {getArrayField(destUser.join(', '))}
            </TableCell>
            <TableCell>{message.reactions.positive}</TableCell>
            <TableCell>{message.reactions.negative}</TableCell>

            {getMediaTableCell()}

            <TableCell>{(message.content.geo) ?
                (<IconButton
                    aria-label='Show Squeal Geolocalization'
                    onClick={() => {
                        setGeo(message.content.geo);
                        setOpenGeoModal(true);
                    }}
                    aria-controls={geoModalId}
                    aria-haspopup="dialog"
                    aria-expanded={openGeoModal ? 'true' : undefined}>
                    <LocationOnOutlinedIcon />
                </IconButton>
                ) :
                (<LocationOffOutlinedIcon
                    aria-label='No Squeal Geolocation'
                    sx={{
                        ml: 1,
                    }} />)}</TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                        {fetchingReplies && <Container>
                            <Typography
                                color="text.secondary">
                                Loading Replies...
                            </Typography>
                        </Container>}
                        {((!fetchingReplies) && (replies?.length > 0)) && 
                            <RepliesVarList 
                                replies={replies} 
                                page={page} 
                                maxPages={maxPages}
                                onPageChange={(p) => {
                                    setPage(p);
                                    fetchReplies(p);
                                }}
                                setGeo={setGeo}
                                setOpenGeoModal={setOpenGeoModal}
                                geoModalId={geoModalId}
                                openGeoModal={openGeoModal}
                                setMediaUrl={setMediaUrl}
                                setOpenImageModal={setOpenImageModal}
                                openImageModal={openImageModal}
                                imageModalId={imageModalId}
                                setOpenVideoModal={setOpenVideoModal}
                                openVideoModal={openVideoModal}
                                videoModalId={videoModalId}
                                />
                        }
                        {((!fetchingReplies) && (replies?.length === 0)) && <Container>
                            <Typography
                            color="text.secondary">
                                No Replies Found.
                            </Typography>
                        </Container>}
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </Fragment>);

    function getArrayField(data) {
        if (data.length) {
            return <Tooltip title={data} arrow>
                <Typography sx={{
                    maxWidth: '150px'
                }}
                    noWrap>
                    {data}
                </Typography>
            </Tooltip>
        } else {
            return '-'
        }
    }

    function getMediaTableCell() {

        if (message.content.image) {
            return (<TableCell>
                <IconButton
                    aria-label='Show Squeal Image'
                    onClick={() => {
                        //console.log(`Clicked on: ${message.content.image}`)
                        setMediaUrl(message.content.image);
                        setOpenImageModal(true);
                    }}
                    aria-controls={imageModalId}
                    aria-haspopup="dialog"
                    aria-expanded={openImageModal ? 'true' : undefined}>
                    <ImageIcon />
                </IconButton>
            </TableCell>);
        } else if (message.content.video) {
            return (<TableCell>
                <IconButton
                    aria-label='Show Squeal Video'
                    onClick={() => {
                        //console.log(`Clicked on: ${m.content.video}`)
                        setMediaUrl(message.content.video);
                        setOpenVideoModal(true);
                    }}
                    aria-controls={videoModalId}
                    aria-haspopup="dialog"
                    aria-expanded={openVideoModal ? 'true' : undefined}>
                    <PlayCircleFilledIcon />
                </IconButton>
            </TableCell>);
        } else {
            return (<TableCell>
                <HideImageOutlinedIcon
                    aria-label='No Squeal Media'
                    sx={{
                        ml: 1,
                    }} />
            </TableCell>);
        }
    }
}

export default function Squeals({ managed }) {

    const geoModalId = "squeal-location-modal";
    const imageModalId = "squeal-image-modal";
    const videoModalId = "squeal-video-modal";
    

    const [page, setPage] = useState(1);
    const [messagesPerPage, setMessagesPerPage] = useState(15);
    const [messages, setMessages] = useState([]);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const [maxPages, setMaxPages] = useState(null);
    const [messagesCount, setMessagesCount] = useState(-1);

    const [openImageModal, setOpenImageModal] = useState(false);
    const [openVideoModal, setOpenVideoModal] = useState(false);
    const [mediaUrl, setMediaUrl] = useState(null);

    const [openGeoModal, setOpenGeoModal] = useState(false);
    const [geo, setGeo] = useState(null);

    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('created');
    const [period, setPeriod] = useState('all');  // all, today, week, month, year
    const [popularity, setPopularity] = useState('all');  // popular, unpopular, controversial
    const [risk, setRisk] = useState(null);

    const [openRowIndex, setOpenRowIndex] = useState(-1);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        (page === maxPages) ? Math.max(0, messagesPerPage - messages.length) : 0;


    const smm = useAccount();
    const socket = useSocket();


    const makeQuery = (q = {}) => {

        let periods_filters_q = _.pick(q, 'popularity', 'period');
        if (_.has(q, 'popularity')) delete q.popularity;
        if (_.has(q, 'period')) delete q.period;

        let r = risk;
        if (_.has(q, 'risk')) {
            r = q.risk;
            delete q.risk;
        }

        let query = {
            page: page,
            results_per_page: messagesPerPage,
            sort: `${(order === 'desc') ? '-' : ''}${orderBy}`,
            ...getPeriodsFilters(periods_filters_q),
            ...q,
        }

        if (r) query.risk = r;

        return query;
    }

    const fetchMessages = (q = {}) => {
        setFetchingMessages(true);

        let query = makeQuery(q);

        authorizedRequest({
            endpoint: `messages/user/${managed}`,
            token: smm.token,
            query: query
        })
            .then(res => res.json())
            .then(res => ({
                results: res.results.map(parseMessage),
                pages: res.pages
            }))
            .then(res => {
                setMessages(res.results);
                setMaxPages(res.pages)

                setFetchingMessages(false);
                //console.log("AAAAAAAAAAAAAAAaa")
            })
    }

    const fetchMessagesCount = (q = {}) => {
        let query = makeQuery(q);

        authorizedRequest({
            endpoint: `/users/${managed}/messages/stats`,
            token: smm.token,
            query: query
        }).then(res => res.json())
        .then(res => {
            setMessagesCount(res.total);
        })
    } 

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        const ord = isAsc ? 'desc' : 'asc'
        setOrder(ord);
        setOrderBy(property);

        fetchMessages({
            sort: `${(ord === 'desc') ? '-' : ''}${property}`
        })
    };

    const handleChangePage = (event, newPage) => {
        // MUI table pagination starts at 0
        setPage(newPage + 1);

        fetchMessages({
            page: newPage + 1,
        })
    };

    const handleChangeMessagesPerPage = (event) => {
        let rpp = parseInt(event.target.value)
        setMessagesPerPage(rpp);
        setPage(1);

        fetchMessages({
            page: 1,
            results_per_page: rpp,
        })
    };

    const handleChangePopularity = (val) => {
        setPopularity(val);
        setRisk(null);
        setPage(1);

        fetchMessages({ popularity: val, risk: null, page: 1 });
        fetchMessagesCount({ popularity: val, risk: null, page: 1 })
    }

    const handleChangeRisk = (val) => {
        setRisk(val);
        setPopularity('all');
        setPage(1);

        fetchMessages({ risk: val, popularity: 'all', page: 1 });
        fetchMessagesCount({ risk: val, popularity: 'all', page: 1 });
    }

    const handleChangePeriod = (val) => {
        setPeriod(val);
        setPage(1);

        fetchMessages({ period: val, page: 1 });
        fetchMessagesCount({ period: val, page: 1 });
    }

    useEffect(() => {
        if ((!(fetchingMessages)) && managed) {
            fetchMessages();
            fetchMessagesCount();
        }
    }, [managed])

    useEffect(() => {

        const message_created_cb = (message) => {
            if ((message.author === managed) && (page === 1)) {
                // Add it to the currently displayed messages
                let newMessages = [parseMessage(message),
                ...messages.slice(0, messagesPerPage - 1)];
                setMessages(newMessages);
            }
        }

        const message_changed_cb = (message) => {
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
        }

        const message_deleted_cb = (data) => {

            let i = messages.findIndex(m => m.id === data.id);

            if (i >= 0) {
                let new_messages = [...messages];
                new_messages[i].deleted = true;
                setMessages(new_messages);
            }
        }

        socket.on('message:created', message_created_cb);
        socket.on('message:changed', message_changed_cb);
        socket.on('message:deleted', message_deleted_cb);

        return () => {
            socket.off('message:created', message_created_cb);
            socket.off('message:changed', message_changed_cb);
            socket.off('message:deleted', message_deleted_cb);
        }
    }, [socket, messages, page, messagesPerPage, managed])


    return (
        <Fragment>

            <TableModals
                imageModalId={imageModalId}
                videoModalId={videoModalId}
                geoModalId={geoModalId}
                openImageModal={openImageModal}
                openVideoModal={openVideoModal}
                openGeoModal={openGeoModal}
                onCloseImageModal={() => setOpenImageModal(false)}
                onCloseVideoModal={() => setOpenVideoModal(false)}
                onCloseGeoModal={() => setOpenGeoModal(false)}
                mediaUrl={mediaUrl}
                geo={geo} />

            <TableToolbar
                popularity={popularity}
                setPopularity={handleChangePopularity}
                period={period}
                setPeriod={handleChangePeriod}
                risk={risk}
                setRisk={handleChangeRisk} />

            {getMessagesTable()}
            <TablePagination
                rowsPerPageOptions={[10, 15, 25]}
                component="div"
                count={(messagesCount > -1) ? messagesCount: ((maxPages || 1) * messagesPerPage)}
                rowsPerPage={messagesPerPage}
                page={page - 1}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeMessagesPerPage}
            />
        </Fragment>
    );

    function getMessagesTable() {

        return (
            <TableContainer aria-live="polite">
                <Table aria-label='Squeals Table' aria-live='polite'>
                    <caption>Squeals by @{managed}.</caption>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'created'}
                                    direction={orderBy === 'created' ? order : 'asc'}
                                    onClick={() => handleRequestSort('created')}
                                >
                                    <Typography sx={{
                                        fontWeight: 'bold'
                                    }}>
                                        Published
                                    </Typography>
                                </TableSortLabel>
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
                                <TableSortLabel
                                    active={orderBy === 'positive'}
                                    direction={orderBy === 'positive' ? order : 'asc'}
                                    onClick={() => handleRequestSort('positive')}
                                >
                                    <ThumbUpAltIcon />
                                </TableSortLabel>
                            </TableCell>
                            <TableCell aria-label='Dislikes'>
                                <TableSortLabel
                                    active={orderBy === 'negative'}
                                    direction={orderBy === 'negative' ? order : 'asc'}
                                    onClick={() => handleRequestSort('negative')}
                                >
                                    <ThumbDownAltIcon />
                                </TableSortLabel>
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
                        {/* skeleton during loading */}
                        {fetchingMessages && (_.range(messagesPerPage).map(i => (
                            <TableRow>

                                <TableCell>
                                    <Skeleton
                                        variant="circular"
                                        animation="wave"
                                        width={40}
                                        height={40} />
                                </TableCell>

                                {_.range(4).map(i => (
                                    <TableCell>
                                        <Skeleton variant="rectangular" animation="wave" />
                                    </TableCell>))}

                                {_.range(4).map(i => (
                                    <TableCell>
                                        <Skeleton 
                                            variant="circular" 
                                            animation="wave"
                                            width={40}
                                            height={40} />
                                    </TableCell>))}

                            </TableRow>
                        )))}

                        {/* actual messages */}
                        {(!fetchingMessages) && messages.map(
                            (m, i) => <Row
                                    open={(i === openRowIndex)}
                                    onOpen={() => setOpenRowIndex(i)}
                                    onClose={() => setOpenRowIndex(-1)}
                                    message={m}
                                    setMediaUrl={setMediaUrl}
                                    setOpenImageModal={setOpenImageModal}
                                    openImageModal={openImageModal}
                                    imageModalId={imageModalId}
                                    setOpenVideoModal={setOpenVideoModal}
                                    openVideoModal={openVideoModal}
                                    videoModalId={videoModalId}
                                    setGeo={setGeo}
                                    setOpenGeoModal={setOpenGeoModal}
                                    openGeoModal={openGeoModal}
                                    geoModalId={geoModalId}/>)}

                        {/* empty rows to avoid layout jumps on the last page */}
                        {((!fetchingMessages) && (emptyRows > 0)) && (
                            <TableRow
                                style={{
                                    height: (53) * emptyRows,
                                }}
                            >
                                <TableCell colSpan={8} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )

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

    function getPeriodsFilters(q = {}) {

        let p = q.period ?? period;
        let f = q.popularity ?? popularity;


        if ((p === 'all') && (f === 'all')) {
            return {}
        } else if ((p !== 'all') && (f === 'all')) {
            return {
                after: dayjs().startOf(p).toISOString(),
            }
        } else if ((f !== 'all')) {
            return {
                [f]: p,
            }
        }
    }
}