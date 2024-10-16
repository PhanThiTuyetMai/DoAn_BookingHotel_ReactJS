import React, { useEffect, useState } from 'react';
import { Typography, Button, CircularProgress, Container, Card, CardContent, CardMedia, Snackbar, Alert, Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import API, { endpoints } from '../../configs/API';

const NhanVienDetail = () => {
  const { id } = useParams();
  const [nhanvien, setNhanVien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    const loadNhanVienDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = {
          Authorization: `Bearer ${token}`
        };
        const res = await API.get(`${endpoints['nhanvien']}?ma=${id}`, {headers});
        setNhanVien(res.data.results);
      } catch (error) {
        console.error(error);
        setSnackbarMessage('Đã xảy ra lỗi khi tải thông tin nhân viên');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };
    loadNhanVienDetail();
  }, [id]);

  const XoaNhanVien = async () => {
    setSnackbarMessage('Bạn có chắc chắn muốn xóa nhân viên này?');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?');
    if (confirm) {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          let headers = {
            Authorization: `Bearer ${token}`
          };
          const res = await API.delete(`${endpoints['nhanvien']}${id}/Xoa_NV/`, { headers });
          if (res.status === 204) {
            setSnackbarMessage('Xóa thành công');
            setSnackbarSeverity('success');
            navigate('/nhanvien');
          } else {
            setSnackbarMessage('Lỗi! Bạn có phải là Quản Lý');
            setSnackbarSeverity('error');
          }
        } else {
          setSnackbarMessage('Lỗi! Không thể xóa nhân viên!!');
          setSnackbarSeverity('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setSnackbarMessage('Đã xảy ra lỗi khi xóa nhân viên');
        setSnackbarSeverity('error');
      }
    }
  };

  const quayLai = () => {
    navigate('/nhanvien');
  };

  const suaNhanVien = (idnv) => {
    navigate(`/sua_nv/${idnv}`);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        THÔNG TIN NHÂN VIÊN
      </Typography>
      {nhanvien && nhanvien.map(c => (
        <Card key={c.id} style={{ marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <CardMedia
            component="img"
            alt="Avatar"
            height="200"
            image={c.avatar}
            style={{
              objectFit: 'cover',
              borderRadius: '50%', // Đặt borderRadius để tạo hình tròn
              width: '250px',     // Đảm bảo chiều rộng và chiều cao bằng nhau
              height: '250px',    // Đảm bảo chiều rộng và chiều cao bằng nhau
              margin: '0 auto',   // Để căn giữa hình ảnh
              display: 'block'    // Để đảm bảo hình ảnh là một block-level element
            }}
          />
          <CardContent style={{ textAlign: 'center' }}>
            <Typography variant="h5" style={{ color: '#1976d2', marginBottom: '8px' }}>
              Tên: {c.name}
            </Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Mã nhân viên: {c.id}</Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Ngày Sinh: {c.birthday}</Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Giới Tính: {c.sex}</Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Địa chỉ: {c.address}</Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Email: {c.email}</Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>CMND: {c.cccd}</Typography>
            <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Số điện thoại: {c.phone}</Typography>
          </CardContent>
          <CardContent>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="secondary" onClick={quayLai}>
                  Quay lại
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={() => suaNhanVien(c.id)}>
                  Sửa
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="error" onClick={XoaNhanVien}>
                  Xóa
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
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
  );
};

export default NhanVienDetail;