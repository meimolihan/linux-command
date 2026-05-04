/**
* 对数组进行排序，作为 Array.sort() 回调函数使用
*/
const sortArray = function (a, b) {
  return a.nIdx - b.nIdx;
}
/**
 * 判断 indexOf() 是否捕获到了搜索词
 * @returns {boolean} 是否捕获
 */
function indexOfCatch(a) {
  return a > -1
}
/**
 * HTML转义，防止XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* Toast 提示工具 */
function showToast(message, type) {
  type = type || 'success';
  var toast = document.getElementById('copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'show ' + type;
  setTimeout(function() {
    toast.className = '';
  }, 2000);
}

(function () {
  class Commands {
    query = ''
    query_size = 5 //搜索框结果显示5条
    page_size = 50 //每页显示50条
    $countEl = null // 缓存搜索结果计数元素
    searchDebounceTimer = null // 搜索防抖定时器
    $$$(id) {
      return document.getElementById(id)
    }
    constructor() {
      this.commands = linux_commands || [];
      this.elm_query = this.$$$('query');
      this.elm_btn = this.$$$('search_btn');
      this.elm_result = this.$$$('result');
      this.elm_search_result = this.$$$('search_list_result');

      // 获取根路径
      this.root_path = (function () {
        let elm_path = this.$$$('current_path');
        let url = window.location.origin + window.location.pathname;
        return elm_path ? url.replace(/\/(c\/)?(\w|-)+\.html/, '').replace(/\/$/, '') : '';
      }.call(this));

      this.init();
      this.goToIndex();
    }
    /**
     * 前往主页
     * @memberof Commands
     */
    goToIndex() {
      let elma = document.getElementsByTagName('A');
      for (let i = 0; i < elma.length; i++) {
        if (elma[i].pathname === '/' && !/^https?:/i.test(elma[i].protocol)) {
          elma[i].href = this.root_path + '/';
        }
      }
    }
    /**
     * 绑定事件
     * @param {HTMLElement} element 需要绑定事件的元素
     * @param {string} type 需要绑定的类型
     * @param {Function} callback 事件触发回调
     * @memberof Commands
     */
    bindEvent(element, type, callback) {
      element.addEventListener(type, callback, false);
    }
    isSreachIndexOF(oldstr, kw) {
      if (!oldstr || !kw) return -1;
      return oldstr.toLowerCase().indexOf(kw.toLowerCase());
    }
    //获取URL上面的参数
    getQueryString(name) {
      try {
        const hash = decodeURIComponent(window.location.hash.replace(/^(\#\!|\#)/, ''));
        return new URLSearchParams(hash).get(name);
      } catch {
        return null;
      }
    }
    /**
     * 通过 window.history 设置地址栏的地址
     * @memberof Commands
     */
    pushState() {
      if (window.history && window.history.pushState)
        if (this.query) {
          history.pushState({}, "linux_commands", `#!kw=${this.query}`)
        } else {
          history.pushState({}, "linux_commands", window.location.pathname);
        }
    }
    /**
     * 一个简单的模板函数
     *
     * @param {string} str 传入的 HTML 模板
     * @param {object} obj 一个对象，用于放置在 HTML 模板中
     * @return {string} 经过处理的 HTML 模板
     * @memberof Commands
     */
    simple(str, obj) {
      return str.replace(/\$\w+\$/gi, function (matchs) {
        let returns = obj[matchs.replace(/\$/g, "")];
        return typeof returns === "undefined" ? "" : returns;
      })
    }
    /**创建 keyworlds HTML
     * @param {*} json 根据这段 JSON 生成
     * @param {*} keywolds 关键字
     * @param {*} islist 表示这是否是一个列表
     * @return {*} 返回一个 HTML 字符串
     */
    createKeyworldsHTML(json, keywolds, islist) {
      // 搜索词转义，防止XSS
      const escapedKw = escapeHtml(keywolds);
      const replaceHTML = `<i class="kw">$1</i>`;
      let name = json.n;
      let des = json.d;
      // 直接用原始 keywolds 做匹配（搜索逻辑用），用转义后的做展示
      let reg = new RegExp(`(${keywolds.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "ig");
      if (keywolds) {
        name = escapeHtml(json.n).replace(reg, replaceHTML);
        des = escapeHtml(json.d || '').replace(reg, replaceHTML);
      }
      let rootp = escapeHtml(this.root_path.replace(/\/$/, ''));
      const str = `<a href="${rootp}/c$url$.html" data-type="${json.t || 'command'}"><strong>$name$</strong> - $des$</a>`
      return this.simple(str, {
        name,
        url: json.p,
        des
      });
    }
    /**搜索结果
     * @param  {boolean} islist 是否为列表*/
    searchResult(islist = false) {
      let arr = this.commands
      const self = this
      let page_size = arr.length
      let arrResultHTML = []
      const show_list_count = islist ? this.page_size : this.query_size;
      let nameArr = [], desArr = [];
      if (Array.isArray(arr) && arr.length) {
        for (let i = 0; i < page_size; i++) {
          if (!arr[i]) break;
          const nIdx = self.isSreachIndexOF(arr[i].n, self.query);
          const dIdx = self.isSreachIndexOF(arr[i].d, self.query);
          let json = arr[i];
          if (indexOfCatch(nIdx)) {
            json.nIdx = nIdx;
            nameArr.push(json);
          } else if (indexOfCatch(dIdx)) {
            json.dIdx = dIdx;
            desArr.push(json);
          }
        }
      }
      nameArr.sort(sortArray);
      desArr.sort(sortArray);


      const resultData = nameArr.concat(desArr).slice(0, show_list_count);
      resultData.forEach(a => {
        arrResultHTML.push({
          html: self.createKeyworldsHTML(a, self.query, islist),
          type: a.t || 'command'
        });
      })

      /** @type {HTMLElement} */
      let elm = islist ? this.elm_search_result : this.elm_result;

      const totalMatched = nameArr.length + desArr.length;

      if (islist) {
        const banner = document.getElementById('search_banner');
        const bannerTitle = document.getElementById('search_banner_title');
        const bannerDesc = document.getElementById('search_banner_desc');
        if (banner && bannerTitle && bannerDesc) {
          if (this.query && totalMatched > 0) {
            banner.style.display = 'block';
            bannerTitle.textContent = '搜索结果';
            bannerDesc.innerHTML = '共搜到包含 <span class="search-keyword">' + escapeHtml(this.query) + '</span> 的内容共计 <span class="search-count">' + totalMatched + '</span> 条';
          } else if (this.query && totalMatched === 0) {
            banner.style.display = 'block';
            bannerTitle.textContent = '搜索结果';
            bannerDesc.innerHTML = '未找到包含 <strong>' + escapeHtml(this.query) + '</strong> 的内容';
          } else {
            banner.style.display = 'none';
          }
        }
      } else {
        // 搜索结果数量提示 - 先缓存/移除/重新插入计数元素
        if (!this.$countEl) {
          this.$countEl = document.getElementById('search-result-count');
        }
        if (this.$countEl && this.$countEl.parentNode) {
          this.$countEl.parentNode.removeChild(this.$countEl);
        }

        elm.innerHTML = ''

        if (this.$countEl) {
          if (this.query && totalMatched > 0) {
            this.$countEl.style.display = 'block';
            this.$countEl.innerHTML = '<span class="count-icon"></span>找到 <strong>' + totalMatched + '</strong> 个结果';
          } else {
            this.$countEl.style.display = 'none';
          }
          elm.appendChild(this.$countEl);
        }
      }

      if (islist) {
        elm.innerHTML = '';
      }

      arrResultHTML.forEach((result, i) => {
        const el = document.createElement('li')
        el.innerHTML = result.html
        el.classList.add('slide-item', 'visible')
        // 根据类型添加类名
        if (result.type === 'script') {
          el.classList.add('script-item')
        } else {
          el.classList.add('command-item')
        }
        elm.appendChild(el)
      })
      if (!arrResultHTML.length) {
        const noResultTipHTML = document.createElement("LI");
        const tipSpan = document.createElement("span")
        const nullQueryStringTips = `请尝试输入一些字符，进行搜索！`
        const undefinedQueryTips = `没有搜索到任何内容，请尝试输入其它字符！`
        tipSpan.innerText = this.query ? undefinedQueryTips : nullQueryStringTips
        noResultTipHTML.appendChild(tipSpan);
        elm.appendChild(noResultTipHTML);
      }
    }
    /**
     * 移动搜索结果的光标
     * @param {"up"|"down"} type 触发事件类型
     * @memberof Commands
     */
    selectedResult(type) {
      /** @type {Array} */
      let items = this.elm_result.children;
      let index = 0;
      for (var i = 0; i < items.length; i++) {
        if (items[i].className == 'ok') {
          items[i].className = '';
          if (type == 'up') index = i - 1;
          else index = i + 1;
          break;
        };
      };
      if (items[index]) items[index].className = 'ok';
    }
    // 是否选中搜索结果
    isSelectedResult() {
      let items = this.elm_result.children;
      let isSel = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].className == 'ok') {
          isSel = items[i];
          break;
        };
      };
      return isSel;
    }
    init() {
      /**
       * 设定搜索结果的 CSS display 属性
       *
       * @param {string} [inputDisplay='none']
       */
      function setdisplay(inputDisplay) {
        if (inputDisplay === 'none' || !inputDisplay) {
          self.elm_result.style.opacity = '0';
          self.elm_result.style.pointerEvents = 'none';
          self.elm_result.style.display = 'none';
        } else {
          self.elm_result.style.display = inputDisplay;
          requestAnimationFrame(function() {
            self.elm_result.style.opacity = '1';
            self.elm_result.style.pointerEvents = 'auto';
          });
        }
      }
      let self = this;
      let kw = self.getQueryString('kw');
      this.elm_query.value = kw;
      this.query = kw || '';
      if (this.elm_search_result) self.searchResult(true);
      this.bindEvent(this.elm_query, 'input', function (e) {
        clearTimeout(self.searchDebounceTimer);
        self.searchDebounceTimer = setTimeout(function() {
          self.query = e.target.value;
          self.pushState()
          if (self.query) {
            self.searchResult();
          } else {
            setdisplay()
          }
          if (!self.elm_search_result) {
            setdisplay(self.query ? 'block' : 'none')
          } else {
            self.elm_btn.click();
          }
        }, 150);
      })
      this.bindEvent(this.elm_btn, 'click', function (e) {
        setdisplay('none');
        const searchKeyword = self.elm_query.value.trim();
        if (self.elm_search_result) {
          self.query = searchKeyword;
          self.searchResult(true);
        } else {
          window.location.href = self.root_path + '/list.html#!kw=' + encodeURIComponent(searchKeyword);
        }
      })
      // 输入Enter键
      this.bindEvent(document, 'keyup', function (e) {
        if (e.key === 'ArrowDown') self.selectedResult("down");
        if (e.key === 'ArrowUp') self.selectedResult("up");
        if (e.key === 'Enter') {
          let item = self.isSelectedResult();
          if (!item) return self.elm_btn.click();
          setdisplay('none');
          if (item.children[0]) item.children[0].click();
        }
        // Esc 清空搜索
        if (e.key === 'Escape') {
          self.elm_query.value = '';
          self.query = '';
          setdisplay('none');
          history.pushState({}, "linux_commands", window.location.pathname);
          if (self.elm_search_result) {
            self.elm_search_result.innerHTML = '';
          }
        }
      })
      // ① 搜索框聚焦/失焦 - 显示/隐藏快捷键提示
      var shortcutsEl = document.getElementById('search-shortcuts');
      if (shortcutsEl && this.elm_query) {
        this.bindEvent(this.elm_query, 'focus', function () {
          shortcutsEl.classList.add('visible');
        });
        this.bindEvent(this.elm_query, 'blur', function () {
          // 延迟隐藏，防止点击快捷键区域时先触发失焦
          setTimeout(function () {
            shortcutsEl.classList.remove('visible');
          }, 200);
        });
        // 有搜索词时也保持显示
        this.bindEvent(this.elm_query, 'input', function () {
          if (self.elm_query.value) {
            shortcutsEl.classList.add('visible');
          }
        });
      }
      if (kw) self.searchResult();
    }
  }
  new Commands()
})();

(function() {
  var btn = document.createElement('div');
  btn.id = 'back-to-top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>';
  btn.style.cssText = 'position:fixed;right:80px;bottom:80px;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:99998;opacity:0;pointer-events:none;transform:translateY(20px);transition:all 0.35s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(135deg,#58a6ff 0%,#79c0ff 100%);color:#fff;box-shadow:0 4px 15px rgba(88,166,255,0.4);border:none;';
  document.body.appendChild(btn);

  function updateColor() {
    var isDark = document.documentElement.dataset.colorMode === 'dark';
    if (isDark) {
      btn.style.background = 'linear-gradient(135deg, #58a6ff 0%, #79c0ff 100%)';
      btn.style.boxShadow = '0 4px 15px rgba(88,166,255,0.4)';
    } else {
      btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    }
    btn.style.color = '#fff';
  }

  updateColor();

  var observer = new MutationObserver(updateColor);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color-mode'] });

  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        if (window.scrollY > 200) {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.style.transform = 'translateY(0)';
        } else {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
          btn.style.transform = 'translateY(20px)';
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(function() {
  var lists = document.querySelectorAll('.search_list li, .hotlist li');
  lists.forEach(function(item) {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)';
  });

  var ticking = false;
  function handleSlideIn() {
    var windowHeight = window.innerHeight;
    lists.forEach(function(item) {
      if (item.dataset.visible === 'true') return;
      var rect = item.getBoundingClientRect();
      if (rect.top < windowHeight - 30) {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.dataset.visible = 'true';
      }
    });
    ticking = false;
  }

  handleSlideIn();
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(handleSlideIn);
      ticking = true;
    }
  }, { passive: true });
})();

/* 图片点击预览 */
(function() {
  var overlay = document.createElement('div');
  overlay.id = 'img-preview-overlay';
  overlay.innerHTML = '<img src="" alt="preview">';
  document.body.appendChild(overlay);

  var overlayImg = overlay.querySelector('img');
  var isActive = false;

  overlay.addEventListener('click', function() {
    overlay.classList.remove('active');
    isActive = false;
  });

  document.querySelectorAll('.markdown-body img').forEach(function(img) {
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      overlayImg.src = this.src;
      overlay.classList.add('active');
      isActive = true;
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isActive) {
      overlay.classList.remove('active');
      isActive = false;
    }
  });
})();

/* 搜索框占位符打字机轮播效果 */
(function() {
  var input = document.getElementById('query');
  if (!input) return;
  var placeholders = [
    '输入命令名称，如 ls, cd, grep...',
    '输入命令描述，如 查找文件, 压缩...',
    '试试搜索 cp, mv, chmod...',
    '搜索你需要的 Linux 命令...'
  ];
  var idx = 0;
  var charIdx = 0;
  var isUserTyping = false;
  var isTyping = false;
  var typeSpeed = 80;
  var deleteSpeed = 40;
  var pauseTime = 2000;

  function typeChar() {
    if (isUserTyping) return;
    var current = placeholders[idx];
    if (!isTyping) {
      // 删除模式
      if (charIdx > 0) {
        charIdx--;
        input.setAttribute('placeholder', current.substring(0, charIdx));
        setTimeout(typeChar, deleteSpeed);
      } else {
        // 切换到下一个
        idx = (idx + 1) % placeholders.length;
        isTyping = true;
        setTimeout(typeChar, 300);
      }
    } else {
      // 打字模式
      if (charIdx < placeholders[idx].length) {
        charIdx++;
        input.setAttribute('placeholder', placeholders[idx].substring(0, charIdx));
        setTimeout(typeChar, typeSpeed);
      } else {
        // 打字完成，暂停
        isTyping = false;
        setTimeout(typeChar, pauseTime);
      }
    }
  }

  input.addEventListener('focus', function() {
    isUserTyping = true;
  });

  input.addEventListener('blur', function() {
    isUserTyping = false;
    if (!input.value) {
      // 重新开始打字动画
      charIdx = 0;
      isTyping = true;
      typeChar();
    }
  });

  input.addEventListener('input', function() {
    isUserTyping = input.value.length > 0;
  });

  // 初始延迟开始
  setTimeout(typeChar, 1000);
})();

/* 统计数字滚动动画 */
(function() {
  function animateNumber(el, target, duration) {
    duration = duration || 800;
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
        el.classList.add('count-animate');
        setTimeout(function() {
          el.classList.remove('count-animate');
        }, 400);
      }
    }
    requestAnimationFrame(step);
  }

  var statItems = document.querySelectorAll('.stat-item, .footer-count');
  if (statItems.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var text = el.textContent.trim();
        var num = parseInt(text, 10);
        if (!isNaN(num) && num > 0 && !el.dataset.animated) {
          el.dataset.animated = 'true';
          el.textContent = '0';
          animateNumber(el, num, 1000);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statItems.forEach(function(item) {
    observer.observe(item);
  });
})();

/* Skeleton 加载骨架屏 */
(function() {
  var style = document.createElement('style');
  style.textContent = `
    .skeleton {
      background: linear-gradient(90deg, rgba(102,126,234,0.06) 25%, rgba(102,126,234,0.12) 50%, rgba(102,126,234,0.06) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: 4px;
    }
    .skeleton-text {
      height: 16px;
      margin-bottom: 8px;
    }
    .skeleton-title {
      height: 24px;
      width: 60%;
      margin-bottom: 16px;
    }
    .skeleton-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
    .skeleton-card {
      height: 80px;
      margin-bottom: 12px;
      border-radius: 10px;
    }
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    [data-color-mode="dark"] .skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 200% 100%;
    }
  `;
  document.head.appendChild(style);

  function hideSkeleton() {
    var skeletons = document.querySelectorAll('.skeleton, .skeleton-card');
    skeletons.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.98)';
      setTimeout(function() {
        el.remove();
      }, 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(hideSkeleton, 500);
    });
  } else {
    setTimeout(hideSkeleton, 500);
  }
})();

/* 滚动进度条 */
(function() {
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', function() {
    requestAnimationFrame(updateProgress);
  }, { passive: true });

  updateProgress();
})();

/* 代码块超过20行自动折叠 */
var initCodeBlockCollapse = function() {
  var MAX_LINES = 20;
  var codeBlocks = document.querySelectorAll('pre[class*="language-"], markdown-style pre');

  codeBlocks.forEach(function(pre) {
    var lines = pre.querySelectorAll('.code-line, .line-number');
    if (lines.length <= MAX_LINES) return;
    if (pre.closest('.code-block-wrapper')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    pre.classList.add('collapsible-code');
    pre.setAttribute('data-total-lines', lines.length);

    var expandBtn = document.createElement('div');
    expandBtn.className = 'code-expand-btn';
    expandBtn.innerHTML = '<div class="expand-icon-wrapper"><svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 12 15 20 7"></polyline><polyline points="4 13 12 21 20 13"></polyline></svg></div>';
    expandBtn.setAttribute('title', '展开代码');

    pre.appendChild(expandBtn);

    expandBtn.addEventListener('click', function() {
      if (pre.classList.contains('collapsed')) {
        pre.classList.remove('collapsed');
        expandBtn.classList.add('expanded');
        expandBtn.setAttribute('title', '收起代码');
      } else {
        pre.classList.add('collapsed');
        expandBtn.classList.remove('expanded');
        expandBtn.setAttribute('title', '展开代码');
      }
    });

    pre.classList.add('collapsed');
  });
};

initCodeBlockCollapse();

// 监听 DOM 变化，处理动态加载的内容
if (window.MutationObserver) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        initCodeBlockCollapse();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/* 页面切换加载动画 */
(function() {
  // 页面加载时添加动画类
  document.body.classList.add('page-transition');

  // 为所有内部链接添加过渡效果
  var links = document.querySelectorAll('a[href*=".html"]');
  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      // 跳过外部链接和锚点链接
      if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0 || this.target === '_blank') {
        return;
      }

      // 添加淡出效果
      document.body.style.opacity = '0.6';
      document.body.style.transition = 'opacity 0.15s ease';
    });
  });

  // 页面显示时恢复
  window.addEventListener('pageshow', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease';
  });
})();

/* ⑯ 骨架屏 - 页面加载时短暂显示，真实内容就绪后淡出 */
(function() {
  var skeleton = document.getElementById('page-skeleton');
  if (!skeleton) return;
  var parent = skeleton.parentNode;
  if (!parent) return;

  // 短暂显示骨架屏（页面 JS 执行完毕后约 300ms 隐藏）
  var hideTimer = setTimeout(function() {
    skeleton.style.display = 'none';
  }, 400);

  // 监听内容区是否有真实数据（通过检查 li 是否出现）
  function checkContent() {
    var realItems = parent.querySelectorAll('.hotlist li, .command-list li, .script-list li, .search_list li');
    if (realItems.length > 0) {
      clearTimeout(hideTimer);
      skeleton.style.display = 'none';
    }
  }

  // 立即检查一次
  checkContent();
  // 再检查一次（异步渲染情况）
  setTimeout(checkContent, 100);
})();

/* ③ 代码块底部"点击复制"提示 */
(function() {
  function addHints() {
    var preBlocks = document.querySelectorAll('.markdown-body pre, pre[class*="language-"]');
    preBlocks.forEach(function(pre) {
      // 避免重复添加
      if (pre._hintAdded) return;
      pre._hintAdded = true;

      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;';

      var parent = pre.parentNode;
      if (parent.classList && parent.classList.contains('code-block-wrapper')) {
        // 已有 wrapper 的情况，直接在 pre 后面加 hint
      } else {
        parent.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }

      var hint = document.createElement('div');
      hint.className = 'code-copy-hint';
      hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>点击复制代码';

      wrapper.appendChild(hint);
    });
  }

  addHints();

  // 动态内容
  if (window.MutationObserver) {
    var obs = new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        if (m.addedNodes.length) addHints();
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
})();

/* ⑥ 分类标题滚动入场动画 */
(function() {
  var titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;

  // 为每个标题单独观察
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  titles.forEach(function(title, i) {
    // 错开动画延迟
    title.style.transitionDelay = (i * 0.08) + 's';
    observer.observe(title);
  });

  // 初始可见的直接显示
  titles.forEach(function(title, idx) {
    var rect = title.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(function() {
        title.classList.add('visible');
      }, idx * 80);
    }
  });
})();

/* ⑨ 搜索历史记录（localStorage） */
(function() {
  var KEY = 'linux_cmd_history';
  var MAX_HISTORY = 8;
  var input = document.getElementById('query');
  if (!input) return;

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch(e) { return []; }
  }

  function saveHistory(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX_HISTORY)));
    } catch(e) {}
  }

  function addHistory(kw) {
    if (!kw || kw.length < 2) return;
    var arr = getHistory().filter(function(v) { return v !== kw; });
    arr.unshift(kw);
    saveHistory(arr);
  }

  // 搜索时记录
  var btn = document.getElementById('search_btn');
  if (btn) {
    btn.addEventListener('click', function() {
      addHistory(input.value.trim());
    });
  }

  // 聚焦搜索框时显示历史提示
  var shortcutsEl = document.getElementById('search-shortcuts');
  input.addEventListener('focus', function() {
    var hist = getHistory();
    if (hist.length > 0 && shortcutsEl) {
      // 动态追加历史快捷键
      var histEl = document.getElementById('search-history-hint');
      if (!histEl) {
        histEl = document.createElement('span');
        histEl.id = 'search-history-hint';
        histEl.className = 'shortcut-key';
        histEl.style.cssText = 'margin-left:4px;cursor:pointer;font-size:11px;';
        histEl.title = '点击可查看历史搜索';
        shortcutsEl.appendChild(histEl);
      }
      histEl.innerHTML = '<span class="key" style="background:rgba(102,126,234,0.08);color:#667eea;">历史</span> ' + hist.slice(0,3).join(' ');
    }
  });
})();
