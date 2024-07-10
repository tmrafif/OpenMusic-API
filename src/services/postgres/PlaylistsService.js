const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
    constructor(collaborationsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError("Playlist failed to add");
        }

        return result.rows[0].id;
    }

    async getPlaylists(userId) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username 
            FROM playlists
            LEFT JOIN users
            ON playlists.owner = users.id
            LEFT JOIN collaborations
            ON playlists.id = collaborations.playlist_id
            WHERE playlists.owner = $1
            OR collaborations.user_id = $1
            GROUP BY playlists.id, users.username`,
            values: [userId],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getPlaylistById(id) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            LEFT JOIN users
            ON playlists.owner = users.id
            WHERE playlists.id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Playlist Id not found");
        }

        return result.rows[0];
    }

    async deletePlaylistById(id) {
        const query = {
            text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Failed to delete playlist. Id not found");
        }
    }

    async verifySong(songId) {
        const query = {
            text: "SELECT * FROM songs WHERE id = $1",
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Song Id not found");
        }
    }

    async addSongToPlaylist({ playlistId, songId }) {
        const id = `playlist_song-${nanoid(16)}`;

        // verify song id
        await this.verifySong(songId);

        const query = {
            text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError("Song failed to add to playlist");
        }

        return result.rows[0].id;
    }

    async getSongsFromPlaylist(playlistId) {
        const playlist = await this.getPlaylistById(playlistId);

        const query = {
            text: `SELECT songs.id, songs.title, songs.performer 
            FROM playlist_songs
            LEFT JOIN songs
            ON playlist_songs.song_id = songs.id
            WHERE playlist_id = $1`,
            values: [playlistId],
        };

        const { rows: songs } = await this._pool.query(query);

        const result = { ...playlist, songs };
        return result;
    }

    async deleteSongFromPlaylist(playlistId, songId) {
        const query = {
            text: `DELETE FROM playlist_songs
            WHERE playlist_id = $1 
            AND song_id = $2 
            RETURNING id`,
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError(
                "Failed to delete song from playlist. Id not found"
            );
        }
    }

    async verifyPlaylistOwner(playlistId, ownerId) {
        const query = {
            text: "SELECT * FROM playlists WHERE id = $1",
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Playlist not found");
        }
        const playlist = result.rows[0];
        if (playlist.owner !== ownerId) {
            throw new AuthorizationError(
                "You are not the owner of this playlist"
            );
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        // verify owner
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            // verify collaborator
            await this._collaborationsService.verifyCollaborator(
                playlistId,
                userId
            );
        }
    }

    async addPlaylistActivity(playlistId, songId, userId, action) {
        const id = `playlist_activity-${nanoid(16)}`;
        const time = new Date().toISOString();

        const query = {
            text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
            values: [id, playlistId, songId, userId, action, time],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError("Playlist activity failed to add");
        }

        return result.rows[0].id;
    }

    async getPlaylistActivities(playlistId) {
        const query = {
            text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
            FROM playlist_song_activities
            LEFT JOIN users
            ON playlist_song_activities.user_id = users.id
            LEFT JOIN songs
            ON playlist_song_activities.song_id = songs.id
            WHERE playlist_id = $1`,
            values: [playlistId],
        }

        const result = await this._pool.query(query);

        return result.rows;
    }
}

module.exports = PlaylistsService;
