import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import API, { endpoints } from '../../configs/API';
import { useNavigate } from 'react-router-dom';
import './css/Home.css'

const HotelSearch = () => {
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numberOfNights, setNumberOfNights] = useState(1);
    const [location, setLocation] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);
    const [provinces, setProvinces] = useState([]); 
    const navigate = useNavigate();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        '/hotel-booking-services-cheap-hotels-booking-the-easiest-method-to-benefit-from-the-download-1-1.jpg',
        '/LeQuocKhanh_checkin.png',
        '/anh1.jpg',
    ]; 

    const articles = [
        {
            title: "10 Điểm Đến Không Thể Bỏ Qua Tại Đà Nẵng",
            image: "/DaNang.jpg",
            description: "Khám phá những điểm đến tuyệt vời khi đến Đà Nẵng.",
            url: 'https://amazingo.vn/vivu/10-dia-diem-du-lich-da-nang-ban-khong-the-bo-qua.html'
        },
        {
            title: "Cách Chọn Khách Sạn Phù Hợp Với Ngân Sách Của Bạn",
            image: "/The-Grand-Ho-Tram-Strip-review-6.jpg",
            description: "Những mẹo giúp bạn chọn được khách sạn tốt nhất.",
            url: 'https://mixhotel.vn/tieu-chi-lua-chon-khach-san/'
        },
    ];

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await API.get(endpoints['provinces']); 
                setProvinces(response.data); 
            } catch (error) {
                console.error('Error fetching provinces:', error);
            }
        };

        fetchProvinces();
    }, []);

    const handleDateChange = (e) => {
        const date = e.target.value;
        setCheckInDate(date);
        if (checkOutDate && new Date(date) < new Date(checkOutDate)) {
            const nights = Math.ceil((new Date(checkOutDate) - new Date(date)) / (1000 * 60 * 60 * 24));
            setNumberOfNights(nights);
        }
    };

    const handleSearch = async () => {
        const provinceId = provinces.find(province => province.name === location)?.id;

        const searchParams = {
            province: provinceId,
            check_in: checkInDate,
            check_out: checkOutDate,
            adults,
            children,
            pets,
        };

        try {
            const response = await axios.get('http://localhost:8000/api/hotels/search/', { params: searchParams });
            const availableHotels = response.data.available_hotels;
            console.log(availableHotels);
            localStorage.setItem('availableHotels', JSON.stringify(availableHotels))
            navigate('/hotel')
        } catch (error) {
            console.error('Error fetching hotels:', error);
        }
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div className="container mt-4">
            <div className="slider-container8 mb-4">
                <img src={images[currentImageIndex]} alt="Slider" className="slider-image8" />
                <button className="slider-button8 left" onClick={handlePrevImage}>&lt;</button>
                <button className="slider-button8 right" onClick={handleNextImage}>&gt;</button>
            </div>
            <div>
                <h2 className="text-center mb-4">Tìm Khách Sạn</h2>
                <div className="card p-4 shadow-sm">
                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Ngày nhận phòng:</label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={checkInDate} 
                                onChange={handleDateChange} 
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Ngày trả phòng:</label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={checkOutDate} 
                                onChange={(e) => {
                                    setCheckOutDate(e.target.value);
                                    if (checkInDate) {
                                        const nights = Math.ceil((new Date(e.target.value) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
                                        setNumberOfNights(nights);
                                    }
                                }} 
                            />
                        </div>
                        <div className="col-md-2 mb-3">
                            <label className="form-label">Số đêm:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={numberOfNights} 
                                onChange={(e) => setNumberOfNights(e.target.value)} 
                                min="1"
                                readOnly 
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Tỉnh thành:</label>
                            <select 
                                className="form-select" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                            >
                                <option value="">Chọn tỉnh thành</option>
                                {provinces.map((province) => (
                                    <option key={province.id} value={province.name}>{province.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Số người lớn:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={adults} 
                                onChange={(e) => setAdults(e.target.value)} 
                                min="1" 
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Số trẻ em:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={children} 
                                onChange={(e) => setChildren(e.target.value)} 
                                min="0" 
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Số thú cưng:</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={pets} 
                                onChange={(e) => setPets(e.target.value)} 
                                min="0" 
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary mt-3" onClick={handleSearch}>
                        Tìm kiếm
                    </button>
                </div>
            </div>
            <div className="inspiration-section mt-4">
                <h2 className="text-center mb-4">Tin Tức và Bài Viết Cảm Hứng</h2>
                <div className="row">
                    {articles.map((article, index) => (
                        <div className="col-md-4 mb-3" key={index} style={{width: '50%'}}>
                            <div className="card">
                                <img src={article.image} className="card-img-top" alt={article.title} />
                                <div className="card-body">
                                    <h5 className="card-title">{article.title}</h5>
                                    <p className="card-text">{article.description}</p>
                                    <a href={article.url} className="btn btn-primary" style={{marginLeft: '250px'}}>Đọc thêm</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HotelSearch;
