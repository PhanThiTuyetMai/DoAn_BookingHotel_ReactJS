import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../configs/API';
import './css/list_styles.css'; 


const NhanVien = () => {
    const [nhanvien, setNhanVien] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 
    const navigate = useNavigate();

    const itemsPerPage = 5; 

    const loadNV = async () => {
        if (page > 0) {
            try {
                setLoading(true);
                let url;
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Authorization': `Bearer ${token}`
                };
                if (!isNaN(q)) {
                    url = `${endpoints['nhanvien']}?ma=${q}&page=${page}`;
                } else {
                    url = `${endpoints['nhanvien']}?name=${q}&page=${page}`;
                }

                console.log(url);
                let res = await API.get(url, {headers});

                // Cập nhật dữ liệu cho trang hiện tại
                setNhanVien(res.data.results);

                // Tính số trang tổng cộng
                const totalItems = res.data.count;
                const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
                setTotalPages(calculatedTotalPages);

                // Kiểm tra nếu không còn trang tiếp theo
                if (res.data.next === null) {
                    setPage(totalPages); // Đặt trang hiện tại thành trang cuối cùng nếu không còn trang tiếp theo
                }
            }
            catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        loadNV();
    }, [q, page]);

    const gotoDetail = (id) => {
        navigate(`/detail_nv/${id}`);
    }

    const search = (value) => {
        setPage(1);
        setQ(value);
    }

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
        }
    }

    return (
        <div className="container">
            <div>
                <h1 style={{textAlign: 'center'}}>DANH SÁCH NHÂN VIÊN</h1>
            </div>
            <div style={{ marginTop: 10 }}>
                <input
                    type="text"
                    placeholder="Nhập id hoặc tên của nhân viên..."
                    onChange={(e) => search(e.target.value)}
                    value={q}
                    className="searchbar"
                />
            </div>
            <div 
                style={{ overflowY: 'scroll', height: '80vh' }}
            >
                {loading && <div className="loading">Loading...</div>}
                {nhanvien.length > 0 ? (
                    nhanvien.map(c => (
                        <div 
                            onClick={() => gotoDetail(c.id)} 
                            key={c.id} 
                            className="list-item"
                        >
                            <div className="list-item-content">
                                <img 
                                    className="avatar" 
                                    src={c.avatar}
                                    alt={c.name}
                                />
                                <div className="list-item-text">
                                    <h3>{c.name}</h3>
                                    <p>{c.email}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No results found</div>
                )}
                {loading && <div className="loading">Loading...</div>}
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
    );
}

export default NhanVien;
