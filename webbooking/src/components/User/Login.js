import React, { useState, useContext } from 'react';
import { TextField, Button, CircularProgress, InputAdornment, IconButton } from '@mui/material'; 
import MyContext from '../../configs/MyContext';
import API, { authAPI, endpoints } from '../../configs/API';
import { useNavigate } from 'react-router-dom';
import { AccountCircle, Visibility } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, dispatch] = useContext(MyContext);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const formData = new URLSearchParams(); // Use URLSearchParams for form data
      formData.append('username', username);
      formData.append('password', password);
      formData.append('client_id', '0aE2mtkbjypCNituN7SyRlmgQE2p8wXWOwIIKEwW');
      formData.append('client_secret', 'fhPs9exmmcPSDT5lnQkP7WnmPt7ZHXdafZwa1X782nH4H4d1UF7UCa0B9elpvGRsFoOhOOxSqgEbeEpubl26jjhijU5zqk4rR9q714QHBocRxIEPvyCzzEfiWqntuAA0');
      formData.append('grant_type', 'password');

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const res = await API.post(endpoints['login'], formData, config);

      localStorage.setItem('access_token', res.data.access_token);

      const authAxios = authAPI(res.data.access_token);

      const user = await authAxios.get(endpoints['current-user']);
      console.log(user.data);

      dispatch({
        type: 'login',
        payload: user.data,
      });

      navigate('/');

    } catch (ex) {
        console.error(ex);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: 'url(/1.jpg)', backgroundPosition: 'center', height: '750px' }}>
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h1 style={{  marginTop: '80px', marginBottom: '50px', textAlign: 'center', color: 'red' }}>ĐĂNG NHẬP</h1>
        <TextField
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tên đăng nhập..."
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
                <InputAdornment position="end">
                    <AccountCircle />
                </InputAdornment>
            ) 
        }}
        />
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Mật khẩu..."
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
                <InputAdornment position="end">
                    <IconButton>
                        <Visibility />
                    </IconButton>
                </InputAdornment>
            ) 
        }}
        />
        <Button
          variant="contained"
          color="secondary"
          style={{ marginTop: '60px', width: '100%' }}
          onClick={login}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'ĐĂNG NHẬP'}
        </Button>
      </div>
    </div>
  );
};

export default Login;
