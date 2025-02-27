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

export type RPCTargetPort = {
    postMessage: typeof MessagePort.prototype.postMessage,
    addEventListener: typeof MessagePort.prototype.addEventListener
};

/**
 * An object capable of submitting RPC messages on a given port. Generally, you
 * should subtype (or has-a) this to make your own RPC frontends.
 */
export class RPCTarget {
    constructor(private _port: RPCTargetPort) {
        _port.addEventListener("message", this._onmessage.bind(this));
    }

    /**
     * Call this remote procedure call.
     * @param func  Function name to call.
     * @param args  Arguments to the function.
     */
    rpc(func: string, args: any[]) {
        return this._rpc("rpc", true, func, args)!;
    }

    /**
     * Call this remote procedure call, void (ignore any return OR EXCEPTION).
     */
    rpcv(func: string, args: any[]) {
        this._rpc("rpcv", false, func, args);
    }

    /**
     * @private
     * Underlying RPC messenger method.
     */
    private _rpc(c: string, reply: boolean, func: string, args: any[]) {
        const id = this._idx++;
        const transfer: any[] = [];
        for (const arg of args) {
            if (arg && arg.transfer)
                transfer.push.apply(transfer, arg.transfer);
        }
        let p: Promise<any> | null = null;
        if (reply) {
            p = new Promise<any>((res, rej) => {
                this._res[id] = res;
                this._rej[id] = rej;
            });
        }
        this._port.postMessage({
            c,
            f: func, id, args
        }, transfer);
        return p;
    }

    /**
     * @private
     * Handle messages from the message port.
     */
    private _onmessage(ev: MessageEvent) {
        if (!ev || !ev.data) return;
        const id: number = ev.data.id;
        const res =
            ("ex" in ev.data)
            ? this._rej[id]
            : this._res[id];
        delete this._res[id];
        delete this._rej[id];
        if (!res) return;
        res(("ex" in ev.data) ? ev.data.ex : ev.data.ret);
    }

    private _idx = 0;
    private _res: Record<number, (x:any)=>unknown> = {};
    private _rej: Record<number, (x:any)=>unknown> = {};
}
