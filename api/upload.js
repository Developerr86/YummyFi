// In api/upload.js

import { put } from '@vercel/blob';
// The config export has been removed. Vercel will now default to the Node.js runtime.

export default async function (request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!file) {
    return new Response('No file found in the form data.', { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return new Response(JSON.stringify(blob), {
    headers: { 'Content-Type': 'application/json' },
  });
}