import React, { useEffect, useState } from 'react';
import { Container, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../configs/API'; 
import { DropzoneArea } from 'mui-file-dropzone'; 
import { toast } from 'react-toastify';

const SuaNhanVien = () => {
    const { idnv } = useParams();
    console.log(idnv);
    const navigate = useNavigate();
    const [id, setID] = useState('');
    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [sex, setSex] = useState('');
    const [address, setAddress] = useState('');
    const [cccd, setCCCD] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [userID, setUserID] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [newAvatar, setNewAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        NhanVienData();
    }, [idnv]);

    const NhanVienData = async () => {
        setLoading(true);
        try {
                const token = localStorage.getItem('access_token');
                const headers = {
                    Authorization: `Bearer ${token}`
                };
                const response = await API.get(`${endpoints['nhanvien']}?ma=${idnv}`, {headers});
                const data = response.data.results;
                if (data && data.length > 0) {
                    const c = data[0];
                    setID(c.id);
                    setName(c.name);
                    setBirthday(c.birthday);
                    setSex(c.sex);
                    setAddress(c.address);
                    setCCCD(c.cccd);
                    setPhone(c.phone);
                    setEmail(c.email);
                    setAvatar(c.avatar);
                    setUserID(c.user);
            } else {
                alert('Bạn có phải là Quản Lý!! Vui lòng đăng nhập đúng tài khoản!');
                navigate('/login');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin nhân viên:', error);
        }
        setLoading(false);
    };

    const handleImageUpload = (files) => {
        const file = files[0];
        if (file) {
            setNewAvatar(file);
        }
    };

    const suaNhanVien = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', name);
            formData.append('birthday', birthday);
            formData.append('sex', sex);
            formData.append('address', address);
            formData.append('cccd', cccd);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('user', userID);
            formData.append('active', 1);

            if (newAvatar) {
                formData.append('avatar', newAvatar);
            } else if (avatar) {
                formData.append('avatar', avatar);
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            };

            await API.put(`${endpoints['nhanvien']}${idnv}/sua_nv/`, formData, {headers});
            toast.success('Sửa thành công')
            await NhanVienData();
            setTimeout(() => {
                navigate('/nhanvien');
            }, 2000)
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin nhân viên:', error);
            alert('Lỗi khi cập nhật thông tin nhân viên!!!');
        }
        setLoading(false);
    };

    return (
        <Container>
            {loading ? (
                <CircularProgress />
            ) : (
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Cập Nhật Thông Tin Nhân Viên
                    </Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Tên nhân viên"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ngày Sinh"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Giới Tính"
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Địa Chỉ"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="CMND"
                        value={cccd}
                        onChange={(e) => setCCCD(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Điện Thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Box sx={{ my: 3 }}>
                        <Typography variant="h6">Chọn ảnh đại diện:</Typography>
                        <DropzoneArea
                            acceptedFiles={['image/*']}
                            onChange={handleImageUpload}
                            showPreviews
                            showPreviewsInDropzone={false}
                        />
                        {newAvatar && (
                            <img
                                src={URL.createObjectURL(newAvatar)}
                                alt="Preview"
                                style={{ width: 200, height: 200, marginTop: 10 }}
                            />
                        )}
                        {avatar && !newAvatar && (
                            <img
                                src={avatar}
                                alt="Current Avatar"
                                style={{ width: 200, height: 200, marginTop: 10 }}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button variant="contained" color="secondary" onClick={() => navigate('/nhanvien')}>
                            Quay Lại
                        </Button>
                        <Button variant="contained" color="primary" onClick={suaNhanVien}>
                            Cập nhật
                        </Button>
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default SuaNhanVien;
