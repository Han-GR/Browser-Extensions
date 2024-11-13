// 处理快捷键命令
chrome.commands.onCommand.addListener(async (command) => {
  try {
    if (command === "toggle-current-group") {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.groupId !== -1) {
        const group = await chrome.tabGroups.get(activeTab.groupId);
        await chrome.tabGroups.update(activeTab.groupId, {
          collapsed: !group.collapsed
        });
      }
    } else if (command === "toggle-all-groups") {
      const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      if (groups.length > 0) {
        const allCollapsed = groups.every(group => group.collapsed);
        for (const group of groups) {
          await chrome.tabGroups.update(group.id, {
            collapsed: !allCollapsed
          });
        }
      }
    }
  } catch (e) {
    console.error('快捷键处理失败:', e);
  }
});

// 监听标签页创建事件
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.url && tab.url.startsWith('http')) {
    await handleNewTab(tab);
  }
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.url.startsWith('http')) {
    await handleNewTab(tab);
  }
});

// 监听标签组更新事件
chrome.tabGroups.onUpdated.addListener(async (group) => {
  try {
    const tabs = await chrome.tabs.query({ groupId: group.id });
    if (tabs.length > 0) {
      const domain = new URL(tabs[0].url).hostname;
      const { groupNames = {} } = await chrome.storage.local.get('groupNames');
      
      // 如果组名被手动更改（不等于域名），则保存新名称
      if (group.title !== domain && group.title !== '') {
        const updatedNames = {
          ...groupNames,
          [domain]: group.title
        };
        await chrome.storage.local.set({ groupNames: updatedNames });
      }
      // 如果组名为域名或者为空，则保存域名
      if (group.title === domain || group.title === '') {
        const updatedNames = {
          ...groupNames,
          [domain]: domain
        };      
        await chrome.storage.local.set({ groupNames: updatedNames });
      }
    }
  } catch (e) {
    console.error('处理组更新失败:', e);
  }
});

// 处理新标签页
async function handleNewTab(tab) {
  try {
    if (!tab.url) return;
    const domain = new URL(tab.url).hostname;
    const { groupNames = {} } = await chrome.storage.local.get('groupNames');
    
    // 查找当前窗口中相同域名的标签
    const sameDomainTabs = await chrome.tabs.query({
      windowId: tab.windowId,
      url: [`*://*.${domain}/*`, `*://${domain}/*`]
    });
    
    if (sameDomainTabs.length > 1) {
      const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
      const existingGroup = await findExistingGroup(groups, domain);
      
      if (existingGroup) {
        // 将新标签添加到现有组
        await chrome.tabs.group({
          tabIds: [tab.id],
          groupId: existingGroup.id
        });
        // 始终应用保存的自定义名称
        if (groupNames[domain]) {
          await chrome.tabGroups.update(existingGroup.id, {
            title: groupNames[domain]
          });
        }
      } else {
        // 创建新组
        const group = await chrome.tabs.group({
          tabIds: sameDomainTabs.map(t => t.id)
        });
        // 始终应用保存的自定义名称
        await chrome.tabGroups.update(group, {
          title: groupNames[domain] || domain,
          collapsed: true
        });
      }
    }
  } catch (e) {
    console.error('处理新标签页失败:', e);
  }
}

// 查找现有组
async function findExistingGroup(groups, domain) {
  for (const group of groups) {
    const groupTabs = await chrome.tabs.query({ groupId: group.id });
    if (groupTabs.length > 0) {
      try {
        const groupDomain = new URL(groupTabs[0].url).hostname;
        if (groupDomain === domain) {
          return group;
        }
      } catch (e) {
        continue;
      }
    }
  }
  return null;
}

// 添加标签组创建监听器
chrome.tabGroups.onCreated.addListener(async (group) => {
  try {
    const tabs = await chrome.tabs.query({ groupId: group.id });
    if (tabs.length > 0) {
      const domain = new URL(tabs[0].url).hostname;
      const { groupNames = {} } = await chrome.storage.local.get('groupNames');
      
      // 如果有保存的自定义名称，立即应用
      if (groupNames[domain]) {
        await chrome.tabGroups.update(group.id, {
          title: groupNames[domain]
        });
      }
    }
  } catch (e) {
    console.error('处理组创建失败:', e);
  }
});

// 添加标签组移动监听器
chrome.tabGroups.onMoved.addListener(async (group) => {
  try {
    const tabs = await chrome.tabs.query({ groupId: group.id });
    if (tabs.length > 0) {
      const domain = new URL(tabs[0].url).hostname;
      const { groupNames = {} } = await chrome.storage.local.get('groupNames');
      
      // 如果有保存的自定义名称，确保应用
      if (groupNames[domain]) {
        await chrome.tabGroups.update(group.id, {
          title: groupNames[domain]
        });
      }
    }
  } catch (e) {
    console.error('处理组移动失败:', e);
  }
});