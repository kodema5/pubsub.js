// deno test --unstable --watch
//
import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.148.0/testing/asserts.ts";
import {
    describe, it, beforeEach
} from "https://deno.land/std@0.148.0/testing/bdd.ts";

import { pubsub } from '../mod.js'

describe('pubsub', () => {

    beforeEach(() => { pubsub.reset() })

    it('can publish-subscribe', () => {
        pubsub.subscribe('channel-1.sub-1', (a,b) => {
            assertEquals(a+b, 3)
        })
        pubsub.publish('channel-1', 1, 2)
    })


    it ('can execute subscribers', async () => {
        pubsub.subscribe('channel-1.sub-1', () => 1)
        pubsub.subscribe('channel-1.sub-2', () => 2)
        pubsub.subscribe('channel-1.sub-3', () => 3)
        let a = await pubsub.exec('channel-1')
        assertEquals(Object.values(a).sort(), [1,2,3])

        pubsub.unsubscribe('channel-1.sub-2', ['channel-1.sub-3'])
        let b = await pubsub.exec('channel-1')
        assertEquals(Object.values(b).sort(), [1])
    })
})
