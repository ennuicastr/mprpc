/*
 * Copyright (c) 2025 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

export type RPCReceiver<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
        ? R extends Promise<infer RP>
            ? (...args: A) => (R | Promise<{return: RP, transfer: Transferable[]}>)
            : (...args: A) => (R | {return: R, transfer: Transferable[]})
        : T[K];
};

export type RPCReceiverPort = {
    postMessage: typeof MessagePort.prototype.postMessage,
    addEventListener: typeof MessagePort.prototype.addEventListener
};

/**
 * Give this port a message handler for RPC messages, with this target.
 * @param target  Target object to call RPC methods on.
 * @param port  MessagePort (or Worker, etc) to send/receive RPC messages.
 */
export function rpcReceiver(target: any, port: RPCReceiverPort) {
    port.addEventListener("message", (ev: MessageEvent) => {
        const msg = ev.data;
        if (!msg || (msg.c !== "rpc" && msg.c !== "rpcv")) return;

        // Get the function
        const f = target[msg.f];
        if (!f) return;

        // Call it
        const ret: any = {
            c: "rpcRet",
            id: ev.data.id
        };
        try {
            ret.ret = f.apply(target, ev.data.args);
        } catch (ex) {
            ret.ex = ex;
        }

        // Maybe wait for promises
        if (ret.ret && ret.ret.then) {
            ret.ret.then(
                (x: any) => ret.ret = x
            ).catch(
                (ex: any) => ret.ex = ex
            ).then(then);
        } else {
            then();
        }

        function then() {
            if (msg.c === "rpcv") {
                if (ret.ex)
                    console.error("Unhandled exception:", ret.ex);
                return;
            }

            // Process the transfer out of the return
            let transfer: any[] = [];
            if (ret.ret && ret.ret.transfer) {
                transfer = ret.ret.transfer;
                if ("return" in ret.ret)
                    ret.ret = ret.ret.return;
            } else if (ret.ex && ret.ex.transfer) {
                transfer = ret.ex.transfer;
                if ("return" in ret.ex)
                    ret.ex = ret.ex.return;
            }
            try {
                port.postMessage(ret, transfer);
            } catch (ex) {
                ret.ex = "" + ret.ex;
                port.postMessage(ret, transfer);
            }
        }
    });

    const mport = <MessagePort> port;
    if (mport.start) mport.start();
}
