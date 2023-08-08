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
import { useManagedAccounts } from '../context/ManagedAccountsContext';
import { useSocket } from '../context/SocketContext';
import authorizedRequest from '../utils/authorizedRequest';


export default function Squeals({ managed }) {


    const messagesPerPage = 100;

    const [page, setPage] = useState(1);
    const [messages, setMessages] = useState([]);
    const [fetchingMessages, setFetchingMessages] = useState(true);
    const [fetchingStats, setFetchingStats] = useState(true);
    const [maxPages, setMaxPages] = useState(null);

    const smm = useAccount();
    const managedUsers = useManagedAccounts();
    const userAccount = managedUsers?.find(u => u.handle === managed);
    const socket = useSocket();

    const fetchMessages = () => {
        setFetchingMessages(true);

        authorizedRequest({
            endpoint: `messages/${managed}/messages`,
            token: smm.token,
            query: { page: page }
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

    useEffect(() => {
        if (managed) {
            fetchMessages();
        }
    }, [page]);

    useEffect(() => {
        setFetchingStats(true);
        fetchCheckPointData(new dayjs(), new dayjs(userAccount.meta.created), managed, smm.token)
        .then(res => res.json())
        .then(res => {
            setMaxPages(Math.ceil(res.total / messagesPerPage));
            setFetchingStats(false);
        })
        setPage(1);
        fetchMessages();
    }, [managed])

    useEffect(() => {

        socket.on('message:created', (message) => {
            if (message.author === managed) {
                // for now refetch messages
               fetchMessages()
            }
        })

        socket.on('message:reactions', (message) => {  
            if (message.author === managed) {
                // for now refetch messages
                const ind = messages.findIndex(m => m.id === message.id) 

                if (ind > -1) {
                    let newMessages = [...messages];
                    newMessages[ind].reactions = message.reactions;
                }
            }
        })

        return () => {
            socket.off('message:changed');
            socket.off('message:reactions');
        }
    }, [socket])

    return (
        <React.Fragment>
            <Title>Squeals</Title>
            {getMessagesTable()}
            <Box display='flex' justifyContent='center'>

                <Pagination 
                    color='primary'
                    count={maxPages || 1}
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

                            const destChannel = m.dest.filter(d => d.charAt(0) === '§');
                            const destUser = m.dest.filter(d => d.charAt(0) === '@');

                            return (<TableRow key={m.id}>
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
                                <TableCell>{(destChannel.length) ? destChannel.join(', ') : "-"}</TableCell>
                                <TableCell>{(destUser.length) ? destUser.join(', ') : "-"}</TableCell>
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