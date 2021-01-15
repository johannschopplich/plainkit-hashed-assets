import fs from 'fs'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import glob from 'tiny-glob'

;(async () => {
  const inputDir = 'src/js'
  const isProduction = process.env.NODE_ENV === 'production'

  const builder = await esbuild.build({
    entryPoints: [
      `${inputDir}/main.js`,
      ...fs.existsSync(`${inputDir}/templates`) ? await glob(`${inputDir}/templates/*.js`) : []
    ],
    outdir: 'public/assets/js',
    outbase: inputDir,
    format: 'esm',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    },
    bundle: true,
    splitting: true,
    minify: isProduction,
    sourcemap: !isProduction,
    incremental: !isProduction
  })

  if (!isProduction) {
    chokidar
      .watch(`${inputDir}/**/*.js`, { awaitWriteFinish: true, ignoreInitial: true })
      .on('all', (eventName, path) => {
        console.log(`${path} ${eventName}`)
        return builder.rebuild()
      })
  }
})()
