/* EMBEDDED_ASSETS */
(() => {
  'use strict';
  function mount(root, d, options={}) {
  const pageDocument=globalThis.document;
  const themeTarget=options.embedded?root.host:root.documentElement;
  const systemTheme=window.matchMedia('(prefers-color-scheme: dark)');
  const syncTheme=()=>{
    const theme=options.embedded?pageDocument.documentElement.dataset.theme:null;
    themeTarget.dataset.theme=theme==='dark'||theme==='light'?theme:systemTheme.matches?'dark':'light';
  };
  syncTheme();
  systemTheme.addEventListener('change',syncTheme);
  if(options.embedded){
    new MutationObserver(syncTheme).observe(pageDocument.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  const document = root;
  const query = new URLSearchParams(location.search);
  let lang = options.language ?? (query.get('lang') === 'en' ? 'en' : 'zh');
  const views = new Map(d.views.map(v => [v.id, v]));
  const configs = new Map(d.configurations.map(c => [c.id, c]));
  const records = new Map(d.results.map(r => [r.id, r]));
  const selection = new Map(d.sections.map(s => [s.id, s.default_view]));
  if (views.has(query.get('view'))) {
    const s = d.sections.find(s => s.views.includes(query.get('view')));
    if (s) selection.set(s.id, query.get('view'));
  }
  const copy = {
  "en": {
    "paper": "Paper",
    "title": "RPent Leaderboard",
    "backTop": "Back to top ↑",
    "view": "Evaluation",
    "rate": "Success rate",
    "method": "Method",
    "meanTime": "Mean time / episode (s)",
    "outputTokens": "Total output tokens",
    "unreported": "Not reported",
    "modelUnknown": "Model not reported",
    "noReasoning": "no-reasoning",
    "table": "Results table",
    "download": "Download CSV",
    "print": "Print page",
    "menu": "Chart options",
    "countsOnly": "Evaluated",
    "saved": "CSV downloaded",
    "allScores": "All methods & reported scores"
  },
  "zh": {
    "paper": "论文",
    "title": "RPent Leaderboard",
    "backTop": "返回顶部 ↑",
    "view": "评测范围",
    "rate": "成功率",
    "method": "方法",
    "meanTime": "平均每回合耗时（秒）",
    "outputTokens": "总输出 token",
    "unreported": "未报告",
    "modelUnknown": "未报告模型",
    "noReasoning": "no-reasoning",
    "table": "结果明细表",
    "download": "下载 CSV",
    "print": "打印页面",
    "menu": "图表选项",
    "countsOnly": "已评测",
    "saved": "CSV 已下载",
    "allScores": "完整方法与分项成绩"
  }
};
  const t = key => copy[lang][key] ?? key;
  const tr = value => value && typeof value === 'object' ? value[lang] ?? value.en : value;
  const h = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const asset = name => window.RPENT_ASSETS?.[name] ?? (options.assetBase?new URL(`assets/${name}`,options.assetBase).href:`assets/${name}`);
  // jsDelivr can reject uncached images from large repositories.
  document.addEventListener('error', event => {
    const img = event.target;
    if (img.tagName !== 'IMG') return;
    const url = new URL(img.src);
    const match = url.pathname.match(/^\/gh\/RLinf\/misc@(main|[a-f0-9]{40})\/(rpent\/benchmarks\/assets\/.+)$/);
    if (url.hostname === 'cdn.jsdelivr.net' && match) {
      img.src = `https://raw.githubusercontent.com/RLinf/misc/${match[1]}/${match[2]}`;
    }
  }, true);
  function label(r) {
    const c=configs.get(r.configuration_id);
    if (c.display_name) return c.display_name;
    if (c.kind==='external') return c.model;
    return c.model?`RPent / ${c.model}`:'RPent / '+c.backend;
  }
  function detailLabel(r) {
    const c=configs.get(r.configuration_id);
    if(c.perception_model) return `${c.perception_model} · ${lang==='en'?'visual localization':'视觉定位'}`;
    if(c.id==='aspire'&&r.status==='derived') return '';
    if(r.evaluation_note) return tr(r.evaluation_note);
    const reasoning=c.effort==='max'&&c.reasoning===true?['max.reasoning']:[c.effort,c.reasoning===false?t('noReasoning'):c.reasoning===true?'reasoning':null];
    return [c.kind==='external'?null:c.backend, ...reasoning,
      !c.model && c.kind!=='external'?t('modelUnknown'):null].filter(Boolean).join(' · ');
  }
  function color(r, view) {
    const c=configs.get(r.configuration_id);
    if(Number(r.rate)===Number(allRows(view).find(r=>r.rate!==null)?.rate))return 'var(--best)';
    return (c.model??'').includes('Astra')?'var(--astra)':c.kind==='external'?'var(--baseline)':'var(--blue)';
  }
  const allRows = view => view.record_ids.map(id=>records.get(id)).sort((a,b)=>
    a.rate===null?b.rate===null?a.id.localeCompare(b.id):1:b.rate===null?-1:Number(b.rate)-Number(a.rate)||a.id.localeCompare(b.id));
  const count = r => r.successes!==null?`${r.successes}/${r.episodes}`:r.episodes!==null?`${t('countsOnly')}: ${r.episodes}`:'—';
  function headline(id) {
    if(id==='libero-pro') return lang==='en'?'Mean Success Across Eight Suites':'八套件平均成功率';
    if(id==='standard-libero') return lang==='en'?'Mean Success Across Four Suites':'四套件平均成功率';
    if(id==='robocasa') return lang==='en'?'Target50 Overall':'Target50 总体成功率';
    if(id==='robotwin') return lang==='en'?'Clean-to-Randomized Success':'Clean-to-Randomized 成功率';
    return tr(views.get(id).label)+' · '+t('rate');
  }
  function chart(view, kind='primary') {
    const rows=allRows(view).filter(r=>r.rate!==null);
    return `<div class="chart ${kind}" aria-label="${h(headline(view.id))}"><div class="chart-grid" aria-hidden="true">${Array.from({length:6},()=>'<i></i>').join('')}</div><div class="chart-rows">${rows.map(r=>
      `<div class="chart-row" tabindex="0" data-record="${r.id}" aria-label="${h(label(r)+', '+detailLabel(r)+', '+r.rate+'%, '+count(r))}"><div class="method-label"><span class="method-text"><span class="method-name">${h(label(r))}</span><span class="method-description">${h(detailLabel(r))}</span></span></div><div class="bar-track"><div class="bar${Number(r.rate)===0?' zero':''}" style="--value:${Number(r.rate)}%;--bar-color:${color(r,view)}"><span class="bar-value">${r.rate}%</span></div></div></div>`).join('')}</div><div class="axis" aria-hidden="true">${[0,20,40,60,80,100].map(x=>`<span>${x}</span>`).join('')}</div></div>`;
  }
  function comparisonMatrix(s) {
    const columns=s.views.map(id=>views.get(id));
    const rows=d.configurations.filter(c=>columns.some(v=>v.record_ids.some(id=>records.get(id).configuration_id===c.id&&records.get(id).rate!==null)));
    return `<details class="comparison-matrix" data-details="${s.id}"><summary>${t('allScores')} <span>${rows.length} ${lang==='en'?'configurations':'配置'}</span></summary><div class="table-wrap" tabindex="0" role="region" aria-label="${h(s.name+' '+t('allScores'))}"><table><thead><tr><th>${t('method')}</th>${columns.map(v=>`<th class="rate">${h(tr(v.label))}</th>`).join('')}</tr></thead><tbody>${rows.map(c=>{
      const sample=columns.flatMap(allRows).find(r=>r.configuration_id===c.id&&r.rate!==null);
      return `<tr data-method="${c.id}"><th scope="row"><div class="matrix-label"><span>${h(label(sample))}<small> ${h(detailLabel(sample))}</small></span></div></th>${columns.map(v=>{
        const r=allRows(v).find(r=>r.configuration_id===c.id);
        return `<td class="rate"${r?` data-matrix-record="${r.id}"`:''} title="${h(tr(r?.evaluation_note)||tr(v.label))}">${r?.rate!=null?r.rate+'%':`<span class="not-reported" aria-label="${t('unreported')}">—</span>`}</td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody></table></div></details>`;
  }
  function sectionBody(s) {
    const view=views.get(selection.get(s.id));
    return `<div class="subsection-heading"><h4>${h(tr(s.heading))}</h4>${s.summary?`<p>${h(tr(s.summary))}</p>`:''}</div><div class="chart-tools"><div class="view-controls"><label for="view-${s.id}">${t('view')}</label><select id="view-${s.id}" data-section="${s.id}" aria-label="${h(s.name+' '+t('view'))}">${s.views.map(id=>`<option value="${id}"${view.id===id?' selected':''}>${h(tr(views.get(id).label))}</option>`).join('')}</select></div><div class="chart-menu"><button type="button" class="icon-button" data-menu="${s.id}" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-${s.id}" aria-label="${t('menu')}" title="${t('menu')}"><img src="${asset('ellipsis.svg')}" alt=""></button><div class="menu-options" id="menu-${s.id}" role="menu" hidden><button role="menuitem" data-action="csv" data-section="${s.id}">${t('download')}</button><button role="menuitem" data-action="table" data-section="${s.id}">${t('table')}</button><button role="menuitem" data-action="print">${t('print')}</button></div></div></div>${chart(view)}${comparisonMatrix(s)}`;
  }
  function renderSection(s) {
    const element=document.getElementById('panel-'+s.id);
    const note=tr(s.notes);
    element.innerHTML=sectionBody(s)+(note?`<p class="scope-note">${h(note)}</p>`:'')+(s.context?`<p id="${s.id}-astra-memory" class="scope-note memory-context">${h(tr(s.context))}</p>`:'');
    setupTables(element,s.id);
  }
  function setupTables(element,key) {
    window.RPentTables.setup(element,{key,language:lang,icon:asset('arrow-down.svg'),download:asset('download.svg')});
  }
  function renderCosts() {
    const element=document.getElementById('time-token-costs');
    const groups=[['libero-pro','LIBERO-PRO'],['robocasa','RoboCasa365'],['robotwin','RoboTwin']];
    const methodOrder=new Map(d.cost_method_order.map((id,i)=>[id,i]));
    element.innerHTML=`<div class="section-inner"><h2 id="costs-heading">Time &amp; Token Costs</h2>${groups.map(([id,name])=>{
      const rows=d.cost_results.filter(r=>r.benchmark_id===id).sort((a,b)=>(methodOrder.get(a.configuration_id)??Infinity)-(methodOrder.get(b.configuration_id)??Infinity)||a.id.localeCompare(b.id));
      return `<section class="cost-group" data-cost-group="${id}"><h3>${name}</h3><div class="table-wrap" tabindex="0" role="region" aria-label="${name} Time &amp; Token Costs"><table data-sort-key="costs-${id}" data-sortable="false" data-highlight-best="false"><thead><tr><th>${t('method')}</th><th class="rate">${t('meanTime')}</th><th class="rate">${t('outputTokens')}</th></tr></thead><tbody>${rows.map(r=>{
        return `<tr data-cost-record="${r.id}" data-method="${r.configuration_id}"><td><div class="matrix-label"><span>${h(label(r))}<small> ${h(detailLabel(r))}</small></span></div></td><td class="rate" data-value="${r.mean_elapsed_seconds}">${r.mean_elapsed_seconds.toLocaleString('en-US')}</td><td class="rate" data-value="${r.total_output_tokens}">${r.total_output_tokens.toLocaleString('en-US')}</td></tr>`;
      }).join('')}</tbody></table></div></section>`;
    }).join('')}</div>`;
    setupTables(element,'costs');
  }
  function render() {
    (options.embedded?document.host:document.documentElement).lang=lang==='en'?'en':'zh-CN';
    if(!options.embedded)document.title='RPent Leaderboard';
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    const language=document.getElementById('language');language.textContent=lang==='en'?'中文':'English';language.lang=lang==='en'?'zh-CN':'en';language.setAttribute('aria-label',lang==='en'?'切换为中文':'Switch to English');
    document.getElementById('leaderboards').innerHTML=d.sections.filter(s=>!s.parent).map(s=>`<section id="${s.id}" class="benchmark-band"><div class="benchmark-shell"><h3 class="benchmark-wordmark">${h(s.name)}</h3><div id="panel-${s.id}"></div>${d.sections.filter(c=>c.parent===s.id).map(c=>`<section id="${c.id}" class="benchmark-subsection"><div id="panel-${c.id}"></div></section>`).join('')}</div></section>`).join('');
    d.sections.forEach(renderSection);renderCosts();hideTooltip();
  }
  function downloadCSV(rows, name) {
    const keys=['record_id','benchmark','view','method','model','planner','perception_model','reasoning','effort','success_rate_percent','successes','episodes','status','evaluation_note'];
    const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
    const body=[keys.join(','),...rows.map(r=>{
      const c=configs.get(r.configuration_id),v=views.get(r.view_id);
      return [r.id,v.benchmark_id,r.view_id,label(r),c.model,c.backend,c.perception_model,c.reasoning,c.effort,r.rate,r.successes,r.episodes,r.status,tr(r.evaluation_note)].map(quote).join(',');
    })].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type:'text/csv;charset=utf-8'}));
    const a=globalThis.document.createElement('a');a.href=url;a.download=name+'.csv';(document.body??document).append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
    document.getElementById('announcement').textContent=t('saved');
  }
  function closeMenus(focus=false) {
    document.querySelectorAll('[data-menu][aria-expanded="true"]').forEach(button=>{document.getElementById('menu-'+button.dataset.menu).hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus();});
  }
  const tip=document.getElementById('chart-tooltip');
  let dismissedRecord=null;
  function hideTooltip(){tip.hidden=true;document.querySelectorAll('[aria-describedby="chart-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
  function showTooltip(row,event) {
    if(row.dataset.record===dismissedRecord)return;
    const r=records.get(row.dataset.record);
    tip.innerHTML=`<strong>${h(label(r))}</strong><span class="tip-value">${r.rate}%</span><p>${h(detailLabel(r))}</p><p>${h(tr(views.get(r.view_id).label))} · ${h(count(r))}</p>`;
    tip.hidden=false;row.setAttribute('aria-describedby','chart-tooltip');
    const rect=row.getBoundingClientRect();
    const x=event?.clientX??rect.left+rect.width*.6,y=event?.clientY??rect.top;
    const box=tip.getBoundingClientRect();
    tip.style.left=Math.max(8,Math.min(x+15,window.innerWidth-box.width-8))+'px';
    tip.style.top=Math.max(8,Math.min(y+15,window.innerHeight-box.height-8))+'px';
  }
  document.addEventListener('change',e=>{
    const select=e.target.closest('select[data-section]');if(!select)return;
    const id=select.dataset.section;selection.set(id,select.value);renderSection(d.sections.find(s=>s.id===id));
    document.getElementById('view-'+id).focus({preventScroll:true});hideTooltip();
    try{const url=new URL(location.href);url.searchParams.set('view',selection.get(id));url.searchParams.set('lang',lang);history.replaceState(null,'',url);}catch{/* file previews need no history support */}
  });
  document.addEventListener('click',e=>{
    const anchor=e.target.closest('a[href^="#"]');
    if(options.embedded&&anchor){const target=document.getElementById(anchor.hash.slice(1));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}}
    const langButton=e.target.closest('#language');if(langButton){lang=lang==='en'?'zh':'en';render();try{const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);}catch{}return;}
    const menu=e.target.closest('[data-menu]');if(menu){const wasOpen=menu.getAttribute('aria-expanded')==='true';closeMenus();if(!wasOpen){menu.setAttribute('aria-expanded','true');const panel=document.getElementById('menu-'+menu.dataset.menu);panel.hidden=false;panel.querySelector('button').focus();}return;}
    const action=e.target.closest('[data-action]');if(action){
      if(action.dataset.action==='csv')downloadCSV(allRows(views.get(selection.get(action.dataset.section))).filter(r=>r.rate!==null),selection.get(action.dataset.section));
      if(action.dataset.action==='print')window.print();
      if(action.dataset.action==='table'){const el=document.querySelector(`[data-details="${action.dataset.section}"]`);el.open=true;el.querySelector('summary').focus({preventScroll:true});}
      closeMenus(action.dataset.action!=='table');return;
    }
    if(!e.target.closest('.chart-menu'))closeMenus();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){dismissedRecord=document.querySelector('[aria-describedby="chart-tooltip"]')?.dataset.record??null;closeMenus(true);hideTooltip();}
    const item=e.target.closest('[role="menuitem"]');
    if(item&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault();const items=[...item.parentElement.children],i=items.indexOf(item);
      items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();
    }
  });
  document.addEventListener('pointerover',e=>{const row=e.target.closest('.chart-row');if(row&&e.pointerType!=='touch')showTooltip(row,e);});
  document.addEventListener('pointermove',e=>{const row=e.target.closest('.chart-row');if(row&&!tip.hidden)showTooltip(row,e);});
  document.addEventListener('pointerout',e=>{const row=e.target.closest('.chart-row');if(row&&!row.contains(e.relatedTarget)){dismissedRecord=null;hideTooltip();}});
  document.addEventListener('focusin',e=>{const row=e.target.closest('.chart-row');if(row){dismissedRecord=null;showTooltip(row);}});
  document.addEventListener('focusout',e=>{if(e.target.closest('.chart-row')){dismissedRecord=null;hideTooltip();}});
  window.addEventListener('scroll',hideTooltip,{passive:true});window.addEventListener('resize',hideTooltip);
  render();
  if(options.embedded){
    const scrollToAnchor=()=>document.getElementById(location.hash.slice(1))?.scrollIntoView();
    window.addEventListener('hashchange',scrollToAnchor);
    if(location.hash)requestAnimationFrame(scrollToAnchor);
  }
  }
  window.RPentLeaderboard={mount};
  const data=document.getElementById('results-data');
  if(data)mount(document,JSON.parse(data.textContent));
})();
