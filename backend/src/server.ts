import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import pad from 'pad';
import CharCrypto = require('./CharCrypto');
import PWDGen = require('./PWDGen');
import { Character, Vehicle, TagData } from './types';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// Load data
const characters: Character[] = JSON.parse(
  readFileSync(join(__dirname, '../data/characters.json'), 'utf8')
);
const vehicles: Vehicle[] = JSON.parse(
  readFileSync(join(__dirname, '../data/vehicles.json'), 'utf8')
);

// Generate tag data
function generateTagData(uid: string, itemId: number, itemName: string, itemType: string, vehicleCode?: string): TagData {
  const cc = new CharCrypto();
  const characterCode = pad(16, cc.encrypt(uid, itemId).toString('hex'), '0') as string;
  const pwdValue = PWDGen(uid);
  const pwd = pad(8, pwdValue, '0') as string;

  const charPart1 = characterCode.substring(0, 4).toUpperCase();
  const charPart2 = characterCode.substring(4, 8).toUpperCase();
  const charPart3 = characterCode.substring(8, 12).toUpperCase();
  const charPart4 = characterCode.substring(12, 16).toUpperCase();
  const pwdPart1 = pwd.substring(0, 4).toUpperCase();
  const pwdPart2 = pwd.substring(4, 8).toUpperCase();

  return {
    name: itemName,
    characterCode,
    pwd,
    charPart1,
    charPart2,
    charPart3,
    charPart4,
    pwdPart1,
    pwdPart2,
    type: itemType,
    vehicleCode: vehicleCode?.toUpperCase(),
    vehicleFlag: '00010000',
  };
}

// Routes
app.get('/api/characters', (req: Request, res: Response) => {
  res.json(characters);
});

app.get('/api/vehicles', (req: Request, res: Response) => {
  res.json(vehicles);
});

app.post('/api/generate', (req: Request, res: Response) => {
  const { uid, characterId, type } = req.body;

  if (!uid || !characterId) {
    return res.status(400).json({ error: 'UID and character/vehicle ID are required' });
  }

  // Validate UID format (should be hex)
  if (!/^[0-9A-Fa-f]+$/.test(uid)) {
    return res.status(400).json({ error: 'UID must be a valid hexadecimal string' });
  }

  const character = characters.find((char) => char.id === parseInt(characterId));
  const vehicle = vehicles.find((veh) => veh.id === parseInt(characterId));
  const item = character || vehicle;
  const itemType = type || (character ? 'character' : 'vehicle');

  if (!item) {
    return res.status(404).json({ error: 'Character or vehicle not found' });
  }

  const vehicleCode = vehicle?.code;
  const tagData = generateTagData(uid, item.id, item.name, itemType, vehicleCode);
  res.json(tagData);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`LEGO Dimensions Tag Generator API running at http://0.0.0.0:${port}`);
});
