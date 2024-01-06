import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import PlaceIcon from '@mui/icons-material/Place';
import { ListItemIcon, ListItemText } from '@mui/material';

import authorizedRequest from '../utils/authorizedRequest';
import { useAccount } from '../context/CurrentAccountContext';
import { useSocket } from '../context/SocketContext';

import dayjs from 'dayjs';
import ReactPlayer from 'react-player';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CollectionsIcon from '@mui/icons-material/Collections';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';
import MapIcon from '@mui/icons-material/Map';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocationOffOutlinedIcon from '@mui/icons-material/LocationOffOutlined';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';



const headCells = [
    {
        id: 'text',
        numeric: false,
        label: (<Typography sx={{ fontWeight: 'bold' }}>
            Text
        </Typography>),
    },
    {
        id: 'created',
        numeric: false,
        label: (<Typography sx={{ fontWeight: 'bold' }}>
            Published
        </Typography>),
    },
    {
        id: 'destChannel',
        numeric: false,
        label: (<Typography sx={{ fontWeight: 'bold' }}>
            Channels
        </Typography>),
    },
    {
        id: 'destUser',
        numeric: false,
        label: (<Typography sx={{ fontWeight: 'bold' }}>
            Users
        </Typography>),
    },
    {
        id: 'positive',
        numeric: true,
        label: (<ThumbUpIcon />),
        'aria-label': 'Likes',
    },
    {
        id: 'negative',
        numeric: true,
        label: (<ThumbDownIcon />),
        'aria-label': 'Dislikes',
    },
    {
        id: 'media',
        numeric: false,
        label: (<CollectionsIcon />),
        'aria-label': 'Media',
    },
    {
        id: 'geo',
        numeric: false,
        label: (<PlaceIcon />),
        'aria-label': 'Geolocation',
    },
];

