/**
 * Cargador de .env.local SIN dotenv (side-effect, sin exports).
 *
 * Debe ser el PRIMER import de start-bot.ts, wizard.ts y doctor.ts: los
 * imports ES se hoistean, y client.ts/openrouter.ts leen process.env en
 * top-level, así que .env.local debe estar cargado antes de cualquier otro
 * import que dependa de él.
 *
 * Reglas de parseo:
 *  - Ignora líneas vacías y las que empiezan por #.
 *  - Separa por el PRIMER '='.
 *  - Recorta comillas simples/dobles envolventes del valor.
 *  - Solo asigna si la clave NO existe ya en process.env (las reales del
 *    entorno tienen prioridad sobre el fichero).
 *  - Si .env.local no existe, no hace nada (no falla).
 */
import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

if (fs.existsSync(ENV_PATH)) {
  const content = fs.readFileSync(ENV_PATH, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!key) continue;

    let value = line.slice(eq + 1).trim();
    // Recorta comillas envolventes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
