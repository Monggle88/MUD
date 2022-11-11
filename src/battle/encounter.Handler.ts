import { UserSession } from '../interfaces/user';
import { BattleService } from '../services';
import redis from '../db/redis/config';
import { Monsters } from '../db/models';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    ehelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        tempScript += '[도망] 가기 - 전투를 포기하고 도망갑니다.\n';
        tempScript += '---전투 중 명령어---\n';
        tempScript +=
            '[스킬] [num] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n';

        const script = tempScript;
        const field = 'encounter';
        return { script, user, field };
    },

    encounter: async (CMD: string | undefined, user: UserSession) => {
        // 던전 진행상황 불러오기
        let dungeonSession = await redis.hGetAll(String(user.characterId));
        const dungeonLevel = Number(dungeonSession!.dungeonLevel);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        // 적 생성
        const newMonster = await BattleService.createNewMonster(dungeonLevel);
        tempScript += `너머에 ${newMonster.name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        dungeonSession = {
            dungeonLevel: String(dungeonLevel),
            monsterId: String(newMonster.monsterId),
        };
        await redis.hSet(String(user.characterId), dungeonSession);

        const script = tempLine + tempScript;
        const field = 'encounter';

        return { script, user, field };
    },

    run: async (CMD: string | undefined, user: UserSession) => {
        console.log('도망 실행');
        const dungeonSession = await redis.hGetAll(String(user.characterId));
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += `... 몬스터와 눈이 마주친 순간,\n`;
        tempScript += `당신은 던전 입구를 향해 필사적으로 뒷걸음질쳤습니다.\n\n`;
        tempScript += `??? : 하남자특. 도망감.\n\n`;
        tempScript += `목록 - 던전 목록을 불러옵니다.\n`;
        tempScript += `입장 [number] - 선택한 번호의 던전에 입장합니다.\n\n`;

        // 몬스터 삭제
        await Monsters.destroyMonster(Number(dungeonSession.monsterId));
        await redis.hDel(String(user.userId), 'monsterId');

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },

    ewrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, user, field };
    },
};