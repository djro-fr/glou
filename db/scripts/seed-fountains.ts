import { readFileSync } from 'node:fs';

import 'dotenv/config';
import pg from 'pg';
import { parse } from 'csv-parse/sync';

// Retire le BOM (Byte Order Mark, U+FEFF) parfois ajouté en tête de fichier
// par Excel/Windows — sans ça, la première colonne du CSV ("Geo Point")
// devient une clé invisible différente et devient introuvable via rows[0]['Geo Point']
const csvContent = readFileSync('db/data/fontaines-a-boire.csv', 'utf-8').replace(/^\uFEFF/, '');

interface FontaineCsvRow {
  'Geo Point': string;
  'Geo Shape': string;
  id_fontaines_a_boire: string;
  localisation: string;
  type: string;
  adresse: string;
  commune: string;
  quartier: string;
  territoire: string;
  statut: string;
}

const rows: FontaineCsvRow[] = parse(csvContent, {
  delimiter: ';',
  columns: true,
});

const client = new pg.Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: 'localhost',
  port: 5433,
});

await client.connect();  
for (const row of rows) {
  const geoPoint = row['Geo Point'];
  const [latitude, longitude] = geoPoint.split(',').map(v => Number.parseFloat(v));
  const quartierNumero = row.quartier === '' ? null : Number(row.quartier);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    console.warn('Coordonnées invalides pour la ligne id', row.id_fontaines_a_boire);
    continue; // passe à la ligne suivante sans essayer d'insérer
  }
  await client.query(
    `INSERT INTO fountain (id, location_f, type_f, address_f, city, status_f, latitude, longitude, district_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO NOTHING`,
    [
      Number(row.id_fontaines_a_boire),
      row.localisation,
      row.type,
      row.adresse,
      row.commune,
      row.statut,
      latitude,
      longitude,
      quartierNumero
    ]
  );
}
await client.end();



