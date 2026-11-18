import app from '../server.ts';

export const config = {
  maxDuration: 30,
};

export default function handler(req: any, res: any) {
  return app(req, res);
}
