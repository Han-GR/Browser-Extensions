// Tab Eraser - popup.js
// 白名单管理弹窗脚本

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('whitelist-list');
  const inputEl = document.getElementById('whitelist-input');
  const addBtn = document.getElementById('add-btn');
  const feedbackEl = document.getElementById('feedback');

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
      delBtn.textContent = '删除';
      delBtn.setAttribute('aria-label', `删除域名${domain}`);
      delBtn.addEventListener('click', () => deleteDomain(idx));

      li.appendChild(input);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  // 添加新域名
  function addDomain() {
    const val = inputEl.value.trim();
    if (!val) {
      showFeedback('请输入域名', true);
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
    newVal = newVal.trim();
    if (!newVal) {
      showFeedback('域名不能为空', true);
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

  // 操作反馈
  function showFeedback(msg, isError = false) {
    feedbackEl.textContent = msg;
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

  loadWhitelist();
}); 