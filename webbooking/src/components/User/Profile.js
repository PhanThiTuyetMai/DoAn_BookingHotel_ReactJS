import React, { useContext, useEffect, useState } from 'react';
import MyContext from '../../configs/MyContext';
import API, { endpoints } from '../../configs/API';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import { CardMedia } from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddCustomer = () => {
    const [state] = useContext(MyContext);
    const { user } = state;
    const [page, setPage] = useState(1);
    const [pageR, setPageR] = useState(1);
    const [customers, setCustomers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [cancelableBookings, setCancelableBookings] = useState([]);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedHotelId, setSelectedHotelId] = useState(null);
    const [formData, setFormData] = useState({
        active: 1,
        user: user.id,
        name: '',
        birthday: '',
        sex: '',
        address: '',
        cccd: '',
        phone: '',
        email: '',
        avatar: null,
    });

    const [commentData, setCommentData] = useState({
        content: '',
        cleanliness_rating: '', 
        comfort_rating: '',
        food_rating: '',
        location_rating: '',
        service_rating: '',
    });
    
    const [showForm, setShowForm] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [existingCustomer, setExistingCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false); 
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                let allCustomers = [];
                let hasMore = true;
                if (page === 0) {
                    return;
                }
                while (hasMore) {
                    const token = localStorage.getItem('access_token');
                    const response = await API.get(`${endpoints['customer']}?page=${page}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
    
                    allCustomers = [...allCustomers, ...response.data.results];
    
                    if (!response.data.next) {
                        hasMore = false; // Dừng lại nếu không còn trang
                    } else {
                        setPage(prevPage => prevPage + 1); // Tăng trang cho lần gọi tiếp theo
                    }
                }
                
                setCustomers(allCustomers);
    
                const customer = allCustomers.find(cust => cust.user === user.id);
                console.log(user.id)
                setExistingCustomer(customer);
            
                // Cập nhật dữ liệu biểu mẫu nếu tìm thấy khách hàng
                if (customer) {
                    setFormData({
                        ...formData,
                        name: customer.name,
                        birthday: customer.birthday,
                        sex: customer.sex,
                        address: customer.address,
                        cccd: customer.cccd,
                        phone: customer.phone,
                        email: customer.email,
                    });
                    setAvatarUrl(customer.avatar);
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        };
    
        fetchCustomers();
    }, [user.id, page]); 
    

    useEffect(() => {
        const fetchHotelsAndRooms = async () => {
            try {
                let hasMore = true;
                let allHotels = [];
                let allRooms = [];
                while (hasMore) {
                    const hotelResponse = await API.get(`${endpoints['hotels']}?page=${page}`);
                    allHotels = [...allHotels, ...hotelResponse.data.results];
                    setHotels(allHotels);
                    const roomResponse = await API.get(`${endpoints['room']}?page=${pageR}`);
                    allRooms = [...allRooms, ...roomResponse.data.results]
                    setRooms(allRooms);
    
                    if (!hotelResponse.data.next) {
                        hasMore = false; 
                    } else {
                        setPage(prevPage => prevPage + 1); 
                    }

                    if (!roomResponse.data.next) {
                        hasMore = false; 
                    } else {
                        setPageR(prevPage => prevPage + 1); 
                    }
                }
            } catch (error) {
                console.error('Error fetching hotels and rooms:', error);
            }
        };
        fetchHotelsAndRooms();
    }, [page, pageR]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (existingCustomer) {
                try {
                    const response = await API.get(`${endpoints['booking']}?customer_id=${existingCustomer.id}`);
                    const currentTime = new Date();
    
                    const bookingsWithTimeout = response.data.map(booking => {
                        const isCancelable = new Date(booking.cancelable_until) > currentTime;
    
                        return { ...booking, isCancelable };
                    });
    
                    setBookings(bookingsWithTimeout);
                    setCancelableBookings(bookingsWithTimeout.filter(b => b.isCancelable));
                } catch (error) {
                    console.error('Error fetching bookings:', error);
                }
            }
        };
        fetchBookings();
    }, [existingCustomer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, avatar: file });
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }

        try {
            let response;
            const token = localStorage.getItem('access_token');
            if (existingCustomer) {
                response = await API.put(`${endpoints['customer']}${existingCustomer.id}/sua_kh/`, formDataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success("Cập nhật thông tin khách hàng thành công!");
            } else {
                response = await API.post(endpoints['add_customer'], formDataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success("Thêm khách hàng thành công!");
            }
            console.log('Customer updated:', response.data);
            setShowForm(false);
            setCustomers([...customers, response.data]);
            setShowModal(true); 
        } catch (error) {
            console.error('Error saving customer!', error);
            toast.error("Có lỗi xảy ra!");
        }
    };


    const handleCommentChange = (e) => {
        const { name, value } = e.target;
        setCommentData({ ...commentData, [name]: value });
    };
    
    const handleSubmitComment = async () => {
        console.log(commentData.cleanliness_rating);
        if (!commentData.content || 
            !commentData.cleanliness_rating || 
            !commentData.comfort_rating || 
            !commentData.food_rating || 
            !commentData.location_rating || 
            !commentData.service_rating) {
            toast.error("Vui lòng điền tất cả các trường!");
            return;
        }
    
        try {
            const avg = (
                parseFloat(commentData.cleanliness_rating) + 
                parseFloat(commentData.comfort_rating) + 
                parseFloat(commentData.food_rating) + 
                parseFloat(commentData.location_rating) + 
                parseFloat(commentData.service_rating)
            ) / 5;
            
            const roundedAvg = avg.toFixed(1);
            
            let accessToken = localStorage.getItem("access_token");

            await API.post(`${endpoints['hotels']}${selectedHotelId}/them_comments/`, {
                hotel: parseInt(selectedHotelId),
                user: parseInt(user.id),
                average_rating: roundedAvg,
                ...commentData,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
    
            toast.success("Bình luận đã được gửi thành công!");
            handleCloseCommentModal(); 
        } catch (error) {
            console.error('Error submitting comment:', error);
            toast.error("Có lỗi xảy ra khi gửi bình luận!");
        }
    };

    const handleShowCommentModal = (hotelId) => {
        setSelectedHotelId(hotelId);
        setShowCommentModal(true);
    };
    
    const handleCloseCommentModal = () => {
        setShowCommentModal(false);
        setSelectedHotelId(null); 
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/'); 
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const response = await API.delete(`${endpoints['list_booking']}${bookingId}/xoa_booking/`);
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            setCancelableBookings(prev => prev.filter(b => b.id !== bookingId));
            if (response.status === 200){
                toast.success("Hủy đơn hàng thành công!");
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            toast.error("Không hủy đơn hàng được!");
        }
    };

    const formattedBirthday = existingCustomer?.birthday 
        ? format(new Date(existingCustomer.birthday), 'dd/MM/yyyy') 
        : '';

    return (
        <div className="container">
            <h1 className="mt-4 mb-4 text-center">XIN CHÀO BẠN {user.username.toUpperCase()}</h1>
            {existingCustomer ? (
                <div className="card p-3 text-center">
                    <h2 className="card-title">Thông Tin Khách Hàng</h2>
                    <div className="card-body d-flex justify-content-center align-items-center">
                        {existingCustomer.avatar && (
                            <CardMedia
                                component="img"
                                image={existingCustomer.avatar}
                                alt="Avatar"
                                className="img-fluid rounded-circle"
                                style={{ width: '30%', height: 'auto', marginRight: '80px' }}
                            />
                        )}
                        <div className="text-start">
                            <p><strong>Tên:</strong> {existingCustomer.name}</p>
                            <p><strong>Ngày Sinh:</strong> {formattedBirthday}</p>
                            <p><strong>Giới Tính:</strong> {existingCustomer.sex}</p>
                            <p><strong>Địa Chỉ:</strong> {existingCustomer.address}</p>
                            <p><strong>CCCD:</strong> {existingCustomer.cccd}</p>
                            <p><strong>Điện Thoại:</strong> {existingCustomer.phone}</p>
                            <p><strong>Email:</strong> {existingCustomer.email}</p>
                        </div>
                    </div>
                    <br></br><br></br>
                    <Button variant="warning" onClick={() => {
                        setShowForm(true);
                        setAvatarUrl(existingCustomer.avatar); 
                    }}>Sửa Thông Tin</Button>
                    <br></br><br></br>
                    {showForm && (
                        <form onSubmit={handleSubmit} className="mt-3">
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="date" className="form-control mx-auto" style={{ width: '50%' }} name="birthday" value={formData.birthday} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <select name="sex" className="form-select mx-auto" style={{ width: '50%' }} value={formData.sex} onChange={handleChange} required>
                                    <option value="">Giới Tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="cccd" placeholder="CCCD" value={formData.cccd} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="email" className="form-control mx-auto" style={{ width: '50%' }} name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="file" className="form-control mx-auto" style={{ width: '50%' }} name="avatar" onChange={handleFileChange} />
                            </div>
                            {avatarUrl && (
                                <CardMedia
                                    component="img"
                                    image={avatarUrl}
                                    alt="Avatar"
                                    className="img-fluid rounded-circle mx-auto"
                                    style={{ width: '30%', height: 'auto', marginTop: 10 }}
                                />
                            )}
                            <div className="text-center">
                                <button type="submit" className="btn btn-success">Cập Nhật Thông Tin</button>
                            </div>
                        </form>
                    )}

                    <div className="row">
                        <h3 style={{fontSize: 28, color:'red', marginBottom: '25px', marginTop: '25px' }}>Lịch Sử Đơn Hàng</h3>
                        {bookings.map(booking => {
                            const hotel = hotels.find(h => h.id === booking.hotel);
                            const room = rooms.find(r => r.id === booking.hotel_rom);
                            console.log(rooms);
                            return (
                                <div className="col-md-4 mb-4" key={booking.id}>
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">Phòng: {room ? room.name : 'Không tìm thấy phòng'}</h5>
                                            <p className="card-text"><strong>Khách Sạn:</strong> {hotel ? hotel.hotel_name : 'Không tìm thấy khách sạn'}</p>
                                            <p className="card-text"><strong>Ngày Nhận:</strong> {booking.check_in_date}</p>
                                            <p className="card-text"><strong>Ngày Trả:</strong> {booking.check_out_date}</p>
                                            <p className="card-text">
                                                <strong>Trạng Thái:</strong> 
                                                {booking.is_checked_out ? ' Đã trả phòng' : ' Chưa trả phòng'}
                                            </p>
                                            {!booking.is_checked_out && cancelableBookings.find(b => b.id === booking.id) && (
                                                <div>
                                                    <p>Bạn có 1 phút để hủy đơn hàng</p>
                                                    <Button 
                                                        variant="danger" 
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                    >
                                                       Hủy Đặt
                                                    </Button>
                                                </div>
                                            )}
                                            {booking.is_checked_out && (
                                                <Button variant="primary" onClick={() => handleShowCommentModal(booking.hotel)}>
                                                    Bình luận
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center mb-3">
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>Thêm thông tin liên lạc</button>
                    {showForm && (
                        <form onSubmit={handleSubmit} className="mt-3">
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="date" className="form-control mx-auto" style={{ width: '50%' }} name="birthday" value={formData.birthday} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <select name="sex" className="form-select mx-auto" style={{ width: '50%' }} value={formData.sex} onChange={handleChange} required>
                                    <option value="">Giới Tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="cccd" placeholder="CCCD" value={formData.cccd} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="text" className="form-control mx-auto" style={{ width: '50%' }} name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="email" className="form-control mx-auto" style={{ width: '50%' }} name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3 text-center">
                                <input type="file" className="form-control mx-auto" style={{ width: '50%' }} name="avatar" onChange={handleFileChange} />
                            </div>
                            {avatarUrl && (
                                <CardMedia
                                    component="img"
                                    image={avatarUrl}
                                    alt="Avatar"
                                    className="img-fluid rounded-circle mx-auto"
                                    style={{ width: '30%', height: 'auto', marginTop: 10 }}
                                />
                            )}
                            <div className="text-center">
                                <button type="submit" className="btn btn-success">Thêm Thông Tin</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thông Báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>Thêm hoặc cập nhật khách hàng thành công!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCommentModal} onHide={handleCloseCommentModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Bình luận về khách sạn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Nội dung bình luận</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                name="content"
                                value={commentData.content}
                                onChange={handleCommentChange}
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Cleanliness:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                min="1" 
                                max="5" 
                                step="0.1" 
                                name="cleanliness_rating" 
                                value={commentData.cleanliness_rating}
                                onChange={handleCommentChange} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Comfort:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                min="1" 
                                max="5" 
                                step="0.1" 
                                name="comfort_rating" 
                                value={commentData.comfort_rating}
                                onChange={handleCommentChange} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Food:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                min="1" 
                                max="5" 
                                step="0.1" 
                                name="food_rating" 
                                value={commentData.food_rating}
                                onChange={handleCommentChange} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Location:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                min="1" 
                                max="5" 
                                step="0.1" 
                                name="location_rating" 
                                value={commentData.location_rating}
                                onChange={handleCommentChange} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Service:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                min="1" 
                                max="5" 
                                step="0.1" 
                                name="service_rating" 
                                value={commentData.service_rating}
                                onChange={handleCommentChange} 
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseCommentModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleSubmitComment}>
                        Gửi
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AddCustomer;

