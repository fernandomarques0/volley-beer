import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

const files = {
  players: 'players.json',
  ratings: 'ratings.json',
};

const dir = path.resolve(process.cwd(), config.dataDir);

// Fila de escritas para evitar conflitos
const writeQueues = {
  players: Promise.resolve(),
  ratings: Promise.resolve(),
};

export async function ensureDataStore() {
  await fs.mkdir(dir, { recursive: true });
  for (const fname of Object.values(files)) {
    const fpath = path.join(dir, fname);
    try {
      await fs.access(fpath);
      // Validar se o JSON é válido
      const content = await fs.readFile(fpath, 'utf-8');
      JSON.parse(content);
    } catch (err) {
      console.warn(`Criando/recriando ${fname} devido a erro:`, err.message);
      await fs.writeFile(fpath, '[]', 'utf-8');
    }
  }
}

async function read(name) {
  const fpath = path.join(dir, files[name]);
  try {
    const raw = await fs.readFile(fpath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erro ao ler ${name}:`, err.message);
    // Se houver erro, retorna array vazio e tenta recriar o arquivo
    await fs.writeFile(fpath, '[]', 'utf-8');
    return [];
  }
}

async function write(name, data) {
  // Adiciona a escrita na fila para evitar conflitos
  writeQueues[name] = writeQueues[name].then(async () => {
    const fpath = path.join(dir, files[name]);
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(fpath, content, 'utf-8');
  });
  
  return writeQueues[name];
}

export const PlayersStore = {
  getAll: () => read('players'),
  saveAll: (data) => write('players', data),
};

export const RatingsStore = {
  getAll: () => read('ratings'),
  saveAll: (data) => write('ratings', data),
};