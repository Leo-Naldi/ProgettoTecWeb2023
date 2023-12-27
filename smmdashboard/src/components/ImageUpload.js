import React, { useState } from "react";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Button, Card, CardActionArea, CardMedia, Tooltip } from "@mui/material";
import isImage from "../utils/isImage";

export default function UploadAndDisplayMedia({ selectedMedia, setSelectedMedia }){

    return (
        <React.Fragment>
                <Button 
                    component='label'
                    variant="text"
                    startIcon={<AddPhotoAlternateIcon sx={{ mb: 1 }}/>}>
                        {(selectedMedia) ? 'Change Image or Video...': 'Add Image or Video...'}
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={e => {
                            setSelectedMedia(e.target.files[0]);
                        }}
                        style={{ display: 'none' }}
                    />
                </Button>
            {selectedMedia && <Tooltip title='Click to Clear'>
                <Card sx={{ maxWidth: '100%' }}>
                    <CardActionArea
                        onClick={() => setSelectedMedia(null)}>
                        <CardMedia
                            component={(isImage(selectedMedia)) ? "img": "video"}
                            height="280"
                            src={URL.createObjectURL(selectedMedia)}
                            alt={`Uploaded Media titled ${selectedMedia.name}`}
                        />
                    </CardActionArea>
                </Card>
            </Tooltip>}
        </React.Fragment>
    );
};