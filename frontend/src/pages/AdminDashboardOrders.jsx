import React, { useEffect } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../redux/action/order";
import AdminSideBar from "../components/Admin/Layout/AdminSidebar";
import { DataGrid } from "@mui/x-data-grid";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, []);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

    {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        flex: 0.7,
        cellClassName: (params) => {
            return params.row.status === "Delivered" ? "greenColor" : "redColor";

        },
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 130,
      flex: 0.7,
    },

    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },
    {
        field: "joinedAt",
        headerName: "Order Date",
        type: "number",
        minWidth: 130,
        flex: 0.8,
      },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: item?.totalPrice + " $",
        status: item?.status,
        joinedAt: new Date(item.createdAt).toLocaleDateString('vi-VN'),
      });
    });
  return (
    <div>
    <AdminHeader />
    <div className="w-full flex">
    
      <div className="flex items-start justify-between w-full">
        
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={2} />
        </div>
        
        <div className="w-full min-h-[45vh] pt-5 rounded flex justify-center">
          <div className="w-[97%] flex justify-center">
            <DataGrid
              rows={row}
              columns={columns}
              pageSize={4}
              disableSelectionOnClick
              autoHeight
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminDashboardOrders;