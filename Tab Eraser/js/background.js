// Tab Eraser - 后台脚本
// 监听标签页关闭，自动删除非白名单网站的历史记录

// 记录每个tab访问过的URL集合
const tabUrlMap = {};

// 获取白名单（域名数组）
function getWhitelist() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ whitelist: [] }, (result) => {
      resolve(result.whitelist);
    });
  });
}

// 判断URL是否属于白名单
function isWhitelisted(url, whitelist) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return whitelist.some(domain => {
      const cleanDomain = domain.trim().replace(/^\.+/, '').toLowerCase();
      // 只允许纯域名，不含协议和路径
      return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
    });
  } catch {
    return false;
  }
}

// 记录tab访问的URL（去重）
function recordTabUrl(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;
  if (!tabUrlMap[tabId]) tabUrlMap[tabId] = new Set();
  tabUrlMap[tabId].add(url);
}

// 监听webNavigation主框架URL变化
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0 && details.tabId) {
    recordTabUrl(details.tabId, details.url);
  }
});

// 辅助监听tab主URL变化（如前进/后退/重定向）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    recordTabUrl(tabId, changeInfo.url);
  }
});

// 新增：切换标签页时，主动记录当前tab的URL
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      recordTabUrl(activeInfo.tabId, tab.url);
    }
  });
});

// 新增：tab被替换时迁移历史
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  if (tabUrlMap[removedTabId]) {
    tabUrlMap[addedTabId] = tabUrlMap[removedTabId];
    delete tabUrlMap[removedTabId];
  }
});

// 监听tab关闭，清理历史
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const urls = tabUrlMap[tabId];
  if (!urls) return;
  const whitelist = await getWhitelist();
  for (const url of urls) {
    if (!isWhitelisted(url, whitelist)) {
      chrome.history.deleteUrl({ url });
    }
  }
  delete tabUrlMap[tabId];
});

// 与popup通信：白名单管理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getWhitelist') {
    getWhitelist().then(sendResponse);
    return true;
  }
  if (message.type === 'setWhitelist') {
    chrome.storage.local.set({ whitelist: message.whitelist }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 启动时批量清理历史
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get({ autoCleanOnExit: false, whitelist: [] }, (result) => {
    if (!result.autoCleanOnExit) return;
    const whitelist = result.whitelist;
    // 查询所有历史，批量删除非白名单
    chrome.history.search({ text: '', maxResults: 10000 }, (items) => {
      items.forEach(item => {
        const url = item.url;
        try {
          const hostname = new URL(url).hostname.toLowerCase();
          const isWhite = whitelist.some(domain => {
            const cleanDomain = domain.trim().replace(/^\.+/, '').toLowerCase();
            return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
          });
          if (!isWhite) {
            chrome.history.deleteUrl({ url });
          }
        } catch {}
      });
    });
  });
}); 