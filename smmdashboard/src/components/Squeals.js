import React, { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Title from './Title';
import { useAccount } from '../context/CurrentAccountContext';

import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import dayjs from 'dayjs';
import Spinner from './Spinner';
import { Box, Button, Pagination } from '@mui/material';
import fetchCheckPointData from '../utils/fetchStats';


export default function Squeals({ managed }) {

    const [page, setPage] = useState(1);
    const [messages, setMessages] = useState([]);
    const [fetchingMessages, setFetchingMessages] = useState(true);
    const [fetchingStats, setFetchingStats] = useState(true);
    const [maxPages, setMaxPages] = useState(null);
    const [messagesPerPage, setMessagesPerPage] = useState(100);

    const smm = useAccount();

    useEffect(() => {

        if (managed) {
            
            setFetchingMessages(true);

            const baseUrl = `http://localhost:8000/messages/${managed}/messages`;
            
            // Create a new URL object
            const url = new URL(baseUrl);
            
            // Create a new URLSearchParams object
            const params = new URLSearchParams();
            
            // Add query parameters
            params.append('page', page);
            
            url.search = params.toString();
    
            fetch(url.href, {
                headers: {
                    'Authorization': 'Bearer ' + smm.token,
                }
            })
            .then(res => res.json())
            .then(res => res.map(m => ({
                    ...m,
                    meta: {
                        created: new dayjs(m.meta.created),
                        lastModified: new dayjs(m.meta.lastModified)
                    }
                }))
            )
            .then(res => {
                setMessages(res);
                setFetchingMessages(false);
            })
        }

    }, [page]);

    useEffect(() => {
        setFetchingStats(true);
        fetchCheckPointData(new dayjs(), managed, smm.token)
        .then(res => res.json())
        .then(res => {
            console.log(res.total)
            setMaxPages(Math.ceil(res.total / messagesPerPage));
            setFetchingStats(false);
        })
    }, [])

    return (
        <React.Fragment>
            <Title>Squeals</Title>
            {getMessagesTable()}
            <Box display='flex' justifyContent='center'>

                <Pagination 
                    color='primary'
                    count={maxPages}
                    onChange={(_, p) => setPage(p)}
                    sx={{ mt: 2 }}/>
            </Box>
        </React.Fragment>
    );

    function getMessagesTable() {
        if (fetchingMessages || fetchingStats) {
            return (<Spinner />)
        } else {
            return (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Published</TableCell>
                            <TableCell>Content</TableCell>
                            <TableCell>Channels</TableCell>
                            <TableCell>Users</TableCell>
                            <TableCell>
                                <ThumbUpAltIcon />
                            </TableCell>
                            <TableCell>
                                <ThumbDownAltIcon />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {messages.map(m => {
                            return (<TableRow key={m._id}>
                                <TableCell>{m.meta.created.format('YYYY/MM/DD')}</TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}>
                                        {m.content.text}
                                    </Typography>
                                </TableCell>
                                <TableCell>{(m.destChannel.length) ? m.destChannel.join(',') : "-"}</TableCell>
                                <TableCell>{(m.destUser.length) ? m.destUser.join(',') : "-"}</TableCell>
                                <TableCell>{m.reactions.positive}</TableCell>
                                <TableCell>{m.reactions.negative}</TableCell>
                            </TableRow>)
                        })}
                    </TableBody>
                </Table>
            )
        }
    }
}