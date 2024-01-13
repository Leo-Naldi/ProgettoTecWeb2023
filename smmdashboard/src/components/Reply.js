import { ListItem, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";

export default function Reply({ message, index, setSize, windowWidth }){
    const { text, img, video, geo } = message.content;

    const root = useRef(null);

    useEffect(() => {
        setSize(index, root.current.getBoundingClientRect().height);
    }, [windowWidth]);


    return (
        <div ref={root}>
            <Typography>From @{message.author}</Typography>
            {text}
        </div>
    );
};