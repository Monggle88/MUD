import { Socket } from 'socket.io';
import env from '../config.env';
import { village } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandRouter } from '../interfaces/socket';
import { socketIds } from '../socket.routes';

const PVP_URL = `${env.HTTP}://${env.WAS_LB}/pvp`

export default {

    // pvp룸 생성 및 입장
    pvpListController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        
        if (CMD1 === '돌'|| CMD1 === '돌아가기' || CMD1 === 'R' || CMD1 === 'RETURN') return village.NpcList(socket, CMD2, userInfo);

        if (CMD1 === '도' || CMD1 === '도움말' || CMD1 === 'H' || CMD1 === 'HELP') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpList' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '생': 'createRoom',
            '생성': 'createRoom',
            'C': 'createRoom',
            'CREATE': 'createRoom',
            '입': 'joinRoom',
            '입장': 'joinRoom',
            'J': 'joinRoom',
            'JOIN': 'joinRoom',
            '새': 'pvpGo',
            '새로고침': 'pvpGo',
            'RE': 'pvpGo',
            'REFRESH': 'pvpGo',
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpList' })
            return;
        }

        socket.data[socket.id] = `${userStatus.name},pvpRoom ${CMD2},${userInfo.userId}`
        
        const frontId = socketIds.get(userInfo.userId);
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: frontId })
    },

    // pvp룸 입장 후 6명이 되기까지 기다리는중
    pvpJoinController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            '현': 'getUsers',
            '현재인원': 'getUsers',
            '돌': 'leaveRoom',
            '돌아가기': 'leaveRoom',
            'R': 'leaveRoom',
            'RETURN': 'leaveRoom',
            '도': 'help',
            '도움말': 'help',
            'H': 'help',
            'HELP': 'help',
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpJoin' })
            return;
        }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpJoin' });
    },

    pvpBattleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const CMD = line.toUpperCase().trim();

        if (CMD === '도움말' || CMD === '도' || CMD === 'H' || CMD === 'HELP') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD, userInfo, option: 'pvpBattle' })
            return;
        }

        if (CMD === '상' || CMD === '상태창' || CMD === 'S' || CMD === 'STATUS') {
            const URL = `${PVP_URL}/pvp/users`
            fetchPost({ URL, socketId: socket.id, CMD, userInfo, userStatus })
            return;
        }

        if (!CMD) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD, userInfo, userStatus, option: 'pvpBattle' })
            return;
        }
        const URL = `${PVP_URL}/pvp/pvpBattle`
        fetchPost({ URL, socketId: socket.id, CMD, userInfo, userStatus });
    },
}