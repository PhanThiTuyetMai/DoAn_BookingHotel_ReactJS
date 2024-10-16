import React, { useState, useEffect } from 'react';
import API, { endpoints } from '../../configs/API';
import './css/ListHotel.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const ManageHotelRequests = () => {
    const [requests, setRequests] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [province, setProvince] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Authorization': `Bearer ${token}`
                };
                const response = await API.get(endpoints['request'], {headers});
                setRequests(response.data);
            } catch (error) {
                console.error('Có lỗi xảy ra khi lấy danh sách yêu cầu:', error);
                setError('Không thể lấy danh sách yêu cầu.');
            }
        };

        const fetchHotels = async () => {
            try {
                const response = await API.get(endpoints['hotels']);
                setHotels(response.data.results);
                console.log(response.data.results)
            } catch (error) {
                console.error('Có lỗi xảy ra khi lấy danh sách khách sạn', error);
                setError('Không thể lấy danh sách khách sạn.');
            }
        };

        const fetchProvince = async () => {
            try{
                const response = await API.get(endpoints['provinces']);
                setProvince(response.data)
            } catch (error) {
                console.error('Có lỗi xảy ra khi lấy danh sách tỉnh thành', error);
                setError('Không thể lấy danh sách tỉnh thành.');
            }
        }

        fetchRequests();
        fetchHotels();
        fetchProvince();
    }, []);

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            await API.patch(`${endpoints['request']}/${requestId}/update_status/`, { status: newStatus }, {headers});
            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === requestId ? { ...request, status: newStatus } : request
                )
            );
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái yêu cầu:', error);
            setError('Đã có lỗi xảy ra khi cập nhật trạng thái.');
        }
    };

    const handleDeleteRequest = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token && requestToDelete) {
                let headers = {
                    Authorization: `Bearer ${token}`
                };
                const request = requests.find(req => req.id === requestToDelete);
                const hotelToDelete = hotels.find(hotel => hotel.hotel_name === request.hotel_name);
    
                if (hotelToDelete) {
                    const hotelId = hotelToDelete.id; 
                    const res = await API.delete(`${endpoints['hotels']}${hotelId}/xoa_khachsan`, { headers });
                    if (res.status === 204) {
                        const requestRes = await API.delete(`${endpoints['request']}/${requestToDelete}/`, { headers });
                        if (requestRes.status === 204) {
                            setRequests(prevRequests => prevRequests.filter(req => req.id !== requestToDelete));
                            setShowModal(false);
                            setSuccessMessage('Yêu cầu đã được xóa thành công!'); 
                        } else {
                            setError('Lỗi! Không thể xóa yêu cầu.');
                        }
                    } else {
                        setError('Lỗi! Không thể xóa khách sạn.');
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi xóa yêu cầu:', error);
            setError('Đã có lỗi xảy ra khi xóa yêu cầu.');
        }
    };

    const namePro = province.reduce((map, province) => {
        map[province.id] = province.name; 
        return map;
    }, {});
    

    return (
        <div className="container">
            <h2>Danh Sách Khách Sạn Đăng Ký</h2>
            {error && <div className="error">{error}</div>}
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Khách Sạn</th>
                        <th>Tỉnh/Thành phố</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>{request.hotel_name}</td>
                            <td>{namePro[request.province] || 'N/A'}</td>
                            <td>{request.status}</td>
                            <td>
                                {request.status === 'approved' ? (
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => {
                                            setRequestToDelete(request.id);
                                            setShowModal(true);
                                        }}
                                    >
                                        Xóa
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => handleStatusChange(request.id, 'approved')}>
                                            Chấp Nhận
                                        </button>
                                        <button onClick={() => handleStatusChange(request.id, 'rejected')}>
                                            Từ Chối
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa yêu cầu này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDeleteRequest}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageHotelRequests;
