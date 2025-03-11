const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const sendMail = require('../ultis/sendMail');
const sendToken = require('../ultis/jwtToken');
const Shop = require('../model/shop');
const { isSeller, isAuthenticated, isAdmin } = require('../middleware/auth');
const { promiseHooks } = require('v8');
const { upload } = require('../multer');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../ultis/ErrorHandler');
const sendShopToken = require('../ultis/shopToken');
const shop = require('../model/shop');
const cloudinary = require('cloudinary');
//create shop
// router.post('/create-shop', upload.single('file'), async (req, res, next) => {
//   try {
//     // Lấy email và chuyển về chữ thường, loại bỏ khoảng trắng
//     const email = req.body.email.trim().toLowerCase();
//     const { name, password, phoneNumber, zipCode, address } = req.body;

//     // Kiểm tra xem email đã tồn tại chưa
//     const sellerEmail = await Shop.findOne({ email });
//     if (sellerEmail) {
//       return res.status(400).json({
//         success: false,
//         message:
//           'Người dùng đã tồn tại, vui lòng đăng nhập thay vì tạo tài khoản mới.',
//       });
//     }
//     const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
//       folder: 'avatars',
//     });

//     // Xử lý địa chỉ nếu nó là mảng
//     let shopAddress = address;
//     if (Array.isArray(shopAddress)) {
//       shopAddress = shopAddress.join(', ');
//     }

//     // // Tiếp tục tạo shop
//     // const filename = req.file.filename;
//     // const fileUrl = path.join('/uploads', filename);
//     // const public_id = filename;

//     const seller = {
//       name: req.body.name,
//       email: email,
//       password: req.body.password,
//       avatar: {
//         public_id: myCloud.public_id,
//         url: myCloud.secure_url,
//       },
//       address: req.body.address,
//       phoneNumber: req.body.phoneNumber,
//       zipCode: req.body.zipCode,
//     };

//     const activationToken = createActivationToken(seller);
//     // const activationUrl = `http://localhost:3001/seller/activation/${activationToken}`;
//     const isProduction = process.env.NODE_ENV === 'production';
//     const activationUrl = isProduction
//       ? `https://frontend-one-kappa-74.vercel.app/seller/activation/${activationToken}`
//       : `http://localhost:3000/seller/activation/${activationToken}`;

//     // Gửi email kích hoạt
//     await sendMail({
//       email: seller.email,
//       subject: 'Activate your account',
//       message: `Hello ${seller.name}, please click on the link to activate your account: ${activationUrl}`,
//     });

//     res.status(201).json({
//       success: true,
//       message: `Vui lòng kiểm tra email của bạn: ${seller.email} để kích hoạt shop!`,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });
// create shop

// create shop
router.post(
  '/create-shop',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
        return next(new ErrorHandler('User already exists', 400));
      }

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
      });

      const seller = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };

      const activationToken = createActivationToken(seller);
      // const activationUrl = `http://localhost:3001/seller/activation/${activationToken}`;
      const isProduction = process.env.NODE_ENV === 'production';
      const activationUrl = isProduction
        ? `https://frontend-one-kappa-74.vercel.app/seller/activation/${activationToken}`
        : `http://localhost:3000/seller/activation/${activationToken}`;
      try {
        await sendMail({
          email: seller.email,
          subject: 'Activate your Shop',
          message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${seller.email} to activate your shop!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: '5m',
  });
};

// activate user
router.post(
  '/activation',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      // Verify the activation token
      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler('Token không hợp lệ', 400));
      }

      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      // Check if the user already exists before activation
      let seller = await Shop.findOne({ email: email });

      if (seller) {
        return next(new ErrorHandler('Người dùng đã tồn tại', 400));
      }

      // Create a new shop after activation
      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      // Send token after successful activation
      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop
router.post(
  '/login-shop',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler('Please provide the all fields!', 400));
      }

      const user = await Shop.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler('Please provide the correct information', 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  '/getSeller',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id); // Sử dụng req.seller

      if (!seller) {
        return next(new ErrorHandler("seller doesn't exist", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// log out shop
router.get(
  '/logout',
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie('seller_token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// get shop info
router.get(
  '/get-shop-info/:id',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all shop --- for admin
router.get(
  '/admin-all-seller',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//delete seller by admin
router.delete(
  '/delete-seller/:id',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);
      if (!seller) {
        return next(
          new ErrorHandler('Người bán không có sẵn với id này', 404)
        );
      }
      await Shop.findByIdAndDelete(req.params.id);
      res.status(201).json({
        success: true,
        message: 'Người dùng đã xóa thành công',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller avatar
router.put(
  '/update-shop-avatar',
  isSeller,
  upload.single('image'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsSeller = await Shop.findById(req.seller._id);
      const imageId = existsSeller.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
      });
      existsSeller.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      // // Xóa avatar cũ nếu tồn tại
      // if (existsUser.avatar?.url) {
      //   const existsAvatarPath = `uploads/${existsUser.avatar.public_id}`;
      //   if (fs.existsSync(existsAvatarPath)) {
      //     fs.unlinkSync(existsAvatarPath);
      //   }
      // }

      // // Lấy thông tin file mới
      // const file = req.file;
      // const public_id = req.body.public_id || file.originalname; // Dùng tên đầy đủ của file (bao gồm đuôi file)
      // const url = `uploads/${public_id}`; // Xây dựng URL từ public_id

      // existsUser.avatar = { public_id, url };
      // await existsUser.save();
      await existsSeller.save();
      res.status(201).json({
        success: true,
        seller: existsSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  '/update-seller-info',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler('Không tìm thấy người dùng', 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  '/update-payment-methods',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// delete seller withdraw merthods --- only seller
router.delete(
  '/delete-withdraw-method/',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler('Không tìm thấy người bán với id này', 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// forgot-password route
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;
      const seller = await Shop.findOne({ email });

      if (!seller) {
        return next(new ErrorHandler("Người bán với email này không tồn tại", 404));
      }

      const resetToken = createPasswordResetToken(seller);
      const isProduction = process.env.NODE_ENV === "production";
      const resetUrl = isProduction
        ? `https://frontend-one-kappa-74.vercel.app/shop/reset-password/${resetToken}`
        : `http://localhost:3000/shop/reset-password/${resetToken}`;

      try {
        await sendMail({
          email: seller.email,
          subject: "Password Reset Request",
          message: `Hello ${seller.name},\n\nPlease click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this change, please ignore this email.\n\nBest regards,\nYour Shop Team`,
        });

        res.status(200).json({
          success: true,
          message: "Password reset link sent successfully.",
        });
      } catch (err) {
        return next(new ErrorHandler("Failed to send email. Please try again later.", 500));
      }
    } catch (error) {
      return next(new ErrorHandler("Something went wrong. Please try again.", 500));
    }
  })
);


// Create reset token
const createPasswordResetToken = (seller) => {
  const resetToken = jwt.sign({ id: seller._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h", // Token will expire in 1 hour
  });
  return resetToken;
};

// reset-password route
router.post(
  "/reset-password/:token",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { token } = req.params;
      const { newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const seller = await Shop.findById(decoded.id);

      if (!seller) {
        return next(new ErrorHandler("Invalid or expired token", 400));
      }

      seller.password = newPassword; // Update the password
      await seller.save();

      res.status(200).json({
        success: true,
        message: "Password has been successfully reset",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
