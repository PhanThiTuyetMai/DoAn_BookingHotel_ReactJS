import React, { useContext, useEffect, useState } from 'react';
import MyContext from '../../configs/MyContext';
import API, { endpoints } from '../../configs/API';  
import { useNavigate} from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'
import {Button, Modal} from 'react-bootstrap';
import './css/DSRom.css'

const Star = ({ filled }) => (
    <span className={`star ${filled ? 'filled' : ''}`}>&#9733;</span>
);

const HotelDetails = () => {
    const customIcon = L.icon({
        iconUrl: '/placeholder.png',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
    });
    const navigate = useNavigate();
    const itemsPerPage = 2; 
    const [state] = useContext(MyContext);
    const { user } = state;
    const [hotels, setHotels] = useState([]);
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [services, setServices] = useState({});
    const [expandedDescription, setExpandedDescription] = useState({});
    const [coordinates, setCoordinates] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedHotelId, setSelectedHotelId] = useState(null);
    const [rooms, setRooms] = useState({});
    const [imagesroom, setImagesRoom] = useState({});
    const [currentImageIndex1, setCurrentImageIndex1] = useState({});
    const [showChildFeeNote, setShowChildFeeNote] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 

    useEffect(() => {
        if (user && user.id) {
            fetchHotelDetails(user.id);
        }
    }, [user]);


    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await API.get(endpoints['typeroom']); 
                const data = response.data;
                setRoomTypes(data);
            } catch (error) {
                console.error('Error fetching room types:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomTypes();
    }, []);

    const fetchHotelDetails = async (userID) => {
        try {

            const response = await API.get(`${endpoints['hotels']}?user_id=${userID}`);
            if (!response.data || !response.data.results) {
                throw new Error('Không tìm thấy khách sạn của bạn');
            }
            
            setHotels(response.data.results);
            // await fetchCoordinates(response.data.results);
        } catch (error) {
            console.error('Lỗi:', error);
        } finally {
            setLoading(false);
        }
    };
    

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

    const fetchRooms = async (hotelId) => {
        try {
            const response = await API.get(`${endpoints['room']}?mahotel=${hotelId}&page=${page}`);
            const availableRooms = response.data.results.filter(room => room.available_rooms > 0);
            setRooms(prev => ({ ...prev, [hotelId]: availableRooms }));

            const totalItems = response.data.count;
            const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
            setTotalPages(calculatedTotalPages);
            if (response.data.next === null) {
                setPage(totalPages); 
            }
        } catch (error) {
            console.error(`Có lỗi xảy ra khi lấy phòng cho khách sạn ${hotelId}:`, error);
        }
    };

    const fetchServices = async (hotelId) => {
        try {
            const response = await API.get(`${endpoints['services']}?maht=${hotelId}`);
            setServices(prev => ({ ...prev, [hotelId]: response.data || [] }));
        } catch (error) {
            console.error(`Có lỗi xảy ra khi lấy dịch vụ cho khách sạn ${hotelId}:`, error);
        }
    };

    useEffect(() => {
        const fetchAllRoomsAndServices = async () => {
            if (hotels.length > 0) {
                await Promise.all(hotels.map(hotel => {
                    fetchRooms(hotel.id);
                    fetchServices(hotel.id);
                }));
            }
        };
    
        fetchAllRoomsAndServices();
    }, [hotels, page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
        }
    }
    
    useEffect(() => {
        const fetchRoomImages = async () => {
            const newImages1 = {};
            for (const hotelId in rooms) {
                const hotelRooms = rooms[hotelId]; 
                for (const room of hotelRooms) {
                    try {
                        const response = await API.get(`${endpoints['roomimages']}?maroom=${room.id}`);
                        newImages1[room.id] = response.data || [];
                        setCurrentImageIndex1(prev => ({...prev, [room.id]: 0}));
                    } catch (error) {
                        console.error('Error fetching room images:', error);
                    }
                }
            }
            setImagesRoom(newImages1);
        };
        
        if (Object.keys(rooms).length > 0) { 
            fetchRoomImages();
        }
    }, [rooms]);

    

    // const fetchCoordinates = async (hotels) => {
    //     const coords = {};
    //     for (const hotel of hotels) {
    //         const address = encodeURIComponent(hotel.hotel_address);
    //         const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${address}&key=b426d9aada5e42429f83fde239922df7`);
    //         if (!response.ok) {
    //             console.error('Error fetching coordinates:', response.statusText);
    //             continue;
    //         }
    //         const data = await response.json();
    //         if (data && data.results.length > 0) {
    //             coords[hotel.id] = {
    //                 lat: data.results[0].geometry.lat,
    //                 lon: data.results[0].geometry.lng,
    //             };
    //         }
    //     }
    //     setCoordinates(coords);
    //     console.log(coords);
    // };

    // const fetchCoordinates = async (hotels) => {
    //     const coords = {};
    //     for (const hotel of hotels) {
    //         const address = encodeURIComponent(hotel.hotel_address);
    //         const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
    //         const data = await response.json();
    //         if (data && data.length > 0) {
    //             coords[hotel.id] = {
    //                 lat: parseFloat(data[0].lat),
    //                 lon: parseFloat(data[0].lon),
    //             };
    //         }
    //     }
    //     setCoordinates(coords);
    //     console.log(coords); // Kiểm tra giá trị của coords
    // };

    // const fetchCoordinates = async (hotels) => {
    //     const coords = {};
    //     const apiKey = 'PXFNugkb3WgJtJvHWTtJSml6xLseKuK4'; 
    
    //     for (const hotel of hotels) {
    //         const address = encodeURIComponent(hotel.hotel_address);
    //         const response = await fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${address}`);
    
    //         if (response.ok) {
    //             const data = await response.json();
    //             if (data.results && data.results.length > 0 && data.results[0].locations.length > 0) {
    //                 const location = data.results[0].locations[0];
    //                 coords[hotel.id] = {
    //                     lat: location.latLng.lat,
    //                     lon: location.latLng.lng,
    //                 };
    //             }
    //         } else {
    //             console.error("Lỗi khi gọi API:", response.statusText);
    //         }
    //     }
    
    //     setCoordinates(coords);
    //     console.log(coords); 
    // };

    const handlePrevImage = (hotelId) => {
        setCurrentImageIndex(prev => {
            const maxIndex = images[hotelId]?.length || 1;
            const currentIndex = prev[hotelId] || 0;
            const newIndex = (currentIndex - 1 + maxIndex) % maxIndex;
            return { ...prev, [hotelId]: newIndex };
        });
    };

    const handleNextImage = (hotelId) => {
        setCurrentImageIndex(prev => {
            const maxIndex = images[hotelId]?.length || 1;
            const currentIndex = prev[hotelId] || 0;
            const newIndex = (currentIndex + 1) % maxIndex;
            return { ...prev, [hotelId]: newIndex };
        });
    };

    const handlePrevImage1 = (roomId) => {
        setCurrentImageIndex1(prev => {
            const maxIndex1 = imagesroom[roomId]?.length || 1;
            const currentIndex1 = prev[roomId] || 0;
            const newIndex1 = (currentIndex1 - 1 + maxIndex1) % maxIndex1;
            return { ...prev, [roomId]: newIndex1 };
        });
    };

    const handleNextImage1 = (roomId) => {
        setCurrentImageIndex1(prev => {
            const maxIndex1 = imagesroom[roomId]?.length || 1;
            const currentIndex1 = prev[roomId] || 0;
            const newIndex1 = (currentIndex1 + 1) % maxIndex1;
            return { ...prev, [roomId]: newIndex1 };
        });
    };

    const toggleDescription = (hotelId) => {
        setExpandedDescription(prev => ({
            ...prev,
            [hotelId]: !prev[hotelId]
        }));
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    const addServices = (idht) => {
        navigate(`/add_services/${idht}`);
    };

    const addRoom = (idhotel) => {
        navigate(`/add_room/${idhotel}`);
    };

    const addVoucher = (idhotel) => {
        navigate(`/add_voucher/${idhotel}`);
    };

    const dsVoucher = () => {
        navigate(`/voucher/`);
    };

    const suaHotel = (idhotel) => {
        navigate(`/sua_hotel/${idhotel}`);
    };

    const editRoom = (idphong) => {
        navigate(`/suaphong/${idphong}`);
    }

    const openModal = (hotelId) => {
        setSelectedHotelId(hotelId);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedHotelId(null);
    };

    const getRatingFromQuality = (quality) => {
        console.log(quality);
        if (typeof quality !== 'string' || !quality) {
            return 0; 
        }
    
        // Trích xuất số từ chuỗi
        const match = quality.match(/(\d+)/);
        
        // Kiểm tra xem có tìm thấy số không
        if (!match) return 0; 
    
        const parsedQuality = parseInt(match[0]); // Lấy giá trị số

        if (parsedQuality === 1) return 1;
        if (parsedQuality === 4) return 4;
        if (parsedQuality === 3) return 3;
        if (parsedQuality ===2 ) return 2;
        return 5; 
    };
    

    const formatPrice = (price) => {
        return price > 0 ? `${price.toLocaleString()} VNĐ` : null;
    };

    return (
        <div className='container'>
            {hotels.length === 0 ? (
                <p>Không có khách sạn nào để hiển thị.</p>
            ) : (
            hotels.map(hotel => (
                <div key={hotel.id} className="hotel-container">
                    <h1 style={{color: "orange"}}>Thông Tin Khách Sạn {hotel.hotel_name}</h1>
                    <div className="image-container">
                        <img 
                            src={`https://res.cloudinary.com/duz2xltvs/${hotel.image}`} 
                            alt={hotel.hotel_name} 
                            className="main-image" 
                        />
                        {images[hotel.id] && images[hotel.id].length > 0 && (
                            images[hotel.id].map((img, index) => (
                                <img 
                                    key={index} 
                                    src={`https://res.cloudinary.com/duz2xltvs/${images[hotel.id][currentImageIndex[hotel.id]].image}`} 
                                    alt={hotel.hotel_name} 
                                    className={`slider-image ${currentImageIndex[hotel.id] > 0 ? 'active' : ''}`} 
                                />
                            ))
                        )}
                        <button className="arrow left-arrow" onClick={() => handlePrevImage(hotel.id)}>
                            &#10094;
                        </button>
                        <button className="arrow right-arrow" onClick={() => handleNextImage(hotel.id)}>
                            &#10095;
                        </button>
                    </div>
                    <div className="info-container">
                        <h2>{hotel.hotel_name}</h2>
                        <p><strong>Địa chỉ:</strong> {hotel.hotel_address} 
                            <button onClick={() => openModal(hotel.id)} className="toggle-button">Xem Bản Đồ</button>
                        </p>
                        
                        <Modal show={modalIsOpen} onHide={closeModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Bản Đồ</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {selectedHotelId && coordinates[selectedHotelId] ? (
                                    <>
                                        {console.log(coordinates[selectedHotelId].lon)} 
                                        <MapContainer
                                            center={[coordinates[selectedHotelId].lat, coordinates[selectedHotelId].lon]}
                                            zoom={13}
                                            className="map"
                                            style={{ height: "400px", width: "100%" }} 
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <Marker position={[coordinates[selectedHotelId].lat, coordinates[selectedHotelId].lon]} icon={customIcon}>
                                                <Popup>
                                                    {hotel.hotel_name}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </>
                                ) : (
                                    <div>Đang tải bản đồ...</div>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={closeModal}>
                                    Đóng
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <p><strong>Số điện thoại:</strong> {hotel.hotel_phone}</p>
                        <div className="hotel-description">
                            <p className="hotel-paragraph">
                                <strong className="hotel-strong">Mô tả: </strong> 
                                {expandedDescription[hotel.id] ? hotel.hotel_desc : `${hotel.hotel_desc.split(' ').slice(0, 20).join(' ')}...`}
                                <button onClick={() => toggleDescription(hotel.id)} className="toggle-button">
                                    {expandedDescription[hotel.id] ? 'Ẩn bớt' : 'Xem tất cả'}
                                </button>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="services-title">DANH SÁCH DỊCH VỤ</h4>
                        <div className="service-container">
                            <div className="service-column">
                                <h3>Các hoạt động:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.activity.split(', ').map((act, index) => (
                                            <p key={index} className="service-item">{act}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                            <div className="service-column">
                                <h3>Dịch vụ khách sạn:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.service.split(', ').map((srv, index) => (
                                            <p key={index} className="service-item">* {srv}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="service-container">
                            <div className="service-column">
                                <h3>Tiện nghi phòng:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.room_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                            <div className="service-column">
                                <h3>Ẩm thực:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.cuisine.split(', ').map((cuisine, index) => (
                                            <p key={index} className="service-item">* {cuisine}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="service-container">
                            <div className="service-column">
                                <h3>Tiện nghi văn phòng:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.office_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                            <div className="service-column">
                                <h3>Tiện nghi phù hợp với gia đình:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.family_friendly_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="service-container">
                            <div className="service-column">
                                <h3>Các tiện ích lân cận:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.nearby_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                            <div className="service-column">
                                <h3>Vận chuyển:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.transportation_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="service-container">
                            <div className="service-column">
                                <h3>Hỗ trợ người khuyết tật:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.disability_support_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                            <div className="service-column">
                                <h3>Trẻ em và Thú cưng:</h3>
                                <div className="service-list">
                                    {services[hotel.id]?.map(service => (
                                        service.pet_friendly_amenity.split(', ').map((amenity, index) => (
                                            <p key={index} className="service-item">* {amenity}</p>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>
                        {rooms[hotel.id] && rooms[hotel.id].length > 0 ? (
                        <div>
                            <h3 className="services-title">CÁC PHÒNG CÒN TRỐNG</h3>
                            <div className="row">
                                {rooms[hotel.id].map(room => {
                                    const roomType = roomTypes.find(type => type.id === room.type);
                                    return (
                                        <div key={room.id} className="col-12 mb-4">
                                            <div className="card d-flex flex-row">
                                                <div className="image-container-room">
                                                    <img 
                                                        src={`https://res.cloudinary.com/duz2xltvs/${room.image}`} 
                                                        alt={room.name} 
                                                        className="card-img-top main-image-room" 
                                                    />
                                                    {imagesroom[room.id] && imagesroom[room.id].length > 0 && (
                                                        imagesroom[room.id].map((img, index) => (
                                                            <img 
                                                                key={index}
                                                                src={`https://res.cloudinary.com/duz2xltvs/${imagesroom[room.id][currentImageIndex1[room.id]].image}`} 
                                                                alt={room.name} 
                                                                className={`slider-image-room ${currentImageIndex1[room.id] > 0 ? 'active' : ''}`}
                                                            />
                                                        ))
                                                    )}
                                                    <button className="arrow left-arrow" onClick={() => handlePrevImage1(room.id)}>
                                                        &#10094;
                                                    </button>
                                                    <button className="arrow right-arrow" onClick={() => handleNextImage1(room.id)}>
                                                        &#10095;
                                                    </button>
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title">{room.name}</h5>
                                                    <div className="price-info d-flex justify-content-between">
                                                        <p className="card-text">
                                                            <small className="text-muted">Loại phòng: {roomType ? roomType.name : 'Không tìm thấy loại phòng'}</small>
                                                        </p>
                                                        <div className="rating">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} filled={star <= getRatingFromQuality(room.bed_quality)} />
                                                        ))}
                                                    </div>
                                                    </div>
                                                    <div className="price-info d-flex justify-content-between">
                                                        {room.price_adult > 0 && (
                                                            <p className="card-text">
                                                                <small className="text-muted">Giá người lớn: <strong>{formatPrice(room.price_adult)}</strong></small>
                                                            </p>
                                                        )}
                                                        {room.price_child > 0 && (
                                                            <p className="card-text">
                                                                <small className="text-muted">Giá trẻ em: <strong>{formatPrice(room.price_child)}</strong></small>
                                                            </p>
                                                        )}
                                                        {room.price_pet > 0 && (
                                                            <p className="card-text">
                                                                <small className="text-muted">Giá thú cưng: <strong>{formatPrice(room.price_pet)}</strong></small>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="additional-fees">
                                                        {room.applies_additional_child_fee && room.additional_child_fee > 0 && (
                                                            <p className="card-text">
                                                                <small className="text-muted">
                                                                    <span 
                                                                        onClick={() => setShowChildFeeNote(!showChildFeeNote)} 
                                                                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                                                    >
                                                                        Áp dụng phí trẻ em thêm
                                                                    </span>
                                                                </small>
                                                                {showChildFeeNote && (
                                                                    <p className="card-text">
                                                                        <small className="text-muted">Phí trẻ em thêm: <strong>{formatPrice(room.additional_child_fee)}</strong></small>
                                                                    </p>
                                                                )}
                                                            </p>
                                                        )}
                                                        {room.applies_additional_pet_fee && room.additional_pet_fee > 0 && (
                                                            <p className="card-text">
                                                                <small className="text-muted">
                                                                    <span 
                                                                        onClick={() => setShowChildFeeNote(!showChildFeeNote)} 
                                                                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                                                    >
                                                                        Áp dụng phí thú cưng thêm 
                                                                    </span>
                                                                </small>
                                                                {showChildFeeNote && (
                                                                    <p className="card-text">
                                                                        <small className="text-muted">Phí thú cưng thêm: <strong>{formatPrice(room.additional_pet_fee)}</strong></small>
                                                                    </p>
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="price-info d-flex justify-content-between">
                                                        <p className="card-text">
                                                            <small className="text-muted">Số phòng còn lại: {room.available_rooms}</small>
                                                        </p>
                                                        <button 
                                                            style={{width: '120px'}}
                                                            className="btn btn-danger float-right mt-3" 
                                                            onClick={() => editRoom(room.id)}
                                                        >
                                                            Sửa phòng
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                    })}
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
                            ) : (
                                <p>Không có phòng còn trống.</p>
                            )}
                            <div className="button-container">
                                {services[hotel.id]?.length === 0 && (
                                    <button className="action-button" onClick={() => addServices(hotel.id)}>Thêm dịch vụ</button>
                                )}
                                <button className="action-button" onClick={() => suaHotel(hotel.id)}>Sửa Khách Sạn</button>
                                <button className="action-button" onClick={() => addRoom(hotel.id)}>Thêm Phòng</button>
                                <button className="action-button" onClick={() => dsVoucher()}>Danh Sách Khuyến Mãi</button>
                                <button className="action-button" onClick={() => addVoucher(hotel.id)}>Thêm Khuyến Mãi</button>
                            </div>
                        </div>
                    </div>
            )))}
        </div>
    );
};

export default HotelDetails;
