import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import MyContext from '../../configs/MyContext';
import API, { endpoints } from '../../configs/API';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThongKeDT = () => {
    const [state] = useContext(MyContext);
    const { user } = state;
    const [selectedOption, setSelectedOption] = useState('year');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [roomRevenueData, setRoomRevenueData] = useState({});
    const [labels, setLabels] = useState([]);

    // Lấy danh sách loại phòng
    const [roomTypes, setRoomTypes] = useState({});

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const roomTypeRes = await API.get(endpoints['typeroom']);
                const roomTypeData = roomTypeRes.data;
                const roomTypeMap = {};
                roomTypeData.forEach(type => {
                    roomTypeMap[type.id] = type.name; // Lưu trữ loại phòng theo id
                });
                setRoomTypes(roomTypeMap);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách loại phòng:', error);
            }
        };
    
        fetchRoomTypes();
    }, []);

    // Tính doanh thu theo loại phòng
    useEffect(() => {
        setRoomRevenueData({});  // Reset dữ liệu doanh thu
        setLabels([]);  // Reset nhãn
        tinhDoanhThu(selectedOption);
    }, [selectedOption, selectedYear, selectedMonth, roomTypes]);

    const tinhDoanhThu = async (option) => {
        try {
            const hotelRes = await API.get(endpoints['hotels']);
            const hotels = hotelRes.data.results.filter(hotel => hotel.user === user.id);
            const revenueData = {};
            const processedBookings = new Set(); // Set để theo dõi các booking đã xử lý
    
            for (const hotel of hotels) {
                const roomRes = await API.get(`${endpoints['room']}?mahotel=${hotel.id}`);
                const rooms = roomRes.data.results;
    
                for (const room of rooms) {
                    const bookingRes = await API.get(`${endpoints['list_booking']}?room_id=${room.id}`);
                    const bookings = bookingRes.data;
    
                    bookings.forEach((booking) => {
                        if (processedBookings.has(booking.id) || booking.is_canceled) return;
    
                        const date = new Date(booking.created_date);
                        const revenue = parseInt(booking.total_amount);
                        const roomTypeName = roomTypes[room.type];
    
                       
                        console.log(`Booking: ${booking.id}, Date: ${date}, Revenue: ${revenue}, RoomType: ${roomTypeName}`);
    
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1; 
                        const quarter = Math.ceil(month / 3); 
    
                        if (option === 'year' && year === selectedYear) {
                            if (!revenueData[roomTypeName]) revenueData[roomTypeName] = 0;
                            revenueData[roomTypeName] += revenue;
                        } else if (option === 'month' && year === selectedYear && month === selectedMonth) {
                            if (!revenueData[roomTypeName]) revenueData[roomTypeName] = 0;
                            revenueData[roomTypeName] += revenue;
                        } else if (option === 'quarter' && year === selectedYear && quarter === Math.ceil(selectedMonth / 3)) {
                            if (!revenueData[roomTypeName]) revenueData[roomTypeName] = 0;
                            revenueData[roomTypeName] += revenue;
                        }
    
                        processedBookings.add(booking.id);
                    });
                }
            }
    
            console.log('Revenue Data:', revenueData); 
            setRoomRevenueData(revenueData);
            setLabels(Object.keys(revenueData));
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            setRoomRevenueData({});
            setLabels([]);
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


    const formatLabel = (roomType, year, month, date) => {
        const formattedDate = date ? ` ${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : '';
        if (selectedOption === 'month') {
            return `${roomType} - Tháng ${month}/${year}${formattedDate}`;
        } else if (selectedOption === 'quarter') {
            const quarter = Math.ceil(month / 3);
            return `${roomType} - Quý ${quarter} ${year}${formattedDate}`;
        } else {
            return `${roomType} - ${year}${formattedDate}`;
        }
    };

    return (
        <Container style={{ marginTop: 20 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                THỐNG KÊ DOANH THU THEO LOẠI PHÒNG
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

            <Bar
                data={{
                    labels: Object.keys(roomRevenueData).map(roomType => {
                        const date = new Date(); // Cập nhật thời gian tại đây, nếu cần
                        return formatLabel(roomType, selectedYear, selectedMonth, date);
                    }),
                    datasets: [
                        {
                            label: 'Doanh Thu',
                            data: Object.values(roomRevenueData),
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
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: VNĐ ${context.raw}`;
                                },
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'VNĐ',
                            },
                        },
                    },
                }}
                width={600}
                height={400}
            />

            <TableContainer component={Paper} style={{ marginTop: 20 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Loại Phòng</TableCell>
                            <TableCell>Doanh thu (VNĐ)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(roomRevenueData).map(([key, value], index) => (
                            <TableRow key={index}>
                                <TableCell>{key}</TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ThongKeDT;
