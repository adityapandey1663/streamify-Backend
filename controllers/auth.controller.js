import User from "../Database/model.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../Database/Stream.js";

export async function signup(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 6 characters",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://api.dicebear.com/7.x/personas/svg?seed=user${randomNumber}`;

    // ✅ FIXED - Correct user creation
    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream User created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Failed to Create User");
    }

    // Generate token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set cookie
  res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",     // ✅ FIX
  secure: false        // ✅ FIX (dev only)
});

    return res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log("There is some error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(200)
        .json({ success: false, message: "All field is required" });
    }

    const emailExists = await User.findOne({ email });
    if (!emailExists) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await emailExists.matchPassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or Password" });
    }

    const token = jwt.sign(
      { userId: emailExists._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, emailExists });
  } catch (error) {
    console.log("Error in login Controller", error);
    return res.status(500).json({ success: false, error });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logut Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout Falied" });
  }
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, nativeLanguage, learningLanguage, location, bio } = req.body;

    if (!fullName || !nativeLanguage || !learningLanguage || !location) {
      return res
        .status(401)
        .json({
          message: "All fields are required",
          missingFields: [
            !fullName && "fullName",
            !bio && "bio",
            !nativeLanguage && "nativeLanguage",
            !learningLanguage && "learningLanguage",
            !location && "location",
          ],
        });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updateUser) return res.status(404).json({ message: "User not found" });

     try {
         await upsertStreamUser({
      id: updateUser._id.toString(),
      name:updateUser.fullName,
      image:updateUser.profilePic || "",
    })
      console.log(`Stream User updated after onboarding for ${updateUser.fullName}`);
      
      
     } catch (error) {
      console.log(error);
      
      
     }

    res.status(200).json({ success: true, user: updateUser });
  } catch (error) {
    console.error("Onboarding error : ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
