import FS from 'fs-extra';
import path from 'path';
import stylus from 'stylus';
import * as ejs from 'ejs';
import * as terser from 'terser';
import { create } from 'markdown-to-html-cli';
import 'colors-cli/toxic';
import crypto from 'crypto';

// 构建产物输出到 .deploy 目录，部署时该目录内容会成为仓库根目录
const deployDir = path.resolve(process.cwd(), '.deploy');
const templateImgDir = path.resolve(process.cwd(), 'template', 'img');
const rootIndexJSPath = path.resolve(process.cwd(), 'template', 'js', 'index.js');
const dataJsonPath = path.resolve(process.cwd(), 'dist', 'data.json');
const dataJsonMinPath = path.resolve(process.cwd(), 'dist', 'data.min.json');
const cssPath = path.resolve(deployDir, 'css', 'index.css');
const contributorsPath = path.resolve(process.cwd(), 'CONTRIBUTORS.svg');
const BUILD_VERSION = Date.now().toString(36);

// 缓存目录（用于增量构建）
const cacheDir = path.resolve(process.cwd(), '.cache');
const cacheMetaPath = path.resolve(cacheDir, 'meta.json');

// 全量构建标志
const isFullBuild = process.argv.includes('--full') || process.argv.includes('-f');

/**
 * 简单文件缓存：只处理有变化的 .md 文件
 * 返回 { files: string[], changed: boolean }
 */
function getChangedFiles(filepath, type) {
  const allFiles = [];
  const files = FS.readdirSync(filepath);
  for (let i = 0; i < files.length; i++) {
    if (/\.md$/.test(files[i])) {
      allFiles.push(path.join(filepath, files[i]));
    }
  }

  // 全量构建时直接返回全部文件
  if (isFullBuild) {
    return { files: allFiles, changed: true };
  }

  // 读取缓存元数据
  let cacheMeta = {};
  if (FS.existsSync(cacheMetaPath)) {
    try {
      cacheMeta = JSON.parse(FS.readFileSync(cacheMetaPath, 'utf8'));
    } catch { /* 忽略解析错误 */ }
  }

  // 检查哪些文件有变化
  const changedFiles = [];
  for (const f of allFiles) {
    const mtime = FS.statSync(f).mtimeMs;
    const key = `${type}:${path.basename(f)}`;
    if (!cacheMeta[key] || cacheMeta[key] < mtime) {
      changedFiles.push(f);
      cacheMeta[key] = mtime;
    }
  }

  return {
    files: changedFiles.length > 0 ? allFiles : allFiles, // 始终返回所有文件（JSON需要全量）
    changed: changedFiles.length > 0,
    changedFiles,
    cacheMeta
  };
}

/**
 * 保存缓存元数据
 */
function saveCacheMeta(meta) {
  if (isFullBuild) return; // 全量构建不写缓存
  FS.ensureDirSync(cacheDir);
  FS.writeFileSync(cacheMetaPath, JSON.stringify(meta, null, 2));
}

