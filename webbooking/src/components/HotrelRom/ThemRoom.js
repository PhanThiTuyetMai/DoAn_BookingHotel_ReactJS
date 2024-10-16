import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../configs/API';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import './css/ThemPhong.css'

const AddHotelRoomForm = () => {
    const { idhotel } = useParams();
    console.log(idhotel);
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState({
        hotel: idhotel,
        type: '',
        name: '',
        bed_quality: '',
        price_adult: '',
        price_child: '',
        price_pet: '',
        description: '',
        total_rooms: 0,
        additional_child_fee: '',
        additional_pet_fee: '',
        applies_additional_child_fee: false, 
        applies_additional_pet_fee: false,  
        available_rooms: 0,
        images: [],
        image: null,
    });
    const [roomTypes, setRoomTypes] = useState([]);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await API.get(endpoints['typeroom']);
                setRoomTypes(response.data);
            } catch (error) {
                console.error("Error fetching room types", error);
                toast.error("Không thể tải loại phòng.");
            }
        };

        fetchRoomTypes();
    }, []);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        console.log(name, type, checked); 
        setRoomData((prevState) => {
            const newState = {
                ...prevState,
                [name]: type === 'checkbox' ? checked : value,
            };
    
            if (name === 'available_rooms') {
                newState.total_rooms = value; 
            }
            return newState;
        });

    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (name === 'image') {
            const file = files[0];
            if (file) {
                setRoomData({ ...roomData, image: file });
            }
        } else if (name === 'images') {
            const newImages = Array.from(files).slice(0, 5); 
            setRoomData(prevState => ({
                ...prevState,
                images: [...prevState.images, ...newImages]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        console.log(roomData.type);
        if (roomData.image) {
            formData.append('image', roomData.image);
        }
        roomData.images.forEach((img) => {
            formData.append('images', img);
        });
        for (const key in roomData) {
            if (key !== 'image' && key !== 'images') {
                formData.append(key, roomData[key]);
            }
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await API.post(endpoints['themphong'], formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("Phòng đã được thêm thành công!");
            navigate('/hotel')
            if (response.status === 201) {
                toast.success("Phòng đã được thêm thành công!");
            } else {
                toast.error("Có lỗi xảy ra khi thêm phòng.");
            }
        } catch (error) {
            console.error(error.response.data);
            toast.error("Có lỗi xảy ra khi thêm phòng.");
        }
    };

    useEffect(() => {
        return () => {
            if (roomData.image) {
                URL.revokeObjectURL(roomData.image);
            }
            roomData.images.forEach(file => {
                URL.revokeObjectURL(file);
            });
        };
    }, [roomData.image, roomData.images]);

    return (
        <div className="container mt-5">
            <h2>Thêm Phòng Mới</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Loại phòng:</label>
                    <select name="type" className="form-select" onChange={handleChange} required>
                        <option value="">Chọn loại phòng</option>
                        {roomTypes.map((roomType) => (
                            <option key={roomType.id} value={roomType.id}>
                                {roomType.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Tên phòng:</label>
                    <input type="text" name="name" className="form-control" onChange={handleChange} required minLength={1} maxLength={255} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Chất lượng giường:</label>
                    <input type="text" name="bed_quality" className="form-control" onChange={handleChange} required minLength={1} maxLength={255} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Giá người lớn:</label>
                    <input type="number" name="price_adult" className="form-control" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Giá trẻ em:</label>
                    <input type="number" name="price_child" className="form-control" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Giá thú cưng:</label>
                    <input type="number" name="price_pet" className="form-control" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mô tả:</label>
                    <textarea name="description" className="form-control" onChange={handleChange} required minLength={1} maxLength={255} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phí thêm cho trẻ em:</label>
                    <input type="number" name="additional_child_fee" className="form-control" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phí thêm cho thú cưng:</label>
                    <input type="number" name="additional_pet_fee" className="form-control" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Số lượng phòng còn lại:</label>
                    <input type="number" name="available_rooms" className="form-control" onChange={handleChange} min={0} />
                </div>
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            type='checkbox'
                            name='applies_additional_child_fee'
                            id='additionalChildFee'
                            className="checkbox-input"
                            checked={roomData.applies_additional_child_fee}
                            onChange={handleChange}
                        />
                        <span className="checkbox-custom" />
                        <label htmlFor='additionalChildFee'>Áp dụng phí thêm cho trẻ em</label>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            type='checkbox'
                            name='applies_additional_pet_fee'
                            id='additionalPetFee'
                            className="checkbox-input"
                            checked={roomData.applies_additional_pet_fee}
                            onChange={handleChange}
                        />
                        <span className="checkbox-custom" />
                        <label htmlFor='additionalPetFee'>Áp dụng phí thêm cho thú cưng</label>
                    </div>
                </div>


                <div className="mb-3">
                    <label className="form-label">Ảnh chính:</label>
                    <input type="file" className="form-control" name="image" accept="image/*" onChange={handleImageChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ảnh phụ:</label>
                    <input type="file" className="form-control" name="images" accept="image/*" multiple onChange={handleImageChange} />
                </div>
                <div className="mb-3">
                    <h3>Ảnh chính:</h3>
                    {roomData.image && (
                        <img src={URL.createObjectURL(roomData.image)} alt="Ảnh chính" className="img-fluid mb-3" />
                    )}
                </div>
                <div className="mb-3">
                    <h3>Ảnh phụ:</h3>
                    <div className="d-flex flex-wrap">
                        {roomData.images.map((file, index) => (
                            <img key={index} src={URL.createObjectURL(file)} alt={`Ảnh phụ ${index + 1}`} className="img-thumbnail" style={{ width: '100px', height: 'auto', margin: '5px' }} />
                        ))}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Thêm phòng</button>
            </form>
        </div>
    );
};

export default AddHotelRoomForm;
