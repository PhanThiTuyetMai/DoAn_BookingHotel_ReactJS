import React, { useContext } from "react";
import { Button } from "react-bootstrap"; // Sử dụng Button từ Bootstrap
import MyContext from '../../configs/MyContext';
import { useNavigate } from "react-router-dom"; 

const Logout = () => {
    const [user, dispatch] = useContext(MyContext);
    const navigate = useNavigate(); 

    const logout = () => {
        dispatch({
            type: "logout"
        });
        navigate('/');
    };

    const goToLogin = () => {
        navigate('/login'); 
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            {user === null ? (
                <Button
                    variant="primary" // Chọn màu từ Bootstrap
                    style={{ 
                        margin: "10px", 
                        padding: "10px 20px", // Tăng padding để nút lớn hơn
                        fontSize: "18px", // Tăng kích thước chữ
                        borderRadius: "5px" // Bo góc
                    }} 
                    onClick={goToLogin} 
                >
                    Đăng nhập
                </Button>
            ) : (
                <Button
                    variant="danger" // Màu đỏ cho đăng xuất
                    style={{ 
                        margin: "10px", 
                        padding: "10px 20px", // Tăng padding
                        fontSize: "18px", // Tăng kích thước chữ
                        borderRadius: "5px" // Bo góc
                    }} 
                    onClick={logout} 
                >
                    Đăng xuất
                </Button>
            )}
        </div>
    );
};

export default Logout;
