import chokidar from 'chokidar'
import esbuild from 'esbuild'
import glob from 'tiny-glob'

;(async () => {
  const isProduction = process.env.NODE_ENV === 'production'

  const builder = await esbuild.build({
    color: true,
    entryPoints: [
      './src/js/main.js',
      ...await glob('./src/js/templates/*.js')
    ],
    outdir: './public/assets/js',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    },
    bundle: true,
    minify: isProduction,
    sourcemap: !isProduction,
    incremental: !isProduction
  })

  if (!isProduction) {
    chokidar
      .watch('src/**/*.js', { awaitWriteFinish: true, ignoreInitial: true })
      .on('all', (eventName, path) => {
        console.log(`${path} ${eventName}`)
        return builder.rebuild()
      })
  }
})()
