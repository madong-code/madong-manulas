/**
 * 门户首页：读取 docs.json 渲染手册卡片
 * - 按 type 分组（应用手册 / 插件手册）
 * - 支持名称/描述/标签搜索 + 状态筛选
 * - 无 JS / fetch 失败时由 #portal-fallback 兜底
 */
(function () {
  var TYPE_LABEL = { app: '应用手册', plugin: '插件手册', guide: '指南' };
  var STATUS_LABEL = { active: '在用', wip: '建设中', deprecated: '已废弃' };
  var state = { kw: '', status: 'all' };

  function el(id) { return document.getElementById(id); }

  function badge(status) {
    var cls = { active: 'badge--active', wip: 'badge--wip', deprecated: 'badge--deprecated' }[status] || 'badge--deprecated';
    return '<span class="badge ' + cls + '">' + (STATUS_LABEL[status] || status) + '</span>';
  }

  function card(m) {
    var tags = (m.tags || []).map(function (t) { return '<span class="card__tag">' + esc(t) + '</span>'; }).join('');
    var icon = (m.name || '?').trim().charAt(0);
    return '' +
      '<a class="card" href="' + m.entry + '" data-name="' + esc(m.name) + '" data-desc="' + esc(m.desc || '') + '" data-tags="' + esc((m.tags || []).join(' ')) + '" data-status="' + (m.status || '') + '">' +
      '  <div class="card__head">' +
      '    <div class="card__icon">' + esc(icon) + '</div>' +
      '    <div>' +
      '      <div class="card__name">' + esc(m.name) + '</div>' +
      '      <div class="card__meta">' + badge(m.status) + '<span class="badge badge--ver">' + esc(m.version || '') + '</span></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="card__desc">' + esc(m.desc || '') + '</div>' +
      '  <div class="card__tags">' + tags + '</div>' +
      '  <span class="card__enter">进入手册 <span class="arrow">→</span></span>' +
      '</a>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(list) {
    var groups = {};
    (list || []).forEach(function (m) {
      var t = m.type || 'guide';
      (groups[t] = groups[t] || []).push(m);
    });
    var html = '';
    Object.keys(groups).forEach(function (t) {
      html += '<section class="portal__group" data-group="' + t + '">' +
        '<h2 class="portal__group-title">' + (TYPE_LABEL[t] || t) + '</h2>' +
        '<div class="portal__grid">' + groups[t].map(card).join('') + '</div></section>';
    });
    var mount = el('portal-mount');
    mount.innerHTML = html || '<p style="color:#8a93a6">暂无手册</p>';
    applyFilter();
  }

  function applyFilter() {
    var cards = document.querySelectorAll('#portal-mount .card');
    cards.forEach(function (c) {
      var hay = (c.dataset.name + ' ' + c.dataset.desc + ' ' + c.dataset.tags).toLowerCase();
      var okKw = !state.kw || hay.indexOf(state.kw.toLowerCase()) !== -1;
      var okSt = state.status === 'all' || c.dataset.status === state.status;
      c.style.display = (okKw && okSt) ? '' : 'none';
    });
    // 隐藏空分组
    document.querySelectorAll('#portal-mount .portal__group').forEach(function (g) {
      var visible = g.querySelectorAll('.card[style=""]').length + g.querySelectorAll('.card:not([style])').length;
      // 简化：用 display 计算
      var any = [].slice.call(g.querySelectorAll('.card')).some(function (c) { return c.style.display !== 'none'; });
      g.style.display = any ? '' : 'none';
    });
  }

  function bindControls() {
    var search = el('portal-search');
    if (search) search.addEventListener('input', function () { state.kw = search.value; applyFilter(); });
    document.querySelectorAll('.portal__chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.portal__chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        state.status = chip.dataset.status;
        applyFilter();
      });
    });
  }

  function bindRepo() {
    var box = document.querySelector('.portal__repo');
    if (!box) return;
    var btn = box.querySelector('.portal__repo-btn');
    btn.addEventListener('click', function (e) { e.stopPropagation(); box.classList.toggle('open'); });
    box.addEventListener('mouseenter', function () { box.classList.add('open'); });
    box.addEventListener('mouseleave', function () { box.classList.remove('open'); });
    document.addEventListener('click', function () { box.classList.remove('open'); });
  }

  function init() {
    var fb = el('portal-fallback');
    if (fb) fb.style.display = 'none';
    fetch('docs.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        render(data.docs || []);
        bindControls();
        bindRepo();
      })
      .catch(function () {
        if (fb) fb.style.display = '';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
