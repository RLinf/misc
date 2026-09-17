/* The docs mount is optional; ordinary documentation pages are unaffected. */
(() => {
  'use strict';
  const scriptBase = new URL('.', document.currentScript.src);
  async function mount() {
    const host = document.getElementById('rpent-interactive-leaderboard');
    if (!host || host.dataset.loaded) return;
    try {
      const response = await fetch(host.dataset.resultsUrl);
      if (!response.ok) throw new Error(`Results HTTP ${response.status}`);
      const data = await response.json();
      const templateResponse = await fetch(new URL('embed.html', scriptBase));
      if (!templateResponse.ok) throw new Error(`Template HTTP ${templateResponse.status}`);
      const markup = await templateResponse.text();
      const detached = document.createElement('div');
      const root = detached.attachShadow({mode: 'open'});
      root.innerHTML = markup;
      root.querySelectorAll('img[src^="assets/"]').forEach(img => {img.src = new URL(img.getAttribute('src'), scriptBase);});
      const style = document.createElement('link');
      style.rel = 'stylesheet';style.href = new URL('embed.css', scriptBase);
      const loaded = new Promise((resolve, reject) => {style.onload = resolve;style.onerror = reject;});
      root.prepend(style);
      host.append(detached);
      await loaded;
      window.RPentLeaderboard.mount(root, data, {language:host.dataset.language??'en',assetBase:scriptBase.href,embedded:true});
      host.querySelector('.rpent-static-leaderboard')?.remove();
      host.dataset.loaded = 'true';
    } catch (error) {
      host.querySelectorAll(':scope > div:not(.rpent-static-leaderboard)').forEach(el => el.remove());
      // The compact native summary stays readable when remote assets fail.
      host.dataset.loadError = 'true';
      console.warn('RPent interactive results unavailable; showing the summary.', error);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
