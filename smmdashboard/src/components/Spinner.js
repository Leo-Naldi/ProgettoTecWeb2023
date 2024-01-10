import React from "react";
import Container from '@mui/material/Container';
import Box from "@mui/material/Box";
import { CircularProgress } from '@mui/material';

export default function Spinner() {

    return (
    <Container maxWidth='xs'>
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 4,
        }}>
            <CircularProgress />
        </Box>
    </Container>)

}