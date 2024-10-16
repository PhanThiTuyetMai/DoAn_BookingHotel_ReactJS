import React, { useState, useEffect, useContext } from 'react';
import API, { endpoints } from '../../configs/API';
import { Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import MyContext from '../../configs/MyContext';

const ConfirmCheckout = () => {
    const [state] = useContext(MyContext);
    const { user } = state;
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [hotelId, setHotelId] = useState(null);

    useEffect(() => {
        const fetchHotelsAndRooms = async () => {
            try {
                const hotelsResponse = await API.get(endpoints['hotels']);
                const hotels = hotelsResponse.data.results || [];
                
                const currentHotel = hotels.find(hotel => hotel.user === user.id); 
                if (currentHotel) {
                    setHotelId(currentHotel.id);
                    
                    const roomsResponse = await API.get(endpoints['room']);
                    const allRooms = roomsResponse.data.results || [];
                    
                    const filteredRooms = allRooms.filter(room => room.hotel === currentHotel.id);
                    setRooms(filteredRooms);
                }
             
                const bookingsResponse = await API.get(endpoints['booking']);
                const fetchedBookings = bookingsResponse.data || [];
                setBookings(fetchedBookings);
            } catch (error) {
                setMessage('Không thể lấy dữ liệu phòng hoặc booking.');
                console.error(error);
            }
        };

        fetchHotelsAndRooms();
    }, [user]);

    const handleConfirmCheckout = async (roomId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            const response = await API.post(`${endpoints['room']}${roomId}/confirm-checkout/`, {headers});
            if (response.data.success) {
                setMessage(`Khách đã trả phòng. Số phòng có sẵn hiện tại: ${response.data.available_rooms}`);
                setBookings(prevBookings => 
                    prevBookings.map(booking => 
                        booking.hotel_rom === roomId ? { ...booking, is_checked_out: true } : booking
                    )
                );
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

   
    const groupedBookings = bookings.reduce((acc, booking) => {
        const roomId = booking.hotel_rom;
        if (!acc[roomId] && !booking.is_checked_out) {  
            acc[roomId] = [];
        }
        if (!booking.is_checked_out) {  
            acc[roomId].push(booking);
        }
        return acc;
    }, {});

    return (
        <Container>
            <h2 className="my-4">Xác Nhận Khách Đã Trả Phòng</h2>
            {message && <Alert variant="danger">{message}</Alert>}
            <Row>
                {rooms.map(room => {
                    const roomBookings = groupedBookings[room.id] || [];
                    return (
                        <Col md={4} key={room.id} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{room.name}</Card.Title>
                                    {roomBookings.length > 0 ? (
                                        roomBookings.map(booking => (
                                            <div key={booking.id}>
                                                <Card.Text>
                                                    Ngày nhận: {booking.check_in_date}<br />
                                                    Ngày trả: {booking.check_out_date}
                                                </Card.Text>
                                                <Button 
                                                    variant="primary" 
                                                    onClick={() => handleConfirmCheckout(room.id)} 
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Đang xác nhận...' : 'Xác Nhận'}
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <Card.Text>Phòng này không có khách nào đang thuê.</Card.Text>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};

export default ConfirmCheckout;
