// Tab Eraser - popup.js
// 白名单管理弹窗脚本

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('whitelist-list');
  const inputEl = document.getElementById('whitelist-input');
  const addBtn = document.getElementById('add-btn');
  const feedbackEl = document.getElementById('feedback');
  const autoCleanEl = document.getElementById('auto-clean-on-exit');

  let whitelist = [];

  // 获取白名单
  function loadWhitelist() {
    chrome.runtime.sendMessage({ type: 'getWhitelist' }, (result) => {
      whitelist = result || [];
      renderList();
    });
  }

  // 内置中英文i18n对象
  const i18nMap = {
    zh: {
      whitelistTitle: '白名单管理',
      inputPlaceholder: '输入域名，如example.com',
      addBtn: '+',
      deleteBtn: '-',
      feedbackExists: '域名已存在',
      feedbackInvalid: '域名格式不正确',
      feedbackEmpty: '请输入有效域名',
      feedbackSuccess: '添加成功',
      feedbackDelete: '删除成功',
      feedbackEdit: '修改成功',
      autoCleanLabel: '关闭浏览器时自动清理历史',
      editDomainAria: '编辑域名',
      deleteDomainAria: '删除域名'
    },
    en: {
      whitelistTitle: 'Whitelist',
      inputPlaceholder: 'Enter domain, e.g. example.com',
      addBtn: '+',
      deleteBtn: '-',
      feedbackExists: 'Domain already exists',
      feedbackInvalid: 'Invalid domain format',
      feedbackEmpty: 'Please enter a valid domain',
      feedbackSuccess: 'Added successfully',
      feedbackDelete: 'Deleted successfully',
      feedbackEdit: 'Edited successfully',
      autoCleanLabel: 'Auto clean history on browser close',
      editDomainAria: 'Edit domain',
      deleteDomainAria: 'Delete domain'
    }
  };
  // 根据浏览器语言自动切换
  const lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  const i18n = i18nMap[lang];

  // 赋值UI文本
  document.querySelector('.whitelist-section h2').textContent = i18n.whitelistTitle;
  inputEl.placeholder = i18n.inputPlaceholder;
  addBtn.textContent = i18n.addBtn;
  document.querySelector('.setting-label').lastChild.textContent = i18n.autoCleanLabel;

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

  // 渲染白名单列表
  function renderList() {
    listEl.innerHTML = '';
    whitelist.forEach((domain, idx) => {
      const li = document.createElement('li');
      li.className = 'whitelist-item';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = domain;
      input.setAttribute('aria-label', `${i18n.editDomainAria}${domain}`);
      input.addEventListener('change', (e) => editDomain(idx, e.target.value));

      const delBtn = document.createElement('button');
      delBtn.textContent = i18n.deleteBtn;
      delBtn.setAttribute('aria-label', `${i18n.deleteDomainAria}${domain}`);
      delBtn.addEventListener('click', () => deleteDomain(idx));

      li.appendChild(input);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  // 操作反馈
  function showFeedback(msgKey, isError = false) {
    feedbackEl.textContent = i18n[msgKey] || msgKey;
    feedbackEl.className = isError ? 'feedback error' : 'feedback';
    setTimeout(() => {
      feedbackEl.textContent = '';
    }, 1500);
  }

  // 添加新域名
  function addDomain() {
    let val = inputEl.value.trim();
    val = cleanDomain(val);
    if (!val) {
      showFeedback('feedbackEmpty', true);
      return;
    }
    if (!isValidDomain(val)) {
      showFeedback('feedbackInvalid', true);
      return;
    }
    if (whitelist.includes(val)) {
      showFeedback('feedbackExists', true);
      return;
    }
    whitelist.push(val);
    saveWhitelist('feedbackSuccess');
    inputEl.value = '';
  }

  // 删除域名
  function deleteDomain(idx) {
    whitelist.splice(idx, 1);
    saveWhitelist('feedbackDelete');
  }

  // 编辑域名
  function editDomain(idx, newVal) {
    newVal = cleanDomain(newVal);
    if (!newVal) {
      showFeedback('feedbackEmpty', true);
      renderList();
      return;
    }
    if (!isValidDomain(newVal)) {
      showFeedback('feedbackInvalid', true);
      renderList();
      return;
    }
    if (whitelist.includes(newVal) && whitelist[idx] !== newVal) {
      showFeedback('feedbackExists', true);
      renderList();
      return;
    }
    whitelist[idx] = newVal;
    saveWhitelist('feedbackEdit');
  }

  // 保存白名单
  function saveWhitelist(msgKey) {
    chrome.runtime.sendMessage({ type: 'setWhitelist', whitelist }, (res) => {
      if (res && res.success) {
        showFeedback(msgKey);
        renderList();
      } else {
        showFeedback('保存失败', true);
      }
    });
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

  loadWhitelist();
});
