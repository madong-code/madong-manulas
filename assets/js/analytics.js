/**
 * 百度统计（hm.baidu.com）接入模块
 *
 * 由 assets/js/site-config.js 的 analytics.baidu 驱动：
 *   enabled        : 总开关（默认 false，避免开发/预览污染线上数据）
 *   id             : 百度统计站点 ID（hm.js? 后面那串）
 *   trackSpaRoutes : 是否上报 SPA 路由切换（docsify 是 hash 路由，切换不会自动上报）
 *   hosts          : 生效域名白名单，留空=不限制（如 ['example.com', '.example.com']）
 *
 * 设计要点：
 *   1. 第三方脚本异步注入，onerror 静默——离线 / webview 拦截时绝不影响文档渲染；
 *   2. 首屏由 hm.js 自动上报，本模块只在路由切换时手动 push，避免首屏 PV 双计；
 *   3. 配置缺失或关闭时不注入任何脚本，零副作用。
 */
(function (global) {
  var injected = false;

  function getCfg() {
    var s = global.SITE_CONFIG || {};
    var a = s.analytics || {};
    return a.baidu || {};
  }

  function hostAllowed(c) {
    if (!c.hosts || !c.hosts.length) return true; // 留空表示不限制域名
    var h = global.location.hostname;
    for (var i = 0; i < c.hosts.length; i++) {
      var rule = String(c.hosts[i]);
      if (h === rule) return true;
      if (rule.charAt(0) === '.' && h.slice(-rule.length) === rule) return true;
    }
    return false;
  }

  function active(c) {
    c = c || getCfg();
    return !!(c.enabled && c.id && hostAllowed(c));
  }

  function inject(c) {
    if (injected) return;
    injected = true;
    global._hmt = global._hmt || [];
    var hm = document.createElement('script');
    hm.async = true;
    hm.src = 'https://hm.baidu.com/hm.js?' + encodeURIComponent(String(c.id));
    // 加载失败（离线 / 被拦截）时静默，不影响页面
    hm.onerror = function () { };
    var first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) first.parentNode.insertBefore(hm, first);
    else (document.head || document.documentElement).appendChild(hm);
  }

  var Analytics = {
    isActive: function () { return active(); },

    // 仅初始化：首屏由 hm.js 自动上报一次（非 SPA 页面用这个，避免重复计数）
    init: function () {
      var c = getCfg();
      if (!active(c)) return false;
      inject(c);
      return true;
    },

    // 手动上报一次 PV（SPA 路由切换 / 自定义上报）
    trackPageview: function (url) {
      var c = getCfg();
      if (!active(c)) return false;
      inject(c);
      global._hmt = global._hmt || [];
      global._hmt.push(['_trackPageview', url || (global.location.pathname + global.location.hash)]);
      return true;
    },

    // docsify 插件：首屏注入，之后每次路由切换上报
    makePlugin: function () {
      var isFirst = true;
      return function (hook) {
        hook.doneEach(function () {
          var c = getCfg();
          if (!active(c)) return;
          if (isFirst) { isFirst = false; inject(c); return; }
          if (c.trackSpaRoutes === false) return;
          global._hmt = global._hmt || [];
          global._hmt.push(['_trackPageview', global.location.pathname + global.location.hash]);
        });
      };
    }
  };

  global.DocsifyAnalytics = Analytics;
})(window);
