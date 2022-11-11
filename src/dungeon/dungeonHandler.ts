import { UserSession } from '../interfaces/user';
import DungeonService from '../services/dungeon.service';
import redis from '../db/redis/config';

export default {
    help: (CMD: string | undefined, user: UserSession) => {
        let tempScript = '';

        tempScript += '명령어 : \n';
        tempScript += '목록 - 던전 목록을 불러옵니다.\n';
        tempScript += '입장 (번호) - 던전에 들어갑니다.\n';
        tempScript += '돌아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },

    getDungeonList: (CMD: string | undefined, user: UserSession) => {
        console.log('dungeon list.');

        // 던전 목록 불러오기
        const dungeonList = DungeonService.getDungeonList();

        // 임시 스크립트 선언
        const tempLine = '========================================\n';
        let tempScript: string = '';

        tempScript += `${user.name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n`;
        tempScript += `${dungeonList}`;

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field, chat:true };
    },

    getDungeonInfo: (CMD: string | undefined, user: UserSession) => {
        console.log('dungeonInfo.');

        // 임시 스크립트 선언
        const tempLine = '========================================\n';
        let tempScript: string = '';

        // 던전 정보 불러오기
        const dungeonInfo = DungeonService.getDungeonInfo(Number(CMD));

        tempScript += dungeonInfo;
        tempScript += `1. [수동] 전투 진행\n`;
        tempScript += `2. [자동] 전투 진행\n`;
        tempScript += `3. [돌]아가기\n`;

        // 던전 진행상황 업데이트
        const dungeonSession = {
            dungeonLevel: Number(CMD),
            monsterId: 0,
        };
        redis.hSet(String(user.characterId), dungeonSession);

        const script = tempLine + tempScript;
        const field = 'battle';
        return { script, user, field };
    },

    wrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },
};




export function dungeonList(name: string) {
    // 던전 목록 불러오기
    const dungeonList = DungeonService.getDungeonList();
    console.log(dungeonList);

    // 임시 스크립트 선언
    const tempLine = '========================================\n';
    let tempScript: string = '';

    tempScript += `${name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n`;
    tempScript += `${dungeonList}`;

    return tempLine + tempScript;
}