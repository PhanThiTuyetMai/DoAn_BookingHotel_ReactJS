import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import API, { endpoints } from '../../configs/API';
import { useNavigate, useParams } from 'react-router-dom';
import './css/Booking.css';
import MyContext from '../../configs/MyContext';
import { Modal, Button } from 'react-bootstrap';

const BookingPage = () => {
    const navigate = useNavigate(); 
    const [state] = useContext(MyContext);
    const { user } = state;
    const { idhotel, idroom, giaphong, giatreem, giathucung, phithemtre, phithemthu } = useParams();
    const [vouchers, setVouchers] = useState([]);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [rooms, setRooms] = useState(0);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Trực tiếp');
    const [customerId, setCustomerId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchVouchers();
        // fetchCustomers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await API.get(endpoints['voucher']);
            setVouchers(response.data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    };

    // const fetchCustomers = async () => {
    //     try {
    //         const response = await API.get(endpoints['customer']);
    //         const currentCustomer = response.data.results.find(customer => customer.user === user.id);
    //         if (currentCustomer) {
    //             setCustomerId(currentCustomer.id); 
    //         }
    //     } catch (error) {
    //         console.error('Error fetching customers:', error);
    //     }
    // };

    const checkCustomerExists = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get(endpoints['customer'], {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const currentCustomer = response.data.results.find(customer => customer.user === user.id);
            if (currentCustomer) {
                setCustomerId(currentCustomer.id);
                return true; // Khách hàng đã tồn tại
            } else {
                return false; // Khách hàng không tồn tại
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            return false; // Nếu có lỗi, coi như khách hàng không tồn tại
        }
    };

    const handleBooking = async () => {
        const customerExists = await checkCustomerExists();
        
        if (!customerExists) {
            setShowModal(true); 
            return;
        }

        if (!checkInDate || !checkOutDate || rooms <= 0) {
            toast.error("Vui lòng điền đầy đủ thông tin đặt phòng.");
            return;
        }

        const bookingData = {
            hotel: parseInt(idhotel),
            hotel_rom: parseInt(idroom),
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            total_amount: totalAmount.toString(),
            payment_method: paymentMethod,
            voucher: selectedVoucher ? selectedVoucher.id : null,
            adults: rooms, 
            children: children,
            pets: pets,
            customer: customerId,
        };
    
        try {
            const response = await API.post(endpoints['booking'], bookingData);
            if (response.status === 201) {
                const bookingId = response.data.id; // Lấy ID của booking

                // Tạo booking rooms
                const bookingRoomsData = Array.from({ length: rooms }, () => ({
                    discount_price: selectedVoucher ? selectedVoucher.discount_amount : 0,
                    rom: idroom,
                    booking: bookingId,
                }));

                // Gửi yêu cầu tạo booking rooms
                await Promise.all(
                    bookingRoomsData.map(room => API.post(endpoints['them_booking_room'], room))
                );
    
                toast.success("Đặt phòng và thêm phòng thành công!");
                // cho nó qua trang lịch sử đặt phòng
                navigate('/')
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error("Có lỗi xảy ra trong quá trình đặt phòng.");
        }
    };

    const handleCompleteProfile = () => {
        setShowModal(false);
        navigate('/profile')
    };

    const calculateTotalAmount = () => {
        if (!checkInDate || !checkOutDate || rooms <= 0) return;

        const basePrice = parseFloat(giaphong) || 0; // Giá phòng
        const checkIn = new Date(checkInDate); // Ngày nhận phòng
        const checkOut = new Date(checkOutDate); // Ngày trả phòng
        const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Số đêm lưu trú
    
        let amount = basePrice * numberOfNights * rooms; // Tổng tiền từ số phòng và số đêm

        // Nếu có trẻ em
        if (children > 0) {
            amount += parseFloat(giatreem); 
            amount += (children - 1) * parseFloat(phithemtre); 
        }

        // Nếu có thú cưng
        if (pets > 0) {
            amount += parseFloat(giathucung); // Phí cho thú cưng đầu tiên
            amount += (pets - 1) * parseFloat(phithemthu); // Phí cho thú cưng còn lại
        }

        if (selectedVoucher) {
            const discount = parseFloat(selectedVoucher.discount_amount) || 0;
            amount -= discount; // Giảm giá
        }
    
        setTotalAmount(amount > 0 ? amount : 0);
    };

    const handlePaymentMoMo = async (totalAmount) => {
        console.log(totalAmount);
        try {
            const response = await API.post(endpoints['momo'], null, {
                headers: { amount: totalAmount.toString() }
            });
            if (response.data.payUrl) {
                window.open(response.data.payUrl, '_blank');
            } else {
                toast.error('Có lỗi xảy ra khi tạo đơn hàng MoMo. Vui lòng thử lại sau!');
            }
        } catch (error) {
            console.error('Error handling MoMo payment:', error);
            toast.error('Có lỗi xảy ra khi tạo đơn hàng MoMo. Vui lòng thử lại sau!');
        }
    };

    const handlePaymentZalo = async (totalAmount) => {
        try {
            const response = await API.post(endpoints['zalo'], null, {
                headers: { amount: totalAmount.toString() }
            });
            if (response.data.order_url) {
                window.open(response.data.order_url, '_blank');
            } else {
                toast.error('Có lỗi xảy ra khi tạo đơn hàng Zalo. Vui lòng thử lại sau!');
            }
        } catch (error) {
            console.error('Error handling Zalo payment:', error);
            toast.error('Có lỗi xảy ra khi tạo đơn hàng Zalo. Vui lòng thử lại sau!');
        }
    };
    
    useEffect(() => {
        calculateTotalAmount();
    }, [selectedVoucher, rooms, children, pets, checkInDate, checkOutDate]);

    return (
        <div className="booking-page">
            <h2>Đặt Phòng</h2>
            <div className="form-group">
                <label>Ngày nhận phòng:</label>
                <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Ngày trả phòng:</label>
                <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Số phòng:</label>
                <input type="number" value={rooms} min="0" onChange={(e) => setRooms(parseInt(e.target.value) || 0)} />
            </div>
            {giatreem > 0 && (
                <div className="form-group">
                    <label>Trẻ em:</label>
                    <input type="number" value={children} min="0" onChange={(e) => setChildren(parseInt(e.target.value) || 0)} />
                </div>
            )}
            {giathucung > 0 && (
                <div className="form-group">
                    <label>Thú cưng:</label>
                    <input type="number" value={pets} min="0" onChange={(e) => setPets(parseInt(e.target.value) || 0)} />
                </div>
            )}
            <div className="voucher-section">
                <h3>Chọn Mã Khuyến Mãi</h3>
                {vouchers.length > 0 ? (
                    <div className="voucher-list">
                        {vouchers.map((voucher) => (
                            <div
                                key={voucher.id}
                                className={`voucher-item ${selectedVoucher && selectedVoucher.id === voucher.id ? 'selected' : ''}`}
                                onClick={() => {
                                    if (selectedVoucher && selectedVoucher.id === voucher.id) {
                                        setSelectedVoucher(null);
                                    } else {
                                        setSelectedVoucher(voucher);
                                    }
                                }}
                            >
                                <div className="voucher-code">{voucher.code}</div>
                                <div className="voucher-discount">Giảm: {voucher.discount_amount} VNĐ</div>
                                <div className="voucher-conditions">Áp dụng cho hóa đơn từ: {voucher.min_booking_amount} VNĐ</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Không có mã khuyến mãi nào.</p>
                )}
            </div>
            <div className="form-group">
                <label>Phương thức thanh toán:</label>
                <select onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Trực tiếp">Trực tiếp</option>
                    <option value="MoMo">MoMo</option>
                    <option value="Zalo">Zalo</option>
                </select>
            </div>
                            <p className="total-amount">
                    Tổng số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </p>

                {paymentMethod === 'MoMo' ? (
                    <button 
                        className="payment-button" 
                        onClick={() => handlePaymentMoMo(totalAmount)}
                    >
                        Thanh Toán bằng MoMo
                    </button>
                ) : paymentMethod === 'Zalo' ? (
                    <button 
                        className="payment-button" 
                        onClick={() => handlePaymentZalo(totalAmount)}
                    >
                        Thanh Toán bằng Zalo
                    </button>
                ) : (
                    <button className="booking-button" onClick={handleBooking}>Đặt Phòng</button>
                )}

                <span 
                    className="back-link" 
                    onClick={() => window.history.back()}
                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                >
                    Quay Về
                </span>

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Thông Báo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Vui lòng hoàn tất thông tin cá nhân của bạn trước khi đặt phòng.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleCompleteProfile}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
};

export default BookingPage;
