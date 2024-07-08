const Jwt = require("@hapi/jwt");
const InvariantError = require("../exceptions/InvariantError");

const TokenManager = {
    generateAccessToken(payload) {
        return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
    },
    generateRefreshToken(payload) {
        return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY);
    },
    verifyRefreshToken(refreshToken) {
        try {
            const artifacts = Jwt.token.decode(refreshToken);
            const { decoded, raw } = artifacts;
            Jwt.token.verifySignature({ decoded, raw }, process.env.REFRESH_TOKEN_KEY);
            const { payload } = artifacts.decoded;
            return payload;
        } catch (error) {
            throw new InvariantError("Invalid refresh token");
        }
    },
};

module.exports = TokenManager;
