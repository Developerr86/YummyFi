// In api/upload.js

import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function (request) {
  const form = await request.formData();
  const file = form.get('file');

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return new Response(JSON.stringify(blob), {
    headers: { 'Content-Type': 'application/json' },
  });
}