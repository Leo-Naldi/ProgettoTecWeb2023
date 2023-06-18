import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Title from './Title';

// Generate Sales Data
function createData(time, likes, dislikes) {
    return { time, likes, dislikes };
}

// Generate dummy data for Today
const generateTodayData = () => {
    const todayData = [];
    const now = new Date();
    const currentTime = `${now.getHours()}:00`;
    for (let i = 0; i <= now.getHours(); i++) {
        const time = `${i < 10 ? '0' + i : i}:00`;
        const likes = Math.floor(Math.random() * 1000);
        const dislikes = Math.floor(Math.random() * 500);
        todayData.push(createData(time, likes, dislikes));
    }
    todayData.push(createData(currentTime, undefined, undefined));
    return todayData;
};


function parseChartData(chartData, timePeriod) {
    
    if (timePeriod === 'Today') {
        return chartData.map(datapoint => {
            createData(`${datapoint.start.getHours()}:datapont.start.getMinutes()`,
                datapoint.stats.positive, datapoint.stats.positive);
        })
    } else {
        return chartData.map(datapoint => {
            createData(`${datapoint.start.getMonth() + 1}/${datapoint.start.getMinutes()}`,
                datapoint.stats.positive, datapoint.stats.positive);
        })
    }
}

export default function Chart({ timePeriods, selectedPeriod, setSelectedPeriod, chartData }) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <React.Fragment>
            <Title>

                <Button onClick={handleClick} size="small">
                    {selectedPeriod}
                </Button>
            </Title>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {timePeriods.map(p => (
                    <MenuItem onClick={() => setSelectedPeriod(p)}>{p}</MenuItem>
                ))}
            </Menu>
            <ResponsiveContainer>
                <LineChart
                    data={parseChartData(chartData, selectedPeriod)}
                    margin={{
                        top: 16,
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
                    <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey="likes"
                        stroke={theme.palette.primary.main}
                        dot={false}
                    />
                    <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey="dislikes"
                        stroke="#FF0000" // Custom shade of red for dislikes
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
}
