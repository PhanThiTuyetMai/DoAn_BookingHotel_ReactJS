import React, { useState, useEffect } from 'react';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API, { endpoints } from '../../configs/API';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThongKeQL = () => {
    const [selectedOption, setSelectedOption] = useState('year');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [data, setData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [hotelDensityData, setHotelDensityData] = useState({});
    const [densityLabels, setDensityLabels] = useState([]);

    useEffect(() => {
        tinhDoanhThu(selectedOption);
        fetchHotelDensity();
    }, [selectedOption, selectedYear, selectedMonth]);

    const tinhDoanhThu = async (option) => {
        try {
            const bookingRes = await API.get(endpoints['list_booking']);
            const bookings = bookingRes.data;
            const revenueData = {};
    
            bookings.forEach((booking) => {
                if (booking.is_canceled) return;
                const date = new Date(booking.created_date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const quarter = Math.ceil(month / 3);
                const revenue = parseInt(booking.total_amount);
    
                if (option === 'year') {
                    const label = `${year}`;
                    if (!revenueData[label]) {
                        revenueData[label] = 0;
                    }
                    revenueData[label] += revenue;
                } else if (option === 'month' && year === selectedYear && month === selectedMonth) {
                    const label = `${year}-${month < 10 ? '0' : ''}${month}`;
                    if (!revenueData[label]) {
                        revenueData[label] = 0;
                    }
                    revenueData[label] += revenue;
                } else if (option === 'quarter' && year === selectedYear && quarter === Math.ceil(selectedMonth / 3)) {
                    const label = `${year}-Quý${quarter}`;
                    if (!revenueData[label]) {
                        revenueData[label] = 0;
                    }
                    revenueData[label] += revenue;
                }
            });
    
            setData(Object.values(revenueData));
            setLabels(Object.keys(revenueData));
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            setData([]);
            setLabels([]);
        }
    };    

    const fetchHotelDensity = async () => {
        try {
            const hotelRes = await API.get(endpoints['hotels']);
            const hotels = hotelRes.data.results;
    
            const densityMap = {};
            hotels.forEach(hotel => {
                const provinceId = hotel.province; 
                if (!densityMap[provinceId]) {
                    densityMap[provinceId] = 0;
                }
                densityMap[provinceId]++;
            });
    
            const provinceRes = await API.get(endpoints['provinces']);
            const provinceData = provinceRes.data;
    
            const provinceNameMap = {};
            provinceData.forEach(province => {
                provinceNameMap[province.id] = province.name; 
            });
    
            const densityWithNames = {};
            Object.keys(densityMap).forEach(id => {
                if (provinceNameMap[id]) {
                    densityWithNames[provinceNameMap[id]] = densityMap[id];
                }
            });
    
            setHotelDensityData(densityWithNames);
            setDensityLabels(Object.keys(densityWithNames));
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu mật độ khách sạn:', error);
            setHotelDensityData({});
            setDensityLabels([]);
        }
    };    

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Doanh Thu',
                data: data,
                backgroundColor: [
                    '#00FFFF',
                    '#1E90FF',
                    '#0000FF',
                    '#FFFF00',
                    '#FF4500',
                    '#FA8072',
                    '#FF1493',
                ],
            },
        ],
    };

    const densityChartData = {
        labels: densityLabels,
        datasets: [
            {
                label: 'Mật độ Khách sạn',
                data: Object.values(hotelDensityData),
                backgroundColor: '#FFA500',
            },
        ],
    };

    return (
        <Container style={{ marginTop: 20 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                BIỂU ĐỒ DOANH THU
            </Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel>Chọn tùy chọn</InputLabel>
                <Select value={selectedOption} onChange={handleOptionChange}>
                    <MenuItem value="quarter">Theo Quý</MenuItem>
                    <MenuItem value="year">Theo Năm</MenuItem>
                    <MenuItem value="month">Theo Tháng</MenuItem>
                </Select>
            </FormControl>
            {(selectedOption === 'month' || selectedOption === 'quarter') && (
                <FormControl fullWidth margin="normal">
                    <InputLabel>Năm</InputLabel>
                    <Select value={selectedYear} onChange={handleYearChange}>
                        {Array.from({ length: new Date().getFullYear() - 2019 }, (v, i) => (
                            <MenuItem key={2020 + i} value={2020 + i}>
                                {2020 + i}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
            {selectedOption === 'month' && (
                <FormControl fullWidth margin="normal">
                    <InputLabel>Tháng</InputLabel>
                    <Select value={selectedMonth} onChange={handleMonthChange}>
                        {Array.from({ length: 12 }, (v, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                                {i + 1}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        
            <Bar data={chartData} options={{ responsive: true }} />

            <Typography variant="h6" component="h3" gutterBottom style={{ marginTop: 20 }}>
                Mật độ Khách sạn theo Tỉnh Thành
            </Typography>
           
            <Bar data={densityChartData} options={{ responsive: true }} />

           
            <Typography variant="h6" component="h3" gutterBottom style={{ marginTop: 20 }}>
                Tổng Kết Doanh Thu
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Thời gian</TableCell>
                            <TableCell>Doanh thu (VNĐ)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {labels.map((label, index) => (
                            <TableRow key={index}>
                                <TableCell>{label}</TableCell>
                                <TableCell>{data[index]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ThongKeQL;