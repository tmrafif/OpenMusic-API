/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
// exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // create table playlist_songs
    pgm.createTable("playlist_songs", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        playlist_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        song_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
    });

    // add constaint unique playlist_id and song_id
    pgm.addConstraint(
        "playlist_songs",
        "unique_playlist_id_and_song_id",
        "UNIQUE(playlist_id, song_id)"
    );

    // add foreign key constraint
    pgm.addConstraint(
        "playlist_songs",
        "fk_playlist_songs.playlist_id",
        "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
    );

    pgm.addConstraint(
        "playlist_songs",
        "fk_playlist_songs.song_id",
        "FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE"
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // drop constraint
    pgm.dropConstraint("playlist_songs", "fk_playlist_songs.playlist_id");
    pgm.dropConstraint("playlist_songs", "fk_playlist_songs.song_id");
    pgm.dropConstraint("playlist_songs", "unique_playlist_id_and_song_id");

    // drop table
    pgm.dropTable("playlist_songs");
};
