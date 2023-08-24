import { defineConfig } from 'vite';
import JSZip from 'jszip';
import fs from 'fs';

export default defineConfig({
  server: {
    port: 3000
  },
  preview: {
    port: 3001
  },
  plugins: [plugin()],
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false
    },
    reportCompressedSize: false,
    minify: 'terser',
    terserOptions: {
      toplevel: true,
      compress: {
        drop_console: true,
        ecma: 2020,
        module: true,
        passes: 3,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      mangle: {
        // properties: 'true', // Seems to be breaking pointer events
        // properties: {
        //   debug: '',
        //   keep_quoted: true,
        // },
        // reserved: ['onOver'],
        module: true,
        toplevel: true
      },
      format: {
        comments: false,
        ecma: 2020
      },
      module: true
    },
    assetsInlineLimit: 0
  }
})

async function zip(content) {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  const jszip = new JSZip();
  const zipOptions = {
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  };

  jszip.file('index.html', content, zipOptions);
  jszip.file('i.png', fs.readFileSync('dist/i.png'), zipOptions);

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

      html.source = html.source
        .replace(/<script.*<\/script>/, "")
        .replace("</body>", () => `<script>${js.code}</script>`)
        .replace(/\n+/g, "");

      await zip(html.source);

      // Delete the JS so it doesn't go into the dist folder
      delete bundle[js.fileName];
    }
  };
}
