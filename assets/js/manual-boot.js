/**
 * 手动册共享 Docsify 配置 + 自定义插件
 * ------------------------------------------------------------------
 * 每个手册目录的 index.html 只需先设置 window.__MANUAL__（id / name / homepage / access），
 * 再引入本文件；本文件在 docsify.min.js 之前执行，负责拼出 window.$docsify 并注册插件。
 *
 * 加载顺序（手册 index.html 内）：
 *   <script src="../../assets/js/gate.js"></script>
 *   <script>window.__MANUAL__ = { id, name, homepage, access };</script>
 *   <script src="../../assets/js/manual-boot.js"></script>
 *   <script src="../../assets/libs/docsify.min.js"></script>
 *   ... 其余 libs ...
 */
(function () {
  var cfg = window.__MANUAL__ || {};
  var name = cfg.name || 'Madong 手册';
  var homepage = cfg.homepage || 'README.md';

  // GitHub Pages 部署在子路径（如 /madong-manulas/）下，内部整页跳转需带基址，
  // 否则 /manuals/...、/ 会跳到域名根导致 404。这里按当前路径推导基址。
  var BASE = (location.pathname.replace(/\/manuals\/.*$/, '') || '');
  function withBase(u) { return u.charAt(0) === '/' ? BASE + u : u; }

  // ---- Docsify 官方推荐配置 ----
  window.$docsify = {
    name: name,
    repo: '',
    loadSidebar: '_sidebar.md',
    loadNavbar: '_navbar.md',
    coverpage: false,            // 手册内不自动展示封面，避免遮挡 README
    homepage: homepage,
    relativePath: false,
    subMaxLevel: 0,              // 0 = 左侧菜单完全由 _sidebar.md 控制
    auto2top: true,
    maxLevel: 4,

    // 正文标题不包 <a> 锚点链接
    markdown: {
      renderer: {
        heading: function (text, level) {
          return '<h' + level + '>' + text + '</h' + level + '>';
        }
      }
    },

    // ---- 搜索（每册独立实例，范围仅本册）----
    search: {
      maxAge: 86400000,
      paths: 'auto',
      placeholder: '搜索本册…',
      noData: '找不到结果',
      depth: 3
    },

    // ---- 字数统计 ----
    count: {
      countable: true,
      fontsize: '0.8em',
      color: 'rgb(90,90,90)',
      language: 'chinese'
    },

    plugins: [
      // 禁用 Prism autoloader（离线必需）
      function (hook) {
        hook.init(function () {
          if (window.Prism && Prism.plugins && Prism.plugins.autoloader) {
            Prism.plugins.autoloader.loadLanguages = function () {};
          }
        });
      },

      // 禁用 .md 请求的浏览器缓存，开发时每次拿到最新内容
      function (hook) {
        hook.init(function () {
          if (!window.fetch || window.__docsFetchPatched) return;
          window.__docsFetchPatched = true;
          var origFetch = window.fetch;
          window.fetch = function (input, init) {
            var url = typeof input === 'string' ? input : (input && input.url) || '';
            if (/\.md(\?|#|$)/.test(url)) {
              // 追加时间戳参数，绕过浏览器/代理对 .md 的缓存（静态服务器按路径返回原文件，忽略 query）
              if (typeof input === 'string' && url.indexOf('_t=') === -1) {
                input = url + (url.indexOf('?') === -1 ? '?' : '&') + '_t=' + Date.now();
              }
              init = Object.assign({}, init || {}, {
                cache: 'no-store',
                headers: Object.assign({}, (init && init.headers) || {}, {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache'
                })
              });
            }
            return origFetch.call(this, input, init);
          };
        });
      },

      // 左侧菜单「默认收起 + 点击展开」
      function (hook) {
        function setupSidebar() {
          var nav = document.querySelector('.sidebar .sidebar-nav') || document.querySelector('.sidebar ul');
          if (!nav) return;

          var uls = nav.querySelectorAll('ul ul');
          uls.forEach(function (ul) { ul.classList.add('app-sub-sidebar'); });

          var currentHash = location.hash.replace(/^#\//, '').replace(/\.md$/, '');
          var activeLinks = nav.querySelectorAll('a');
          var matchedLinks = [];
          activeLinks.forEach(function (a) {
            var href = (a.getAttribute('href') || '').replace(/^#\//, '').replace(/\.md$/, '');
            if (href && href === currentHash) matchedLinks.push(a);
          });

          var expandSet = new Set();
          matchedLinks.forEach(function (link) {
            var node = link;
            while (node && node !== nav) {
              if (node.tagName === 'LI') expandSet.add(node);
              node = node.parentElement;
            }
          });

          var lis = nav.querySelectorAll('li');
          lis.forEach(function (li) {
            var hasSub = false;
            for (var i = 0; i < li.children.length; i++) {
              if (li.children[i].tagName === 'UL') { hasSub = true; break; }
            }
            if (hasSub) {
              li.classList.add('collapsible');
              if (!expandSet.has(li)) li.classList.add('collapse');
              else li.classList.remove('collapse');
            }
          });

          lis.forEach(function (li) {
            if (!li.classList.contains('collapsible')) return;
            var titleEl = li.querySelector(':scope > p, :scope > a');
            if (titleEl && !titleEl.__collapseBound) {
              titleEl.__collapseBound = true;
              titleEl.style.cursor = 'pointer';
              titleEl.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                li.classList.toggle('collapse');
              });
            }
          });
        }
        hook.doneEach(function () {
          requestAnimationFrame(function () { requestAnimationFrame(setupSidebar); });
        });
      },

      // 右侧 TOC 目录：树形层级（h2 为分组、h3 为其子项），悬浮/点击展开 + 滚动高亮
      function (hook) {
        var toc = null;
        function build() {
          var content = document.querySelector('.markdown-section');
          if (!toc) {
            toc = document.createElement('nav');
            toc.id = 'docs-toc';
            toc.setAttribute('aria-label', '本页目录');
            document.body.appendChild(toc);
          }
          if (!content) { toc.innerHTML = ''; toc.style.display = 'none'; return; }
          var heads = Array.prototype.slice.call(content.querySelectorAll('h2, h3'));
          if (heads.length < 2) { toc.innerHTML = ''; toc.style.display = 'none'; return; }
          toc.style.display = '';
          // 为每个标题补 id，并构建 h2 -> [h3] 树
          var tree = [];
          var cur = null;
          heads.forEach(function (h, i) {
            if (!h.id) h.id = 'toc-' + i + '-' + (h.textContent || '').slice(0, 16)
              .replace(/\s+/g, '-');
            var tag = h.tagName.toLowerCase();
            if (tag === 'h2') {
              cur = { tag: 'h2', id: h.id, text: h.textContent, children: [] };
              tree.push(cur);
            } else {
              if (!cur) tree.push({ tag: 'h3', id: h.id, text: h.textContent, children: null });
              else cur.children.push({ tag: 'h3', id: h.id, text: h.textContent });
            }
          });
          var html = '<div class="docs-toc__title">本页目录</div>';
          tree.forEach(function (n) {
            if (n.tag === 'h2') {
              if (n.children.length) {
                html += '<div class="docs-toc__group">'
                  + '<a class="docs-toc__link lvl-2 docs-toc__parent" href="javascript:void(0)" data-target="' + n.id + '">'
                  + '<span class="docs-toc__caret"></span>' + n.text + '</a>'
                  + '<div class="docs-toc__children">';
                n.children.forEach(function (c) {
                  html += '<a class="docs-toc__link lvl-3" href="javascript:void(0)" data-target="' + c.id + '">' + c.text + '</a>';
                });
                html += '</div></div>';
              } else {
                html += '<a class="docs-toc__link lvl-2" href="javascript:void(0)" data-target="' + n.id + '">' + n.text + '</a>';
              }
            } else {
              html += '<a class="docs-toc__link lvl-3" href="javascript:void(0)" data-target="' + n.id + '">' + n.text + '</a>';
            }
          });
          toc.innerHTML = html;
          toc.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function (e) {
              var el = document.getElementById(a.getAttribute('data-target'));
              if (el) {
                var y = el.getBoundingClientRect().top + window.pageYOffset - 64;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
              // 点击父级（h2）切换固定展开，方便对照其子项
              if (a.classList.contains('docs-toc__parent')) {
                e.preventDefault();
                var g = a.closest('.docs-toc__group');
                if (g) g.classList.toggle('pinned');
              }
            });
          });
        }
        function spy() {
          if (!toc || toc.style.display === 'none') return;
          var heads = document.querySelectorAll('.markdown-section h2, .markdown-section h3');
          var cur = null;
          heads.forEach(function (h) {
            if (h.getBoundingClientRect().top <= 100) cur = h.id;
          });
          // 高亮当前项
          toc.querySelectorAll('.docs-toc__link').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-target') === cur);
          });
          // 当前若停在某个 h3，自动展开其所属分组，确保高亮项可见
          var active = toc.querySelector('.docs-toc__link.active');
          toc.querySelectorAll('.docs-toc__group').forEach(function (g) { g.classList.remove('expanded'); });
          if (active && active.classList.contains('lvl-3')) {
            var g = active.closest('.docs-toc__group');
            if (g) g.classList.add('expanded');
          }
        }
        hook.doneEach(function () { requestAnimationFrame(build); });
        hook.mounted(function () {
          window.addEventListener('scroll', function () { requestAnimationFrame(spy); }, { passive: true });
          spy();
        });
      },

      // 共用 navbar：在 Docsify .app-nav 里注入「文档 ▾」二级菜单，用于切换手册 / 回首页
      function (hook) {
        var SHARED_NAV = [
          { name: '文档中心', url: '/' },
          { name: '标准版手册', url: '/manuals/standard/' },
          { name: 'SaaS 多租户版', url: '/manuals/saas/' },
          { name: '工作流引擎', url: '/manuals/workflow/', soon: true }
        ];
        hook.doneEach(function () {
          var nav = document.querySelector('.app-nav > ul');
          if (!nav || document.getElementById('shared-docs-menu')) return;
          var current = window.__MANUAL__ && window.__MANUAL__.id || '';
          var items = SHARED_NAV.map(function (n) {
            var active = (current && n.url.indexOf('/manuals/' + current + '/') !== -1) ||
              (!current && n.url === '/');
            var label = n.name + (n.soon ? '（规划中）' : '');
            return '<a class="shared-docs-menu__item' + (active ? ' active' : '') +
              (n.soon ? ' soon' : '') + '" href="' + withBase(n.url) + '" data-full>' +
              (n.soon ? '🚧 ' : '') + label + '</a>';
          }).join('');

          var li = document.createElement('li');
          li.id = 'shared-docs-menu';
          li.className = 'shared-docs-menu';
          li.innerHTML = '<a class="shared-docs-menu__toggle" href="' + withBase('/') + '" data-full>文档中心 ▾</a>' +
            '<div class="shared-docs-menu__panel">' + items + '</div>';
          nav.insertBefore(li, nav.firstChild);

          // 点击带 data-full 的链接触发整页跳转（文档中心 / 切换手册）
          li.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[data-full]');
            if (!a) return;
            e.preventDefault();
            e.stopPropagation();
            window.location.href = a.getAttribute('href');
          });

          // 鼠标移入展开，移出收起
          li.addEventListener('mouseenter', function () { li.classList.add('open'); });
          li.addEventListener('mouseleave', function () { li.classList.remove('open'); });

          document.addEventListener('click', function () { li.classList.remove('open'); });
        });
      },

      // 正文底部注入版权页脚（含仓库链接 / 文档中心）
      function (hook) {
        // 惰性创建，避免依赖 mounted（Docsify 生命周期中 doneEach 先于 mounted 执行，
        // 若等 mounted 再创建，首页首次渲染会错过挂载时机）。
        function ensureFooter() {
          var existing = document.getElementById('docs-footer');
          if (existing) return existing;
          var f = document.createElement('footer');
          f.id = 'docs-footer';
          f.className = 'docs-footer'; // 必须带样式类，否则无 CSS 生效
          f.innerHTML =
            '<span>© 2026 Madong 极速开发框架 · 文档由 Docsify 驱动</span>' +
            '<span class="docs-footer__links">' +
            '<a href="' + withBase('/') + '">文档中心</a>' +
            '<a href="https://github.com/madong" target="_blank" rel="noopener">GitHub</a>' +
            '<a href="https://gitee.com/madong" target="_blank" rel="noopener">Gitee</a>' +
            '<a href="https://gitcode.com/madong" target="_blank" rel="noopener">GitCode</a>' +
            '</span>';
          return f;
        }
        hook.doneEach(function () {
          var f = ensureFooter();
          var content = document.querySelector('.content');
          if (content && !document.getElementById('docs-footer')) {
            content.appendChild(f);
          }
        });
      },

      // 增强：返回顶部 / 代码复制 / 图片灯箱（离线，无外部依赖）
      function (hook) {
        hook.doneEach(function () {
          // 返回顶部
          var bt = document.getElementById('docs-backtop');
          if (!bt) {
            bt = document.createElement('button');
            bt.id = 'docs-backtop';
            bt.innerHTML = '↑';
            bt.title = '返回顶部';
            document.body.appendChild(bt);
            bt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
            window.addEventListener('scroll', function () {
              if (window.scrollY > 400) bt.classList.add('show'); else bt.classList.remove('show');
            }, { passive: true });
          }
          // 代码复制
          document.querySelectorAll('.markdown-section pre').forEach(function (pre) {
            if (pre.querySelector('.docs-copy')) return;
            var btn = document.createElement('button');
            btn.className = 'docs-copy';
            btn.type = 'button';
            btn.textContent = '复制';
            btn.addEventListener('click', function (e) {
              e.stopPropagation();
              var code = pre.querySelector('code');
              if (code && navigator.clipboard) {
                navigator.clipboard.writeText(code.innerText).then(function () {
                  btn.textContent = '已复制';
                  setTimeout(function () { btn.textContent = '复制'; }, 1500);
                });
              }
            });
            pre.style.position = 'relative';
            pre.appendChild(btn);
          });
          // 图片灯箱
          document.querySelectorAll('.markdown-section img').forEach(function (img) {
            if (img.__zoomBound) return;
            img.__zoomBound = true;
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function () {
              var ov = document.createElement('div');
              ov.className = 'docs-lightbox';
              ov.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="" />';
              ov.addEventListener('click', function () { ov.remove(); });
              document.body.appendChild(ov);
            });
          });
        });
      }
    ]
  };

  // 密钥门禁（多策略 / 文档级）：作为 Docsify 插件逐一文档判定所需密钥策略。
  // 仅当存在 window.__MANUAL__（手册页）且门禁已启用时挂载。
  if (window.DocsifyGate && DocsifyGate.enabled && DocsifyGate.makePlugin && window.__MANUAL__) {
    window.$docsify.plugins.push(DocsifyGate.makePlugin());
  }
})();
