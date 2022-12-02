

export default {
    help: 
    `명령어 : 
    목록 - 던전 목록을 불러옵니다.
    입장 (번호) - 던전에 들어갑니다.
    돌아가기 - 이전 단계로 돌아갑니다.
    글로벌 명령어 : g [OPTION]\n\n`,
    wrong: (CMD: string) => {
        const script = 
        `=======================================================================
        입력값을 확인해주세요.
        현재 입력 : 입장 '${CMD}'
        사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n\n`;
        return script;
    },
    enter: 
    `1. [수동] 전투 진행
    2. [자동] 전투 진행
    3. [돌]아가기`,
}