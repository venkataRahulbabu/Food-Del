import React, { createContext, useEffect, useState } from "react";
import axios from 'axios';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  const updateCartItems = (newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  const addToCart = async (itemId) => {
    const newCartItems = {
      ...cartItems,
      [itemId]: (cartItems[itemId] || 0) + 1,
    };
    updateCartItems(newCartItems);

    if (token) {
      try {
        await axios.post(url + "/api/cart/add", { itemId }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const newCartItems = { ...cartItems };
    if (newCartItems[itemId] === 1) {
      delete newCartItems[itemId];
    } else {
      newCartItems[itemId] -= 1;
    }
    updateCartItems(newCartItems);

    if (token) {
      try {
        await axios.post(url + "/api/cart/remove", { itemId }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) { 
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Error fetching food list:", error.message);
    }
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { Authorization: `Bearer ${token}` } });
      setCartItems(response.data.cartData || {}); 
    } catch (error) {
      console.error("Error loading cart data:", error.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
  
      const storedCartItems = localStorage.getItem("cartItems");
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }
  
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId); // assuming setUserId is defined to store userId in state
      }
    }
    loadData();
  }, []);
  

  useEffect(() => {
    if (!token) {
      setCartItems({}); // Clear cart items from state but not from local storage
    }
  }, [token]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems: updateCartItems, 
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
