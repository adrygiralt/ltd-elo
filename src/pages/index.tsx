import Link from 'next/link'
import { useEffect, useState } from "react"
import { ListFormat } from "typescript"

export interface HomeProps {
  playerList: Player[] | undefined
}

// KindaCode.com
export default function Home({playerList}: HomeProps) {

  const game = {east: Array(), west: Array()}

  async function addPlayer(id : Number) {
    if (game.east.length <= game.west.length) {
      game.east.push(id)
    } else {
      game.west.push(id)
    }
     console.log(game)
  }

  return (
    <div className="container">
      <div className="row">
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Jugadors</th><th>elo</th><th>wins/partides</th>
            </tr>
          </thead>
          <tbody>
            {playerList?.map(player => (
              <tr key={player.id}>
                <td>{player.name} <button className="badge bg-primary" onClick={() => addPlayer(player.id)}>add</button></td>
                <td>{player.elo}</td>
                <td>{player.wins} / {player.games}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface Player {
  id: number;
  name: string;
  elo: number;
  wins: number;
  games: number;
}

Home.getInitialProps = async () => {
  const response = await fetch("http://localhost:3000/api/players")
  const playerList: Player[] | undefined = await response.json()

  return { playerList }
}