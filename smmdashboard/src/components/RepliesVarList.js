import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { VariableSizeList } from 'react-window';
import Reply from './Reply';


export default function RepliesVarList({ replies, page, maxPages, onAddPage }) {

    const listHeight = 450;

    const listRef = useRef(null);
    const sizeMap = useRef({});

    const setSize = useCallback((index, size) => {
        sizeMap.current = { ...sizeMap.current, [index]: size };
        listRef.current?.resetAfterIndex(0);
    }, []);
    
    const getSize = useCallback(index => sizeMap.current[index] || 50, []);
    
    
    const [windowWidth] = useWindowSize();


    return (
        <Fragment>
            {replies.length > 0 && (
                <VariableSizeList
                    height={listHeight}
                    itemCount={replies.length}
                    itemSize={(index) => {
                        console.log(getSize(index))
                        return getSize(index);
                    }}
                    width="100%"
                    ref={listRef}
                >
                    {({ index, style }) => (
                        <div style={style}>
                            <Reply 
                                index={index} 
                                message={replies[index]} 
                                setSize={setSize} 
                                windowWidth={windowWidth} />
                        </div>
                    )}
                </VariableSizeList>
            )}
        </Fragment>
        );

} 