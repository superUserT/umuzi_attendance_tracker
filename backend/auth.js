const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('./config/logger');
const User = require('./models/User');
const Admin = require('./models/Admin');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role || 'user' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const registerUser = async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      surname,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).send('Server error');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    let admin = await Admin.findOne({ email });

    const entity = user || admin;

    if (!entity) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, entity.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json({
      _id: entity._id,
      name: entity.name,
      email: entity.email,
      role: entity.role || 'user',
      token: generateToken(entity),
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).send('Server error');
  }
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      next();
    } catch (error) {
      logger.error('Token verification failed: %o', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ error: 'Not authorized as an admin' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  protect,
  admin
};
