import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API, { endpoints } from '../../configs/API';
import MyContext from '../../configs/MyContext';
import { Modal, Button, Table } from 'react-bootstrap';

const VoucherList = () => {
    const [state] = useContext(MyContext);
    const { user } = state;
    const [hotelVouchers, setHotelVouchers] = useState([]);
    const [platformVouchers, setPlatformVouchers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [voucherIdToDelete, setVoucherIdToDelete] = useState(null);

    useEffect(() => {
        fetchVouchers();
        const interval = setInterval(checkExpiredVouchers, 60000); 
        return () => clearInterval(interval); 
    }, []);

    const fetchVouchers = async () => {

        try {
            // Lấy danh sách vouchers
            const voucherResponse = await API.get(endpoints['voucher']);
            const vouchers = voucherResponse.data;

            // Lấy danh sách voucher_rooms
            const roomResponse = await API.get(endpoints['voucher_room']);
            const voucherRooms = roomResponse.data;

            // Phân loại vouchers
            const hotelVouchers = vouchers.filter(v => 
                voucherRooms.some(room => room.voucher === v.id)
            );
            const platformVouchers = vouchers.filter(v => 
                !voucherRooms.some(room => room.voucher === v.id)
            );

            setHotelVouchers(hotelVouchers);
            setPlatformVouchers(platformVouchers);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    };

    const checkExpiredVouchers = async () => {
        try {
            await API.get(`${endpoints['voucher']}hethan_voucher/`);
            
        } catch (error) {
            console.error('Error checking expired vouchers:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await API.delete(`${endpoints['voucher']}${voucherIdToDelete}/xoa_voucher/`);
            if (response.status === 204) { 
                toast.success("Khuyến mãi đã được xóa thành công!");
                fetchVouchers(); 
            } else {
                toast.error("Có lỗi xảy ra khi xóa khuyến mãi.");
            }
        } catch (error) {
            console.error('Error deleting voucher:', error);
        } finally {
            setShowModal(false); 
        }
    };

    const confirmDelete = (id) => {
        setVoucherIdToDelete(id);
        setShowModal(true); 
    };

    return (
        <div className="container mt-4">
            <h2>Khuyến Mãi Của Khách Sạn</h2>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Mã Khuyến Mãi</th>
                        <th>Mô Tả</th>
                        <th>Ngày Hết Hạn</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {hotelVouchers.map((v) => (
                        <tr key={v.id}>
                            <td>{v.code}</td>
                            <td>{v.description}</td>
                            <td>{v.end_date}</td>
                            <td>
                                <Button variant="danger" onClick={() => confirmDelete(v.id)}>
                                    Xóa
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {user && user.role ===3 && (
                <>
                    <h2>Khuyến Mãi Của Sàn</h2>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Mã Khuyến Mãi</th>
                                <th>Mô Tả</th>
                                <th>Ngày Hết Hạn</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platformVouchers.map((v) => (
                                <tr key={v.id}>
                                    <td>{v.code}</td>
                                    <td>{v.description}</td>
                                    <td>{v.end_date}</td>
                                    <td>
                                        <Button variant="danger" onClick={() => confirmDelete(v.id)}>
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table> 
                </>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa khuyến mãi này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VoucherList;
