import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chart from './Chart';
import CharacterCount from './CharacterCount';
import Squeals from './Squeals';
import Copyright from './Copiright';
import { useAccount } from "../context/CurrentAccountContext";
import fetchCheckPointData, { getCheckpoints } from '../utils/fetchStats';
import dayjs from 'dayjs';
import { useManagedAccounts } from '../context/ManagedAccountsContext';
import Spinner from './Spinner';
import { Button } from '@mui/material';



export default function Dashboard({ managed }) {

    const num_checkpoints = 8;

    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const [chartData, setChartData] = useState([]);

    const [fetchingChartData, setFetchingChartData] = useState(true);
    
    const smm = useAccount();
    const managedUsers = useManagedAccounts()
    const userAccount = managedUsers?.find(u => u.handle === managed)
    

    useEffect(() => {

        // If managed changes the whole prop will be refetched so its ok

        setFetchingChartData(true);
        const checkpoints = getCheckpoints(
            selectedPeriod, 
            num_checkpoints, 
            new dayjs(userAccount.meta.created)
        );

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
            })).then(vals => {
                setChartData(vals);
                setFetchingChartData(false);
            })
        }

    }, [selectedPeriod]);
    
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
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 260,
                                }}
                            >
                                {getChart()}
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
                                <Button sx={{my: 1}} variant='contained'>
                                    Post Squeal
                                </Button>
                            </Paper>
                        </Grid>
                        {/* Recent Orders */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                <Squeals managed={managed}/>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Copyright sx={{ pt: 4 }} />
                </Container>
            </Box>
    );

    function getChart() {
        if (fetchingChartData) {
            return <Spinner />
        } else {
            return <Chart
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                chartData={chartData}
            />
        }
    }
}