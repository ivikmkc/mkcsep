import app from '../server.ts';

export const config = {
  maxDuration: 30,
};

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel handler error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: error?.message || 'Gagal menjalankan layanan server CBT.',
        })
      );
    }
  }
}
