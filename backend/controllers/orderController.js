import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://food-del-client-c9o8.onrender.com";
  try {
    // Decode the JWT token to get the user ID
    const decodedToken = jwt.verify(req.body.userId, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Log the decoded token to debug
    console.log("Decoded Token:", decodedToken);

    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newOrder = new orderModel({
      userId: userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: {
        currency: "cad",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};


// verifying the order and updating the user's cart data

const verifyOrder = async (req, res) => {
  const {orderId,success} = req.body;
  try{
    if(success=="true"){
      await orderModel.findByIdAndUpdate(orderId,{payment:true});
      res.json({success:true,message:"Paid"})
    }else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({success:false,message:"Not Paid"})
    }
  }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// user orders for frontend

const userOrders = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const orders = await orderModel.find({ userId: userId });
    console.log("Orders found:", orders); // Log the orders found

    if (!orders.length) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.log("Error fetching orders:", error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};



//Listing Orders for admin panel
const listOrders = async (req, res) => {
    try {
      const orders = await orderModel.find({});
      res.json({success: true,data: orders});
    } catch (error) {
      console.log(error);
      res.json({success: false, message: "Error listing orders"});
    }
}

// Api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {status: req.body.status})
    res.json({success: true, message: "Status updated"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error updating status"});
  }
}

export { placeOrder,verifyOrder,userOrders, listOrders ,updateStatus};
