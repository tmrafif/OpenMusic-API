const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
// const { mapDBToModel } = require("../../utils");

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id =  `album-${nanoid(16)}`;

        const query = {
            text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError("Failed to add album");
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const queryAlbum = {
            text: "SELECT * FROM albums WHERE id = $1",
            values: [id],
        };

        const resultAlbum = await this._pool.query(queryAlbum);

        if (!resultAlbum.rows.length) {
            throw new NotFoundError("Album not found");
        }

        // check songs in album
        const querySong = {
            text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
            values: [id],
        };

        const resultSong = await this._pool.query(querySong);

        if (!resultSong.rows.length) {
            return { ...resultAlbum.rows[0], songs: [] };
        }

        return { ...resultAlbum.rows[0], songs: resultSong.rows };
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
            values: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Failed to update album. Id not found");
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: "DELETE FROM albums WHERE id = $1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Failed to delete album. Id not found");
        }
    }
}

module.exports = AlbumsService;