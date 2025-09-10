// In api/upload.js

import { put } from '@vercel/blob';
import { formidable } from 'formidable';
import fs from 'fs';

// 1. REMOVE the 'edge' runtime export
// export const runtime = 'edge'; 

// 2. Change the function signature to handle Node.js request (req) and response (res)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 3. Use a Promise to handle the async formidable parsing
  const data = await new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  // 4. Extract the file from the parsed data
  const file = data.files.file[0];

  if (!file) {
    return res.status(400).json({ error: 'No file to upload' });
  }

  try {
    // 5. Read the file from its temporary path
    const fileBuffer = fs.readFileSync(file.filepath);

    // 6. Upload the file buffer to Vercel Blob
    const blob = await put(file.originalFilename, fileBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    // 7. Send the successful response back
    return res.status(200).json(blob);
    
  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ error: 'Upload failed.' });
  }
}