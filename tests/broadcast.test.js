// deno test --unstable --watch
// note: --unstable (seems some leaks)

import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    describe, it, beforeEach, afterAll,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";

import { PubSub } from '../mod.js'
let pubsub1 = new PubSub({ broadcastChannelId: 'PUBSUB-CHANNEL' })
let pubsub2 = new PubSub({ broadcastChannelId: 'PUBSUB-CHANNEL' })

describe('broadcast', async () => {

    beforeEach(() => {
        pubsub1.reset()
        pubsub2.reset()
    })

    it('can publish-subscribe', () => {
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

    afterAll(() => {
        pubsub1.broadcastChannel.close()
        pubsub2.broadcastChannel.close()
    })
})
