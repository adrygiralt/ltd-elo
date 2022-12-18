import { useState } from "react"
import axios from "axios"

interface gamePlayers {
  east: Array<number>,
  west: Array<number>
}

export interface HomeProps {
  playerList: Player[] | undefined
}

export default function Home({playerList}: HomeProps) {

  function compare_elo( a : Player, b: Player) {
    if ( a.elo < b.elo ){
      return 1;
    }
    if ( a.elo > b.elo ){
      return -1;
    }
    return 0;
  }

  let players : { [key: number]: Player } = {}
  playerList?.map(player => {
    players[player.id] = player 
  })
  playerList?.sort(compare_elo)

  function set_teams(balanced_players: number[]) : void {
    game.east.length = 0
    game.west.length = 0
    const n_players = balanced_players.length
    const n_west_players: number = Math.ceil(n_players / 2)
    for (let i = 0; i < n_players; i++) {
      if (i < n_west_players) {
        game.east.push(balanced_players[i])
      } else {
        game.west.push(balanced_players[i])
      }
    }
    setGame({...game})
  }

  function calculate_elo(in_game_players: number[]): number {
    const n_players = in_game_players.length
    const n_west_players: number = Math.ceil(n_players / 2)
    let east_elo = 0
    let west_elo = 0
    for (let i = 0; i < n_players; i++) {
      if (i < n_west_players) {
        east_elo += players[in_game_players[i]].elo
      } else {
        west_elo += players[in_game_players[i]].elo
      }
    }
    return Math.abs(east_elo - west_elo)
  }

  function combination_step(in_game_players : number[], r : number[], min_elo_diff : number[]) {
    if (r.length === in_game_players.length) {
      const elo_difference = calculate_elo(r)
      if (elo_difference < min_elo_diff[0]) {
        set_teams(r)
        min_elo_diff[0] = elo_difference
      }
      return
    }
    for (let p in in_game_players) {
      if (r.indexOf(in_game_players[p]) === -1) {
        r.push(in_game_players[p])
        combination_step(in_game_players, r, min_elo_diff)
        r.splice(-1,1)
      }
    }
  }

  //this can be pretty improved only combining the first team, not all the players, anyways the improvement will be very small
  function combinations () {
    let in_game_players = []
    for (let p in game.west) in_game_players.push(game.west[p])
    for (let p in game.east) in_game_players.push(game.east[p])
    in_game_players.sort((a, b) => 0.5 - Math.random());
    let r : number[] = []
    let min_elo_diff = [100000]
    combination_step(in_game_players, r, min_elo_diff)
  }

  function start_stop () {
    setPlaying(!playing)
  }

  const [game, setGame] = useState<gamePlayers>({east: [], west: []})
  const [playing, setPlaying] = useState<boolean>(false)
  const array4 = [0,1,2,3]


  async function addPlayer(id : number) {
    
    const index = game.west.indexOf(id, 0);
    const index2 = game.east.indexOf(id, 0);
    if (index > -1) {
      game.west.splice(index, 1);
    }
    else if (index2 > -1) {
      game.east.splice(index2, 1);
    }
    else if (game.west.length <= game.east.length) {
      game.west.push(id)
    } else {
      game.east.push(id)
    }
     setGame({...game})
  }

  function changeTeam(id : number) {
    const index = game.west.indexOf(id, 0);
    const index2 = game.east.indexOf(id, 0);
    if (index > -1) {
      game.west.splice(index, 1);
      game.east.push(id)
    }
    else if (index2 > -1) {
      game.east.splice(index2, 1);
      game.west.push(id)
    }
    setGame({...game})
  }

  function isSelected(id : number) : boolean {
    return game.west.includes(id) || game.east.includes(id)
  }

  function sumElo(side: string) : number {
    let elo : number = 0
    if (side === 'west') {
      for (let i in game.west) elo += players[game.west[i]].elo
    }
    else if (side === 'east') {
      for (let i in game.east) elo += players[game.east[i]].elo
    }
    return elo
  }
  
  function win_east() {
    start_stop()
    update_elo(game.east, game.west)
  }

  function win_west() {
    start_stop()
    update_elo(game.west, game.east)
  }

  function update_elo(winners : number[], losers : number[]) {
    let total_losers_elo = 0
    for (let i = 0; i < losers.length; i++) {
      let change = Math.floor(players[losers[i]].elo * 0.04)
      players[losers[i]].elo -= change
      total_losers_elo += change
      players[losers[i]].games += 1
    }
    for (let i = 0; i < winners.length; i++) {
      players[winners[i]].elo += Math.floor(total_losers_elo / winners.length)
      players[winners[i]].games += 1
      players[winners[i]].wins += 1
    }
    let lost_elo = total_losers_elo - Math.floor(total_losers_elo / winners.length) * winners.length

    let winners_players = []
    for (let winner in winners) {
      winners_players.push(players[winners[winner]])
    }
    winners_players.sort(compare_elo)

    console.log(winners_players)

    let last = winners.length - 1
    while (lost_elo > 0 && last >= 0) {
      players[winners_players[last].id].elo += 1
      last--
      lost_elo--
    }
    axios.post("/api/game", players).then((response : any) => {console.log(response)}).catch((error : any) => {console.log(error)})
  }

  type RowNameProps = {
    id: number,
    name: string,
    playing: boolean
  }

  const RowName = ({id, name, playing} : RowNameProps) => 
  {
    if (!isSelected(id)) {
      return (<td>{name} <button className="btn badge bg-success" disabled={playing} onClick={() => addPlayer(id)}>add</button></td>)
    }
    return (<td>{name} <button className="btn badge bg-danger" disabled={playing} onClick={() => addPlayer(id)}>remove</button></td>)
  }

  type RowGameProps = {
    row: number
  }

  const RowGame = ({row} : RowGameProps) =>
  {
    let west = <td></td>
    if (row < game.west.length && playerList) {
      west = <td>{players[game.west[row]].name} ({players[game.west[row]].elo}) <button className="badge bg-warning" onClick={() => changeTeam(game.west[row])}>{">"}</button> <button className="badge bg-danger" onClick={() => addPlayer(game.west[row])}>x</button></td>
    }
    let east = <td></td>
    if (row < game.east.length) {
      east = <td>{players[game.east[row]].name} ({players[game.east[row]].elo}) <button className="badge bg-warning" onClick={() => changeTeam(game.east[row])}>{"<"}</button> <button className="badge bg-danger" onClick={() => addPlayer(game.east[row])}>x</button></td>
    }
    return (<tr key={row}>{west}{east}</tr>)
  }
  

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Jugadors</th><th>elo</th><th>wins/games(winrate)</th>
              </tr>
            </thead>
            <tbody>
              {playerList?.map(player => (
                <tr key={player.id}>
                  <RowName id={player.id} name={player.name} playing={playing} />
                  <td>{player.elo}</td>
                  <td>{player.wins} / {player.games} <b>({ Math.floor(player.wins * 100 / player.games)}%)</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <table className="table table-striped">
            <thead>
              <tr><th>WEST TEAM {'(' + sumElo("west") +')'}</th><th>EAST TEAM {'(' + sumElo("east") +')'}</th></tr>
            </thead>
            <tbody>
              {array4.map(i => (
                <RowGame key={i} row={i} />
              ))}
              
              <tr><td><button className="btn btn-success" onClick={win_west} disabled={!playing}>WEST TEAM WINS</button></td><td><button className="btn btn-danger" onClick={win_east} disabled={!playing}>EAST TEAM WINS</button></td></tr>
              <tr><td><button className="btn btn-primary" onClick={combinations}>Balance Teams</button></td><td><button className={"btn " + (playing ? "btn-danger" : "btn-warning")} onClick={start_stop} >{(playing ? "STOP GAME" : "START GAME")}</button></td></tr>
            </tbody>
          </table>
        </div>
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