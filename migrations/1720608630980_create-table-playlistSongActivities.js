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
    // create table playlist_song_activities
    pgm.createTable("playlist_song_activities", {
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
        user_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        action: {
            type: "TEXT",
            notNull: true,
        },
        time: {
            type: "TEXT",
            notNull: true,
        },
    });

    // add foreign key constraint
    pgm.addConstraint(
        "playlist_song_activities",
        "fk_playlist_song_activities.playlist_id",
        "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
    );

    pgm.addConstraint(
        "playlist_song_activities",
        "fk_playlist_song_activities.song_id",
        "FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE"
    );
    
    pgm.addConstraint(
        "playlist_song_activities",
        "fk_playlist_song_activities.user_id",
        "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE"
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // drop constraint
    pgm.dropConstraint("playlist_song_activities", "fk_playlist_song_activities.playlist_id");
    pgm.dropConstraint("playlist_song_activities", "fk_playlist_song_activities.song_id");
    pgm.dropConstraint("playlist_song_activities", "fk_playlist_song_activities.user_id");

    // drop table
    pgm.dropTable("playlist_song_activities");
};
