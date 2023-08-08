import React, { useState } from "react";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Button, Card, CardActionArea, CardMedia, Tooltip } from "@mui/material";

export default function UploadAndDisplayImage({ selectedImage, setSelectedImage }){

    return (
        <React.Fragment>
                <Button 
                    component='label'
                    variant="text"
                    startIcon={<AddPhotoAlternateIcon sx={{ mb: 1 }}/>}>
                        {(selectedImage) ? 'Change Image...': 'Add Image...'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedImage(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </Button>
            {selectedImage && <Tooltip title='Click to Clear'>
                <Card sx={{ maxWidth: '100%' }}>
                    <CardActionArea
                        onClick={() => setSelectedImage(null)}>
                        <CardMedia
                            component="img"
                            height="280"
                            image={URL.createObjectURL(selectedImage)}
                            alt={`Uploaded Image titled ${selectedImage.name}`}
                        />
                    </CardActionArea>
                </Card>
            </Tooltip>}
        </React.Fragment>
    );
};