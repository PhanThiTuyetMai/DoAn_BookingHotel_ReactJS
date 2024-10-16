import React, { useState } from 'react';
import API, { endpoints } from '../../configs/API';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/DichVu.css'; 

const availableServices = {
    service: [
        'Nhân viên xách hành lý',
        'Dịch vụ concierge/hỗ trợ khách',
        'Dịch vụ thu đổi ngoại tệ',
        'EARLY_CHECK_IN',
        'Dịch vụ nhận phòng cấp tốc',
        'Dịch vụ trả phòng cấp tốc',
        'Quầy lễ tân',
        'Lễ tân 24h',
        'Bảo vệ 24 giờ',
        'Dịch vụ giặt ủi',
        'Dịch vụ lưu trữ/bảo quản hành lý',
        'Dịch vụ hỗ trợ đặt Tour',
    ],
    activity: [
        'Ghế dài tắm nắng bãi biển',
        'Khăn tắm biển',
        'Dù (ô) trên bãi biển',
        'Khu vui chơi trẻ em',
        'Vườn hoa',
        'Karaoke',
        'Mát-xa',
        'Các tiện nghi ngoài trời',
        'Hồ bơi ngoài trời',
        'Khu vực dã ngoại',
        'Ghế dài tắm nắng hồ bơi',
        'Bãi biển riêng',
        'Xông hơi ướt',
        'Dịch vụ spa',
        'Phòng xông hơi',
        'Ghế dài tắm nắng',
        'Bóng chuyền bãi biển',
        'Bàn bi-da',
        'Bóng bàn',
        'Quần vợt',
    ],
    room_amenity: [
        'Bãi đậu xe',
        'Cà phê/trà tại sảnh',
        'Tiệm cà phê',
        'Nhận phòng sớm',
        'Nhà hàng',
        'Nhà hàng phục vụ bữa sáng',
        'Nhà hàng phục vụ bữa tối',
        'Nhà hàng phục vụ bữa trưa',
        'Dịch vụ dọn phòng',
        'Két an toàn',
        'WiFi tại khu vực chung',
    ],
    cuisine: [
        'Bữa tối với thực đơn gọi món',
        'Bữa trưa với thực đơn gọi món',
        'Quầy bar',
        'Quầy bar bên bãi biển',
        'Bữa sáng',
        'Bữa sáng và bữa tối',
        'Bữa sáng và bữa trưa',
        'Bữa sáng món tự chọn',
        'Tiệm cà phê',
        'Quầy bar bên hồ bơi',
    ],
    general_amenity: [
        'Máy lạnh',
        'Hội trường đa chức năng',
        'Tiệc chiêu đãi',
        'Phòng gia đình',
        'Phòng không hút thuốc',
        'Hồ bơi',
        'Sân thượng/sân hiên',
    ],
    office_amenity: [
        'Dịch vụ văn phòng',
        'Các tiện nghi văn phòng',
        'Phòng hội nghị',
        'Tiện nghi hội họp',
    ],
    nearby_amenity: [
        'Thẩm mỹ viện',
        'Cửa hàng quà tặng',
        'Hiệu làm tóc',
        'Cửa hàng',
    ],
    family_friendly_amenity: [
        'Câu lạc bộ thiếu nhi',
        'Hồ bơi trẻ em',
    ],
    transportation_amenity: [
        'Dịch vụ cho thuê xe đạp',
        'Đưa đón đến trung tâm thương mại',
    ],
    disability_support_amenity: [
        'Chỗ đậu xe cho người khuyết tật',
    ],
    child_friendly_amenity: [
        'Dịch vụ giữ trẻ (thu phí)',
    ],
};

const AddService = () => {
    const navigate = useNavigate();
    const { idht } = useParams();
    const [formData, setFormData] = useState({
        hotel: idht,
        service: [],
        activity: [],
        cuisine: [],
        room_amenity: [],
        general_amenity: [],
        office_amenity: [],
        nearby_amenity: [],
        family_friendly_amenity: [],
        transportation_amenity: [],
        disability_support_amenity: [],
        child_friendly_amenity: [],
    });

    const handleChange = (group, value) => {
        setFormData(prevData => {
            const selected = prevData[group].includes(value)
                ? prevData[group].filter(item => item !== value)
                : [...prevData[group], value];

            return { ...prevData, [group]: selected };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            service: formData.service.join(', '),
            activity: formData.activity.join(', '),
            cuisine: formData.cuisine.join(', '),
            room_amenity: formData.room_amenity.join(', '),
            general_amenity: formData.general_amenity.join(', '),
            office_amenity: formData.office_amenity.join(', '),
            nearby_amenity: formData.nearby_amenity.join(', '),
            family_friendly_amenity: formData.family_friendly_amenity.join(', '),
            transportation_amenity: formData.transportation_amenity.join(', '),
            disability_support_amenity: formData.disability_support_amenity.join(', '),
            child_friendly_amenity: formData.child_friendly_amenity.join(', '),
        };

        console.log('Services:', formattedData.service);

        try {
            const token = localStorage.getItem('access_token');
            const response = await API.post(endpoints['add_service'], formattedData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                const data = await response.data;
                console.log('Success:', data);
                toast.success('Thêm dịch vụ thành công!'); // Hiển thị thông báo thành công
                setTimeout(() => {
                    navigate(-1); // Quay lại trang trước sau 5 giây
                }, 5000);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Đã có lỗi xảy ra!'); // Hiển thị thông báo lỗi
        }
    };

    return (
        <div className="add-service-container">
            <h1>Thêm Dịch Vụ Khách Sạn</h1>
            <form className="service-form" onSubmit={handleSubmit}>
                {Object.keys(availableServices).map(group => (
                    <div key={group}>
                        <h2>{group.charAt(0).toUpperCase() + group.slice(1)}</h2>
                        {availableServices[group].map(service => (
                            <label key={service} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData[group].includes(service)}
                                    onChange={() => handleChange(group, service)}
                                    className="checkbox-input"
                                />
                                <span className="checkbox-custom" />
                                {service}
                            </label>
                        ))}
                    </div>
                ))}

                <div className="add-service-button-group">
                    <button type="submit" className="add-service-button">Thêm Dịch Vụ</button>
                    <button type="button" className="go-back-button" onClick={() => navigate(-1)}>Quay Lại</button>
                </div>
            </form>
            <ToastContainer /> {/* Thêm ToastContainer ở đây */}
        </div>
    );
};

export default AddService;
