import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chart from './Chart';
import CharacterCount from './CharacterCount';
import Orders from './Orders';
import Copyright from './Copiright';
import { useAccount } from "../context/CurrentAccountContext";
import fetchCheckPointData, { getCheckpoints } from '../utils/fetchStats';
import dayjs from 'dayjs';



export default function Dashboard({ managed }) {

    const num_checkpoints = 8;

    const smm = useAccount();
    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const [chartData, setChartData] = useState([]);
    

    useEffect(() => {

        // If managed changes the whole prop will be refetched so its ok
        if ((managed)) {
            const checkpoints = getCheckpoints(selectedPeriod, num_checkpoints);

            if (checkpoints !== null) {
                // if not All Time Was Selected
                
                Promise.all(checkpoints.map(c => {
                    return fetchCheckPointData(null, c, managed, smm.token)
                        .then(res => res.json())
                        .then(res => ({
                            start: c,
                            end: new dayjs(),
                            stats: res,
                        }))
                        .catch(err => console.log(err))
                })).then(vals => {
                    setChartData(vals)
                }).catch(error => {
                    console.log(error)
                })
            }
        }

    }, [selectedPeriod, managed]);

    // TODO fetch checkpoints
    
    return (
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        {/* Chart */}
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 240,
                                }}
                            >
                                <Chart 
                                    selectedPeriod={selectedPeriod}
                                    setSelectedPeriod={setSelectedPeriod}
                                    chartData={chartData}
                                    />
                            </Paper>
                        </Grid>
                        {/* Recent Deposits */}
                        <Grid item xs={12} md={4} lg={3}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 240,
                                }}
                            >
                                <CharacterCount />
                            </Paper>
                        </Grid>
                        {/* Recent Orders */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                <Orders />
                            </Paper>
                        </Grid>
                    </Grid>
                    <Copyright sx={{ pt: 4 }} />
                </Container>
            </Box>
    );
}