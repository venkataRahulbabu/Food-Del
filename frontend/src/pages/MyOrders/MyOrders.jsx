import React, { useContext, useState, useEffect } from 'react';
import './Myorders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);

  const fetchOrders = async () => {
    try {
      if (!token) {
        console.log("No token available.");
        return;
      }
      console.log("Fetching orders with token:", token);
      const response = await axios.post(`${url}/api/order/userorders`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log("Response received:", response);
      if (response.data && response.data.data) {
        setData(response.data.data);
        console.log("Orders fetched successfully:", response.data.data);
      } else {
        console.log("No data in response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.length > 0 ? data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="Parcel icon" />
            <p>
              {order.items.map((item, idx) => (
                <span key={idx}>
                  {item.name} x {item.quantity}
                  {idx !== order.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <p>${order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p><span>&#x25cf;</span><b>{order.status}</b></p>
            <button onClick={fetchOrders}>Track Order</button>
          </div>
        )) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
