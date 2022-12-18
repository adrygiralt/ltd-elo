import { NextApiRequest, NextApiResponse } from "next";
import executeQuery from '../../../lib/db'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
  res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  const players = req.body
  for (const p in players) {
    await executeQuery({
        query: 'UPDATE players SET elo = ' + players[p].elo + ', wins = ' + players[p].wins + ', games = ' + players[p].games + ' WHERE id = ' + players[p].id,
        values: [req.body.content]
    })
  }
  res.json({code:200})
}