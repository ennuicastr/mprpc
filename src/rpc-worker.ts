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

import * as cWorker from "./collectable-worker";
import * as rpcTarget from "./rpc-target";

/**
 * A Worker backed by RPC. Generally, you should derive from (or has-a) this to
 * expose the desired API.
 */
export class RPCWorker {
    constructor(url: string) {
        const worker = this._worker = new cWorker.CollectableWorker(this, url);
        this.postMessage = worker.postMessage.bind(worker);
        this.addEventListener = worker.addEventListener.bind(worker);
        this.removeEventListener = worker.removeEventListener.bind(worker);

        const rpcT = this._rpcTarget = new rpcTarget.RPCTarget(worker);
        this.rpc = rpcT.rpc.bind(rpcT);
        this.rpcv = rpcT.rpcv.bind(rpcT);
    }

    rpc: typeof rpcTarget.RPCTarget.prototype.rpc;
    rpcv: typeof rpcTarget.RPCTarget.prototype.rpcv;
    postMessage: typeof Worker.prototype.postMessage;
    addEventListener: typeof Worker.prototype.addEventListener;
    removeEventListener: typeof Worker.prototype.removeEventListener;

    private _rpcTarget: rpcTarget.RPCTarget;
    private _worker: cWorker.CollectableWorker;
}
