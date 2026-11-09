import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/signs');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, filename);
    const file = fs.createWriteStream(dest);
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
          res2.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`[Downloaded redirect]: ${filename} (${fs.statSync(dest).size} bytes)`);
            resolve(dest);
          });
        }).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        console.error(`Failed ${filename}: status ${res.statusCode}`);
        resolve(null);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[Downloaded]: ${filename} (${fs.statSync(dest).size} bytes)`);
        resolve(dest);
      });
    }).on('error', (err) => {
      console.error(`Error ${filename}:`, err.message);
      resolve(null);
    });
  });
}

const signAssets = [
  // 1. Namaste
  {
    name: 'namaste.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/An_Oberoi_Hotel_employee_doing_Namaste%2C_New_Delhi.jpg'
  },
  // 2. Hello
  {
    name: 'hello.jpg',
    url: 'https://raw.githubusercontent.com/Tarun-032/Sign-Language-Detection-live/master/Tensorflow/workspace/images/test/hello.a0db5084-99d3-11ee-a307-a9adca7773f2.jpg'
  },
  // 3. Thank You
  {
    name: 'thank_you.jpg',
    url: 'https://raw.githubusercontent.com/Tarun-032/Sign-Language-Detection-live/master/Tensorflow/workspace/images/test/thanks.a0db5084-99d3-11ee-a307-a9adca7773f2.jpg'
  },
  // 4. Good / Thumbs Up
  {
    name: 'good.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Jempol_Ngadep_Atas_%28cropped%29.jpg'
  },
  // 5. Bad / Thumbs Down
  {
    name: 'bad.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Jempol_Ngadep_Bawah_%28cropped%29.jpg'
  },
  // 6. Help
  {
    name: 'help.gif',
    url: 'https://raw.githubusercontent.com/satyam9090/Automatic-Indian-Sign-Language-Translator-ISL/master/ISL_Gifs/shall%20I%20help%20you.gif'
  },
  // 7. Love / ILY
  {
    name: 'love.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/ASL_ILY%40Side-PalmForward.jpg'
  },
  // 8. Call
  {
    name: 'call.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Callme.jpg'
  },
  // 9. Yes
  {
    name: 'yes.jpg',
    url: 'https://raw.githubusercontent.com/Tarun-032/Sign-Language-Detection-live/master/Tensorflow/workspace/images/test/yes.b3186d4f-99d3-11ee-adac-a9adca7773f2.jpg'
  },
  // 10. No
  {
    name: 'no.jpg',
    url: 'https://raw.githubusercontent.com/Tarun-032/Sign-Language-Detection-live/master/Tensorflow/workspace/images/test/no.ced59e1a-99d3-11ee-8201-a9adca7773f2.jpg'
  },
  // 11. Peace / Letter V
  {
    name: 'v.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Sign_of_peace.jpg'
  },
  // All 26 ISL Alphabets from satyam9090
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map(char => ({
    name: `alphabet_${char}.jpg`,
    url: `https://raw.githubusercontent.com/satyam9090/Automatic-Indian-Sign-Language-Translator-ISL/master/letters/${char}.jpg`
  }))
];

async function main() {
  console.log(`Starting download of ${signAssets.length} sign assets to ${targetDir}...`);
  for (const asset of signAssets) {
    await download(asset.url, asset.name);
  }
  console.log('All downloads completed!');
}

main();
