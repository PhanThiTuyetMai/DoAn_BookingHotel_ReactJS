import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

function NhanVienManagement() {
  return (
    <div>
      <ListItem component={Link} to="/nhanvien">
        <ListItemText primary="Nhân Viên" />
      </ListItem>
      <ListItem component={Link} to="/add_nv">
        <ListItemText primary="Thêm Nhân Viên" />
      </ListItem>
    </div>
  );
}

export default NhanVienManagement;
