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
  // Defaults match the dev docker-compose.yml; docker-compose.prod.yml sets the internal service name and port
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5433),
});

let inserted = 0;
let updated = 0;
let skipped = 0;

await client.connect();
try {
  // Une seule transaction : en cas d'erreur, rien n'est écrit (pas de seed à moitié fait)
  await client.query('BEGIN');
  for (const row of rows) {
    const geoPoint = row['Geo Point'];
    const [latitude, longitude] = geoPoint.split(',').map(v => Number.parseFloat(v));
    const quartierNumero = row.quartier === '' ? null : Number(row.quartier);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      console.warn('Coordonnées invalides pour la ligne id', row.id_fontaines_a_boire);
      skipped++;
      continue; // passe à la ligne suivante sans essayer d'insérer
    }
    // Upsert : relancer le seed met à jour les fontaines existantes au lieu de les dupliquer.
    // xmax = 0 uniquement pour une ligne nouvellement insérée.
    const result = await client.query<{ inserted: boolean }>(
      `INSERT INTO fountain (id, location_f, type_f, address_f, city, status_f, latitude, longitude, district_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         location_f = EXCLUDED.location_f,
         type_f = EXCLUDED.type_f,
         address_f = EXCLUDED.address_f,
         city = EXCLUDED.city,
         status_f = EXCLUDED.status_f,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         district_number = EXCLUDED.district_number
       RETURNING (xmax = 0) AS inserted`,
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
    if (result.rows[0]?.inserted) {
      inserted++;
    } else {
      updated++;
    }
  }
  await client.query('COMMIT');
  console.log(`Seed terminé : ${inserted} ajoutée(s), ${updated} mise(s) à jour, ${skipped} ignorée(s).`);
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  await client.end();
}
