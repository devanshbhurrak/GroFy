import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const placeOrderCOD = async(req, res) => {
    try {
        const {items, address} = req.body;
        const userId = req.userId

        if(!address || items.length <= 0)
            return res.json({success: false, message: 'Invalid Data'})

        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }
            amount += product.offerPrice * item.quantity;
        }
        amount += Math.floor(amount * 0.02);


        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'COD'
        })

        return res.json({success: true, message: 'Order Placed Successfully'})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const placeOrderStripe = async(req, res) => {
    try {
        const {items, address} = req.body;
        const userId = req.userId
        const {origin} = req.headers;

        if(!address || items.length <= 0)
            return res.json({success: false, message: 'Invalid Data'})

        let amount = 0;
        let productData = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }

            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });

            amount += product.offerPrice * item.quantity;
        }

        amount += Math.floor(amount * 0.02);


        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'Online'
        })

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price*0.02) * 100
                },
                quantity: item.quantity
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })
    
        return res.json({success: true, url: session.url})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// Stripe Webhooks to verify Payments Action : /stripe
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"]
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`)
    }

    switch(event.type) {
        case "payment_intent:succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId, userId} = session.data[0].metadata;

            await Order.findByIdAndUpdate(orderId, {isPaid: true})

            await User.findByIdAndUpdate(userId, {cartItems: {}})
            break;
        }
        case "payment_intent:payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`)
            break;
    } 
    res.json({received: true})
}

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId
        const orders = await Order.find({
            userId, 
            $or: [{paymentType:'COD'}, {isPaid:true}]
        }).populate('items.product address').sort({createdAt: -1})
        res.json({success: true, orders})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{paymentType:'COD'}, {isPaid:true}]
        }).populate('items.product address').sort({createdAt: -1})
        res.json({success: true, orders})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

