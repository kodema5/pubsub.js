// deno test --unstable --watch
// note: --unstable (seems some leaks)

import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.148.0/testing/asserts.ts";
import {
    describe, it, beforeEach, afterAll, afterEach,
} from "https://deno.land/std@0.148.0/testing/bdd.ts";

import { PubSub } from '../mod.js'

let pubsub1 = new PubSub({ broadcastChannelId: 'PUBSUB-CHANNEL' })
let pubsub2 = new PubSub({ broadcastChannelId: 'PUBSUB-CHANNEL' })
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('broadcast', async () => {

    beforeEach(() => {
        pubsub1.reset()
        pubsub2.reset()
    })

    it('can publish-subscribe', async () => {
        pubsub1.subscribe('channel-1.sub-1', (a,b) => {
            assertEquals(a + b, 3)
        })
        pubsub2.subscribe('channel-1.sub-2', (a,b) => {
            assertEquals(a + b, 3)
        })

        pubsub2.publish(
            'channel-1' + '!', // must be ended w '!'
            1, 2)
    })

    afterEach(async () => {
        pubsub1.broadcastChannel.close()
        pubsub2.broadcastChannel.close()
        await sleep(1)
    })
})
