import { Socket } from 'socket.io';
import { CharacterService } from '../services';
import { redis } from '../db/cache';
import { roomList, chatJoiner } from '../handler/front/home.handler';
import { front, global } from '../handler';
import { CommandHandler, SocketInput } from '../interfaces/socket';


export default {

    globalController: (socket: Socket, { line, userInfo, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        
        const commandHandler: CommandHandler = {
            'HOME': global.backToHome,
            'OUT': front.signout,
            'HELP': global.help,
            '도움말': global.help,
        }
        if (!commandHandler[CMD2] || CMD2.match(/HELP|도움말/)) {
            console.log('exception');
            commandHandler['HELP'](socket, line, userInfo, option);
            return;
        }

        commandHandler[CMD2](socket, CMD2, userInfo, socket.id);
    },

    requestStatus: async(characterId: number, callback: any) => {
        const userStatus = await CharacterService.getUserStatus(characterId);

        callback({
            status: 200,
            userStatus,
        });
    },

    disconnect: (socket: Socket) => {
        if (chatJoiner[socket.id]) {
            const joinedRoom = Number(chatJoiner[socket.id]);
            roomList.get(joinedRoom)!.delete(socket.id);
            delete chatJoiner[socket.id];
            console.log(`roomList: ${roomList}\nchatJoiner: ${chatJoiner}`);
        }
        redis.del(socket.id);
        console.log(socket.id, 'SOCKET DISCONNECTED');
    },
};