const fs = require('fs');
const gulp = require('gulp');
const rollup = require('rollup');
const buble = require('@rollup/plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const { minify } = require('terser');
const header = require('./header');

const pkgJson = fs.readFileSync(`${process.cwd()}/package.json`);
const pkgObj = JSON.parse( pkgJson );
const libName = pkgObj.name;


gulp.task('bundleJs', async () => {
    // 打包并转ES5
    let bundle = await rollup.rollup({
        input: './src/main.js',
        plugins: [
            buble(),
            resolve()
        ],
        // 设置外部引用（传入模块名，将不打包此模块）
        external: ['jquery']
    });

    // 添加头部并生成文件
    bundle = await bundle.write({
        file: `./dist/jquery.${libName}.js`,
        format: 'umd',
        // 设置全局模块（模块名: ID），用于umd/iife包。（rollup会将ID作为变量引入）
        globals: {
            jquery: 'jQuery'
        },
        banner: header
    });

    // 压缩、添加头部并生成文件
    const minified = await minify(bundle.output[0].code, {
        output: {
            comments: false,
            preamble: header
        }
    });


    fs.writeFileSync(`${process.cwd()}/dist/jquery.${libName}.min.js`, minified.code);
});

gulp.task('default', gulp.series(['bundleJs']));