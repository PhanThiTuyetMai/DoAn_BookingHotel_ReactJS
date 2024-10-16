import React, { useState, useEffect } from 'react';
import API, { endpoints } from '../../configs/API';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditHotel = () => {
    const { idhotel } = useParams();
    const [hotel, setHotel] = useState(null);
    const navigate = useNavigate();
    const [oldImageUrl, setOldImageUrl] = useState(''); 
    const [newImageUrl, setNewImageUrl] = useState(''); 
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        hotel_name: '',
        rom_quality: '',
        hotel_desc: '',
        hotel_address: '',
        hotel_phone: '',
        hotel_email: '',
        image: null,
    });

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await API.get(`${endpoints['hotels']}?ma=${idhotel}`);
                const hotelData = response.data.results[0]; 
                setHotel(hotelData);
                setFormData(hotelData);
    
                // Lấy ảnh hotel
                const hotelImages = await API.get(`${endpoints['hotel_images']}?mahotel=${idhotel}`);
                setImages(hotelImages.data);
    
                // Cập nhật ảnh cũ nếu có
                if (hotelData && hotelData.image) {
                    setOldImageUrl(hotelData.image); 
                }
            } catch (error) {
                console.error('Lỗi data:', error);
                toast.error('Không thể tải dữ liệu khách sạn.');
            }
        };
        fetchHotel();
    }, [idhotel]);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    const handleFileChange = (e, index) => {
        const file = e.target.files[0]; // Lấy file đầu tiên
        console.log('File được chọn:', file);

        if (file) {
            if (index === undefined) {
                // Cập nhật ảnh chính
                setFormData({
                    ...formData,
                    image: file, // Cập nhật ảnh chính trong formData
                });
                setNewImageUrl(URL.createObjectURL(file)); // Tạo URL cho ảnh chính
            } else {
                // Cập nhật ảnh phụ
                const updatedImages = [...images];
                updatedImages[index] = {
                    ...updatedImages[index],
                    file, // Lưu file cho ảnh phụ
                    newImageUrl: URL.createObjectURL(file), // Tạo URL tạm cho ảnh phụ mới
                };
                setImages(updatedImages); // Cập nhật danh sách ảnh phụ
            }
        } else {
            if (index === undefined) {
                // Reset nếu không chọn file cho ảnh chính
                setFormData({
                    ...formData,
                    image: null,
                });
                setNewImageUrl('');
            } else {
                // Reset cho ảnh phụ nếu không chọn file
                const updatedImages = [...images];
                updatedImages[index] = {
                    ...updatedImages[index],
                    file: null,
                    newImageUrl: '',
                };
                setImages(updatedImages);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (newImageUrl) {
                URL.revokeObjectURL(newImageUrl);
            }
        };
    }, [newImageUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            };
            const response = await API.patch(`${endpoints['hotels']}${idhotel}/sua_khachsan/`, formData, {headers});

            for (let i = 0; i < images.length; i++) {
                if (images[i].file) {
                    const imageData = new FormData();
                    imageData.append('image', images[i].file);
                    await API.patch(`${endpoints['hotel_images']}${images[i].id}/sua_anhhotel/`, imageData);
                    toast.success(`Cập nhật ảnh phụ ${i + 1} thành công`);
                }
            }

            if (response.status === 200) {
                toast.success("Cập nhật thành công!");
                setTimeout(() => {
                    navigate(`/hotel`);
                }, 4000); 
            } else {
                toast.error("Có lỗi xảy ra khi cập nhật.");
            }
        } catch (error) {
            console.error(error);
            alert('Đã có lỗi xảy ra!');
        }
    };

    if (!hotel) return <div className="text-center">Loading...</div>;

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Sửa Khách Sạn</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3 border p-3 rounded shadow-sm">
                    <h4>Thông Tin Khách Sạn</h4>
                    <div className="form-group">
                        <label>Tên Khách Sạn</label>
                        <input
                            type="text"
                            name="hotel_name"
                            className="form-control"
                            value={formData.hotel_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                    <label className="form-label">Ảnh:</label>
                    {newImageUrl ? (
                        <img 
                            src={newImageUrl} 
                            alt="Xem trước phòng" 
                            style={{ maxWidth: '200px', marginBottom: '10px' }} 
                        />
                    ) : (
                        oldImageUrl && (
                            <img 
                                src={`https://res.cloudinary.com/duz2xltvs/${oldImageUrl}`} 
                                alt="Ảnh cũ" 
                                style={{ maxWidth: '200px', marginBottom: '10px' }} 
                            />
                        )
                    )}
                        <input 
                            type="file" 
                            className="form-control" 
                            name="image" 
                            onChange={handleFileChange} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Chất Lượng Phòng</label>
                        <input
                            type="text"
                            name="rom_quality"
                            className="form-control"
                            value={formData.rom_quality}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mô Tả Khách Sạn</label>
                        <textarea
                            name="hotel_desc"
                            className="form-control"
                            value={formData.hotel_desc}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Địa Chỉ Khách Sạn</label>
                        <input
                            type="text"
                            name="hotel_address"
                            className="form-control"
                            value={formData.hotel_address}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Số Điện Thoại</label>
                        <input
                            type="text"
                            name="hotel_phone"
                            className="form-control"
                            value={formData.hotel_phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="hotel_email"
                            className="form-control"
                            value={formData.hotel_email}
                            onChange={handleChange}
                        />
                    </div>
                    <h3>Ảnh Phụ:</h3>
                    {images.map((image, index) => (
                        <div key={image.id} className="mb-3">
                            {image.newImageUrl ? (
                                <img
                                    src={image.newImageUrl}
                                    alt={`Ảnh phụ ${index + 1}`}
                                    style={{ maxWidth: '200px', marginBottom: '10px' }}
                                />
                            ) : (
                                <img
                                    src={`https://res.cloudinary.com/duz2xltvs/${image.image}`}
                                    alt={`Ảnh phụ ${index + 1}`}
                                    style={{ maxWidth: '200px', marginBottom: '10px' }}
                                />
                            )}
                            <input
                                type="file"
                                className="form-control"
                                onChange={(e) => handleFileChange(e, index)}
                            />
                        </div>
                    ))}
                </div>
                <button type="submit" className="btn btn-primary btn-block">Cập Nhật</button>
            </form>
        </div>
    );
};

export default EditHotel;
