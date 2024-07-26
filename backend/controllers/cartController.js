import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';

// Function to add an item to the cart
const addToCart = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await userModel.findById(decoded.id);

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cart || {};

    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }

    const updateResponse = await userModel.findByIdAndUpdate(decoded.id, { cart: cartData }, { new: true });

    res.json({ success: true, message: "Added to cart", cart: updateResponse.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

// Function to remove an item from the cart
const removeFromCart = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await userModel.findById(decoded.id);

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cart || {};

    if (cartData[req.body.itemId]) {
      delete cartData[req.body.itemId];
    }

    const updateResponse = await userModel.findByIdAndUpdate(decoded.id, { cart: cartData }, { new: true });

    res.json({ success: true, message: "Removed from cart", cart: updateResponse.cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

// Function to fetch the cart data
const getCart = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await userModel.findById(decoded.id);

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, cart: userData.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
