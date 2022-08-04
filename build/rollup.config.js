// rollup.config.js
import scss from 'rollup-plugin-scss'
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import injectProcessEnv from 'rollup-plugin-inject-process-env';
import replace from '@rollup/plugin-replace';

const plugins = [
    scss(),
    // injectProcessEnv({ 
    //     NODE_ENV: process.env.NODE_ENV,
    //     SOME_OBJECT: {},
    //     UNUSED: null
    // }),
    replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    commonjs(),
    nodeResolve(),
]
let file = process.env.MOUDLE === 'esm' ? './dist/arrowApp.esm.js' : './dist/arrowApp.js'

if (process.env.NODE_ENV === 'production') {
    plugins.push(terser())
    file = './dist/arrowApp.min.js'
} 

export default {
    // 核心选项
    input: './src/index.js',     // 必须
    output: {
        file,
        format: process.env.MOUDLE === 'esm' ? 'esm' : 'umd',
        name: 'ArrowApp',
    },
    plugins
};