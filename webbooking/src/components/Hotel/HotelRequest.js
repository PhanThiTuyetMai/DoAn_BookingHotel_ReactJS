import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../configs/API';
import MyContext from '../../configs/MyContext';
import './css/ThemHotel.css';

const HotelForm = () => {
    const [state] = useContext(MyContext);
    const { user } = state;
    const [hotelData, setHotelData] = useState({
        province: '',
        hotel_name: '',
        room_quality: '',
        hotel_desc: '',
        hotel_address: '',
        hotel_phone: '',
        hotel_email: '',
        image: null,
        images: []
    });
    const [provinces, setProvinces] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await API.get(endpoints['provinces']);
                setProvinces(response.data);
            } catch (error) {
                console.error('Có lỗi xảy ra khi lấy danh sách tỉnh:', error);
                setError('Không thể lấy danh sách tỉnh/thành phố.');
            }
        };

        fetchProvinces();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setHotelData({ ...hotelData, image: files[0] });
        } else if (name === 'images') {
            setHotelData(prevState => ({
                ...prevState,
                images: [...prevState.images, ...Array.from(files)]
            }));
        } else {
            setHotelData({ ...hotelData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            setError('Bạn cần đăng nhập để thực hiện hành động này.');
            return;
        }

        const formData = new FormData();

        if (hotelData.image) {
            formData.append('image', hotelData.image);
        }

        hotelData.images.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        Object.keys(hotelData).forEach(key => {
            if (key !== 'image' && key !== 'images') {
                formData.append(key, hotelData[key]);
            }
        });

        formData.append('user', user.id);

        const token = localStorage.getItem('access_token');
        try {
            const response = await API.post(endpoints['add_hotel_request'], formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                alert('Yêu cầu tạo khách sạn đã được gửi thành công!');
                navigate('/list_request_hotel');
            }
        } catch (error) {
            console.error('Lỗi xảy ra:', error.response ? error.response.data : error.message);
            setError('Đã có lỗi xảy ra. Vui lòng kiểm tra dữ liệu và thử lại.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Tạo Khách Sạn Mới</h2>
            {error && <div className="alert alert-danger error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Tỉnh/Thành phố:</label>
                    <select
                        className="form-select"
                        name="province"
                        value={hotelData.province}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                            <option key={province.id} value={province.id}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Tên khách sạn:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="hotel_name"
                        value={hotelData.hotel_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Chất lượng phòng:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="room_quality"
                        value={hotelData.room_quality}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mô tả khách sạn:</label>
                    <textarea
                        className="form-control"
                        name="hotel_desc"
                        value={hotelData.hotel_desc}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Địa chỉ khách sạn:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="hotel_address"
                        value={hotelData.hotel_address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Số điện thoại:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="hotel_phone"
                        value={hotelData.hotel_phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        name="hotel_email"
                        value={hotelData.hotel_email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ảnh chính:</label>
                    <input
                        type="file"
                        className="form-control"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ảnh phụ:</label>
                    <input
                        type="file"
                        className="form-control"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                    />
                </div>
                <div className="main-image1 mb-3">
                    <h3>Ảnh chính:</h3>
                    {hotelData.image && (
                        <img
                            src={URL.createObjectURL(hotelData.image)}
                            alt="Ảnh chính"
                            className="img-fluid"
                        />
                    )}
                </div>

                <div>
                    <h3>Ảnh phụ:</h3>
                    <div className="img-preview">
                        {hotelData.images.map((file, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={`Ảnh phụ ${index + 1}`}
                                className="img-thumbnail"
                                style={{ width: '100px', height: 'auto', margin: '5px' }}
                            />
                        ))}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3">Tạo Khách Sạn</button>
            </form>
        </div>
    );
};

export default HotelForm;
