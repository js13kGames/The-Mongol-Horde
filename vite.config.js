import { defineConfig, Plugin } from 'vite';
import JSZip from 'jszip';
import fs from 'fs';

export default defineConfig({
  plugins: [plugin()],
  build: {
    modulePreload: {
      polyfill: false
    },
    reportCompressedSize: false,
    minify: 'terser',
    terserOptions: {
      toplevel: true,
      compress: {
        passes: 2,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true
      },
      mangle: {
        properties: 'true'
      },
      module: true
    },
    assetsInlineLimit: 0
  }
})

async function zip(content) {
  const jszip = new JSZip();

  jszip.file('index.html', content, {
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  })

  await new Promise((resolve) => {
    jszip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream('dist/game.zip'))
      .on('finish', () => {
        const size = fs.statSync('dist/game.zip').size
        let percent = parseInt((size / 13312) * 100, 10);
        console.log(`\nZip size: ${size}B`);
        console.log(`${ percent }% of total game size used`)
        resolve();
      });
  });
}

function plugin() {
  return {
    enforce: "post",
    generateBundle: async (options, bundle) => {
      let html = bundle["index.html"];
      let js = bundle[Object.keys(bundle).filter(i => i.endsWith('.js'))[0]];

      if (html.type === "asset") {
        html.source = html.source
          .replace(/<script.*<\/script>/, "")
          .replace("</body>", () => `<script>${js.code}</script>`)
          .replace(/\n+/g, "");
      }

      await zip(html.source);

      delete bundle[js.fileName];
    }
  };
}
