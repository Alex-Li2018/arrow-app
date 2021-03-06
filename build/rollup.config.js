// rollup.config.js
import scss from 'rollup-plugin-scss'
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [
    scss(),
    nodeResolve(),
    commonjs()
]
let file = './dist/arrowApp.js'

if (process.env.NODE_ENV === 'production') {
    plugins.push(terser())
    file = './dist/arrowApp.min.js'
} 

export default {
    // 核心选项
    input: './src/index.js',     // 必须
    output: {
        file,
        format: 'esm',
        name: 'ArrowApp',
    },
    plugins
};