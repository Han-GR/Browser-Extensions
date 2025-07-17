// Tab Eraser - popup.js
// 白名单管理弹窗脚本

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('whitelist-list');
  const inputEl = document.getElementById('whitelist-input');
  const addBtn = document.getElementById('add-btn');
  const feedbackEl = document.getElementById('feedback');
  const autoCleanEl = document.getElementById('auto-clean-on-exit');
  const langSelect = document.getElementById('lang-select');
  let lang = 'zh_CN';
  let i18n = {};

  let whitelist = [];

  // 获取白名单
  function loadWhitelist() {
    chrome.runtime.sendMessage({ type: 'getWhitelist' }, (result) => {
      whitelist = result || [];
      renderList();
    });
  }

  // 渲染白名单列表
  function renderList() {
    listEl.innerHTML = '';
    whitelist.forEach((domain, idx) => {
      const li = document.createElement('li');
      li.className = 'whitelist-item';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = domain;
      input.setAttribute('aria-label', `编辑域名${domain}`);
      input.addEventListener('change', (e) => editDomain(idx, e.target.value));

      const delBtn = document.createElement('button');
      delBtn.textContent = '-';
      delBtn.setAttribute('aria-label', `删除域名${domain}`);
      delBtn.addEventListener('click', () => deleteDomain(idx));

      li.appendChild(input);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  // 域名清洗函数，只保留主域名
  function cleanDomain(input) {
    try {
      let domain = input.trim().toLowerCase();
      // 去除协议
      domain = domain.replace(/^https?:\/\//, '');
      // 去除路径和参数
      domain = domain.split('/')[0].split(':')[0];
      // 去除前后的点
      domain = domain.replace(/^\.+|\.+$/g, '');
      return domain;
    } catch {
      return '';
    }
  }

  // 域名合法性校验
  function isValidDomain(domain) {
    // 只允许字母、数字、点和短横线，且至少包含一个点
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
  }

  // 添加新域名
  function addDomain() {
    let val = inputEl.value.trim();
    val = cleanDomain(val);
    if (!val) {
      showFeedback('请输入有效域名', true);
      return;
    }
    if (!isValidDomain(val)) {
      showFeedback('域名格式不正确', true);
      return;
    }
    if (whitelist.includes(val)) {
      showFeedback('域名已存在', true);
      return;
    }
    whitelist.push(val);
    saveWhitelist('添加成功');
    inputEl.value = '';
  }

  // 删除域名
  function deleteDomain(idx) {
    whitelist.splice(idx, 1);
    saveWhitelist('删除成功');
  }

  // 编辑域名
  function editDomain(idx, newVal) {
    newVal = cleanDomain(newVal);
    if (!newVal) {
      showFeedback('域名不能为空', true);
      renderList();
      return;
    }
    if (!isValidDomain(newVal)) {
      showFeedback('域名格式不正确', true);
      renderList();
      return;
    }
    if (whitelist.includes(newVal) && whitelist[idx] !== newVal) {
      showFeedback('域名已存在', true);
      renderList();
      return;
    }
    whitelist[idx] = newVal;
    saveWhitelist('修改成功');
  }

  // 保存白名单
  function saveWhitelist(msg) {
    chrome.runtime.sendMessage({ type: 'setWhitelist', whitelist }, (res) => {
      if (res && res.success) {
        showFeedback(msg);
        renderList();
      } else {
        showFeedback('保存失败', true);
      }
    });
  }

  // 加载语言资源
  function loadLocale(locale, cb) {
    fetch(`../locales/${locale}.json`)
      .then(res => res.json())
      .then(data => {
        i18n = data;
        lang = locale;
        chrome.storage.local.set({ tabEraserLang: locale });
        cb && cb();
      });
  }

  // 应用界面文本
  function applyLocale() {
    document.getElementById('title').textContent = i18n.title;
    document.querySelector('.whitelist-section h2').textContent = i18n.whitelistTitle;
    inputEl.placeholder = i18n.inputPlaceholder;
    addBtn.textContent = i18n.addBtn;
    document.querySelector('.setting-label').lastChild.textContent = i18n.autoCleanLabel;
    // 移除对lang-label的赋值，无需再设置语言label
    langSelect.options[0].textContent = i18n.zh;
    langSelect.options[1].textContent = i18n.en;
  }

  // 操作反馈
  function showFeedback(msgKey, isError = false) {
    feedbackEl.textContent = i18n[msgKey] || msgKey;
    feedbackEl.className = isError ? 'feedback error' : 'feedback';
    setTimeout(() => {
      feedbackEl.textContent = '';
    }, 1500);
  }

  // 事件绑定
  addBtn.addEventListener('click', addDomain);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomain();
  });

  // 加载开关状态
  chrome.storage.local.get({ autoCleanOnExit: false }, (result) => {
    autoCleanEl.checked = !!result.autoCleanOnExit;
  });

  // 监听开关变化
  autoCleanEl.addEventListener('change', () => {
    chrome.storage.local.set({ autoCleanOnExit: autoCleanEl.checked });
  });

  // 监听语言切换
  langSelect.addEventListener('change', () => {
    loadLocale(langSelect.value, applyLocale);
  });

  // 初始化语言
  chrome.storage.local.get({ tabEraserLang: 'zh_CN' }, (result) => {
    lang = result.tabEraserLang;
    langSelect.value = lang;
    loadLocale(lang, applyLocale);
  });

  loadWhitelist();
});
