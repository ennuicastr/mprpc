import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const plugins = [typescript({
    compilerOptions: {
        module: "esnext"
    }
})];

function dist(name, entry) {
    return {
        input: `src/${entry}.ts`,
        output: [
            {
                file: `dist/${name}.js`,
                format: "umd",
                name: "MPRPC"
            }, {
                file: `dist/${name}.min.js`,
                format: "umd",
                name: "MPRPC",
                plugins: [terser()]
            }, {
                file: `dist/${name}.mjs`,
                format: "es"
            }, {
                file: `dist/${name}.min.mjs`,
                format: "es",
                plugins: [terser()]
            }
        ],
        plugins
    };
}

export default [
    dist("mprpc", "main"),
    dist("mprpc-receiver", "rpc-receiver"),
    dist("mprpc-receiver-worker", "main-receiver"),
    dist("mprpc-target", "main-target")
];
