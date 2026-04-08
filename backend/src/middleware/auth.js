import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  // Get token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1]

  if (!token)
    return res.status(401).json({ message: 'No token — please log in' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // attach user info to the request
    next()              // move on to the actual route
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
