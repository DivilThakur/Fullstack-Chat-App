import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ Message: "Unauthorised - No Token Provided" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(401).json({ Message: "Unauthorised - Invalid Token " });

        }
        const user = await User.findById(decode.userId).select("-password");
        if (!user) {
            return res.status(404).json({ Message: "User Not Found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("Error in AuthMiddleWare", error.Message);
        res.status(500).json({ message: "Internal server error" });
    }
}