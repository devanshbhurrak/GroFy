import jwt from "jsonwebtoken";


export const sellerLogin = async(req, res) => {
    const {email, password} = req.body;

    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'})
    
        res.cookie('sellerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7*24*60*60*1000
        })
        return res.json({success:true, message: 'Logged In'})
    }
    return res.json({success:false, message:'Invalid Credentials'})
} 


export const isAuthSeller = (req, res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message:error.message})
    }
}

export const sellerLogout = (req, res) => {
    try {
        res.clearCookie('sellerToken', {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
        })
        return res.json({success: true, message: 'Logged Out'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}