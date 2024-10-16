import Layout from './Layout';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NhanVien from './components/NhanVien/Employee';
import ThemNV from './components/NhanVien/AddEmployee';
import { useEffect, useReducer, useState } from 'react';
import MyContext from './configs/MyContext';
import Login from './components/User/Login';
import Logout from './components/User/Logout';
import NhanVienDetail from './components/NhanVien/DetailNV';
import { ThemeProvider, createTheme } from '@mui/material/styles'; 
import Register from './components/User/Register';
import SuaNhanVien from './components/NhanVien/SuaNhanVien';
import HotelForm from './components/Hotel/HotelRequest';
import ManageHotelRequests from './components/Hotel/DS_YeuCau_Hotel';
import HotelList from './components/Hotel/DS_Hotel';
import HotelDetails from './components/HotrelRom/DSRom';
import AddService from './components/Hotel/DichVu';
import AddHotelRoomForm from './components/HotrelRom/ThemRoom';
import CreateVoucher from './components/Voucher/Voucher';
import VoucherList from './components/Voucher/DSVoucher';
import BookingPage from './components/DatPhong/DatPhong';
import AddCustomer from './components/User/Profile';
import RoomDetails from './components/HotrelRom/HotelDetail';
import EditHotel from './components/Hotel/SuaHotel';
import ThongKeDT from './components/ThongKe/ThongKeDT';
import ThongKeQL from './components/ThongKe/ThongKeQL';
import ConfirmCheckout from './components/HotrelRom/TraPhong';
import EditHotelRoom from './components/Hotel/SuaPhong';
import KhachHang from './components/KhachHang/KhachHang';
import KhachHangDetail from './components/KhachHang/Detail_KH';
import SuaKhachHang from './components/KhachHang/SuaKhach';
import Footer from './components/Home/Footer';


const theme = createTheme({
  palette: {
    mode: 'light', // hoặc 'dark'
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    // Thêm các cấu hình khác nếu cần
  },
});


const initialState = { user: null };

const reducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return { ...state, user: action.payload };
      case 'logout':
        return { ...state, user: null }; 
      default:
        return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [userRole, setUserRole] = useState(null);
  const {user} = state;

  useEffect(() => {
    if(user) {
      setUserRole(user.Loai_NguoiDung)
    } else {
      setUserRole(null);
    }
  }, [user])

  return (
    <ThemeProvider theme={theme}>
        <Router>
            <MyContext.Provider value={[state, dispatch]}>
                  <Routes>
                    <Route path='/' element={<Layout/>} >
                      <Route path="/login" element={<Login />} />
                      <Route path="/logout" element={<Logout/>} />
                      <Route path='/register' element={<Register/>}/>
                      <Route path='/nhanvien' element={<NhanVien/>} />
                      <Route path='/add_nv' element={<ThemNV/>} />
                      <Route path='/sua_nv/:idnv' element={<SuaNhanVien />} />
                      <Route path='/detail_nv/:id' element={<NhanVienDetail/>} />
                      <Route path='/khachhang' element={<KhachHang/>} />
                      <Route path='/detail_kh/:id' element={<KhachHangDetail/>} />
                      <Route path='/sua_kh/:idkh' element={<SuaKhachHang/>} />
                      <Route path='/hotel' element={<HotelList />} />
                      <Route path='/list_request_hotel' element={<ManageHotelRequests />} />
                      <Route path='/them_hotel' element={<HotelForm />} />
                      <Route path='/sua_hotel/:idhotel' element={<EditHotel/>} />
                      <Route path='/my_hotel' element={<HotelDetails/>} />
                      <Route path='/add_services/:idht' element={<AddService/>} />
                      <Route path='/add_room/:idhotel' element={<AddHotelRoomForm/>} />
                      <Route path='/detail_hotel/:idhotel' element={<RoomDetails/>} />
                      <Route path='/voucher' element={<VoucherList/>} />
                      <Route path='/add_voucher/:idhotel' element={<CreateVoucher/>} />
                      <Route path='/booking/:idhotel/:idroom/:giaphong/:giatreem/:giathucung/:phithemtre/:phithemthu' element={<BookingPage/>} />
                      <Route path='/profile/' element={<AddCustomer/>} />
                      <Route path='/thongke_doanhthu' element={<ThongKeDT/>} />
                      <Route path='/thongke' element={<ThongKeQL/>} />
                      <Route path='/traphong' element={<ConfirmCheckout/>} />
                      <Route path='/suaphong/:idphong' element={<EditHotelRoom/>} />
                    </Route> 
                  </Routes>
                  <Footer/>
            </MyContext.Provider>
        </Router>
    </ThemeProvider>
  );
}

export default App;
