const jwt = require('jsonwebtoken')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq } = require('drizzle-orm')
const postgres = require('postgres')
const { users } = require('../db/schema')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Không tìm thấy token xác thực'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Check if user still exists and is active
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)

    if (user.length === 0) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Tài khoản không tồn tại'
      })
    }

    if (!user[0].isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Tài khoản đã bị vô hiệu hóa'
      })
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      userData: user[0]
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token không hợp lệ'
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Token đã hết hạn'
      })
    }

    console.error('Authentication error:', error)
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Lỗi xác thực người dùng'
    })
  }
}

/**
 * Authorization middleware to check user roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Chưa xác thực người dùng'
      })
    }

    const userRole = req.user.role
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Bạn không có quyền truy cập chức năng này'
      })
    }

    next()
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1)

      if (user.length > 0 && user[0].isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          userData: user[0]
        }
      }
    }

    next()
  } catch (error) {
    // Ignore errors in optional auth
    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
}
