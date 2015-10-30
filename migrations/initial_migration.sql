CREATE TABLE pixel_loads
(id SERIAL NOT NULL PRIMARY KEY,
created timestamp default now(),
ip VARCHAR(40),
useragent text,
pixel_id VARCHAR(20),
os VARCHAR(100),
os_version VARCHAR(100),
browser VARCHAR(100),
browser_version VARCHAR(100),
geo text);



CREATE TABLE page_sessions_link
(
  id SERIAL NOT NULL PRIMARY KEY,
  created timestamp default now(),
  page_unique_code VARCHAR(20) NOT NULL,
  local_user_id VARCHAR(20) NOT NULL,
  session_id VARCHAR(20),
  session_updated timestamp,
  os VARCHAR(20),
  os_version VARCHAR(20),
  browser VARCHAR(20),
  browser_version VARCHAR(20),
  country VARCHAR(20),
  city VARCHAR(100),
  ip VARCHAR(40),
  url VARCHAR(255),
  extra_data TEXT
);

CREATE TABLE localid_site_link
( id SERIAL NOT NULL PRIMARY KEY,
  created timestamp default now(),
  site_id integer NOT NULL,
  local_user_id VARCHAR(20),  
  global_user_id VARCHAR(20)
);



CREATE TABLE user_keywords
(
  id SERIAL NOT NULL PRIMARY KEY,
  created timestamp default now(),
  global_user_id VARCHAR(20),
  keyword VARCHAR(200)
);


CREATE TABLE user_categories
(
  id SERIAL NOT NULL PRIMARY KEY,
  created timestamp default now(),
  global_user_id VARCHAR(20),
  keyword VARCHAR(200)
);