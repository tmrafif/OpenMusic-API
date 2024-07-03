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
    pgm.createTable("songs", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        title: {
            type: "TEXT",
            notNull: true,
        },
        year: {
            type: "INTEGER",
            notNull: true,
        },
        performer: {
            type: "TEXT",
            notNull: true,
        },
        genre: {
            type: "TEXT",
            notNull: true,
        },
        duration: {
            type: "INTEGER",
        },
        album_id: {
            type: "VARCHAR(50)",
        },
    });

    pgm.addConstraint(
        'songs',
        'fk_songs.album_id',
        'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE',
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropConstraint('songs', 'fk_songs.album_id');
    pgm.dropTable("songs");
};
