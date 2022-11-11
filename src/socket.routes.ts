import { Socket } from 'socket.io';
import { LineInput, CommandRouter, ChatInput } from './interfaces/socket';
import redis from './db/redis/config';

import { noneController } from './controller/home';
import front from './front';

import dungeon from './dungeon/dungeonHandler';
import battle from './battle'

export let socket: Socket;
const onConnection = (server: Socket) => {
    console.log('SOCKET CONNECTED');
    socket = server;


    /************************************************************************
                                    홈                                      
     ************************************************************************/
    // server.on('none', ({ line, user }: LineInput) => {
    //     const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');

    //     const commandRouter: CommandRouter = {
    //         'LOAD': front.loadHome
    //     }
    //     const result = commandRouter[CMD1](CMD2, user);
    //     server.emit('print', result);
    //     server.emit('enterChat', 'none');
    // });
    server.on('none', noneController);

    server.on('front', async({ line, user }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');
        console.log('front', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            'IN': front.signinUsername,
            'UP': front.signupUsername,
            'OUT': front.signout,
            'D': front.toDungeon,
            'DUNGEON': front.toDungeon,
            'V': front.toVillage,
            'VILLAGE': front.toVillage,
            'EMPTY': front.emptyCommand,
        }
        if (!commandRouter[CMD1]) {  
            const result = commandRouter['EMPTY'](line, user)
            return server.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user, server.id);
        if (result.chat) server.emit('enterChat', result.field);
        if (result.field === 'signout') {
            server.emit('signout', result);
        } else {
            server.emit('print', result);
        }
    });

    server.on('sign', async({ line, user, option }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().split(' ');

        const commandRouter: CommandRouter = {
            10: front.signupPassword,
            11: front.createUser,
            12: front.createCharacter,
            20: front.signinPassword,
            21: front.signinCheck,
            'EMPTY': front.emptyCommand,
        }
        if (!CMD1 || !option) {  
            const result = commandRouter['EMPTY'](line, user)
            return server.emit('print', result);
        }

        const result = await commandRouter[option](CMD1, user, server.id);
        if (result.chat) server.emit('enterChat', result.field);
        server.emit('print', result);
    });


    /************************************************************************
                                    필드                                      
     ************************************************************************/

    server.on('dungeon', async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            도움말: dungeon.help,
            load: dungeon.getDungeonList,
            입장: dungeon.getDungeonInfo,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = dungeon.wrongCommand(CMD1, user);
            return server.emit('print', result);
        }
        
        const result = await commandRouter[CMD1](CMD2, user);
        if (result.chat) server.emit('enterChat', result.field);
        server.emit('print', result);
    });


    /************************************************************************
                                    전투                                      
     ************************************************************************/

    server.on('battle', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            도움말: battle.help,
            수동: battle.fight,
            자동: battle.auto,
            돌: dungeon.getDungeonList,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, user);
            return server.emit('print', result);
        }

        const result = commandRouter[CMD1](CMD2, user);
        server.emit('print', result);
    });

    server.on('fight', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            도움말: battle.help,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, user);
            return server.emit('print', result);
        }

        const result = commandRouter[CMD1](CMD2, user);

        server.emit('print', result);
    });


    /************************************************************************
                                    채팅박스                                      
     ************************************************************************/

    // socket.on('info', ({ name }: UserSession)=>{
    //     CharacterService.findOneByName(name).then((character)=>{
    //         if (character === null) throw new Error();

    //         const script = `${character.Field.name} 채팅방에 입장하였습니다.\n`
    //         socket.emit('print', { script });
    //     });
    //     redis.set(socket.id, name, { EX: 60*5 });
    // });

    server.on('submit', ({ name, message, field }: ChatInput) => {
        redis.set(server.id, name, { EX: 60*5 });

        const script = `${name}: ${message}\n`
        server.broadcast.emit('chat', { script, field });
        server.emit('chat', { script, field });
    });

    server.on('disconnect', () => {
        redis.del(server.id);
        console.log(server.id, 'SOCKET DISCONNECTED');
    });
};

export default onConnection;
