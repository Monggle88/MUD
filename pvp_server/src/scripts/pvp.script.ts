
export default {
    wrongCommand: (CMD: string | undefined): string => {
        if (!CMD) CMD = '입력하지 않으셨습니다.'
        return `message : 입력값을 확인해주세요.
        현재 입력 : ${CMD}
        사용가능한 명령어는 '도움말'을 입력하세요.\n`
    },

    pvpNpcTalk: () :string => {
        const scripts: string[] = [
        `어서오시게 ! 만약 상대가 전쟁을 원하면 기꺼이 응해주게나.\n\n`,
        `내 경기장에서 워리어가 자네 앞길을 막아선다면, 그놈을 때려눕혀.
        위저드가 입을 열면 그 말을 입에 쳐 넣어 줘.
        승리를 향한 길은 오직 하나뿐이지, 수호자. 전장에서 보세.\n\n`,
        `자기가 죽으면 남을 죽일 수도 읍지! 으하하하!\n\n`
        ]
        const randomIndex = Math.floor(Math.random() * scripts.length);

        return '샤크스 경 : \n' + scripts[randomIndex];
    },

    pvpRoomJoin:(name: string): string => {
    return `=======================================================================\n
    ${name}님이 입장하셨습니다.\n\n`
    },

    coolTimeWrong: (cooltime: number) => {
       return `=======================================================================\n
    아직 공격할 수 없습니다. 남은시간은 ${(3000 - cooltime) / 1000}초 입니다.\n`
    },

    village: `=======================================================================\n
        방문할 NPC의 번호를 입력해주세요.\n
        1. 프라데이리 - 모험의 서\n
        2. 아그네스 - 힐러의 집\n
        3. 퍼거스 - 대장장이\n
        4. 에트나 - ???\n
        5. 샤크스 경 - 시련의 장 관리인\n\n`,

    defaultList: `생성된 방이 존재하지 않습니다.\n`,

    welcomePvp: `=======================================================================\n
    샤크스 경 :\n
    3 : 3 전투가 이루어지는 전장에 어서오시게 ! \n\n`,

    pvpJoin: `\n\n1. 방생성 - >1 방이름< 으로 입력하게나 !
    2. 방입장 - >2 방이름< 으로 입력하게나 !
    [새]로고침 - 새로고침 한 방목록을 불러온다네 !
    [돌]아가기 - 마을로 돌아갈수 있긴한데.. 도망가는건가 ?\n`,
}