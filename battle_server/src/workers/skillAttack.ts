import { Worker, MessagePort } from 'node:worker_threads';
import { join } from 'path';
import { errorReport, HttpException } from '../common';
import { redis } from '../db/cache';
import env from '../env';
import { UserStatus } from '../interfaces/user';
import { AutoWorkerData } from '../interfaces/worker';


class SkillAttackWorker {

    private threads: Map<number, Worker> = new Map();

    start = (socketId: string, userStatus: UserStatus, skillToDead: MessagePort): Promise<void> => {
        const { characterId } = userStatus;
        console.log('skillAttack.ts: 스킬반복 start() 시작, ', characterId);
        const workerData: AutoWorkerData = {
            userStatus,
            path: './skillAttack.worker.ts',
            socketId,
        }

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'skillAttack.worker.js'),
                { workerData }
            );
            worker.postMessage({ skillToDead }, [ skillToDead ]);
            this.threads.set(characterId, worker);
            console.log('skillAttack.ts: start() Promise', worker.threadId, characterId);

            worker.on('message', (result) => {
                worker.terminate();
                resolve(result);
            });
            // worker.on('online', () => {});
            worker.on('messageerror', reject);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                console.log(`skillAttack ${characterId} exitCode: ${code}, `, characterId);
                this.threads.delete(characterId);
            });
        });
    }

    get = (characterId: number) => {
        return this.threads.get(characterId);
    }

    terminate = (characterId: number) => {
        // redis.battleSet(characterId, { SKILL: 'off' });
        const worker = this.threads.get(characterId);
        worker?.terminate().catch(errorReport);
    }

    all = () => {
        return Object.fromEntries(this.threads);
    }

}


export default new SkillAttackWorker();