const autoBind = require("auto-bind");

class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        // verify playlist owner
        await this._playlistsService.verifyPlaylistOwner(
            playlistId,
            credentialId
        );

        const collaborationId =
            await this._collaborationsService.addCollaboration(
                playlistId,
                userId
            );

        const response = h.response({
            status: "success",
            message: "Collaboration added successfully",
            data: { collaborationId },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        // verify playlist owner
        await this._playlistsService.verifyPlaylistOwner(
            playlistId,
            credentialId
        );

        await this._collaborationsService.deleteCollaboration(
            playlistId,
            userId
        );

        const response = h.response({
            status: "success",
            message: "Collaboration deleted successfully",
        });
        return response;
    }
}

module.exports = CollaborationsHandler;
