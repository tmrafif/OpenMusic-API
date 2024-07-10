const autoBind = require("auto-bind");

class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;

        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._service.addPlaylist({
            name,
            owner: credentialId,
        });

        const response = h.response({
            status: "success",
            message: "Playlist added successfully",
            data: { playlistId },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;

        const playlists = await this._service.getPlaylists(credentialId);

        const response = h.response({
            status: "success",
            data: { playlists },
        });
        return response;
    }

    async deletePlaylistByIdHandler(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        // verify playlist owner
        await this._service.verifyPlaylistOwner(id, credentialId);

        await this._service.deletePlaylistById(id, credentialId);

        const response = h.response({
            status: "success",
            message: "Playlist deleted successfully",
        });
        return response;
    }

    async postSongToPlaylistHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        // verify playlist access
        await this._service.verifyPlaylistAccess(playlistId, credentialId);

        const playlistSongId = await this._service.addSongToPlaylist({
            playlistId,
            songId,
        });

        const response = h.response({
            status: "success",
            message: "Song added to playlist successfully",
            data: { playlistSongId },
        });
        response.code(201);
        return response;
    }

    async getSongsFromPlaylistHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        // verify playlist access
        await this._service.verifyPlaylistAccess(playlistId, credentialId);

        const playlist = await this._service.getSongsFromPlaylist(playlistId);

        const response = h.response({
            status: "success",
            data: { playlist },
        });
        return response;
    }

    async deleteSongFromPlaylistHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        // verify playlist access
        await this._service.verifyPlaylistAccess(playlistId, credentialId);

        await this._service.deleteSongFromPlaylist(playlistId, songId);

        const response = h.response({
            status: "success",
            message: "Song deleted from playlist successfully",
        });
        return response;
    }
}

module.exports = PlaylistsHandler;