;(async () => {
  try {
    await FS.ensureDir(deployDir);
    await FS.emptyDir(deployDir);
    await FS.ensureDir(path.resolve(deployDir, 'js'));
    await FS.ensureDir(path.resolve(deployDir, 'css'));
    await FS.ensureDir(path.resolve(deployDir, 'c'));
    await FS.copySync(templateImgDir, path.resolve(deployDir, 'img'));

    await FS.copyFile(path.resolve(process.cwd(), 'template', 'js', 'copy-to-clipboard.js'), path.resolve(deployDir, 'js', 'copy-to-clipboard.js'));
    await FS.copyFile(path.resolve(process.cwd(), 'template', 'js', 'enhance.js'), path.resolve(deployDir, 'js', 'enhance.js'));
    await FS.copyFile(path.resolve(process.cwd(), 'node_modules/@uiw/github-corners/lib/index.js'), path.resolve(deployDir, 'js', 'github-corners.js'));

    // 使用 terser 替换 uglify-js
    const jsData = await FS.readFileSync(rootIndexJSPath);
    const terserResult = await terser.minify(jsData.toString(), {
      compress: true,
      mangle: true,
      output: { comments: false }
    });
    await FS.outputFile(path.resolve(deployDir, 'js', 'index.js'), terserResult.code);

    // 读取 command、myscript、k8s 三个目录的 md 文件
    const cmdResult = getChangedFiles(path.resolve(process.cwd(), 'command'), 'cmd');
    const scriptResult = getChangedFiles(path.resolve(process.cwd(), 'myscript'), 'script');
    const k8sResult = getChangedFiles(path.resolve(process.cwd(), 'k8s'), 'k8s');

    const commandFiles = cmdResult.files;
    const scriptFiles = scriptResult.files;
    const k8sFiles = k8sResult.files.filter(f => path.basename(f) !== 'README.md' && path.basename(f) !== '.helmignore');

    const files = [...commandFiles, ...scriptFiles, ...k8sFiles];

    // 合并缓存元数据
    const mergedMeta = {
      ...(cmdResult.cacheMeta || {}),
      ...(scriptResult.cacheMeta || {}),
      ...(k8sResult.cacheMeta || {})
    };

    const jsonData = await createDataJSON(files);
    const commandLength = jsonData.data.filter(item => item.t === "command").length;
    const scriptLength = jsonData.data.filter(item => item.t === "script").length;
    const k8sLength = jsonData.data.filter(item => item.t === "k8s").length;
    const totalLength = jsonData.data.length;

    await FS.outputFile(dataJsonPath, JSON.stringify(jsonData.json, null, 2));

    // 删除冗余的 data.min.json（dt.js 已经是压缩版，不再需要）
    if (FS.existsSync(dataJsonMinPath)) {
      await FS.remove(dataJsonMinPath);
      console.log(`  ${'🗑️ '.green} removed dist/data.min.json (redundant, dt.js already minified)`);
    }

    const dtJsContent = `var linux_commands=${JSON.stringify(jsonData.data)}`;
    const minifiedDtJs = await terser.minify(dtJsContent, { compress: true, mangle: false });
    await FS.outputFile(path.resolve(deployDir, 'js', 'dt.js'), minifiedDtJs.code);

    // 添加 dt.js 的缓存哈希文件名（长期缓存策略）
    const dtJsHash = crypto.createHash('md5').update(dtJsContent).digest('hex').slice(0, 8);
    await FS.outputFile(path.resolve(deployDir, 'js', `dt.${dtJsHash}.js`), minifiedDtJs.code);

    global.BUILD_VERSION = BUILD_VERSION;

    const cssStr = await createStylToCss(
      path.resolve(process.cwd(), 'template', 'styl', 'index.styl'),
    );

    await FS.outputFileSync(cssPath, cssStr)
    console.log(`  ${'→'.green} ${jsonData.data.length} items (cmd:${commandLength} script:${scriptLength} k8s:${k8sLength})`);

    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', 'index.ejs'),
      path.resolve(deployDir, 'index.html'),
      {
        p: '/index.html',
        n: 'Linux命令搜索引擎',
        d: '最专业的Linux命令大全，内容包含Linux命令手册、详解、学习，值得收藏的Linux命令速查手册。',
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength
      }
    );

    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', 'list.ejs'),
      path.resolve(deployDir, 'list.html'),
      {
        p: '/list.html',
        n: '搜索',
        d: '最专业的Linux命令大全，命令搜索引擎，内容包含Linux命令手册、详解、学习，值得收藏的Linux命令速查手册。',
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength
      }
    );

    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', 'hot.ejs'),
      path.resolve(deployDir, 'hot.html'),
      {
        p: '/hot.html',
        n: '搜索',
        d: '最专业的Linux命令大全，命令搜索引擎，内容包含Linux命令手册、详解、学习，值得收藏的Linux命令速查手册。',
        arr: jsonData.data,
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength
      }
    );

    // 生成脚本列表页面
    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', 'script-list.ejs'),
      path.resolve(deployDir, 'script-list.html'),
      {
        p: '/script-list.html',
        n: '脚本列表',
        d: 'Shell脚本大全，内容包含Shell脚本示例、详解、学习，值得收藏的Shell脚本速查手册。',
        arr: jsonData.data,
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength
      }
    );

    // 生成全部列表页面
    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', 'all.ejs'),
      path.resolve(deployDir, 'all.html'),
      {
        p: '/all.html',
        n: '全部列表',
        d: 'Linux命令和Shell脚本大全，内容包含Linux命令手册、Shell脚本示例、详解、学习。',
        arr: jsonData.data,
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength
      }
    );

    let svgStr = '';
    if (FS.existsSync(contributorsPath)) {
      svgStr = (await FS.readFile(contributorsPath)).toString();
    }

    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', 'contributors.ejs'),
      path.resolve(deployDir, 'contributors.html'),
      {
        p: '/contributors.html',
        n: '搜索',
        d: '最专业的Linux命令大全，命令搜索引擎，内容包含Linux命令手册、详解、学习，值得收藏的Linux命令速查手册。',
        arr: jsonData.data,
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength,
        contributors: svgStr,
      }
    );

    // 生成 404 页面
    await createTmpToHTML(
      path.resolve(process.cwd(), 'template', '404.ejs'),
      path.resolve(deployDir, '404.html'),
      {
        p: '/404.html',
        n: '404',
        d: '页面未找到',
        command_length: commandLength,
        script_length: scriptLength,
        k8s_length: k8sLength,
        total_length: totalLength
      }
    );

    // 生成详情页面
    await Promise.all(jsonData.data.map(async (item) => {
      item.command_length = commandLength;
      item.script_length = scriptLength;
      item.k8s_length = k8sLength;
      item.total_length = totalLength;
      // 根据类型选择正确的目录
      const typeMap = { script: 'myscript', k8s: 'k8s' };
      const mdDir = typeMap[item.t] || 'command';
      await createTmpToHTML(
        path.resolve(process.cwd(), 'template', 'details.ejs'),
        path.resolve(deployDir, 'c', `${item.n}.html`),
        item,
        path.resolve(process.cwd(), mdDir),
      );
    }));

    // 保存缓存
    saveCacheMeta(mergedMeta);

    // 复制 vercel.json 到部署目录，用于 Vercel CLI 直接部署
    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    if (FS.existsSync(vercelConfigPath)) {
      await FS.copy(vercelConfigPath, path.resolve(deployDir, 'vercel.json'));
      console.log(`  ${'📄 vercel.json copied'.green}`);
    }

    console.log(`  ${'✅ Build complete'.green} (${BUILD_VERSION})`);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error(`\n  ${'❌ Build failed'.red}`);
    console.error(`     ${'Error:'.red} ${msg}`);
    if (stack) {
      // 只显示第一行栈信息，避免太长
      const firstLine = stack.split('\n').find(l => l.includes(process.cwd()));
      if (firstLine) console.error(`     ${'At:'.red} ${firstLine.trim()}`);
    }
    console.error();
    process.exit(1);
  }
})();

