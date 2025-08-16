const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq } = require('drizzle-orm')
const postgres = require('postgres')
const { users, staff } = require('../db/schema')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'staff' } = req.body

    // Validation
    if (!email || !password || !name) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Email, password, and name are required'
      })
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt
      })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser[0].id, 
        email: newUser[0].email, 
        role: newUser[0].role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser[0]
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (user.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    const userData = user[0]

    // Check if user is active
    if (!userData.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userData.id))

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email, 
        role: userData.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userData

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1)

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      })
    }

    res.json({
      user: user[0]
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user data'
    })
  }
})

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Current password and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters long'
      })
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1)

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].password)

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      })
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await db
      .update(users)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.userId))

    res.json({
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      error: 'Failed to change password',
      message: 'An error occurred while changing password'
    })
  }
})

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body

    // Validation
    if (!name) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Name is required'
      })
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set({
        name,
        avatar,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        updatedAt: users.updatedAt
      })

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    })
  }
})

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { 
        userId: req.user.userId, 
        email: req.user.email, 
        role: req.user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      message: 'Token refreshed successfully',
      token
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({
      error: 'Failed to refresh token',
      message: 'An error occurred while refreshing token'
    })
  }
})

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more sophisticated setup, you would add the token to a blacklist
  // For now, we just return success and let the client remove the token
  res.json({
    message: 'Logged out successfully'
  })
})

module.exports = router
