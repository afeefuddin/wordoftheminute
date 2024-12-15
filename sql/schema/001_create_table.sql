-- +goose Up

CREATE TABLE wordoftheminutes (
    id TEXT PRIMARY KEY,
    first TEXT,
    second TEXT,
    third TEXT
);

-- +goose Down

DROP TABLE wordoftheminutes;