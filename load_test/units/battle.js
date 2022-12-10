


module.exports = (socket, WAIT_COMMAND) => {
let cnt = 0;
let dead = 0;
let alive = 0;
    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            const start = performance.now();
            socket.volatile.emit(field, input);
    
            socket.once('print', (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.once('printBattle',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.once('void',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
    
            socket.once('disconnect', () => {reject(socket.connected)});
        });
    }

    const battleResult = (userInfo, userStatus, seconds) => {
        const start = Date.now();
        let flag = false;
        
        return new Promise((resolve, reject) => {
            const result = {
                'autoBattleS': (res, time) => {
                    if (time < seconds * 1000) return;
    
                    flag = true;
                    alive++;
                    console.log('ALIVE', userInfo.characterId);
                    emit('autoBattleS', { line: '중단', userInfo, userStatus }).then((res) => {
                        userInfo = res.userInfo;
                        const field = 'dungeon';
                        resolve({ ...res, field, userInfo, userStatus });
                    }).catch((error) => {
                        console.log('battleResult Error', userInfo.characterId, error.message);
                        reject(`Error: battleResult, ${userInfo.characterId}, ${error.message}`);
                    });
                },
                'heal': (res, time) => {
                    flag = true;
                    dead++;
                    console.log('DEAD', userInfo.characterId);
                    resolve({ field: res.field, userInfo, userStatus });
                },
                'dungeon': (res, time) => {
                    flag = true;
                    console.log('BATTLE ERROR RETRUNING TO ENTRANCE', userInfo.characterId);
                    resolve({ field: res.field, userInfo, userStatus });
                }
            }
            socket.on('printBattle', async(res) => {
                const time = Date.now() - start;
                const field = res.field;
                userStatus = res.userStatus;

                if (!flag) result[field](res, time);
            });
        });
    }

    return {
        dungeonList: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('dungeon', { line: '목록', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'dungeon';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: dungeonList');
                console.error(error);
            }
        },
        enterDungeon: async(field, userInfo, userStatus) => {
            try {
                const { level } = userStatus;
                const dungeonLevel = (level / 10)|0 + 1;
                const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
    
                const r1 = await emit('dungeon', { line, userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'battle';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: enterDungeon');
                console.error(error);
            }
        },
        encounterFromList: async(field, userInfo, userStatus) => {
            console.log('normal');

            try {
                const { level } = userStatus;
                const dungeonLevel = (level / 10)|0 + 1;
                const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
                const throughput = [];
    
                const r1 = await emit('dungeon', { line, userInfo, userStatus });
                throughput.push(r1.throughput);
        
                const r2 = await emit('battle', { line: '수동', userInfo, userStatus });
                throughput.push(r2.throughput);
    
                userInfo = r2.userInfo;
                field = r2.field;
    
                return { field, userInfo, userStatus, cnt: 2, throughput };
            } catch (error) {
                console.log('ERROR: encounterFromList');
                console.error(error);
            }
        },

        auto: async(field, userInfo, userStatus, seconds=30) => {
            try {
                const throughput = [];
    
                const r1 = await emit('battle', { line: '자동단일', userInfo, userStatus });
                throughput.push(r1.throughput);
    
                const result = await battleResult(userInfo, userStatus, seconds);
                
                switch (result.field) {
                    case 'heal':
                        return { ...result, cnt: 1, throughput };
                    case 'dungeon':
                        throughput.push(result.throughput);
                        return { ...result, cnt: 2, throughput };
                }
            } catch (error) {
                console.log('ERROR: auto');
                console.error(error);
            }
        },
        autoFromList: async(field, userInfo, userStatus, seconds=30) => {
            console.log('autoFromList', userInfo.characterId);

            try {
                const { level } = userStatus;
                const dungeonLevel = (level / 10)|0 + 1;
                const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
                const throughput = [];
        
                console.log('to dungeon', userInfo.characterId);
                const r1 = await emit('dungeon', { line, userInfo, userStatus });
                throughput.push(r1.throughput);
        
                console.log('auto start', userInfo.characterId);
                const r2 = await emit('battle', { line: '자동단일', userInfo, userStatus });
                throughput.push(r2.throughput);
                
                console.log('listen result', userInfo.characterId);
                const result = await battleResult(userInfo, userStatus, seconds);
                cnt++;
                console.log('RESULT OUT', cnt);
                switch (result.field) {
                    case 'heal':
                        return { ...result, cnt: 2, throughput };
                    case 'dungeon':
                        throughput.push(result.throughput);
                        return { ...result, cnt: 3, throughput };
                }
            } catch (error) {
                console.log('ERROR: autoFromList');
                console.error(error);
            }
    
        },

        dungeonHelp: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('dungeon', { line: '도움말', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'dungeon';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: dungeonHelp');
                console.error(error);
            }
        },
        dungeonWrong: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('dungeon', { line: '', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'dungeon';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: dungeonWrong');
                console.error(error);
            }
        },
    }
    
}