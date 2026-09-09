/**
 * 文档门禁（纯前端弱校验 · 多策略 / 文档级）
 * ------------------------------------------------------------------
 * 说明：GitHub Pages 是纯静态、无服务端，密钥只在浏览器校验（防君子不防小人）。
 * 校验方式：SHA-256(salt + 输入) 与预置 hash 比对，通过后把「解锁时间戳」写入
 * localStorage，并在 ttlDays 内免重复输入。
 *
 * 门禁从「整站单密钥」升级为「多手册 / 文档级」：
 *   - 每个手册可在 index.html 的 window.__MANUAL__.access 配置自己的密钥策略；
 *   - 手册内可「排除」某些文档（设为 public 免密），其余走密钥模式；
 *   - 单个文档可指定「独立密钥」（rules 里 access:'protected' 且 keyId 指向自定义策略）。
 *
 * 如何修改 / 新增密钥：
 *   1) 改对应策略的 salt（可选）与 hash；
 *   2) 在浏览器控制台执行  await DocsifyGate.compute('你的新密钥')  得到默认盐的 hash；
 *      若自定义了 salt，用  await DocsifyGate.compute('你的新密钥', '你的salt')；
 *   3) 把返回值填回对应策略的 hash；提交即可。
 *   也可以在本地用 PowerShell：
 *     $s='madong-docs你的新密钥'; (Get-FileHash -Algorithm SHA256 -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($s)))).Hash
 */
