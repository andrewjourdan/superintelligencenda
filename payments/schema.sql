CREATE TABLE orders(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL,license_hash TEXT NOT NULL UNIQUE,bundle TEXT NOT NULL,created_at INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','paid','failed','revoked')),session_id TEXT UNIQUE,payment_intent TEXT UNIQUE,paid_at INTEGER,amount_paid INTEGER,currency TEXT);
CREATE INDEX orders_created ON orders(status,created_at);
CREATE TABLE revoked_intents(payment_intent TEXT PRIMARY KEY,created_at INTEGER NOT NULL);
CREATE TABLE rate_limits(bucket INTEGER NOT NULL,key TEXT NOT NULL,count INTEGER NOT NULL,PRIMARY KEY(bucket,key));