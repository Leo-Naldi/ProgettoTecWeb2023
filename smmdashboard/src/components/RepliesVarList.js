import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { VariableSizeList } from 'react-window';
import Reply from './Reply';
import { Box, Button } from '@mui/material';


export default function RepliesVarList({ 
    replies, 
    page, 
    maxPages, 
    onPageChange,
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
}) {

    const listHeight = 450;

    const listRef = useRef(null);
    const sizeMap = useRef({});

    const setSize = useCallback((index, size) => {
        sizeMap.current = { ...sizeMap.current, [index]: size };
        listRef.current?.resetAfterIndex(0);
    }, []);
    
    const getSize = useCallback(index => (sizeMap.current[index] || 50), []);
    
    
    const [windowWidth] = useWindowSize();


    return (
        <Fragment>
            {replies.length > 0 && (
                <Fragment>
                <VariableSizeList
                    height={listHeight}
                    itemCount={replies.length}
                    itemSize={(index) => {
                        return getSize(index);
                    }}
                    width="100%"
                    ref={listRef}
                >
                    {({ index, style }) => {
                        
                            return (
                                <div style={style}>
                                    <Reply 
                                        index={index} 
                                        message={replies[index]} 
                                        setSize={setSize} 
                                        windowWidth={windowWidth}
                                        setGeo={setGeo}
                                        setOpenGeoModal={setOpenGeoModal}
                                        openGeoModal={openGeoModal}
                                        geoModalId={geoModalId}
                                        setMediaUrl={setMediaUrl}
                                        setOpenImageModal={setOpenImageModal}
                                        openImageModal={openImageModal}
                                        setOpenVideoModal={setOpenVideoModal}
                                        openVideoModal={openVideoModal}
                                        imageModalId={imageModalId}
                                        videoModalId={videoModalId}/>
                                </div>
                            );
                        
                    }}
                </VariableSizeList>
                {(maxPages > 1) && (<Box>
                    <Button 
                        variant='text' 
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}>
                        {"< Prev"}
                    </Button>
                    <Button 
                        variant='text' 
                        disabled={page === maxPages}
                        onClick={() => onPageChange(page + 1)}>
                        {"Next >"}
                    </Button>
                </Box>)}
                </Fragment>
            )}
        </Fragment>
        );

} 