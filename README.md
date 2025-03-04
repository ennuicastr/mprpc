This is a simple system for remote procedure calls over MessagePorts and
Workers.

It is divided into a receiver module and a target module. In this context, a
receiver is the object that actually handles and runs RPC procedures, and a
target is an object that dispatches RPC calls over message ports.

Types are exported for TypeScript to make it relatively straightforward to
implement both sides based on a single interface.

We will use the following simple interface as an example:

```typescript
interface Calculator {
    readNumber(): Promise<number>;
    sum(l: Float64Array): number;
}
```


## Receiver

Import `@ennuicastr/mprpc/receiver`. In sample code, it will be imported as
`rpcReceiver`.

Any object with methods can be an RPC receiver. To assign an RPC receiver
object to a `MessagePort`, use `rpcReceiver.rpcReceiver`:

```typescript
rpcReceiver.rpcReceiver(new Handler(), messagePort);
```

As it's common to make a worker that primarily acts as a receiver for RPC
messages, a helper function is provided that's simply equivalent to calling
`rpcReceiver.rpcReceiver` with `globalThis` as the message port:

```typescript
rpcReceiver.rpcWorkerMain(new Handler());
```

RPC methods can return either the value directly, or an object of the form
`{return: value, transfer: [...]}`. In the latter case, the `transfer` array is
passed as the `transfer` argument to `postMessage`.

In addition, the type constructor `rpcReceiver.RPCReceiver<T>` is provided.
This modifies a type by allowing the return type of methods to have transfers.
`rpcReceiver.RPCReceiver<Calculator>` is:

```typescript
interface {
    readNumber(): Promise<number> | Promise<{return: number, transfer: Transferable[]}>;
    sum(l: Float64Array): number | {return: number, transfer: Transferable[]};
}
```


## Target

Import `@ennuicastr/mprpc/target`. In sample code, it will be imported as
`rpcTarget`.

The `rpcTarget.RPCTarget` class class provides an RPC target for a
`MessagePort` you've created yourself. It provides two RPC methods: `rpc` and
`rpcv`. The difference is simply that the latter does not wait for a return,
which can be more efficient as it saves a message. `rpc` and `rpcv` take two
arguments plus an optional third: the method to call on the receiver, the
arguments as an array, and the transfer list for `postMessage`. `rpc` returns a
Promise which resolves (or rejects) based on the result of the method on the
receiver.

Additionally, `rpcTarget.RPCTarget` provides a `tee` method, which creates an
additional `MessagePort` for communicating with the same receiver, which can
then be, for instance, transferred to another worker.

For the common case of a worker servering as the RPC receiver, the class
`rpcTarget.RPCWorker` is provided. It takes a Worker URL as its argument, just
like the native `Worker`, and connects it as an RPC target.

The type constructor `rpcTarget.Async` is provided to help create wrapper
classes for `rpcTarget.RPCTarget`. It simply adds `Promise` to all method
return types. `rpcTarget.Async<Calculator>` is:

```typescript
interface {
    readNumber(): Promise<number>;
    sum(l: Float64Array): Promise<number>;
}
```

The general design intent of `rpcTarget.RPCTarget` and `rpcTarget.RPCWorker` is
to build classes that inherit from them, but they're also suitable for keeping
as private fields within an exposed class. Here are examples of both designs,
for `Calculator`:


```typescript
class CalculatorWorkerA
    extends rpcTarget.RPCWorker
    implements rpcTarget.Async<Calculator>
{
    constructor() { super(calculatorWorkerURL); }

    readNumber(): Promise<number> {
        return this.rpc("readNumber", []);
    }

    sum(l: Float64Array): Promise<number> {
        return this.rpc("sum", [l], [l.buffer]);
    }
}

class CalculatorWorkerB
    implements rpcTarget.Async<Calculator>
{
    constructor() {
        this._worker = new rpcTarget.RPCWorker(calculatorWorkerURL);
    }

    readNumber(): Promise<number> {
        return this._worker.rpc("readNumber", []);
    }

    sum(l: Float64Array): Promise<number> {
        return this._worker.rpc("sum", [l], [l.buffer]);
    }
}
```
