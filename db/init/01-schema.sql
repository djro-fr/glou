CREATE TABLE quartiers (  
  numero      INTEGER PRIMARY KEY,   -- numéro de quartier (recoupé avec "Quartiers de proximité")
  nom         VARCHAR(255) NOT NULL
);

CREATE TABLE fontaines (
  id                INTEGER PRIMARY KEY,
  localisation      VARCHAR(255),
  type_font         VARCHAR(50),
  adresse           VARCHAR(255),
  commune           VARCHAR(20),
  statut            VARCHAR(50),
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  quartier_numero   INTEGER REFERENCES quartiers(numero)
);

CREATE INDEX idx_fontaines_quartier ON fontaines(quartier_numero);
CREATE INDEX idx_fontaines_type ON fontaines(type_font);
CREATE INDEX idx_fontaines_statut ON fontaines(statut);