function EnhancedTableHead({ 
    order, 
    orderBy,
    onClick, 
}) {

    const allowed_sort_ids = ['positive', 'negative', 'created'];

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        aria-label={headCell['aria-label']}
                        component='th'
                    >
                        {(allowed_sort_ids.some(id => headCell.id === id)) ? 
                            (<TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={() => onClick(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>) : (headCell.label)}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}


function EnhancedTableToolbar({ filter, setFilter, period, setPeriod }) {

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilter = Boolean(filterAnchorEl);
    const [periodAnchorEl, setPeriodAnchorEl] = useState(null);
    const openPeriod = Boolean(periodAnchorEl);

    const handleClickFilter = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };
    const handleCloseFilterMenu = (val) => {
        if (val) setFilter(val)
        setFilterAnchorEl(null);
    };

    const handleClickPeriod = (event) => {
        setPeriodAnchorEl(event.currentTarget);
    };
    const handleClosePeriodMenu = (val) => {
        if (val) setPeriod(val)
        setPeriodAnchorEl(null);
    };

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            
            <Menu
                id="filter-menu"
                anchorEl={filterAnchorEl}
                open={openFilter}
                onClose={handleClickFilter}
                MenuListProps={{
                    'aria-label': 'Squeal Popularity Filters',
                }}
            >

                <MenuItem onClick={() => handleCloseFilterMenu('all')} >
                    <ListItemIcon>
                        <AllInclusiveIcon />
                    </ListItemIcon>
                    <ListItemText>All Squeals</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleCloseFilterMenu('popular')}>
                    <ListItemIcon>
                        <ThumbUpIcon />
                    </ListItemIcon>
                    <ListItemText>Popular</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleCloseFilterMenu('unpopular')}>
                    <ListItemIcon>
                        <ThumbDownIcon />
                    </ListItemIcon>
                    <ListItemText>Unpopular</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleCloseFilterMenu('controversial')}>
                    <ListItemIcon>
                        <ThumbsUpDownIcon />
                    </ListItemIcon>
                    <ListItemText>Controversial</ListItemText>
                </MenuItem>
            </Menu>

            <Menu
                id="period-menu"
                anchorEl={periodAnchorEl}
                open={openPeriod}
                onClose={handleClickPeriod}
                MenuListProps={{
                    'aria-label': 'Squeal Time Filters',
                }}
            >

                <MenuItem onClick={() => handleClosePeriodMenu('today')} >
                    <ListItemText>Today</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleClosePeriodMenu('week')}>
                    <ListItemText>This Week</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleClosePeriodMenu('month')}>
                    <ListItemText>This Month</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleClosePeriodMenu('year')}>
                    <ListItemText>This Year</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleClosePeriodMenu('all')}>
                    <ListItemText>All Time</ListItemText>
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
            
            <Tooltip title="Popularity Filter">
                <IconButton 
                    id="open-filters-button"
                    aria-controls={openFilter ? 'filter-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openFilter ? 'true' : undefined}
                    onClick={handleClickFilter}>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Period Filter">
                <IconButton
                    id="open-period-button"
                    aria-controls={openPeriod ? 'period-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openPeriod ? 'true' : undefined}
                    onClick={handleClickPeriod}>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}


export default function EnhancedTable({ managed }) {

    const dense = false;

    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('created');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [maxPages, setMaxPages] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [fetching, setFetching] = useState(true);
    const [period, setPeriod] = useState('all');
    const [filter, setFilter] = useState('all');
    const [messages, setMessages] = useState([]);
    const [mediaUrl, setMediaUrl] = useState(null);
    const [openImageModal, setOpenImageModal] = useState(false)
    const [openVideoModal, setOpenVideoModal] = useState(false)
    const [openGeoModal, setOpenGeoModal] = useState(false)
    const [geo, setGeo] = useState(null);



    const smm = useAccount();
    const socket = useSocket();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        
        fetchMessages({
            page: newPage,
        })
    };

    const handleChangeRowsPerPage = (event) => {
        let rpp = parseInt(event.target.value)
        setRowsPerPage(rpp);
        setPage(1);

        fetchMessages({
            page: 1,
            results_per_page: rpp,
        })
    };

    const fetchMessages = (q) => {
        setFetching(true);

        let query = {
            page: page,
            results_per_page: rowsPerPage,
            sort: `${(order === 'desc') ? '-' : ''}${orderBy}`,
            ...q
        }

        let f = q.filter ?? filter;
        let p = q.period ?? period;

        if ((f === 'all') && (p !== 'all')) {
            query.after = dayjs().startOf(p);
        } else if ((f !== 'all')) {
            query[f] = p;
        }

        console.log(query);

        authorizedRequest({
            endpoint: `messages/user/${managed}`,
            token: smm.token,
            query: query,
        })
            .then(res => res.json())
            .then(res => ({
                results: res.results.map(parseMessage),
                pages: res.pages
            }))
            .then(res => {

                if (res.pages !== maxPages) {
                    setMaxPages(res.pages)
                }
                setFetching(false);
                setMessages(res.results);
            })
    }


    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        (page === maxPages) ? Math.max(0, rowsPerPage - messages.length) : 0;

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar 
                    filter={filter} 
                    setFilter={setFilter}
                    period={period}
                    setPeriod={setPeriod}
                    />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-label="Squeals Table"
                        size={'medium'}
                    >
                        <caption>Squeals by @{managed}.</caption>
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onClick={handleRequestSort}
                        />
                        <TableBody>
                            {messages.length && messages.map((row, index) => {

                                const destChannel = row.dest.filter(d => d.charAt(0) === '§');
                                const destUser = row.dest.filter(d => d.charAt(0) === '@');

                                return (
                                    <TableRow key={row.id}>

                                        <TableCell component="td">
                                            {getArrayField(row.text)}
                                        </TableCell>
                                        <TableCell component="td">
                                            {(new dayjs(row.meta.created)).format('YYYY/MM/DD, HH:mm')}
                                        </TableCell>
                                        <TableCell component="td">
                                            {getArrayField(destChannel)}
                                        </TableCell>
                                        <TableCell component="td">
                                            {getArrayField(destUser)}
                                        </TableCell>
                                        <TableCell component="td">
                                            {row.reactions.positive}
                                        </TableCell>
                                        <TableCell component="td">
                                            {row.reactions.negative}
                                        </TableCell>

                                        {getMediaTableCell(row)}

                                        <TableCell>
                                            {(row.content.geo) ?
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
                                                    }} />)}
                                        </TableCell>
                                    </TableRow>
                                        
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={headCells.length} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    component="div"
                    count={-1}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );

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
}