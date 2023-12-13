import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';


export default function FetchOptionsAutocomplete({ optionsPromise, onChange, id, getOptionLabel, textLabel }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    
    const loading = open && options.length === 0;

    useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        (async () => {
            const res = await optionsPromise();
            if (active)
                setOptions(res);
        })();
    
        return () => {
            active = false;
        };
    }, [loading]);

    return (
        <Autocomplete
            id={id}
            getOptionLabel={getOptionLabel}
            multiple
            open={open}
            sx={{
                mt: 1
            }}
            onChange={onChange}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            onInputChange={(e, val) => {
                optionsPromise(val).then(res => setOptions(res))
            }}
            options={options}
            loading={loading}
            filterOptions={x => x}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={textLabel}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

