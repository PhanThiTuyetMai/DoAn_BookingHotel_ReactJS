import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API, { authAPI, BASE_URL, endpoints } from '../../configs/API';
import { Button, TextField, Typography, Container, Grid, Card, CardMedia, CardContent, Alert, Snackbar } from '@mui/material';
import './css/styles_add.css'; 

const ThemNV = () => {
    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [sex, setSex] = useState('');
    const [address, setAddress] = useState('');
    const [cccd, setCCCD] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [listuser, setListUser]  = useState ([]);
    const [avatarUrl, setAvatarUrl] = useState(''); 
    const navigate = useNavigate();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const blobUrl = URL.createObjectURL(file);
        setAvatarUrl(blobUrl); 
        setAvatar(file);
      }
    };

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await API.get(endpoints['list_user']);
          setListUser(response.data); 
          console.log(response.data);
        } catch (error) {
          console.error('Failed to fetch user list:', error.message);
        }
      };
      fetchUsers();
    }, []);

    const findUserId = (name) => {
          const nameParts = name.trim().split(' '); 
          console.log(nameParts);
          if (nameParts.length >= 2) {
            const firstName = nameParts[0]; // Tên đầu tiên
            const lastName = nameParts.slice(1).join(' '); // Tên còn lại
            console.log(lastName);
            const foundUser = listuser.find(user => 
              user.first_name === firstName.trim().toString() && user.last_name === lastName.trim().toString()
            );

            return foundUser ? foundUser.id : null;
          }

          const foundUser = listuser.find(user => 
            `${user.firstName} ${user.lastName}` === name
          );

          return foundUser ? foundUser.id : null;
    };

    const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
    };

    const addEmployee = async () => {
      try {
        
        const list = await API.get(endpoints['list_user']);
        setListUser(list);

        if (!name || !birthday || !sex || !address || !cccd|| !phone || !email || !avatar) {
          setSnackbarMessage('Vui lòng nhập đầy đủ thông tin và chọn ảnh đại diện');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          return;
        }

        const userId = findUserId(name); 

        if (!userId) {
          setSnackbarMessage('Không tìm thấy người dùng này !!');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          return;
        }

        const token = localStorage.getItem('access_token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        };
        const formData = new FormData();
        formData.append('name', name);
        formData.append('birthday', birthday);
        formData.append('sex', sex);
        formData.append('address', address);
        formData.append('cccd', cccd);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('avatar', avatar);
        formData.append('user', userId);
        formData.append('active', 1);
      
      const response = await API.post(endpoints['add_nv'], formData, {headers})
      console.log('Response:', response);
      if (response.status === 200 || response.status === 201) {
          setSnackbarMessage('Thêm thành công. Bạn vui lòng quay lại trang Nhân Viên để xem sự thay đổi.');
          setSnackbarSeverity('success');
          setName('');
          setBirthday('');
          setSex('');
          setAddress('');
          setCCCD('');
          setPhone('');
          setEmail('');
          setAvatar(null);
      }
    } catch (error) {
        console.error('Lỗi:', error);
        setSnackbarMessage('Đã xảy ra lỗi khi thêm nhân viên');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    };

    return (
      <div>
        <Container component="main" maxWidth="xs" className="container1">
          <Card>
            <CardContent>
              <Typography variant="h5" style={{marginLeft: 75}}>Thêm Nhân Viên</Typography>
              <TextField
                margin="normal"
                fullWidth
                label="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Ngày sinh"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Giới tính"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="CMND"
                value={cccd}
                onChange={(e) => setCCCD(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {avatarUrl && (
                <CardMedia
                  component="img"
                  image={avatarUrl}
                  alt="Avatar"
                  style={{ width: '100%', height: 'auto', marginTop: 10 }}
                />
              )}
              <Grid container spacing={2} justifyContent="center" marginTop={2}>
                <Grid item>
                  <Button variant="contained" color="secondary" onClick={() => navigate('/nhanvien')}>
                    Quay Lại
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={addEmployee}>
                    Thêm nhân viên
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </div>
    );
}

export default ThemNV;
