-- name: GetWords :many
SELECT * FROM wordoftheminutes
ORDER BY id DESC
LIMIT $1 OFFSET $2;