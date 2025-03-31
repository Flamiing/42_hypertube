CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE language_enum AS ENUM('EN', 'ES', 'DE');

CREATE TABLE users (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	password VARCHAR(255) DEFAULT NULL,
	biography VARCHAR(500),
	profile_picture VARCHAR(255) DEFAULT NULL,
    prefered_language language_enum DEFAULT 'EN',
	active_account BOOLEAN DEFAULT FALSE,
	oauth BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR(2048) DEFAULT NULL,
    reset_pass_token VARCHAR(2048) DEFAULT NULL
);

CREATE TABLE images (
	id UUID PRIMARY KEY,
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	image_path VARCHAR(255) NOT NULL
);

ALTER TABLE users
ADD CONSTRAINT fk_profile_picture
FOREIGN KEY (profile_picture) REFERENCES images(id) ON DELETE SET NULL;