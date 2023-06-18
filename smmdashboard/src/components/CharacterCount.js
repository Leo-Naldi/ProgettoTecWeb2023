import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';


export default function CharacterCount({ dailyCount=8, weeklyCount=60, monthlyCount=45 }) {
    const getTextColor = (count) => {
        if (count <= 10) {
            return 'error';
        } else if (count <= 50) {
            return '#FF9800';
        } else {
            return 'text.primary';
        }
    };

    return (
        <React.Fragment>
            <Typography sx={{ mb: 2 }} variant="h5" component="h2">Characters Left</Typography>
            <Grid container  sx={{ ml: 1 }} spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6" component="span" display="inline">Daily: </Typography>
                    <Typography component="span" variant="h5" color={getTextColor(dailyCount)} display="inline">
                        {dailyCount}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" component="span" display="inline">Weekly: </Typography>
                    <Typography component="span" variant="h5" color={getTextColor(weeklyCount)} display="inline">
                        {weeklyCount}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" component="span" display="inline">Monthly: </Typography>
                    <Typography component="span" variant="h5" color={getTextColor(monthlyCount)} display="inline">
                        {monthlyCount}
                    </Typography>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}
