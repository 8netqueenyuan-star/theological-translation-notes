/* =====================================================================
 * EmailSubscribe — 邮件订阅组件（provider-agnostic）
 *
 * 这是一个纯静态站点（GitHub Pages，无后端），所以订阅组件被设计为
 * UI 与提交逻辑分离：
 *   - UI / 表单验证 / 成功态 / 失败态：已完成，开箱即用
 *   - 真正的订阅保存：需要接入 newsletter provider（见下方配置区）
 *
 * ┌─ 未来接入点（INTEGRATION POINT）────────────────────────────────┐
 * │ 1. 把 NEWSLETTER_CONFIG.provider 设为已选服务：                  │
 * │    'buttondown' | 'beehiiv' | 'kit' | 'substack' | 'mailchimp'   │
 * │ 2. 按该服务的文档实现 subscribeEmail() 里的 fetch 调用。          │
 * │                                                                  │
 * │    参考（以各服务官方文档为准）：                                 │
 * │    - Buttondown:  POST https://api.buttondown.email/v1/subscribers │
 * │                   需要 API key → 必须走服务端代理，               │
 * │                   不要把 private API key 写进前端 JS。             │
 * │    - Beehiiv:     POST https://api.beehiiv.com/v2/publications/   │
 * │                   {publication_id}/subscriptions                   │
 * │    - Kit(ConvertKit): POST https://api.convertkit.com/v3/forms/     │
 * │                   {form_id}/subscribe                              │
 * │    - Substack:    官方推荐用它的 hosted 订阅页/嵌入代码；          │
 * │                   API 写入需走代理。                               │
 * │    - Mailchimp:   官方 embedded form 或 API（需代理藏 key）。     │
 * │                                                                  │
 * │ 3. 在 provider 接入之前，表单不会伪造“订阅成功”——                 │
 * │    用户提交后会看到诚实的“即将上线”提示，并引导到 Substack。      │
 * └──────────────────────────────────────────────────────────────────┘
 * =================================================================== */
(function () {
  "use strict";

  var NEWSLETTER_CONFIG = {
    provider: null,   // TODO: 接入时改为 'buttondown' | 'beehiiv' | 'kit' | 'substack' | 'mailchimp'
    endpoint: "",     // TODO: 接入时填该服务的订阅 endpoint
    // 临时替代订阅入口（在 provider 接入前，给用户一个真实可用的去处）
    fallbackUrl: "https://substack.com/@thetriuneprism",
    fallbackLabel: "Substack「守望者笔记」"
  };

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }

  /* ---- INTEGRATION POINT: 实现具体 provider 的订阅请求 ----
   * 成功时 resolve，失败时 reject(new Error('...'))。
   * 注意：需要 API key 的服务请走你自己的服务端代理，
   * 不要把 key 写在这里。 */
  function subscribeEmail(email) {
    if (!NEWSLETTER_CONFIG.provider || !NEWSLETTER_CONFIG.endpoint) {
      return Promise.reject(new Error("not_configured"));
    }
    // 示例（Buttondown 经代理）：按实际 provider 文档替换
    // return fetch(NEWSLETTER_CONFIG.endpoint, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: email })
    // }).then(function (r) { if (!r.ok) throw new Error("bad_response"); });
    return Promise.reject(new Error("not_implemented"));
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function mount(host) {
    if (host.dataset.esMounted) return;
    host.dataset.esMounted = "1";

    var h = el("h2", null, "Stay with the work.");
    var p1 = el("p", null, "如果你愿意，可以跟着这项工作继续走下去。");
    var p2 = el("p", null,
      "Receive new theological translations, emerging concepts, research notes, " +
      "and major updates as this system develops. " +
      "接收新的神学翻译、概念发展、研究笔记，以及这套思想系统的重要更新。");

    var row = el("div", "es-row");
    var input = el("input");
    input.type = "email";
    input.name = "email";
    input.placeholder = "Your email";
    input.setAttribute("aria-label", "Your email");
    input.autocomplete = "email";
    var btn = el("button", null, "Subscribe");
    btn.type = "submit";
    row.appendChild(input);
    row.appendChild(btn);

    var msg = el("p", "es-msg");
    msg.setAttribute("role", "status");
    msg.style.display = "none";

    function showMsg(text, cls, html) {
      msg.style.display = "";
      msg.className = "es-msg " + (cls || "");
      if (html) { msg.innerHTML = html; } else { msg.textContent = text; }
    }

    function onSubmit(e) {
      e.preventDefault();
      var email = input.value.trim();
      if (!isValidEmail(email)) {
        showMsg("请输入有效的邮箱地址。Please enter a valid email address.", "es-error");
        input.focus();
        return;
      }
      btn.disabled = true;
      btn.textContent = "…";
      subscribeEmail(email).then(function () {
        // 成功态（仅当 provider 已接入并返回成功时才会走到这里）
        showMsg("已收到，欢迎同行。You're on the list.", "es-ok");
        input.value = "";
        btn.disabled = false;
        btn.textContent = "Subscribe";
      }, function (err) {
        btn.disabled = false;
        btn.textContent = "Subscribe";
        if (err && err.message === "not_configured") {
          // 诚实状态：没有伪造“订阅成功”，告诉用户系统正在接入，
          // 并给出一个真实可用的替代入口。
          showMsg("", "es-note",
            "感谢你的意愿。邮件订阅系统正在接入中，暂未保存你的邮箱——" +
            "在此之前，欢迎先在 <a href=\"" + NEWSLETTER_CONFIG.fallbackUrl + "\">" +
            NEWSLETTER_CONFIG.fallbackLabel + "</a> 关注更新。");
        } else {
          showMsg("提交失败，请稍后再试；也可以直接在 <a href=\"" +
            NEWSLETTER_CONFIG.fallbackUrl + "\">" +
            NEWSLETTER_CONFIG.fallbackLabel + "</a> 订阅。", "es-error", true);
        }
      });
    }

    host.appendChild(h);
    host.appendChild(p1);
    host.appendChild(p2);
    host.appendChild(row);
    host.appendChild(msg);
    // 用一个可提交的 form 包裹（无后端时拦截默认行为）
    var form = el("form");
    form.setAttribute("novalidate", "novalidate");
    // 把 row 移入 form
    host.insertBefore(form, row);
    form.appendChild(row);
    form.addEventListener("submit", onSubmit);
    // 回车提交：input 已在 form 内，浏览器默认行为即触发 submit
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-email-subscribe]").forEach(mount);
  });
})();