/**
 * 返回 MD 所有路径的 Array
 * @param {String} filepath
 */
function readMarkdownPaths(filepath) {
  return new Promise((resolve, reject) => {
    try {
      let pathAll = [];
      if (!FS.existsSync(filepath)) {
        resolve(pathAll);
        return;
      }
      const files = FS.readdirSync(filepath);
      for (let i = 0; i < files.length; i++) {
        if (/\.md$/.test(files[i])) {
          pathAll.push(path.join(filepath, files[i]));
        }
      }
      resolve(pathAll);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 生成搜索数据 JSON
 * @param {String[]} pathArr
 */
function createDataJSON(pathArr) {
  return new Promise((resolve, reject) => {
    try {
      const commandData = {};
      const indexes = [];
      pathArr.forEach((mdPath) => {
        const json = {}
        const con = FS.readFileSync(mdPath);
        const str = con.toString();
        let title = str.match(/[^===]+(?=[===])/g);
        title = title[0] ? title[0].replace(/\n/g, '') : title[0];
        title = title.replace(/\r/, '')
        // 命令名称
        json["n"] = title;
        // 命令路径
        json["p"] = `/${path.basename(mdPath, '.md').replace(/\\/g, '/')}`;
        // 命令描述
        let des = str.match(/\n==={1,}([\s\S]*?)##/i);
        if (!des) {
          // 尝试匹配 ## 标题（k8s 文件可能用 ##）
          des = str.match(/\n## ([\s\S]*?)(?=\n##|\n#|$)/i);
        }
        if (!des) {
          throw `格式错误: ${mdPath}`;
        }
        des = des[1] ? des[1].replace(/\n/g, '').trim() : des[1];
        des = des.replace(/\r/g, '')
        json["d"] = des;
        // 添加类型字段，区分命令、脚本和K8s
        if (mdPath.includes('/k8s/') || mdPath.includes('\\k8s\\')) {
          json["t"] = "k8s";
        } else if (mdPath.includes('/myscript/') || mdPath.includes('\\myscript\\')) {
          json["t"] = "script";
        } else {
          json["t"] = "command";
        }
        indexes.push(json);
        commandData[title] = json;
      })
      resolve({
        json: commandData,
        data: indexes
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * @param {String} fromPath ejs path
 * @param {String} toPath html path
 */
function createTmpToHTML(fromPath, toPath, desJson, mdPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const current_path = toPath.replace(new RegExp(`${deployDir}`), '');
      const tmpStr = await FS.readFile(fromPath);
      let mdPathName = '';
      let mdhtml = '';
      let relative_path = '';
      if (mdPath) {
        // CSS/JS 引用相对地址
        relative_path = '../';
        // 判断类型
        if (desJson.t === "k8s") {
          mdPathName = `/k8s/${desJson.n}.md`;
        } else if (desJson.t === "script") {
          mdPathName = `/myscript/${desJson.n}.md`;
        } else {
          mdPathName = `/command/${desJson.n}.md`;
        }
        const mdFilePath = path.resolve(mdPath, `${desJson.n}.md`);
        if (FS.existsSync(mdFilePath)) {
          const READMESTR = await FS.readFile(mdFilePath);
          mdhtml = await markdownToHTML(READMESTR.toString());
        }
      }
      // 生成 HTML
      let html = ejs.render(tmpStr.toString(), {
        filename: fromPath,
        relative_path, // 当前文件相对于根目录的相对路径
        md_path: mdPathName || '',  // markdown 路径
        mdhtml: mdhtml || '',
        current_path,   // 当前 html 路径
        describe: desJson ? desJson : {},   // 当前 md 的描述
        BUILD_VERSION,  // 缓存版本号
      }, {
        filename: fromPath
      });

      await FS.outputFile(toPath, html);
      console.log(`  ${'♻️  →'.green} ${path.relative(process.cwd(), toPath)}`);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function markdownToHTML(str) {
  const html = create({
    rewrite: (node) => {
      if (node.type === 'element' && node.properties?.href && /.md/.test(node.properties.href) && !/^(https?:\/\/)/.test(node.properties.href)) {
        let href = node.properties.href;
        node.properties.href = href.replace(/([^\.\/\\]+)\.(md|markdown)/gi, '$1.html');
      }
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties.loading = 'lazy';
      }
    },
    markdown: str, document: undefined, 'dark-mode': false
  });
  return html
    .replace(/class="copied"/g, 'class="copied" style="opacity:1!important;visibility:visible!important;display:flex!important;"')
    .replace(
      /function copied\(target, str\) \{[\s\S]*?target\.classList\.remove\('active'\);[\s\S]*?\}, 2000\);[\s\S]*?\}\);[\s\S]*?\}/,
      `function copied(target, str) {
  target.classList.add('active');
  copyTextToClipboard(str || target.dataset.code, function(success) {
    if (!window._copyToastEl) {
      window._copyToastEl = document.createElement('div');
      window._copyToastEl.id = 'copy-toast';
      document.body.appendChild(window._copyToastEl);
    }
    clearTimeout(window._copyToastTimer);
    window._copyToastEl.textContent = success ? '\\u2713 \\u5df2\\u590d\\u5236\\u5230\\u526a\\u8d34\\u677f' : '\\u2717 \\u590d\\u5236\\u5931\\u8d25\\uff0c\\u8bf7\\u624b\\u52a8\\u590d\\u5236';
    window._copyToastEl.className = success ? 'show success' : 'show error';
    window._copyToastTimer = setTimeout(function() {
      window._copyToastEl.className = '';
    }, 2000);
    setTimeout(function() {
      target.classList.remove('active');
    }, 2000);
  });
}`
    );
}

/**
 * [createStylToCss 生成CSS]
 * @param {String} stylPath stylus path
 */
function createStylToCss(stylPath) {
  return new Promise((resolve, reject) => {
    try {
      const stylStr = FS.readFileSync(stylPath, 'utf8');
      stylus(stylStr.toString())
        .set('filename', stylPath)
        .set('compress', true)
        .render((err, css) => {
          if (err) throw err;
          resolve(`${css}`);
        });
    } catch (err) {
      reject(err);
    }
  });
}
