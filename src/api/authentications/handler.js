const autoBind = require("auto-bind");

class AuthenticationsHandler {
    constructor(
        authenticationsServices,
        usersServices,
        tokenManager,
        validator
    ) {
        this._authenticationsServices = authenticationsServices;
        this._usersServices = usersServices;
        this._tokenManager = tokenManager;
        this._validator = validator;

        autoBind(this);
    }

    async postAuthenticationHandler(request, h) {
        this._validator.validatePostAuthenticationPayload(request.payload);

        const { username, password } = request.payload;
        const id = await this._usersServices.verifyUserCredential({
            username,
            password,
        });

        const accessToken = this._tokenManager.generateAccessToken({ id });
        const refreshToken = this._tokenManager.generateRefreshToken({ id });

        // store refresh token
        await this._authenticationsServices.addRefreshToken(refreshToken);

        const response = h.response({
            status: "success",
            message: "Authentication added successfully",
            data: {
                accessToken,
                refreshToken,
            },
        });
        response.code(201);
        return response;
    }

    async putAuthenticationHandler(request, h) {
        this._validator.validatePutAuthenticationPayload(request.payload);
        const { refreshToken } = request.payload;

        // verify refresh token
        await this._authenticationsServices.verifyRefreshToken(refreshToken);
        const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

        const accessToken = this._tokenManager.generateAccessToken({ id });

        const response = h.response({
            status: "success",
            message: "Access Token updated successfully",
            data: { accessToken },
        });
        return response;
    }

    async deleteAuthenticationHandler(request, h) {
        this._validator.validateDeleteAuthenticationPayload(request.payload);
        const { refreshToken } = request.payload;

        // verify refresh token
        await this._authenticationsServices.verifyRefreshToken(refreshToken);

        await this._authenticationsServices.deleteRefreshToken(refreshToken);

        const response = h.response({
            status: "success",
            message: "Refresh Token successfully deleted",
        });
        return response;
    }
}

module.exports = AuthenticationsHandler;
