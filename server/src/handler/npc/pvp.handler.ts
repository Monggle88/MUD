import { socket } from '../../socket.routes';
import { UserInfo } from '../../interfaces/user';
import { NpcService } from '../../services';


export default {
    pvpHelp: (CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 샤크스 경과 대화합니다.\n';
        tempScript += '2 - 시련의 장으로 입장합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'pvp';

        socket.emit('print', { script, userInfo, field });
    },

    pvpTalk: async (CMD: string | undefined, userInfo: UserInfo) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.pvpTalkScript(userInfo.name);

        const script = tempLine + NpcScript;
        const field = 'pvp';

        socket.emit('print', { script, userInfo, field });
    },

    pvp: async (CMD: string | undefined, userInfo: UserInfo) => {
        // 여기서 pvp 입장하는 코드
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const actionScript: string = await NpcService.pvp(
            Number(userInfo.characterId),
        );
        tempScript += actionScript;
        tempScript += '1 - pvp룸 테스트.\n';

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.emit('print', { script, userInfo, field });
    },

    pvpWrongCommand: (CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvp';
        socket.emit('print', { script, userInfo, field });
    },
};
