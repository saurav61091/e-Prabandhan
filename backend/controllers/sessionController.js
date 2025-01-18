const SessionService = require('../services/sessionService');
const createError = require('http-errors');

// Get user's active sessions
const getUserSessions = async (req, res) => {
  try {
    const sessions = await SessionService.getUserSessions(req.user.id);

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        deviceType: session.deviceType,
        deviceName: session.deviceName,
        browser: session.browser,
        os: session.os,
        location: session.location,
        lastActivity: session.lastActivity,
        isCurrentSession: session.token === req.session.token
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving sessions'
    });
  }
};

// Revoke a specific session
const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check if trying to revoke current session
    if (sessionId === req.session.id) {
      throw createError(400, 'Cannot revoke current session');
    }

    await SessionService.revokeSession(sessionId, req.user.id);

    res.json({
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error revoking session'
    });
  }
};

// Revoke all other sessions
const revokeOtherSessions = async (req, res) => {
  try {
    await SessionService.revokeUserSessions(req.user.id, req.session.id);

    res.json({
      message: 'All other sessions revoked successfully'
    });
  } catch (error) {
    console.error('Revoke other sessions error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error revoking other sessions'
    });
  }
};

// Refresh session token
const refreshSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError(400, 'Refresh token is required');
    }

    const newTokens = await SessionService.refreshSession(refreshToken);

    res.json({
      message: 'Session refreshed successfully',
      ...newTokens
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error refreshing session'
    });
  }
};

// Verify MFA for session
const verifyMFA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError(400, 'MFA token is required');
    }

    // Verify MFA token
    const verified = await req.user.verifyMFAToken(token);
    if (!verified) {
      throw createError(401, 'Invalid MFA token');
    }

    // Mark session as MFA verified
    await SessionService.markMFAVerified(req.session.id);

    res.json({
      message: 'MFA verified successfully'
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error verifying MFA'
    });
  }
};

// Get current session info
const getCurrentSession = async (req, res) => {
  try {
    const session = await SessionService.validateSession(req.session.token);

    res.json({
      session: {
        id: session.id,
        deviceType: session.deviceType,
        deviceName: session.deviceName,
        browser: session.browser,
        os: session.os,
        location: session.location,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        mfaVerified: session.mfaVerified
      }
    });
  } catch (error) {
    console.error('Get current session error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving current session'
    });
  }
};

module.exports = {
  getUserSessions,
  revokeSession,
  revokeOtherSessions,
  refreshSession,
  verifyMFA,
  getCurrentSession
};
