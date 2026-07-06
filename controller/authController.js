const User = require('../model/userModel')
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

//Register
exports.Register = async (req, res) => {
  try {
    const {name, email, password, role} = req.body

    // const existUser = await User.findOne({email});
    const cleanEmail = email.toLowerCase().trim();

const existUser = await User.findOne({ email: cleanEmail });

    if(existUser) {
      return res.status(500).json({
        message: 'user already exist'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // const user = await User.create({
    //    name,
    //    email,
    //    password: hashedPassword,
    //    role,
    //    isApproved: role === 'seller' ? false : true,
    //    verificationToken
    // })

    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      isApproved: role === 'seller' ? false : true,
      verificationToken
    });

    

    // try {
    //   await sendEmail({
    //     email,
    //     subject: 'Verify your Email - Rentify Estate Platform', 
    //     message: `<p>Your email verification code is: <strong>${verificationToken}</strong></p><p>Please enter this code on the verification page to activate your account</p?`
    //   })
    // } catch (emailError) {
    //   console.log('Failed to send verification email:', emailError)
    // }

    await user.save()

    res.status(200).json({
      message: 'user registered. Please check you email for the verification code.',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    
    
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};

exports.login = async (req,res) => {
  try {
    const {email, password} = req.body
    if(!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required"
      });
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        message: "Invalid email or password"
      })
    }

    if(!user.isVerified){
      return res.status(400).json({
        message: "please verify your email or contact support"
      })
    }

    const isMath =  await bcrypt.compare(password, user.password)
    if(!isMath){
      return res.status(400).json({
        message: 'invalid email or password'
      })
    }

    if(user.isBlocked){
      return res.status(403).json({
        message: 'your account has blocked by an admin. please contact support'
      })
    }

    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET,{
      expiresIn: '7d'
    })

    res.json({
      message: 'login successfully',
      token,
      user
    })
    
    
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user =  await User.findById(req.user.id).select('-password');

    if(!user){
      return res.status(404).json({message: 'user not found'})
    }

    res.json({
      success:true,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const {email, code} = req.body;

    if(!email ||!code) {
      return res.status(400).json({
        message: 'email and code are required'
      })
    }

    const user = await User.findOne({email})

    if(!user){
      return res.status(404).json({
        message: 'user not found'
      })
    }

    

    if(user.verificationToken !== code) {
      return res.status(400).json({message: 'invalid verification code'})
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({
      message: "Email verified successfully"
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

//forget password 
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No user found with that email address" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        const clientUrl = "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
        const message = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset - Rentify Estate Platform",
                message,
            });
            res.status(200).json({ message: "Password reset email sent", success: true });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Could not send email", success: false });
        }
    } catch (err) {
        res.status(500).json({ message: err.message, success: false });
    }
};

exports.resetPassword = async (req, res) => {
  try {
    const {token} = req.params;
    const {password} = req.body;

    const resetPasswordToken = crypto.createHash('sh256'). update(token).digest('sum');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now()},
    })

    if(!user) {
      return res.status(400).json({
        message: 'invalid or expire password reset token',
        success: false
      })
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(200).json({
      message: 'password updated successfully'
    })
  } catch (error) {
    res.status(500).json({ message: err.message, success: false });
  }
}
