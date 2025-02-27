import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const plugins = [typescript({
    compilerOptions: {
        module: "esnext"
    }
})];

export default [{
    input: "src/main.ts",
    output: [
        {
            file: "dist/mprpc.js",
            format: "umd",
            name: "MPRPC"
        }, {
            file: "dist/mprpc.min.js",
            format: "umd",
            name: "MPRPC",
            plugins: [terser()]
        }, {
            file: "dist/mprpc.mjs",
            format: "es"
        }, {
            file: "dist/mprpc.min.mjs",
            format: "es",
            plugins: [terser()]
        }
    ],
    plugins
}, {
    input: "src/main-receiver.ts",
    output: [
        {
            file: "dist/mprpc-receiver.js",
            format: "umd",
            name: "MPRPC"
        }, {
            file: "dist/mprpc-receiver.min.js",
            format: "umd",
            name: "MPRPC",
            plugins: [terser()]
        }, {
            file: "dist/mprpc-receiver.mjs",
            format: "es"
        }, {
            file: "dist/mprpc-receiver.min.mjs",
            format: "es",
            plugins: [terser()]
        }
    ],
    plugins

}, {
    input: "src/main-target.ts",
    output: [
        {
            file: "dist/mprpc-target.js",
            format: "umd",
            name: "MPRPC"
        }, {
            file: "dist/mprpc-target.min.js",
            format: "umd",
            name: "MPRPC",
            plugins: [terser()]
        }, {
            file: "dist/mprpc-target.mjs",
            format: "es"
        }, {
            file: "dist/mprpc-target.min.mjs",
            format: "es",
            plugins: [terser()]
        }
    ],
    plugins
}];
