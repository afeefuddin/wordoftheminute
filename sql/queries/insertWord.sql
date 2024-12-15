-- name: InsertWord :one
INSERT INTO wordoftheminutes (id, first, second, third)
VALUES ($1, $2, $3, $4)
RETURNING *;