CREATE TABLE district (  
  number_d       INTEGER PRIMARY KEY,   
  name_d         VARCHAR(255) NOT NULL
);

CREATE TABLE fountain (
  id                INTEGER PRIMARY KEY,
  location_f        VARCHAR(255),
  type_f            VARCHAR(50),
  address_f         VARCHAR(255),
  city              VARCHAR(20),
  status_f          VARCHAR(50),
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  district_number   INTEGER REFERENCES district(number_d)
);

CREATE INDEX idx_fountain_district ON fountain(district_number);
CREATE INDEX idx_fountain_type_f ON fountain(type_f);
CREATE INDEX idx_fountain_status ON fountain(status_f);