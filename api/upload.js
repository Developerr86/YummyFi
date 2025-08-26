import { put } from '@vercel/blob';

// This config is crucial for Vercel to run the function in the correct environment.
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
    // This ensures every upload gets a unique filename, preventing errors.
    addRandomSuffix: true, 
  });

  // Return the blob object (which includes the URL) as JSON
  return new Response(JSON.stringify(blob), {
    headers: { 'Content-Type': 'application/json' },
  });
}