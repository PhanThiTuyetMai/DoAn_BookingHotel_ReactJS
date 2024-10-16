import React, { useState, useEffect } from 'react';
import API, { endpoints } from '../../configs/API';  
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/DSHotel.css';
import { useNavigate } from 'react-router-dom';


const Star = ({ filled }) => (
    <span className={`star ${filled ? 'filled' : ''}`}>&#9733;</span>
);

const HotelList = () => {
    const availableHotels = JSON.parse(localStorage.getItem('availableHotels')) || [];
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [images, setImages] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [error, setError] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedRatings, setSelectedRatings] = useState(new Set());
    const [minprice, setMinPrice] = useState({});
    const [priceSortOrder, setPriceSortOrder] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 
    const itemsPerPage = 5; 

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await API.get(`${endpoints['hotels']}?page=${page}`);
                if (response && response.data && Array.isArray(response.data.results)) {
                    setHotels(response.data.results);

                    const totalItems = response.data.count;
                    const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
                    setTotalPages(calculatedTotalPages);
                    if (response.data.next === null) {
                        setPage(totalPages); 
                    }
                } else {
                    throw new Error('Không lấy được dữ liệu');
                }
            } catch (error) {
                console.error('Có lỗi xảy ra khi lấy danh sách khách sạn:', error);
                setError('Không thể lấy danh sách khách sạn.');
            }
        };

        const fetchProvinces = async () => {
            try {
                const response = await API.get(endpoints['provinces']);
                setProvinces(response.data || []);
            } catch (error) {
                console.error('Có lỗi xảy ra khi lấy danh sách tỉnh thành:', error);
            }
        };

        fetchHotels();
        fetchProvinces();
    }, [page]);

    useEffect(() => {
        const fetchImages = async () => {
            const newImages = {};
            for (const hotel of hotels) {
                try {
                    const response = await API.get(`${endpoints['hotel_images']}?mahotel=${hotel.id}`);
                    newImages[hotel.id] = response.data || [];
                    setCurrentImageIndex(prev => ({ ...prev, [hotel.id]: 0 }));
                } catch (error) {
                    console.error(`Có lỗi xảy ra khi lấy hình ảnh cho khách sạn ${hotel.id}:`, error);
                }
            }
            setImages(newImages);
        };

        if (hotels.length > 0) {
            fetchImages();
        }
    }, [hotels]);


    useEffect(() => {
        const fetchMinPrices = async () => {
            const newMinPrices = {};
            for (const hotel of hotels) {
                try {
                    const response = await API.get(`${endpoints['room']}gia_phong_re_nhat/?mahotel=${hotel.id}`);
                    if (response && response.data) {
                        newMinPrices[hotel.id] = response.data; // Cập nhật giá phòng
                    } else {
                        newMinPrices[hotel.id] = null; // Hoặc một giá trị mặc định
                    }
                } catch (error) {
                    console.error(`Có lỗi xảy ra khi lấy giá phòng cho khách sạn ${hotel.id}:`, error);
                    newMinPrices[hotel.id] = null; // Hoặc một giá trị mặc định
                }
            }
            setMinPrice(newMinPrices);
            console.log(minprice)
        };
    
        if (hotels.length > 0) {
            fetchMinPrices();
        }
    }, [hotels]);
    

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => {
                const newIndex = {};
                for (const hotelId in prev) {
                    const maxIndex = images[hotelId]?.length - 1;
                    if (maxIndex >= 0) {
                        const nextIndex = (prev[hotelId] + 1) % (maxIndex + 1);
                        newIndex[hotelId] = nextIndex;
                    }
                }
                return newIndex;
            });
        }, 5000); 

        return () => clearInterval(interval);
    }, [images]);

    const handlePrevImage = (hotelId) => {
        setCurrentImageIndex(prev => {
            const maxIndex = images[hotelId]?.length - 1;
            const currentIndex = prev[hotelId];
            const newIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
            return { ...prev, [hotelId]: newIndex };
        });
    };

    const handleNextImage = (hotelId) => {
        setCurrentImageIndex(prev => {
            const maxIndex = images[hotelId]?.length - 1;
            const currentIndex = prev[hotelId];
            const newIndex = (currentIndex + 1) % (maxIndex + 1);
            return { ...prev, [hotelId]: newIndex };
        });
    };

    const getRatingFromQuality = (quality) => {
        const match = quality.match(/(\d+)/); // Lấy số từ chuỗi
        return match ? parseInt(match[1], 10) : 0; // Chuyển đổi thành số
    };

    const handleRatingChange = (rating) => {
        const newSelectedRatings = new Set(selectedRatings);
        if (newSelectedRatings.has(rating)) {
            newSelectedRatings.delete(rating);
        } else {
            newSelectedRatings.add(rating);
        }
        setSelectedRatings(newSelectedRatings);
    };

    const filteredHotels = hotels.filter(hotel => {
        const matchesProvince = selectedProvince ? parseInt(hotel.province) === parseInt(selectedProvince) : true;
        const hotelRating = getRatingFromQuality(hotel.rom_quality);
        const matchesRating = selectedRatings.size === 0 || selectedRatings.has(hotelRating);
        return matchesProvince && matchesRating;
    });

    const deatail = (idhotel) => {
        navigate(`/detail_hotel/${idhotel}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
        }
    }

    const sortedHotels = filteredHotels.sort((a, b) => {
        if (priceSortOrder === 'asc') {
            return (minprice[a.id]?.price_adult || 0) - (minprice[b.id]?.price_adult || 0);
        } else if (priceSortOrder === 'desc') {
            return (minprice[b.id]?.price_adult || 0) - (minprice[a.id]?.price_adult || 0);
        }
        return 0; 
    });

    return (
        <div className="container" style={{maxWidth: '1010px'}}>
            <h2 className="my-4">Danh Sách Khách Sạn</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row" style={{width: '950px'}}>
                <div className="col-md-3 mb-4">
                    <div className="popular-rating-box p-3"> 
                        <h5>Độ Phổ Biến</h5>
                        <div className="d-flex flex-column">
                            {[1, 2, 3, 4, 5].map(star => (
                                <label key={star} className="d-flex align-items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedRatings.has(star)} 
                                        onChange={() => handleRatingChange(star)} 
                                        className="me-2"
                                    />
                                    <span className="checkbox-square me-2"></span>
                                    <div className="d-flex">
                                        {[1, 2, 3, 4, 5].map(starIcon => (
                                            <Star key={starIcon} filled={starIcon <= star} />
                                        ))}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="popular-rating-box p-3"> 
                        <div className="mb-4">
                            <h5>Theo Giá</h5>
                            <select 
                                value={priceSortOrder} 
                                onChange={(e) => setPriceSortOrder(e.target.value)} 
                                className="form-select"
                            >
                                <option value="">Sắp xếp theo giá</option>
                                <option value="asc">Giá từ thấp đến cao</option>
                                <option value="desc">Giá từ cao đến thấp</option>
                            </select>
                        </div>   
                    </div>
                </div>
                <div className="col-md-9 mb-4">
                    <div className="mb-4">
                        <select 
                            value={selectedProvince} 
                            onChange={(e) => setSelectedProvince(e.target.value)} 
                            className="form-select"
                        >
                            <option value="">Chọn tỉnh thành</option>
                            {provinces.map(province => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                    {availableHotels && availableHotels.length > 0 ? (
                        availableHotels.map(room => (
                            <div key={room.id} className="col-12 mb-4"> 
                                <div className="card d-flex flex-row">
                                    <div className="image-container2">
                                            <img 
                                                src={room.image} 
                                                alt={room.hotel_name} 
                                                className="card-img-top main-image2" 
                                            />
                                            {images[room.id] && images[room.id].length > 0 ? (
                                                <img 
                                                    src={`https://res.cloudinary.com/duz2xltvs/${images[room.id][currentImageIndex[room.id]].image}`} 
                                                    alt={room.hotel_name} 
                                                    className={`slider-image2 ${currentImageIndex[room.id] > 0 ? 'active' : ''}`} 
                                                />
                                            ) : (
                                                <div>No image available</div>
                                            )}
                                            <button className="arrow left-arrow" onClick={() => handlePrevImage(room.id)}>
                                                &#10094;
                                            </button>
                                            <button className="arrow right-arrow" onClick={() => handleNextImage(room.id)}>
                                                &#10095;
                                            </button>
                                        </div>
                                    <div className="card-body" onClick={() => deatail(room.id)}>
                                        <h5 className="card-title">{room.hotel_name}</h5>
                                        <p className="card-text"><small className="text-muted">{room.hotel_address}</small></p>
                                        <p className="card-text"><small className="text-muted">{room.hotel_email}</small></p>
                                        {minprice[room.id] ? (
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="rating">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} filled={star <= getRatingFromQuality(room.rom_quality)} />
                                                    ))}
                                                </div>
                                                <button className="btn btn-danger me-2">
                                                    Giá chỉ từ {new Intl.NumberFormat('vi-VN').format(minprice[room.id].price_adult)} VNĐ
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="rating">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} filled={star <= getRatingFromQuality(room.rom_quality)} />
                                                    ))}
                                                </div>
                                                <button className="btn btn-secondary me-2" disabled>
                                                    Không có dữ liệu
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            ))       
                        ) : filteredHotels.length > 0 ? ( 
                            filteredHotels.map(hotel => (
                                <div key={hotel.id} className="col-12 mb-4">
                                    <div className="card d-flex flex-row">
                                        <div className="image-container2">
                                            <img 
                                                src={`https://res.cloudinary.com/duz2xltvs/${hotel.image}`} 
                                                alt={hotel.hotel_name} 
                                                className="card-img-top main-image2" 
                                            />
                                            {images[hotel.id] && images[hotel.id].length > 0 ? (
                                                <img 
                                                    src={`https://res.cloudinary.com/duz2xltvs/${images[hotel.id][currentImageIndex[hotel.id]].image}`} 
                                                    alt={hotel.hotel_name} 
                                                    className={`slider-image2 ${currentImageIndex[hotel.id] > 0 ? 'active' : ''}`} 
                                                />
                                            ) : (
                                                <div>No image available</div>
                                            )}
                                            <button className="arrow left-arrow" onClick={() => handlePrevImage(hotel.id)}>
                                                &#10094;
                                            </button>
                                            <button className="arrow right-arrow" onClick={() => handleNextImage(hotel.id)}>
                                                &#10095;
                                            </button>
                                        </div>
                                        <div className="card-body" onClick={() => deatail(hotel.id)}>
                                            <h5 className="card-title">{hotel.hotel_name}</h5>
                                            <p className="card-text"><small className="text-muted">{hotel.hotel_address}</small></p>
                                            <p className="card-text"><small className="text-muted">{hotel.hotel_email}</small></p>
                                            {minprice[hotel.id] ? (
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="rating">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} filled={star <= getRatingFromQuality(hotel.rom_quality)} />
                                                        ))}
                                                    </div>
                                                    <button className="btn btn-danger me-2">
                                                        Giá chỉ từ {new Intl.NumberFormat('vi-VN').format(minprice[hotel.id].price_adult)} VNĐ
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="rating">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} filled={star <= getRatingFromQuality(hotel.rom_quality)} />
                                                        ))}
                                                    </div>
                                                    <button className="btn btn-secondary me-2" disabled>
                                                        Không có dữ liệu
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Không có khách sạn nào để hiển thị.</p>
                        )}
                    
                    </div>
                    <div className="pagination">
                        <button 
                            disabled={page <= 1} 
                            onClick={() => handlePageChange(page - 1)}
                        >
                            &laquo; Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={page === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button 
                            disabled={page >= totalPages} 
                            onClick={() => handlePageChange(page + 1)}
                        >
                            Next &raquo;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );    
};

export default HotelList;
