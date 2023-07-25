import React, { useState } from "react";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Button, IconButton, Input } from "@mui/material";

export default function UploadAndDisplayImage({ imageUploaded }){

    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <React.Fragment>
                <Button 
                    component='label'
                    variant="text"
                    startIcon={<AddPhotoAlternateIcon />}>
                        Add Image...
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            console.log(event.target.files[0]);
                            setSelectedImage(event.target.files[0]);
                            imageUploaded(true);
                        }}
                        style={{ display: 'none' }}
                    />
                </Button>
        </React.Fragment>
    );
};