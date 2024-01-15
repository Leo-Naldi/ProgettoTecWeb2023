import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useManagedAccounts } from '../context/ManagedAccountsContext';


export default function CharacterCount({ managed }) {

    const managedUsers = useManagedAccounts();
    const user = managedUsers.find(u => u.handle === managed);
    

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
        (user) &&
        (<React.Fragment>
            <Typography sx={{ mb: 1 }} variant="h5" component="h2">Characters Left</Typography>
            <Grid container  sx={{ ml: 1 }} spacing={2}>
                <Grid item xs={12} aria-live="polite" aria-atomic="true">
                    <Typography variant="h6" component="span" display="inline">Daily: </Typography>
                    <Typography component="span" variant="h5" color={getTextColor(user.charLeft.day)} display="inline">
                        {user.charLeft.day}
                    </Typography>
                </Grid>
                <Grid item xs={12} aria-live="polite" aria-atomic="true">
                    <Typography variant="h6" component="span" display="inline">Weekly: </Typography>
                    <Typography component="span" variant="h5" color={getTextColor(user.charLeft.week)} display="inline">
                        {user.charLeft.week}
                    </Typography>
                </Grid>
                <Grid item xs={12} aria-live="polite" aria-atomic="true">
                    <Typography variant="h6" component="span" display="inline">Monthly: </Typography>
                    <Typography component="span" variant="h5" color={getTextColor(user.charLeft.month)} display="inline">
                        {user.charLeft.month}
                    </Typography>
                </Grid>
            </Grid>
        </React.Fragment>)
    );
}
