import React, { useState, useEffect, Fragment } from 'react';
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
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Pagination } from '@mui/material';
import fetchCheckPointData from '../utils/fetchStats';
import { useManagedAccounts } from '../context/ManagedAccountsContext';
import { useSocket } from '../context/SocketContext';
import authorizedRequest from '../utils/authorizedRequest';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';

import _ from 'underscore';
import ImageModal from './ImageModal';


function parseMessage (message) {
    message.meta = {
        ...message.meta,
        created: new dayjs(message.meta.created),
        lastModified: new dayjs(message.meta.lastModified)
    }

    message.content = _.defaults(message.content, { text: '', image: null })

    return message;
}

export default function Squeals({ managed }) {

    const messagesPerPage = 25;

    const [page, setPage] = useState(1);
    const [messages, setMessages] = useState([]);
    const [fetchingMessages, setFetchingMessages] = useState(true);
    const [maxPages, setMaxPages] = useState(null);

    const [openImageModal, setOpenImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    const smm = useAccount();
    const managedUsers = useManagedAccounts();
    const userAccount = managedUsers?.find(u => u.handle === managed);
    //console.log(userAccount)
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
                console.log(res.results)
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
        })

        return () => {
            socket?.off('message:created');
            socket?.off('message:changed');
        }
    }, [socket, messages])


    const handleCloseImageModal = () => {
        setOpenImageModal(false);
    }

    return (
        <Fragment>

            <Dialog
                fullWidth={true}
                maxWidth={'sm'}
                open={openImageModal}
                onClose={handleCloseImageModal}
            >
                <DialogContent>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        >

                        <img src={imageUrl} alt={'Squeal image'}
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
                            <TableCell>
                                <PhotoLibraryIcon />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {messages.map(makeMessageRow)};
                    </TableBody>
                </Table>
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
                    <TableCell>{m.meta.created.format('YYYY/MM/DD')}</TableCell>
                    <TableCell>
                        <Typography
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                            {(m.content.text?.length) ? m.content.text : '-'}
                        </Typography>
                    </TableCell>
                    <TableCell>{(destChannel.length) ? destChannel.join(', ') : "-"}</TableCell>
                    <TableCell>{(destUser.length) ? destUser.join(', ') : "-"}</TableCell>
                    <TableCell>{m.reactions.positive}</TableCell>
                    <TableCell>{m.reactions.negative}</TableCell>
                    <TableCell>{(_.isString( m.content.image)) ?
                        (<IconButton
                            aria-label='Show Squeal Image'
                            onClick={() => {
                                console.log(`Clicked on: ${m.content.image}`)
                                setImageUrl(m.content.image);
                                setOpenImageModal(true);
                            }}>
                            <ImageIcon />
                        </IconButton>
                        ) :
                        (<HideImageOutlinedIcon />)}</TableCell>
                    </TableRow>
                </Fragment>
            );
    }
}