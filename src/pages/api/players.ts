import { NextApiRequest, NextApiResponse } from "next";
import executeQuery from '../../../lib/db'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
  res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  const teamid = req.query.id
  const result = await executeQuery({
    query: `SELECT *
            FROM players p`
            ,
    values: [req.body.content]
  })
  res.json(result)
}