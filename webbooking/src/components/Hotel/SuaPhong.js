import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../configs/API';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditHotelRoom = () => {
    const { idphong } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        name: '',
        bed_quality: '',
        price_adult: '',
        price_child: '',
        price_pet: '',
        description: '',
        image: null,
        total_rooms: 0,
        additional_child_fee: 0,
        additional_pet_fee: 0,
        applies_additional_child_fee: false,
        applies_additional_pet_fee: false,
        available_rooms: 0,
    });
    
    const [oldImageUrl, setOldImageUrl] = useState(''); 
    const [newImageUrl, setNewImageUrl] = useState(''); 
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await API.get(`${endpoints['room']}?ma=${idphong}`);
                const roomData = response.data.results[0];
                const roomImages = await API.get(`${endpoints['roomimages']}?maroom=${idphong}`);
                setImages(roomImages.data);
                console.log(roomImages.data)
                setFormData(roomData);
                if (roomData.image) {
                    setOldImageUrl(roomData.image); 
                }
            } catch (error) {
                console.error('Error fetching room data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [idphong]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
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
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        const token = localStorage.getItem('access_token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        };
        await API.patch(`${endpoints['room']}${idphong}/sua_phong/`, data, {headers});

        for (let i = 0; i < images.length; i++) {
            if (images[i].file) {
                const imageData = new FormData();
                imageData.append('image', images[i].file);
                await API.put(`${endpoints['roomimages']}${images[i].id}/sua_anhphong/`, imageData);
                toast.success(`Cập nhật ảnh phụ ${i + 1} thành công`);
            }
        }

        toast.success('Cập nhật thành công');
        setTimeout(() => {
            navigate(`/hotel`);
        }, 4000); 
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            await API.delete(`${endpoints['room']}${idphong}/xoa_phong/`, {headers});
            toast.success('Xóa phòng thành công');
            navigate('/hotel'); 
        } catch (error) {
            console.error('Error deleting room:', error);
            toast.error('Xóa phòng thất bại');
        } finally {
            setShowModal(false); 
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Sửa Thông Tin Phòng: {formData.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Bed Quality:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="bed_quality"
                        value={formData.bed_quality}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Price Adult:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price_adult"
                        value={formData.price_adult}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Price Child:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price_child"
                        value={formData.price_child}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Price Pet:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price_pet"
                        value={formData.price_pet}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description:</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
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
                <div className="mb-3">
                    <label className="form-label">Total Rooms:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="total_rooms"
                        value={formData.total_rooms}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Available Rooms:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="available_rooms"
                        value={formData.available_rooms}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            type='checkbox'
                            name='applies_additional_child_fee'
                            id='additionalChildFee'
                            className="checkbox-input"
                            checked={formData.applies_additional_child_fee}
                            onChange={handleChange}
                        />
                        <span className="checkbox-custom" />
                        <label htmlFor='additionalChildFee'>Áp dụng phí thêm cho trẻ em</label>
                    </div>
                </div>
                {formData.applies_additional_child_fee && (
                    <div className="mb-3">
                        <label className="form-label">Additional Child Fee:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="additional_child_fee"
                            value={formData.additional_child_fee}
                            onChange={handleChange}
                        />
                    </div>
                )}
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            type='checkbox'
                            name='applies_additional_pet_fee'
                            id='additionalPetFee'
                            className="checkbox-input"
                            checked={formData.applies_additional_pet_fee}
                            onChange={handleChange}
                        />
                        <span className="checkbox-custom" />
                        <label htmlFor='additionalPetFee'>Áp dụng phí thêm cho thú cưng</label>
                    </div>
                </div>
                {formData.applies_additional_pet_fee && (
                    <div className="mb-3">
                        <label className="form-label">Additional Pet Fee:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="additional_pet_fee"
                            value={formData.additional_pet_fee}
                            onChange={handleChange}
                        />
                    </div>
                )}
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
                <div className="row mt-3">
                    <div className="col">
                        <button type="submit" className="btn btn-primary">Lưu</button>
                    </div>
                    <div className="col text-end">
                    <button type="button" className="btn btn-danger" onClick={() => setShowModal(true)}>Xóa</button>
                    </div>
                </div>
            </form>
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Xác Nhận Xóa</h5>
                        </div>
                        <div className="modal-body">
                            <p>Bạn có chắc chắn muốn xóa phòng này không?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Không</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Đồng Ý</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditHotelRoom;
