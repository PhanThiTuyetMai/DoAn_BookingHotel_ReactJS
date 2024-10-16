import React, { useState } from 'react';
import API, { endpoints } from '../../configs/API';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateVoucher = () => {
    const [voucher, setVoucher] = useState({
        code: '',
        description: '',
        discount_percentage: '',
        discount_amount: '',
        start_date: '',
        end_date: '',
        min_booking_amount: '',
        max_uses: '',
    });

    let { idhotel } = useParams();
    if (idhotel === ':idhotel') {
        idhotel = null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVoucher((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post(`${endpoints['voucher']}add_voucher/`, {
                voucher,
                hotel: idhotel
            });
            setVoucher({
                code: '',
                description: '',
                discount_percentage: '',
                discount_amount: '',
                start_date: '',
                end_date: '',
                min_booking_amount: '',
                max_uses: '',
            });
            if (response.status === 201) {
                toast.success("Khuyến mãi đã được thêm thành công!");
            } else {
                toast.error("Có lỗi xảy ra khi thêm khuyến mãi.");
            }
        } catch (error) {
            console.error('Error creating voucher:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Tạo Khuyến Mãi</h2>
            <form onSubmit={handleSubmit} className="form-group">
                <div className="mb-3">
                    <input
                        type="text"
                        name="code"
                        value={voucher.code}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Mã Khuyến Mãi"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        name="description"
                        value={voucher.description}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Mô Tả"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        name="discount_percentage"
                        value={voucher.discount_percentage}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Phần Trăm Giảm Giá"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        name="discount_amount"
                        value={voucher.discount_amount}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Số Tiền Giảm Giá"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="date"
                        name="start_date"
                        value={voucher.start_date}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="date"
                        name="end_date"
                        value={voucher.end_date}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        name="min_booking_amount"
                        value={voucher.min_booking_amount}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Số Tiền Đặt Tối Thiểu"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        name="max_uses"
                        value={voucher.max_uses}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Số Lần Sử Dụng Tối Đa"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Tạo Khuyến Mãi</button>
            </form>
        </div>
    );
};

export default CreateVoucher;
