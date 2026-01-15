import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config.js';

const files = {
  players: 'players.json',
  ratings: 'ratings.json',
};

const dir = path.resolve(process.cwd(), config.dataDir);

export async function ensureDataStore() {
  await fs.mkdir(dir, { recursive: true });
  for (const fname of Object.values(files)) {
    const fpath = path.join(dir, fname);
    try { await fs.access(fpath); } catch { await fs.writeFile(fpath, '[]', 'utf-8'); }
  }
}

async function read(name) {
  const fpath = path.join(dir, files[name]);
  const raw = await fs.readFile(fpath, 'utf-8');
  return JSON.parse(raw);
}

async function write(name, data) {
  const fpath = path.join(dir, files[name]);
  const tmp = `${fpath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, fpath); // gravação atômica
}

export const PlayersStore = {
  getAll: () => read('players'),
  saveAll: (data) => write('players', data),
};

export const RatingsStore = {
  getAll: () => read('ratings'),
  saveAll: (data) => write('ratings', data),
};