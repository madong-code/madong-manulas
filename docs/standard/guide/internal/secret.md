# 🔐 内部资料（局部独立密钥）

这是一篇**仅对持有独立密钥 `vip123` 的读者开放**的文档。

它位于 `guide/internal/` 目录下，在 `index.html` 的 `access.rules` 中被单独标记为：

```js
{ match: 'guide/internal/**', access: 'protected', keyId: 'vip' }
```

并对应 `access.policies.vip` 策略（salt=`vip-salt`，密钥=`vip123`）。

## 如何验证「局部密钥」

1. 在**未解锁**状态下直接打开本页（如新开无痕窗口、或清掉 `localStorage`）→ 会弹出标题为「VIP 内部资料」的密钥遮罩。
2. 输入 `vip123` → 解锁后正文才显示。
3. 此时你用站点密钥 `madong` 解锁的「标准版手册」主文档**不会**自动解锁本页——两套密钥互不干扰，各自独立记 `localStorage`。

> 这正是「局部秘钥」的意义：整册用站点密钥，而其中少数敏感文档用另一把钥匙。
> 上线前请把 `vip` 策略的 `hash` 替换为你自己的密钥摘要，并移除 tip 里的明文提示。
