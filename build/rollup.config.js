// rollup.config.js
import scss from 'rollup-plugin-scss'
import { terser } from "rollup-plugin-terser";


const plugins = [
    scss()
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
        format: 'umd',
        name: 'arrowApp',
    },
    plugins
};