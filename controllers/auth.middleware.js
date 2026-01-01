import jwt from "jsonwebtoken";
import User from "../Database/model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });

    let decode;

    try {
      decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }

    const user = await User.findById(decode.userId).select("-password");

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    req.user=user;
    console.log(token);
    
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};

export default protectRoute;
