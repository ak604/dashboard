const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const userService = require('./userService');
const appService = require('./appService');

class AuthService {
    constructor() {
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    /**
     * Verify Google OAuth token and return user info
     * @param {string} token - Google OAuth token
     * @returns {Promise<Object>} - Google user info
     */
    async verifyGoogleToken(token) {
        console.log(process.env.GOOGLE_CLIENT_ID)
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
           

            const payload = ticket.getPayload();
            
            return {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                emailVerified: payload.email_verified
            };
        } catch (error) {
            console.error('Error verifying Google token:', error);
            throw new Error('Invalid Google token');
        }
    }

    /**
     * Generate JWT token for user
     * @param {Object} user - User object
     * @param {string} contextId - Context ID (appId or companyId)
     * @returns {string} - JWT token
     */
    generateJWTToken(user, contextId) {
        return jwt.sign(
            {
                userId: user.userId,
                contextId: contextId,
                email: user.email,
                accessLevel: user.accessLevel
            },
            process.env.JWT_SECRET,
            { expiresIn: '90d' }
        );
    }

    /**
     * Get or create user from Google info
     * @param {Object} googleUser - Google user info
     * @param {string} contextId - Context ID (appId or companyId)
     * @returns {Promise<Object>} - User object
     */
    async getOrCreateUser(googleUser, contextId) {
        let user = await userService.getUserByEmail(googleUser.email);

        if (!user) {
            const newUser = {
                email: googleUser.email,
                name: googleUser.name,
                googleId: googleUser.googleId,
                picture: googleUser.picture,
                accessLevel: 'USER'
            };

            user = await userService.createUserWithGoogle(newUser, contextId);
        }

        return user;
    }
}

module.exports = new AuthService(); 