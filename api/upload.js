import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function (request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!file) {
    return new Response('No file to upload', { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
    // FIX: Add this option to automatically add a random suffix
    // to the filename, ensuring it's always unique.
    addRandomSuffix: true, 
  });

  return new Response(JSON.stringify(blob), {
    headers: { 'Content-Type': 'application/json' },
  });
}