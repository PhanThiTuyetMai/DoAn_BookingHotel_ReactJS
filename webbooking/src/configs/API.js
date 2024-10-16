import axios from 'axios';


export const BASE_URL = 'http://localhost:8000/'; 


export const endpoints = {
    'login': '/o/token/',
    'current-user': '/users/current_user/',
    'Register': '/users/register/',
    'list_user': '/users/list_user/',
    'nhanvien': '/employees/',
    'add_nv': '/employees/them_nv/',
    'khachhang': '/customers/',
    'provinces': '/provinces/',
    'hotels':'/hotels/',
    'request': '/request',
    'add_hotel_request': '/request/add_request/',
    'hotel_images': '/hotelimages/',
    'add_service': '/services/them_dichvu/',
    'services':'/services/',
    'themphong': '/hotelrooms/them_phong/',
    'typeroom': '/typeroom/',
    'room': '/hotelrooms/',
    'roomimages': '/roomimages/',
    'voucher': '/voucher/',
    'voucher_room':'/voucher_room/',
    'customer': '/customers/',
    'add_customer': '/customers/them_kh/',
    'booking': '/booking/booking/',
    'them_booking_room': '/bookingroom/them_booking_room/',
    'list_booking': '/booking/',
    'momo': '/payment/',
    'zalo': '/zalo/payment/',
};


export const authAPI = (accessToken) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            Authorization: `Bearer ${accessToken}` 
        }
    });
};


export default axios.create({
    baseURL: BASE_URL
});
