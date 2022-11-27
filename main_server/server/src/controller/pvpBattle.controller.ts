import { Socket } from 'socket.io';
import { pvpBattle } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';
// import { pvpBattleCache } from '../db/cache';

// 이렇게 임시보관하는것을 따로 저장해둘 DB나 cache가 있다면 어떨까
import { pvpUsers } from '../handler/pvpBattle/pvpList.handler';
export const enemyChoice = new Map();

export default {

    // 
    pvpListController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (!CMD2) return pvpBattle.pvpListWrongCommand(socket, '방이름을 입력해주세요', userInfo)

        const commandHandler: CommandHandler = {
            '도움말': pvpBattle.pvpListHelp,
            '돌': pvpBattle.userLeave,
            '1': pvpBattle.createRoom,
            '2': pvpBattle.joinRoom
        };

        if (!commandHandler[CMD1]) {
            return pvpBattle.pvpListWrongCommand(socket, CMD1, userInfo);
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);

        // 6명이 채워지면 자동으로 시작
    },
    // pvp룸 입장 후 6명이 되기까지 기다리는중
    pvpBattleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {

        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        const commandHandler: CommandHandler = {
            '도움말': pvpBattle.pvpBattleHelp,
            '현': pvpBattle.getUsers,
            '돌': pvpBattle.userLeave
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            pvpBattle.pvpBattleWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);

        // 6명이 채워지면 자동으로 시작
    },

    // 전투가 시작된 후 공격 상대를 고른다.
    enemyChoiceController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const selectUser = [...pvpUsers];

        if (userInfo.username===selectUser[Number(CMD1)-1]) return pvpBattle.selectWrong(socket, CMD1, userInfo, userStatus)

        // 2가지로 나뉘어한다. 1,2,3번 유저는 4,5,6번 유저를 선택할 수 있고,
        // 4,5,6번 유저는 1,2,3번 유저를 선택할 수 있다.
        // 공격 대상을 지정한 값을 가지고 있을 것이 필요함.
        enemyChoice.set(userInfo.username, selectUser[Number(CMD1)-1])

        // 선택하고 대기하는 필드로 넘기는 로직 필요할듯
        // 키는 선택한 유저, 벨류는 선택된 유저 식으로 저장해두고싶은데...
        const commandHandler: CommandHandler = {
            '도움말': pvpBattle.enemyChoiceHelp,
            1: pvpBattle.selecting,
            2: pvpBattle.selecting,
            // 3: pvpBattle.selecting,
            // 4: pvpBattle.selecting,
            // 5: pvpBattle.selecting,
            // 6: pvpBattle.selecting,
        };

        // 모든 유저가 선택이 끝났는지 확인하는 절차 필요


        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            pvpBattle.enemyChoiceWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
    },

    // 공격할 수단을 선택
        // 2가지로 나뉘어한다. 1,2,3번 유저는 4,5,6번 유저를 선택할 수 있고,
        // 4,5,6번 유저는 1,2,3번 유저를 선택할 수 있다.
        // 공격 대상을 지정한 값을 가지고 있을 것이 필요함.
    attackChoiceController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        if (CMD1 === '도움말') return pvpBattle.attackChoiceHelp(socket, CMD1, userInfo, userStatus)
        else if (!CMD2) return pvpBattle.attackChoiceWrongCommand(socket, CMD2, userInfo)
        else if (CMD1==='1' && CMD2 === '기본공격') return pvpBattle.selectSkills(socket, CMD2, userInfo, userStatus);
        else if (CMD1==='1' && CMD2 !== '기본공격') return pvpBattle.attackChoiceWrongCommand(socket, CMD2, userInfo)
        else if (!userStatus.skill[Number(CMD1)-2]) return pvpBattle.isSkills(socket, CMD2, userInfo, userStatus)
        else if (userStatus.skill[Number(CMD1)-2].name !== CMD2) return pvpBattle.isSkills(socket, CMD2, userInfo, userStatus)
        /**
         * 1. 도움말
         * 2. 기본공격 입력 확인
         * 3. 가지고 있는 스킬인지 확인
         */

        // 선택하고 대기하는 필드로 넘기는 로직 필요할듯
        // 키는 선택한 유저, 벨류는 선택된 스킬 식으로 저장해두고싶은데...
        const commandHandler: CommandHandler = {
            2: pvpBattle.selectSkills,
            3: pvpBattle.selectSkills,
            4: pvpBattle.selectSkills,
        };

        // 모든 유저가 선택이 끝났는지 확인하는 절차 필요


        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            pvpBattle.attackChoiceWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
    },

    // 실제 공격이 이루어진다. 순서대로 스크립트를 보여주는 과정이 필요.
    anemyAttackController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
    },

    // 모든 유저의 1회 공격이 이루어진 후 사망한 유저 확인과 1,2,3번 유저와
    // 4,5,6번 유저의 생존 유무에 따라 그대로 끝낼지, 마을로 보내질지 결정한다.
    // 한쪽 유저들이 패배한다면 pvp룸은 삭제된다. (혹은 모두 나가진다? 마을로 보내진다?)
    pvpResultController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
    }
}