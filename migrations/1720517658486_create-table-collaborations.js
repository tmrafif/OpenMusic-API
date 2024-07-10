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
    // create table collaborations
    pgm.createTable("collaborations", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        playlist_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        user_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
    });

    // add constaint unique playlist_id and user_id
    pgm.addConstraint(
        "collaborations",
        "unique_playlist_id_and_user_id",
        "UNIQUE(playlist_id, user_id)"
    );

    // add foreign key constraint
    pgm.addConstraint(
        "collaborations",
        "fk_collaborations.playlist_id",
        "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
    );

    pgm.addConstraint(
        "collaborations",
        "fk_collaborations.user_id",
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
    pgm.dropConstraint("collaborations", "fk_collaborations.playlist_id");
    pgm.dropConstraint("collaborations", "fk_collaborations.user_id");
    pgm.dropConstraint("collaborations", "unique_playlist_id_and_user_id");

    // drop table
    pgm.dropTable("collaborations");
};
