import React, { useContext, useEffect, useState } from 'react';
import { AppBar, Toolbar, Button, Drawer, Box, List, ListItem, ListItemText, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';
import MyContext from '../../configs/MyContext';
import SearchBox from './TrangChu';
import API, { endpoints } from '../../configs/API';

const Home = () => {
    const [state] = useContext(MyContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElHotel, setAnchorElHotel] = useState(null);
    const [anchorElKH, setAnchorElKH] = useState(null);
    const [anchorElVoucher, setAnchorElVoucher] = useState(null);
    const location = useLocation();
    const [userHasHotel, setUserHasHotel] = useState(false);
    const { user } = state;

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await API.get(endpoints['hotels']); 
                const data = response.data.results;   
                const userExistsInHotels = data.some(hotel => hotel.user === user.id);
                setUserHasHotel(userExistsInHotels);
                console.log(userExistsInHotels);
            } catch (error) {
                console.error('Error fetching hotel data:', error);
            }
        };

        if (user) {
            fetchHotels();
        }
    }, [user]);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleHotelMenuClick = (event) => {
        setAnchorElHotel(event.currentTarget);
    };

    const handleHotelMenuClose = () => {
        setAnchorElHotel(null);
    };

    const handleKHMenuClick = (event) => {
        setAnchorElKH(event.currentTarget);
    };

    const handleKHMenuClose = () => {
        setAnchorElKH(null);
    };

    const handleVoucherMenuClick = (event) => {
        setAnchorElVoucher(event.currentTarget);
    };

    const handleVoucherMenuClose = () => {
        setAnchorElVoucher(null);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const menuItems = (
        <div role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <List>
                <ListItem button onClick={handleMenuClick}>
                    <ListItemText primary="Quản lý nhân viên" />
                </ListItem>
                <ListItem button onClick={handleHotelMenuClick}>
                    <ListItemText primary="Quản lý khách sạn" />
                </ListItem>
                <ListItem button onClick={handleHotelMenuClick}>
                    <ListItemText primary="Quản lý khách sạn" />
                </ListItem>
                <ListItem button onClick={handleVoucherMenuClick}>
                    <ListItemText primary="Quản lý Khuyến Mãi" />
                </ListItem>
            </List>
        </div>
    );

    const employeeMenu = (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose} component={Link} to="/nhanvien">
                Danh Sách Nhân Viên
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/add_nv">
                Thêm Nhân Viên
            </MenuItem>
        </Menu>
    );


    const customerMenu = (
        <Menu
            anchorEl={anchorElKH}
            open={Boolean(anchorElKH)}
            onClose={handleKHMenuClose}
        >
            <MenuItem onClick={handleKHMenuClose} component={Link} to="/khachhang">
                Danh Sách Khách Hàng
            </MenuItem>
        </Menu>
    );

    const voucherMenu = (
        <Menu
            anchorEl={anchorElVoucher}
            open={Boolean(anchorElVoucher)}
            onClose={handleVoucherMenuClose}
        >
            <MenuItem onClick={handleVoucherMenuClose} component={Link} to="/voucher">
                Danh Sách Khuyến Mãi
            </MenuItem>
            {user && (user.role !== 4 && user.role !== 2) && (
                <MenuItem onClick={handleVoucherMenuClose} component={Link} to="/add_voucher/:idhotel">
                    Thêm Khuyến Mãi
                </MenuItem>
            )}
        </Menu>
    );

    const hotelMenu = (
        <Menu
            anchorEl={anchorElHotel}
            open={Boolean(anchorElHotel)}
            onClose={handleHotelMenuClose}
        >
            <MenuItem onClick={handleHotelMenuClose} component={Link} to="/hotel">
                Danh Sách Khách Sạn
            </MenuItem>
            
            {user && user.role === 3 && (
                <>
                    <MenuItem onClick={handleHotelMenuClose} component={Link} to="/list_request_hotel">
                        Danh Sách Yêu Cầu
                    </MenuItem>
                </>
            )}
            
            {user && user.role === 4 && !userHasHotel && (
                <MenuItem onClick={handleHotelMenuClose} component={Link} to="/them_hotel">Thêm Yêu Cầu Khách Sạn</MenuItem>
            )}
            {user && user.role === 4 && userHasHotel && (
                <MenuItem onClick={handleHotelMenuClose} component={Link} to="/traphong">
                    Trả Phòng Khách Sạn
                </MenuItem>
            )}
            {user && user.role === 4 && (
                <MenuItem onClick={handleHotelMenuClose} component={Link} to="/my_hotel">Thông Tin Khách Sạn</MenuItem>
            )}
        </Menu>
    );
    

    const isHomePage = location.pathname === '/';

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex'}}>
                        <img 
                            src="/ks.jpg"
                            alt="Logo"
                            style={{
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                marginRight: '8px' 
                            }}
                        />
                        <Button color="inherit" component={Link} to="/">
                            Trang Chủ
                        </Button>
                    </Box>
                    <Box>
                        {user && (user.role !== 4 && user.role !== 2) && (
                            <Button variant="outline-primary" onClick={handleKHMenuClick}>
                                Quản Lý Khách Hàng
                            </Button>
                        )}
                        {customerMenu}
                    </Box>
                    <Box>
                        {user && user.role ===3 && (
                            <Button color="inherit" onClick={handleMenuClick}>
                                Quản Lý Nhân Viên
                            </Button>
                        )}
                        {employeeMenu}
                    </Box>
                    <Box>
                        {user && user.role !== 2 ? (
                            <Button color="inherit" onClick={handleHotelMenuClick}>
                                Quản Lý Khách Sạn
                            </Button>
                        ): (
                            <Button color="inherit" onClick={handleHotelMenuClick}>
                                Danh Sách Khách Sạn
                            </Button>
                        )}
                        {hotelMenu}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user && user.role !== 2 && (
                            <Button variant="outline-primary" onClick={handleVoucherMenuClick}>
                                Quản Lý Khuyến Mãi
                            </Button>
                        )}
                        {voucherMenu}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        {user && user.role === 4 ? (
                            <Button color="inherit" component={Link} to="/thongke_doanhthu">
                                Thống Kê Doanh Thu
                            </Button>
                        ) : user && user.role === 3 ? (
                            <Button color="inherit" component={Link} to="/thongke">
                                Thống Kê
                            </Button>
                        ) : null} 
                    </Box>
                    {user && user.role === 2 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: '750px' }}>
                            {user ? (
                                <>
                                    {user.avatar && (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.username} 
                                            style={{
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '50%', 
                                                marginRight: '8px' 
                                            }}
                                        />
                                    )}
                                    <Button variant="outline-secondary" component={Link} to="/profile/">
                                        Lịch Sử Đơn Đặt 
                                    </Button>
                                </>
                            ) : null}
                        </Box>
                    ): (
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: '50px' }}>
                            {user ? (
                                <>
                                    {user.avatar && (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.username} 
                                            style={{
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '50%', 
                                                marginRight: '8px' 
                                            }}
                                        />
                                    )}
                                    <Button variant="outline-secondary" component={Link} to="/profile/">
                                        Lịch Sử Đơn Đặt 
                                    </Button>
                                </>
                            ) : null}
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user !== null ? (
                            <Button color="inherit" component={Link} to="/logout">
                                Đăng Xuất
                            </Button>
                        ) : (
                            <div>
                                <Button color="inherit" component={Link} to="/login">
                                    Đăng Nhập
                                </Button>
                                <Button color="inherit" component={Link} to="/register">
                                    Đăng Ký
                                </Button>
                            </div>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                {menuItems}
            </Drawer>
            <div>
                {isHomePage && <SearchBox/>}
            </div>
        </div>
    );
};

export default Home;
