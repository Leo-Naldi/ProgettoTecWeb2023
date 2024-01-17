import { Box, Button, Divider, IconButton, ListItem, ListItemText, Typography, useTheme } from "@mui/material";
import React, { useEffect, useRef } from "react";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ImageIcon from '@mui/icons-material/Image';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

import dayjs from "dayjs";


export default function Reply({ 
    message, 
    index, 
    setSize, 
    windowWidth,
    setGeo, 
    setOpenGeoModal,
    geoModalId,
    openGeoModal,
    setMediaUrl,
    setOpenImageModal,
    openImageModal,
    imageModalId,
    setOpenVideoModal,
    openVideoModal,
    videoModalId,
}){

    const created = new dayjs(message.meta.created);
    const { text, image, video, geo } = message.content;
    const { positive, negative } = message.reactions;
    
    const root = useRef(null);

    const theme = useTheme();

    useEffect(() => {
        setSize(index, root.current.getBoundingClientRect().height);
    }, [windowWidth]);


    return (
        <div ref={root}>
            <Box sx={{ pt: 1 }}>
                <Typography>
                    From @{message.author}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary">
                    {created.format('DD/MM/YYYY, HH:mm')}
                </Typography>
                {geo && <Button 
                    variant="text"
                    onClick={() => {
                        setGeo(geo);
                        setOpenGeoModal(true);
                    }}
                    startIcon={<LocationOnOutlinedIcon fontSize="small" />}
                    aria-controls={geoModalId}
                    aria-haspopup="dialog"
                    aria-expanded={openGeoModal ? 'true' : undefined}>
                        Location
                    </Button>}
                    <Box sx={{ my: 1 }}>
                        {text || '-'}
                    </Box>

                <Box display="flex">
                    <Typography variant="button" sx={{ alignItems: 'center', display: 'flex', mx: 2, color: 'text.secondary'}}>
                        <ThumbUpAltOutlinedIcon fontSize="small" color="text.muted" sx={{ mr: 1 }} /> {positive}
                    </Typography>
                    <Typography variant="button" sx={{ alignItems: 'center', display: 'flex', color: 'text.secondary' }}>
                        <ThumbDownAltOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> {negative}
                    </Typography>
                    {image && <IconButton
                        sx={{ mx: 1 }}
                        aria-label='Show Squeal Image'
                        onClick={() => {
                            setMediaUrl(image);
                            setOpenImageModal(true);
                        }}
                        aria-controls={imageModalId}
                        aria-haspopup="dialog"
                        aria-expanded={openImageModal ? 'true' : undefined}>
                        <ImageIcon />
                    </IconButton>}
                    {video && <IconButton
                        sx={{ mx: 1 }}
                        aria-label='Show Squeal Video'
                        onClick={() => {
                            setMediaUrl(video);
                            setOpenVideoModal(true);
                        }}
                        aria-controls={videoModalId}
                        aria-haspopup="dialog"
                        aria-expanded={openVideoModal ? 'true' : undefined}>
                        <PlayCircleFilledIcon />
                    </IconButton>}
                </Box>

                <Divider sx={{ mt: 1 }} />
            </Box>
        </div>
    );
};