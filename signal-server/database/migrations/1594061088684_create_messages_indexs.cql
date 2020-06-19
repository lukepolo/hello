CREATE TABLE IF NOT EXISTS messages (
  id bigint,
  room text,
  author text,
  content text,
  PRIMARY KEY (room, id)
) WITH CLUSTERING ORDER BY (id DESC);