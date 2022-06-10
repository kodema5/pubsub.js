let arrayFrom = (arr) => Array.isArray(arr) ? arr : [arr]

// publish-subscribe to channels
//
export class PubSub {
    constructor ({
        broadcastChannelId
    }) {
        var me = this
        me._id = 0
        me.channels = {} // local channels

        // also listens to broadacast channel
        //
        if (broadcastChannelId) {
            let bc = new BroadcastChannel(broadcastChannelId)

            bc.onmessage = (ev) => {
                let { channel, args } = ev.data
                me.publish_.apply(me, [channel].concat(args))
            }

            me.broadcastChannel = bc
        }
    }

    // clears all channel
    reset() {
        this._id = 0
        this.channels = {}
    }

    // creates channel.unique_id
    //
    channelId(id) {
        let [ch, ...ns] = (id || '').split('.')
        return [
            ch, // channel-name
            ns.join('.') || `_${++this._id}` // id to channel
        ]
    }

    // channels[channel] = { id: fn }
    //
    subscribe(id, fn, override=false) {
        let [ch, n] = this.channelId(id)
        if (!ch) return

        let channels = this.channels
        if (!channels[ch]) channels[ch] = {}
        let subs = channels[ch]

        if (subs[n] && !override) {
            throw new Error(`subscribe: ${id} already exists`)
        }

        subs[n] = fn
        return [ch, n].join('.')
    }

    // deletes from channel
    //
    unsubscribe() {
        let me = this
        Array.from(arguments).flat().forEach((id) => {
            let [ch, n] = me.channelId(id)
            if (!ch) return

            let subs = me.channels[ch]
            if (!subs) return

            delete subs[n]
        })
    }

    // publish to local pool
    //
    publish_(ch, ...args) {
        let subs = this.channels[ch]
        if (!subs) return

        Object.values(subs)
        .forEach(fn => {
            fn.apply(null, args)
        })
    }

    // publish to local and broadcast channel
    // channel ends with "!" broadcast to all listeners
    //
    publish(channel, ...args) {
        let broadcast = channel.slice(-1)==='!'
        channel = broadcast
            ? channel.slice(0, -1)
            : channel

        if (broadcast && this.broadcastChannel ) {
            this.broadcastChannel.postMessage({
                channel,
                args
            })
        }
        return this.publish_.apply(this, [channel].concat(args))
    }

    // execute to local channels only
    //
    async exec(ch, ...args) {
        let subs = this.channels[ch]
        if (!subs) return

        let fns = Object.values(subs)
            .map(fn => fn.apply(null, args))
        let arr = await Promise.all(fns)

        return Object.keys(subs)
            .reduce( (x, id, i) => {
                x[id] = arr[i]
                return x
            }, {})
    }
}

// for a global pubsub
//
const WEB_PUBSUB_BROADCAST_CHANNEL_ID =
    globalThis.WEB_PUBSUB_BROADCAST_CHANNEL_ID
    || 'web-pubsub-broadcast-channel-id'
export let pubsub = new PubSub({
    broadcastChannelId: WEB_PUBSUB_BROADCAST_CHANNEL_ID
})
export let publish = pubsub.publish.bind(pubsub)
export let subscribe = pubsub.subscribe.bind(pubsub)
export let unsubscribe = pubsub.unsubscribe.bind(pubsub)
export let exec = pubsub.exec.bind(pubsub)
