import { getSocket } from "./sockets";
import { gameQueue } from "$lib/stores/game";

async function joinQueue() {
  const socket = getSocket();

  socket.emit('joinQueue', (res: any) => {
    gameQueue.set({ data: res, loading: false });
  })
}

async function leaveQueue() {
  const socket = getSocket();

  socket.emit('leaveQueue', (res: any) => {
    console.log(res);
  })
}

async function spectateGame(game_id: number) {
  const socket = getSocket();

  socket.emit('spectateGame', (res: any) => {
    console.log(res);
  })
}

async function stopSpectatingGame(game_id: number) {
  const socket = getSocket();
  
  socket.emit('stopSpectatingGame', (res: any) => {
    console.log(res);
  })
}

async function createInvite(variation: boolean): Promise<any> {
  const socket = getSocket();

  return new Promise((resolve, reject) => {
    socket.emit("createInvite", { variation }, (res: any) => {
      if (res instanceof Object && "error" in res)
      {
        alert(res.error);
        reject(res.error);
      }
      resolve(res.inviteId);
    })
  })
}

async function joinInvite(invite_id: number) {
  // invite_id = user_id;
  const socket = getSocket();

  socket.emit("joinInvite", { invite_id }, (res: any) => {
    console.log(res);
  });
}

async function deleteInvite() {
  const socket = getSocket();

  socket.emit("deleteInvite", {}, (res: any) => {
    console.log(res);
  });
}

export {
  joinQueue, leaveQueue, spectateGame, stopSpectatingGame,
  createInvite, joinInvite, deleteInvite
}
