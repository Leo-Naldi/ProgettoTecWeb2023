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



export default function Dashboard({ managed, managedUsers }) {

    const num_checkpoints = 8;

    const smm = useAccount();
    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const [chartData, setChartData] = useState([]);
    const [messagePageNum, setMessagePageNum] = useState(1);
    
    const userAccount = managedUsers.find(u => u.handle === managed)
    console.log(userAccount.meta.created)
    

    useEffect(() => {

        // If managed changes the whole prop will be refetched so its ok

        const checkpoints = getCheckpoints(
            selectedPeriod, 
            num_checkpoints, 
            new dayjs(userAccount.meta.created)
        );

        //console.log(checkpoints.map(c => c.toISOString()))

        if (checkpoints !== null) {
            // TODO put a spinner in place of the chart
            Promise.all(checkpoints.map(c => {
                return fetchCheckPointData(c, managed, smm.token)
                    .then(res => res.json())
                    .then(res => {
                        if (selectedPeriod === 'All Time') {
                            //console.log('Res')
                            //console.log(res)
                        }
                        return res
                    })
                    .then(res => {

                        //console.log(res)

                        return ({
                        start: c,
                        end: new dayjs(),
                        stats: res,
                    })})
                    .catch(err => {
                        console.log("Errored")
                        console.log(c.toISOString())
                    })
            })).then(vals => {
                setChartData(vals)
            })
        }

    }, [selectedPeriod]);

    useEffect(() => {
        // TODO fetch the page of user messages
    }, [managed, messagePageNum])

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
                                    height: 260,
                                }}
                            >
                                <Chart 
                                    selectedPeriod={selectedPeriod}
                                    setSelectedPeriod={setSelectedPeriod}
                                    chartData={chartData}
                                    />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4} lg={3}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 260,
                                }}
                            >
                                <CharacterCount managed={managed} managedUsers={managedUsers}/>
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