window.DocsifyGate = {
  enabled: true,

  // —— 默认（站点级）密钥策略：向后兼容，单独调用 bind('protected') 时使用 ——
  salt: 'madong-docs',
  hash: 'ccfbd727fd6330febbf171c61290af25c34addca37fd2e9f8ac153dd5c308f2d',
  ttlDays: 30,
  storageKey: 'madong.docs.gate',
  title: 'Madong 文档中心',
  tip: '请输入访问密钥后继续',
  defaultAccess: 'protected',

  // —— 多策略注册表：id -> { salt, hash, ttlDays, storageKey, title, tip } ——
  // 门户与手册共用 default；各手册可在 index.html 通过 access.policies 注册独立密钥。
  policies: {},

  // 当前手册的访问配置（由 bind() 写入）
  _manual: null,
  _overlay: null,
  _activeKey: null,

  // 计算 sha256(salt + input)，返回 hex
  compute: function (input, salt) {
    var s = (salt === undefined ? this.salt : salt) || '';
    var data = s + (input || '');
    var bytes = new TextEncoder().encode(data);
    if (window.crypto && window.crypto.subtle) {
      return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
      });
    }
    return Promise.reject(new Error('Web Crypto 不可用'));
  },

  // 取某个策略的配置（缺省回落 default）
  _policy: function (id) {
    if (!id || id === 'default') {
      return {
        salt: this.salt, hash: this.hash, key: this.key, ttlDays: this.ttlDays,
        storageKey: this.storageKey, title: this.title, tip: this.tip
      };
    }
    var p = this.policies[id];
    if (!p) return this._policy('default');
    return {
      salt: p.salt !== undefined ? p.salt : this.salt,
      hash: p.hash !== undefined ? p.hash : this.hash,
      key: p.key,
      ttlDays: p.ttlDays !== undefined ? p.ttlDays : this.ttlDays,
      storageKey: p.storageKey || ('madong.docs.gate.' + id),
      title: p.title || this.title,
      tip: p.tip || this.tip
    };
  },

  isUnlocked: function (id) {
    var p = this._policy(id);
    try {
      var raw = localStorage.getItem(p.storageKey);
      if (!raw) return false;
      var rec = JSON.parse(raw);
      if (!rec.t || typeof rec.t !== 'number') return false;
      var ttl = (p.ttlDays || 0) * 24 * 3600 * 1000;
      return Date.now() - rec.t < ttl;
    } catch (e) {
      return false;
    }
  },

  unlock: function (id) {
    var p = this._policy(id);
    try {
      localStorage.setItem(p.storageKey, JSON.stringify({ t: Date.now() }));
    } catch (e) {}
    this._hide();
    // 解锁后重载当前路由，让被拦截的正文重新加载
    this._reload();
  },

  _reload: function () {
    // 简单可靠：整页重载，门禁状态已写入 localStorage，重载后对应文档直接放行
    if (window.location.reload) window.location.reload();
  },

  // —— 门禁遮罩 ——
  _render: function (keyId) {
    var self = this;
    var p = this._policy(keyId);
    if (this._overlay && this._activeKey === keyId) {
      var inp = this._overlay.querySelector('.docs-gate__input');
      if (inp) setTimeout(function () { inp.focus(); }, 30);
      return;
    }
    this._hide();
    this._activeKey = keyId;

    var ov = document.createElement('div');
    ov.className = 'docs-gate';
    ov.innerHTML =
      '<div class="docs-gate__card">' +
      '  <div class="docs-gate__brand">' + (p.title || '文档中心') + '</div>' +
      '  <div class="docs-gate__tip">' + (p.tip || '请输入访问密钥') + '</div>' +
      '  <input class="docs-gate__input" type="password" placeholder="访问密钥" autocomplete="off" />' +
      '  <button class="docs-gate__btn" type="button">进入</button>' +
      '  <div class="docs-gate__err"></div>' +
      '  <div class="docs-gate__note">密钥仅在前端校验，用于避免误入；请勿在公开站点放置敏感内容。</div>' +
      '</div>';
    document.body.appendChild(ov);
    this._overlay = ov;

    var input = ov.querySelector('.docs-gate__input');
    var btn = ov.querySelector('.docs-gate__btn');
    var err = ov.querySelector('.docs-gate__err');
    setTimeout(function () { input.focus(); }, 50);

    function submit() {
      var val = input.value;
      if (!val) { self._shake(err, '请输入密钥'); return; }
      var pol = self._policy(self._activeKey);
      // 明文密钥模式：直接比对（类似语雀文档分享密码，便于随时改值）
      if (pol.key !== undefined && pol.key !== '') {
        if (val === pol.key) {
          self.unlock(self._activeKey);
        } else {
          self._shake(err, '密钥错误，请重试');
        }
        return;
      }
      // 哈希模式：SHA-256(salt + 输入) 比对
      self.compute(val, pol.salt).then(function (h) {
        if (h === pol.hash) {
          self.unlock(self._activeKey);
        } else {
          self._shake(err, '密钥错误，请重试');
        }
      }).catch(function () { self._shake(err, '校验失败，请重试'); });
    }
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  },

  _show: function () { this._render('default'); },
  // 手册渲染期按文档所需策略弹对应密钥遮罩
  _showFor: function (keyId) { this._render(keyId); },

  _hide: function () {
    if (this._overlay) { this._overlay.remove(); this._overlay = null; this._activeKey = null; }
  },

  _shake: function (errEl, msg) {
    if (errEl) errEl.textContent = msg;
    var card = this._overlay && this._overlay.querySelector('.docs-gate__card');
    if (card) {
      card.classList.remove('is-shake');
      void card.offsetWidth;
      card.classList.add('is-shake');
    }
  },

  // —— 绑定：由手册入口调用 ——
  // 新版：window.__MANUAL__.access 为对象时，按手册 / 文档级策略判定（交给 docsify 插件）。
  // 旧版：传入 'public' 免密钥；'protected' 弹整页遮罩（门户场景）。
  bind: function (access) {
    if (!this.enabled) return;
    var m = window.__MANUAL__ || {};
    var cfg = (typeof m.access === 'object') ? m.access : (access || this.defaultAccess);
    this._manual = { access: cfg, homepage: m.homepage };

    // 合并手册自带策略（access.policies）
    if (typeof cfg === 'object' && cfg.policies) {
      var self = this;
      Object.keys(cfg.policies).forEach(function (k) {
        var p = cfg.policies[k] || {};
        self.policies[k] = {
          salt: p.salt !== undefined ? p.salt : self.salt,
          hash: p.hash !== undefined ? p.hash : self.hash,
          key: p.key,
          ttlDays: p.ttlDays !== undefined ? p.ttlDays : self.ttlDays,
          storageKey: p.storageKey || ('madong.docs.gate.' + k),
          title: p.title || self.title,
          tip: p.tip || self.tip
        };
      });
    }

    // 手册页：交给 docsify 插件在渲染期逐文档判定，不在此弹整页遮罩（避免重复）
    if (m && m.id) return;

    // 门户等无 __MANUAL__ 的场景：保持旧整页遮罩行为
    if (cfg === 'public') return;
    if (typeof cfg === 'object' && cfg.default === 'public') return;
    if (this.isUnlocked()) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this._show.bind(this));
    } else {
      this._show();
    }
  },

  // —— 文档级路径匹配（支持 * 与 **）——
  // 例：'guide/intro/**' 匹配 guide/intro/ 下任意深度；'*.md' 匹配根目录任意 md
  _match: function (pattern, path) {
    if (!pattern) return false;
    var p = String(pattern).replace(/\.md$/, '');
    // 转义正则元字符（保留 * 供后续替换）
    var esc = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    // 先处理 **（任意深度，含跨目录），再处理 *（单层），用占位符避免互相污染
    esc = esc
      .split('**').join('\u0002')   // ** -> 任意（含跨目录）
      .split('*').join('\u0003');   // *  -> 单层
    var rx = '^' + esc
      .split('\u0002').join('.*')
      .split('\u0003').join('[^/]*')
      + '$';
    try { return new RegExp(rx).test(path); } catch (e) { return false; }
  },

  // 取当前文档相对手册根的路径（去掉 .md），优先用 docsify 路由信息
  _relativeDoc: function (vm, m) {
    var file = vm && vm.route && vm.route.file;
    if (file) return String(file).replace(/\.md$/, '');
    var h = decodeURIComponent(location.hash.replace(/^#\//, '').split('?')[0]);
    var base = (m && (m.path || m.entry)) || '';
    if (base && h.indexOf(base) === 0) h = h.slice(base.length);
    if (!h || h === '/') h = (m && m.homepage) || 'README';
    return h.replace(/^\/+|\/+$/g, '');
  },

  // 解析某文档所需的密钥策略 id：'public' 表示免密
  _resolve: function (vm, acc, m) {
    var docRel = this._relativeDoc(vm, m);
    if (typeof acc === 'string') return acc === 'public' ? 'public' : 'default';
    var defaultMode = acc.default || 'protected';
    var defaultKey = acc.keyId || 'default';
    var rules = acc.rules || [];
    for (var i = 0; i < rules.length; i++) {
      if (this._match(rules[i].match, docRel)) {
        var ra = rules[i].access || 'protected';
        if (ra === 'public') return 'public';
        return rules[i].keyId || defaultKey;
      }
    }
    return defaultMode === 'public' ? 'public' : defaultKey;
  },

  // —— Docsify 插件工厂：在渲染期逐文档判定密钥 ——
  // docs-boot.js 会把它 push 进 window.$docsify.plugins
  makePlugin: function () {
    var self = this;
    return function (hook, vm) {
      hook.beforeEach(function (content, next) {
        var m = window.__MANUAL__ || {};
        var acc = m.access;
        if (!acc) return next(content);                 // 未配置：放行
        var need = self._resolve(vm, acc, m);
        if (need === 'public' || self.isUnlocked(need)) {
          self._hide();
          return next(content);                          // 放行：真实正文进入 DOM
        }
        // 锁定：弹对应密钥遮罩，正文替换为占位（真实内容不进入 DOM）
        self._showFor(need);
        next('\n\n# 🔒 需要访问密钥\n\n本文档受密钥保护，请输入对应密钥后继续阅读。\n');
      });
    };
  }
};
