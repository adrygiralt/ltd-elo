import { NextApiRequest, NextApiResponse } from "next";

export default function people(req, res) {
    if (req.method !== 'GET') {
      res.status(405).json({ message: 'Method not allowed' });
      return;
    }
    res.json(
        [{person: "Adrià", object:"potato"}, 
        {person: "Jordi", object:"car"}, 
        {person: "Papitu", object:"motorbike"}]
        )
  }