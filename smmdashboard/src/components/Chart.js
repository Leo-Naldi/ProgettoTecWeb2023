import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Title from './Title';


import { time_periods } from '../utils/fetchStats'

// Generate Sales Data
function createData(time, likes, dislikes) {
    return { time, likes, dislikes };
}


function parseChartData(chartData, timePeriod) {
    
    if (timePeriod === 'Today') {
        return chartData.map(datapoint => {

            return createData(datapoint.start.format('HH:mm'),
                datapoint.stats.positive, datapoint.stats.negative);
        })
    } else if (timePeriod === 'All Time') {
        return chartData.map(datapoint => {
            return createData(datapoint.start.format('YYYY/MM'),
                datapoint.stats.positive, datapoint.stats.negative);
        })
    } else {
        return chartData.map(datapoint => {
            return createData(datapoint.start.format('MM/DD'),
                datapoint.stats.positive, datapoint.stats.negative);
        })
    }
}

export default function Chart({ selectedPeriod, setSelectedPeriod, chartData }) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const data = parseChartData(chartData, selectedPeriod);
    const minVal = Math.min(data[0].likes, data[0].dislikes);
    const maxVal = Math.max(data[data.length - 1].likes, data[data.length - 1].dislikes);
    const horizontalPoints = Array.from({ length: 3 }, (v, i) => Math.floor(minVal + (maxVal - minVal) / 4))

    return (
        <React.Fragment>
            <Title>
                <Button onClick={handleClick} >
                    {selectedPeriod}
                </Button>
            </Title>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {time_periods.map(p => (
                    <MenuItem key={p} onClick={() => {
                        setSelectedPeriod(p)
                        handleClose()
                    }}>{p}</MenuItem>
                ))}
            </Menu>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <XAxis
                        dataKey="time"
                        stroke={theme.palette.text.secondary}
                        style={theme.typography.body2}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        style={theme.typography.body2}
                        domain={[minVal, maxVal]}
                    >
                        <Label
                            angle={270}
                            position="left"
                            style={{
                                textAnchor: 'middle',
                                fill: theme.palette.text.primary,
                                ...theme.typography.body1,
                            }}
                        >
                            Likes/Dislikes
                        </Label>
                    </YAxis>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey="likes"
                        stroke={theme.palette.primary.main}
                        //dot={false}
                    />
                    <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey="dislikes"
                        stroke="#FF0000" // Custom shade of red for dislikes
                        //dot={false}
                    />
                    <Tooltip cursor={false}/>
                </LineChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
}
