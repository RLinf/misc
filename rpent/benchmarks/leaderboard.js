/* EMBEDDED_ASSETS */
(() => {
  'use strict';
  function mount(root, d, options={}) {
  const document = root;
  const query = new URLSearchParams(location.search);
  let lang = options.language ?? (query.get('lang') === 'zh' ? 'zh' : 'en');
  const views = new Map(d.views.map(v => [v.id, v]));
  const configs = new Map(d.configurations.map(c => [c.id, c]));
  const records = new Map(d.results.map(r => [r.id, r]));
  const sources = new Map(d.sources.map(s => [s.id, s]));
  const protocols = new Map(d.protocols.map(p => [p.id, p]));
  const selection = new Map(d.sections.map(s => [s.id, s.default_view]));
  if (views.has(query.get('view'))) {
    const s = d.sections.find(s => s.views.includes(query.get('view')));
    if (s) selection.set(s.id, query.get('view'));
  }
  const opened = new Set();
  let analysisTab = 'invocations';
  const copy = {
    en: {
      paper:'Paper', sources:'Sources', title:'Benchmark Results', subtitle:'Memory-guided agents. Frozen policies. Measured task success.',
      preview:'VERIFIED RESULTS', reproduction:'Reproduction', analysis:'Analysis', analysisHeading:'Inside the harness',
      analysisScope:'Mechanism analysis, separate from benchmark rankings.', provenance:'PROVENANCE', sourcesHeading:'Results, with their context',
      footer:'Paper results, repository reports and contributor evaluations retain their own provenance.', backTop:'Back to top ↑',
      view:'Evaluation', rate:'Success rate', method:'Method / model', count:'Successful / evaluated', source:'Source',
      new:'NEW', unreported:'Not reported', effortUnknown:'Effort not reported', modelUnknown:'Model not reported', noReasoning:'no reasoning',
      reference:'Reference method', baseline:'Reference methods', agent:'RPent', astra:'GPT-6 Astra',
      details:'Results & task-level evidence', table:'Results table', download:'Download CSV', print:'Print page', menu:'Chart options',
      countsOnly:'Evaluated', protocol:'Protocol', notes:'Evaluation notes',
      task:'Task', suite:'Suite', mean:'Mean', success:'Success', failure:'Failure',
      astraTitle:'GPT-6 Astra · low · reasoning · eight completed suites', astraNote:'800 episodes: 741 successes, 59 failures. Overall: 92.63% (741/800). All 80 tasks and their ten evaluation seeds are reported.',
      astraBatch:'Each batch uses its own frozen exploration memory. GPT-6 Astra uses low effort with reasoning enabled.',
      zeroTitle:'Per-task success · paper Table 5', zeroNote:'Each cell retains the source percentage. RPent uses ten evaluation seeds per task; external counts follow their source.',
      roboTitle:'GPT-5.6 · xhigh · reasoning · 50 task aggregates', roboNote:'The 57.00% reproduction only. These are aggregate counts, not individual seed outcomes or Astra results.',
      invocationTab:'VLA invocation', attributionTab:'Completion attribution', usageTab:'Primitive usage',
      invocationNote:'Original Figure 4, Harness VLA v4. Success as the allowed number of VLA invocations increases. Curves are preserved as published; point values have not been estimated. Zhang et al., CC BY 4.0.',
      attributionNote:'Original Figure 6, Harness VLA v4. Share of successful rollouts whose final success predicate follows an analytic or VLA primitive. This is an attribution statistic, not a benchmark success rate. Zhang et al., CC BY 4.0.',
      usageNote:'Tables 18–19, Harness VLA v4. Counts and rounded shares are transcribed from the paper. Unavailable primitives remain missing, not zero. These are invocation shares, not task success rates.',
      calls:'calls', primitive:'Primitive', total:'Total', analytic:'Analytic',
      scopeHeading:'Comparable scopes, explicit sources', scopeNote:'Rankings apply only to the selected evaluation coverage. Paper baselines, later repository reproductions and newly contributed evaluations keep their own model and protocol metadata. They are not a controlled model-only comparison.',
      newHeading:'New results', newNote:'Contributor reports include four LIBERO-PRO scores, one RoboCasa Target50 score and two RoboTwin C2R scores. GPT-5.6 reasoning uses xhigh; GPT-6 Astra uses low with reasoning. The no-reasoning control remains separate. Unreported outcomes and success counts are not inferred.',
      versionHeading:'Versioned evidence', coverageHeading:'Source coverage checklist', coverage:'Coverage', section:'Section',
      readDocs:'English results preview', readZhDocs:'中文结果预览', downloadAll:'Download all result records',
      saved:'CSV downloaded', onlySix:'Astra: 8 completed suites · 800 episodes · Overall 92.63% (741/800).',
      allScores:'All methods & reported scores', matrixNote:'Each column retains its own scope. Missing results are not zero; no missing Overall is reconstructed.',
      iconNote:'Project and provider marks identify methods, not endorsements. Where a verified mark is unavailable, a neutral pictogram is used.',
      neutralMark:'Neutral pictogram, not an official project logo', issue:'Source citation unresolved',
    },
    zh: {
      paper:'论文', sources:'来源', title:'Benchmark 实验结果', subtitle:'记忆引导的智能体，冻结的策略模型，可核对的任务成功率。',
      preview:'已核验结果', reproduction:'复现记录', analysis:'实验分析', analysisHeading:'Harness 的作用机制',
      analysisScope:'机制分析独立展示，不参与 benchmark 排名。', provenance:'数据溯源', sourcesHeading:'结果与评测背景',
      footer:'论文结果、仓库报告与新增实验分别保留来源及统计口径。', backTop:'返回顶部 ↑',
      view:'评测范围', rate:'成功率', method:'方法 / 模型', count:'成功 / 评测回合', source:'来源',
      new:'新增', unreported:'未报告', effortUnknown:'未报告 effort', modelUnknown:'未报告模型', noReasoning:'无推理',
      reference:'参考方法', baseline:'参考方法', agent:'RPent', astra:'GPT-6 Astra',
      details:'结果与逐任务证据', table:'结果明细表', download:'下载 CSV', print:'打印页面', menu:'图表选项',
      countsOnly:'已评测', protocol:'协议', notes:'评测说明',
      task:'任务', suite:'套件', mean:'均值', success:'成功', failure:'失败',
      astraTitle:'GPT-6 Astra · low · reasoning · 八个已完成套件', astraNote:'800 回合：741 成功、59 失败。Overall：92.63%（741/800）。包含全部 80 个任务及各任务的十个评测 seeds。',
      astraBatch:'各批次使用独立冻结的探索记忆。GPT-6 Astra 使用 low effort 并开启 reasoning。',
      zeroTitle:'逐任务成功率 · 论文表 5', zeroNote:'保留来源报告的百分比。RPent 每任务评测 10 个 seeds，外部方法的样本量沿用其原始来源。',
      roboTitle:'GPT-5.6 · xhigh · reasoning · 完整 50 任务汇总', roboNote:'仅属于 57.00% 的复现实验，是任务级计数，不是逐 seed 成败记录或 Astra 成绩。',
      invocationTab:'VLA 调用次数', attributionTab:'任务完成归因', usageTab:'Primitive 使用统计',
      invocationNote:'Harness VLA v4 原始图 4：随着允许的 VLA 调用次数增加，任务成功率的变化。保留原始曲线，不估读或编造点值。Zhang 等，CC BY 4.0。',
      attributionNote:'Harness VLA v4 原始图 6：成功回合中，最终成功条件在 analytic 或 VLA primitive 后触发的占比。这是归因统计，不是 benchmark 成功率。Zhang 等，CC BY 4.0。',
      usageNote:'Harness VLA v4 表 18–19，按论文保留调用次数和取整占比。未提供的 primitive 标为缺失，不记为零。这是调用占比，不是任务成功率。',
      calls:'次调用', primitive:'Primitive', total:'合计', analytic:'Analytic',
      scopeHeading:'统计口径明确，来源可查', scopeNote:'排名只适用于当前所选评测范围。论文基线、后续仓库复现和新增实验分别保留模型及协议信息，不视为仅替换模型的受控对比。',
      newHeading:'新增结果', newNote:'用户提供四项 LIBERO-PRO、一项 RoboCasa Target50 和两项 RoboTwin C2R 成绩。GPT-5.6 推理实验使用 xhigh，GPT-6 Astra 使用 low 并开启 reasoning；无推理对照单独保留。不推断未提供的结果和成功次数。',
      versionHeading:'版本化证据', coverageHeading:'来源覆盖清单', coverage:'覆盖内容', section:'页面区域',
      readDocs:'English results preview', readZhDocs:'中文结果预览', downloadAll:'下载全部结果记录',
      saved:'CSV 已下载', onlySix:'Astra：8 个已完成套件、800 回合；Overall 92.63%（741/800）。',
      allScores:'完整方法与已报告分项', matrixNote:'各列保留独立统计范围。缺失不等于零，不推算缺失的 Overall。',
      iconNote:'项目和提供方图标仅用于识别方法，不表示背书。未取得可核验标识的方法使用中性图示。',
      neutralMark:'中性图示，非项目官方 logo', issue:'原文引用待核对',
    },
  };
  const t = key => copy[lang][key] ?? key;
  const tr = value => value && typeof value === 'object' ? value[lang] ?? value.en : value;
  const h = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const asset = name => window.RPENT_ASSETS?.[name] ?? (options.assetBase?new URL(`assets/${name}`,options.assetBase).href:`assets/${name}`);
  const sourceLink = id => {
    const s=sources.get(id);
    const url=s.url&&options.assetBase?new URL(s.url,options.assetBase).href:s.url;
    return `<a href="${h(url ?? '#source-'+s.id)}"${url?' target="_blank" rel="noopener"':''}>${h(tr(s.label))}</a>`;
  };
  function label(r) {
    const c=configs.get(r.configuration_id);
    if (c.kind==='external') return c.model;
    if(c.backend==='Task card') return c.model?`Task card / ${c.model}`:'Task Card';
    return c.model?`RPent / ${c.model}`:'RPent / '+c.backend;
  }
  function detailLabel(r) {
    const c=configs.get(r.configuration_id);
    return [c.kind==='external'?t('reference'):c.backend, c.effort, c.reasoning===false?t('noReasoning'):c.reasoning===true?'reasoning':null,
      r.batch?tr(r.batch):r.new_result?(lang==='en'?'New evaluation':'新增实验'):null,
      !c.model && c.kind!=='external'&&r.view_id!=='task-card-object'?t('modelUnknown'):null].filter(Boolean).join(' · ');
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
    if(id==='robocasa') return lang==='en'?'Reported Overall Success':'原报告 Overall 成功率';
    if(id==='reproduction-overall') return lang==='en'?'Mean Success Across 50 Tasks':'50 个任务等权成功率';
    if(id==='robotwin') return lang==='en'?'Clean-to-Randomized Success':'Clean-to-Randomized 成功率';
    if(id==='task-card-object') return lang==='en'?'Success Across 200 Episodes':'200 回合成功率';
    return tr(views.get(id).label)+' · '+t('rate');
  }
  function methodIcons(configurationId) {
    const marks=d.method_icons[configurationId];
    return `<span class="method-mark${marks.length>1?' paired':''}" aria-hidden="true">${marks.map(m=>{
      const neutral=d.method_assets.find(a=>a.file===m.file).kind==='neutral';
      return `<span class="mark-image${m.crop?' symbol-crop':''}${neutral?' neutral-mark':''}" title="${h(m.label+(neutral?' · '+t('neutralMark'):''))}"><img src="${asset(m.file)}" alt="" width="24" height="24"></span>`;
    }).join('')}</span>`;
  }
  function chart(view, kind='primary') {
    const rows=allRows(view).filter(r=>r.rate!==null);
    return `<div class="chart ${kind}" aria-label="${h(headline(view.id))}"><div class="chart-grid" aria-hidden="true">${Array.from({length:6},()=>'<i></i>').join('')}</div><div class="chart-rows">${rows.map(r=>
      `<div class="chart-row" tabindex="0" data-record="${r.id}" aria-label="${h(label(r)+', '+detailLabel(r)+', '+r.rate+'%, '+count(r))}"><div class="method-label">${methodIcons(r.configuration_id)}<span class="method-text"><span class="method-name">${h(label(r))}${r.new_result?`<span class="new-label">${t('new')}</span>`:''}</span><span class="method-description">${h(detailLabel(r))}</span></span></div><div class="bar-track"><div class="bar${Number(r.rate)===0?' zero':''}" style="--value:${Number(r.rate)}%;--bar-color:${color(r,view)}"><span class="bar-value">${r.rate}%</span></div></div></div>`).join('')}</div><div class="axis" aria-hidden="true">${[0,20,40,60,80,100].map(x=>`<span>${x}</span>`).join('')}</div></div>`;
  }
  function comparisonMatrix(s) {
    if(s.views.length<2) return '';
    const columns=s.views.map(id=>views.get(id));
    const rows=d.configurations.filter(c=>columns.some(v=>v.record_ids.some(id=>records.get(id).configuration_id===c.id&&records.get(id).rate!==null)));
    return `<details class="comparison-matrix"${s.id==='libero-pro'?' open':''}><summary>${t('allScores')} <span>${rows.length} ${lang==='en'?'configurations':'配置'}</span></summary><p>${t('matrixNote')}</p><div class="table-wrap" tabindex="0" role="region" aria-label="${h(s.name+' '+t('allScores'))}"><table><thead><tr><th>${t('method')}</th>${columns.map(v=>`<th class="rate">${h(tr(v.label))}</th>`).join('')}</tr></thead><tbody>${rows.map(c=>{
      const sample=columns.flatMap(allRows).find(r=>r.configuration_id===c.id&&r.rate!==null);
      return `<tr data-method="${c.id}"><th scope="row"><div class="matrix-label">${methodIcons(c.id)}<span>${h(label(sample))}<small>${h(detailLabel(sample))}</small></span></div></th>${columns.map(v=>{
        const r=allRows(v).find(r=>r.configuration_id===c.id);
        return `<td class="rate"${r?` data-matrix-record="${r.id}"`:''} title="${h(tr(v.scope)+(r?' · '+r.source_ids.map(id=>tr(sources.get(id).label)).join(' · '):''))}">${r?.rate!=null?r.rate+'%':`<span class="not-reported" aria-label="${t('unreported')}">—</span>`}</td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody></table></div></details>`;
  }
  function resultsTable(view) {
    return `<div class="table-wrap"><table><thead><tr><th>${t('method')}</th><th class="rate">${t('rate')}</th><th>${t('count')}</th><th>${t('source')}</th></tr></thead><tbody>${allRows(view).map(r=>
      `<tr data-table-record="${r.id}"><td>${h(label(r))}<br><small>${h(detailLabel(r))}</small></td><td class="rate">${r.rate===null?t('unreported'):r.rate+'%'}</td><td>${h(count(r))}</td><td>${r.source_ids.map(sourceLink).join('<br>')}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function astraEvidence(view) {
    const suites=d.astra.suites.filter(s=>view.id==='libero-pro'||s.view_id===view.id);
    if(!suites.length) return '';
    return `<div class="subdetail astra-evidence"><h3>${t('astraTitle')}</h3><p>${t('astraNote')} ${t('astraBatch')}</p><div class="table-wrap"><table><thead><tr><th>${t('suite')}</th><th>${t('count')}</th><th class="rate">${t('rate')}</th></tr></thead><tbody>${suites.map(s=>`<tr><td>${h(s.suite)}</td><td>${s.successes}/${s.completed}</td><td class="rate">${s.rate}%</td></tr>`).join('')}</tbody></table></div>${suites.map(s=>`<details class="task-matrix"><summary class="detail-toggle">${h(s.suite)} · 10 ${lang==='en'?'tasks':'任务'}</summary><div class="table-wrap"><table><thead><tr><th>ID</th><th>${t('task')}</th>${d.astra.evaluation_seeds.map(n=>`<th>s${n}</th>`).join('')}<th class="rate">${t('rate')}</th></tr></thead><tbody>${s.tasks.map(task=>`<tr data-astra-task="${s.view_id}-${task.task_id}"><td>${task.task_id}</td><td class="task-name">${h(task.task_language)}</td>${task.seed_outcomes.map(ok=>`<td class="outcome${ok?'':' fail'}" aria-label="${ok?t('success'):t('failure')}">${ok?'S':'F'}</td>`).join('')}<td class="rate">${task.seed_outcomes.filter(Boolean).length*10}%</td></tr>`).join('')}</tbody></table></div></details>`).join('')}</div>`;
  }
  function zeroEvidence(view) {
    const rows=d.task_results.filter(r=>r.view_id===view.id);
    if(!rows.length) return '';
    return `<div class="subdetail"><h3>${t('zeroTitle')}</h3><p>${t('zeroNote')}</p><div class="table-wrap"><table><thead><tr><th>${t('method')}</th>${rows[0].task_ids.map(i=>`<th class="rate">${t('task')} ${i}</th>`).join('')}<th class="rate">${t('mean')}</th></tr></thead><tbody>${rows.map(r=>`<tr data-paper-tasks="${r.view_id}-${r.configuration_id}"><td>${h(configs.get(r.configuration_id).model)}</td>${r.rates.map(x=>`<td class="rate">${x}%</td>`).join('')}<td class="rate">${d.results.find(x=>x.view_id===view.id&&x.configuration_id===r.configuration_id).rate}%</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function roboEvidence(view) {
    if(view.benchmark_id!=='robocasa-reproduction') return '';
    const match={atomic:'Atomic',seen:'Composite-Seen',unseen:'Composite-Unseen'}[view.id.replace('reproduction-','')];
    const tasks=d.robocasa_tasks.filter(task=>!match||task.split===match);
    return `<div class="subdetail"><h3>${t('roboTitle')}</h3><p>${t('roboNote')}</p><div class="table-wrap"><table><thead><tr><th>#</th><th>Split</th><th>${t('task')}</th><th>${t('count')}</th><th class="rate">${t('rate')}</th></tr></thead><tbody>${tasks.map(task=>`<tr data-robo-task="${task.task}"><td>${task.id}</td><td>${task.split}</td><td class="task-name">${h(task.task)}</td><td>${task.successes}/${task.episodes}</td><td class="rate">${task.successes/task.episodes*100}%</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function sectionBody(s) {
    const view=views.get(selection.get(s.id));
    const missing=allRows(view).filter(r=>r.rate===null);
    const allSources=[...new Set(allRows(view).filter(r=>r.rate!==null).flatMap(r=>r.source_ids))];
    return `<div class="benchmark-shell"><div class="benchmark-heading"><div class="benchmark-wordmark">${h(s.name)}<span class="suffix">${h(tr(s.suffix))}</span></div><div class="chart-title"><h2>${h(headline(view.id))}</h2><p>${h(tr(view.scope))}</p></div></div><div class="chart-tools"><div class="view-controls"><label for="view-${s.id}">${t('view')}</label><select id="view-${s.id}" data-section="${s.id}" aria-label="${h(s.name+' '+t('view'))}">${s.views.map(id=>`<option value="${id}"${view.id===id?' selected':''}>${h(tr(views.get(id).label))}</option>`).join('')}</select></div><div class="tools-right"><div class="legend" aria-label="${t('agent')}, ${t('astra')}, ${t('baseline')}"><span><i></i>${t('agent')}</span><span><i class="astra"></i>${t('astra')}</span><span><i class="baseline"></i>${t('baseline')}</span></div><div class="chart-menu"><button type="button" class="icon-button" data-menu="${s.id}" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-${s.id}" aria-label="${t('menu')}" title="${t('menu')}"><img src="${asset('ellipsis.svg')}" alt=""></button><div class="menu-options" id="menu-${s.id}" role="menu" hidden><button role="menuitem" data-action="csv" data-section="${s.id}">${t('download')}</button><button role="menuitem" data-action="table" data-section="${s.id}">${t('table')}</button><button role="menuitem" data-action="print">${t('print')}</button></div></div></div></div>${chart(view)}<div class="chart-caption"><p>${h(tr(s.note))}</p>${s.id==='libero-pro'?`<p>${t('onlySix')}</p>`:''}<p class="source-links">${allSources.map(sourceLink).join(' ')}</p>${missing.length?`<details class="missing"><summary>${t('unreported')} (${missing.length})</summary><p>${missing.map(r=>h(label(r)+' · '+detailLabel(r))).join('; ')}</p></details>`:''}</div><details class="result-details" data-details="${s.id}"${opened.has(s.id)?' open':''}><summary class="detail-toggle">${t('details')}</summary>${resultsTable(view)}${s.id==='libero-pro'?astraEvidence(view):''}${zeroEvidence(view)}${roboEvidence(view)}<div class="subdetail"><h3>${t('notes')}</h3>${[...new Set(allRows(view).filter(r=>r.rate!==null).map(r=>r.protocol_id))].map(id=>`<p>${h(tr(protocols.get(id)?.description))}</p>`).join('')}</div></details></div>`;
  }
  function renderSection(s) {
    const element=document.getElementById(s.id);
    element.innerHTML=sectionBody(s);
    element.querySelector('.benchmark-shell').insertAdjacentHTML('beforeend',comparisonMatrix(s));
    setupTables(element,s.id+':'+selection.get(s.id));
    element.querySelector('[data-details]').addEventListener('toggle', e=>{
      if(e.target.open) opened.add(s.id); else opened.delete(s.id);
    });
  }
  function renderAnalysis() {
    const tabs=[['invocations','invocationTab'],['attribution','attributionTab'],['usage','usageTab']];
    let body='';
    if(analysisTab==='invocations') body=`<div class="paper-figures">${[['libero','LIBERO-PRO'],['robocasa','RoboCasa365'],['robotwin','RoboTwin C2R']].map(([name,title])=>`<figure><img src="${asset('invocations-'+name+'.png')}" alt="${title}: ${t('invocationTab')}" loading="lazy"><figcaption>${title}</figcaption></figure>`).join('')}</div><p class="paper-note">${t('invocationNote')} ${sourceLink('paper-figure-4')}</p>`;
    if(analysisTab==='attribution') body=`<div class="paper-figures single"><figure><img src="${asset('completion-attribution.png')}" alt="${t('attributionTab')}" loading="lazy"></figure></div><p class="paper-note">${t('attributionNote')} ${sourceLink('paper-figure-6')}</p>`;
    if(analysisTab==='usage') body=`<div class="usage-charts">${d.analysis.environments.map((name,i)=>`<div class="usage-column"><h3>${name}</h3>${d.analysis.classes.map(c=>`<div class="usage-row${c.name==='VLA'?' vla':''}"><div class="usage-label"><span>${c.name}</span><span>${c.percentages[i]}%</span></div><div class="usage-track"><div class="usage-fill" style="--value:${c.percentages[i]}%"></div></div><small>${c.counts[i].toLocaleString('en-US')} ${t('calls')}</small></div>`).join('')}</div>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>${t('primitive')}</th>${d.analysis.environments.map(n=>`<th class="rate">${n}</th>`).join('')}</tr></thead><tbody>${d.analysis.rows.map(row=>`<tr><td>${row.name}</td>${row.counts.map((v,i)=>`<td class="rate">${v===null?'—':`${v.toLocaleString('en-US')} (${row.percentages[i]}%)`}</td>`).join('')}</tr>`).join('')}<tr><td>${t('total')}</td>${d.analysis.totals.map(v=>`<td class="rate">${v.toLocaleString('en-US')} (100.0%)</td>`).join('')}</tr></tbody></table></div><p class="paper-note">${t('usageNote')} ${sourceLink('paper-table-18')} · ${sourceLink('paper-table-19')}</p>`;
    document.getElementById('analysis-content').innerHTML=`<div class="analysis-tabs" role="tablist" aria-label="${t('analysis')}">${tabs.map(([id,key])=>`<button type="button" role="tab" id="tab-${id}" data-analysis="${id}" aria-selected="${analysisTab===id}" aria-controls="analysis-panel" tabindex="${analysisTab===id?0:-1}">${t(key)}</button>`).join('')}</div><div role="tabpanel" id="analysis-panel" aria-labelledby="tab-${analysisTab}">${body}</div>`;
    setupTables(document.getElementById('analysis-content'),'analysis:'+analysisTab);
  }
  function setupTables(element,key) {
    window.RPentTables.setup(element,{key,language:lang,icon:asset('arrow-down.svg'),download:asset('download.svg')});
  }
  function renderSources() {
    document.getElementById('source-content').innerHTML=`<div class="source-grid"><ul class="source-list">${d.sources.map(s=>`<li id="source-${s.id}">${sourceLink(s.id)}<p>${h(s.description?tr(s.description):s.table_number?`Harness VLA · 2607.08448v4 · ${t('source')} ${s.table_number}`:s.id.startsWith('astra')?`Snapshot ${d.astra.source_report_sha256.slice(0,12)} · ${d.astra.completed} episodes`:'Harness VLA · 2607.08448v4')}</p></li>`).join('')}</ul><div class="source-notes"><h3>${t('scopeHeading')}</h3><p>${t('scopeNote')}</p><h3>${t('newHeading')}</h3><p>${t('newNote')}</p><h3>${t('versionHeading')}</h3><p>RPent main<br><code>${d.repository_revision}</code></p><p>Existing result snapshot<br><code>${d.prior_media_revision}</code></p><p>Astra source SHA-256<br><code>${d.astra.source_report_sha256}</code></p><p>Harness VLA: ${d.paper_revision}</p><div class="footer-links"><button type="button" data-action="all-csv">${t('downloadAll')}</button><a href="https://rpent.readthedocs.io/en/latest/rst_source/benchmarks.html">${t('readDocs')}</a><a href="https://rpent.readthedocs.io/zh-cn/latest/rst_source/benchmarks.html">${t('readZhDocs')}</a></div></div></div><h3 class="coverage-title">${t('coverageHeading')}</h3><div class="table-wrap"><table class="coverage"><thead><tr><th>${t('source')}</th><th>${t('coverage')}</th><th>${t('section')}</th></tr></thead><tbody>${d.coverage.map(c=>`<tr><td>${sourceLink(c.source_id)}</td><td>${h(tr(c.description))}</td><td><a href="#${c.section}">${h(d.sections.find(s=>s.id===c.section)?.name??t('analysis'))}</a></td></tr>`).join('')}</tbody></table></div>`;
    document.getElementById('source-content').insertAdjacentHTML('beforeend',`<p class="paper-note">${t('iconNote')}</p>`);
    if(options.embedded)document.querySelectorAll('a[href^="docs-preview/"]').forEach(a=>{
      a.href=`https://rpent.readthedocs.io/${a.getAttribute('href').includes('/zh.')?'zh-cn':'en'}/latest/rst_source/benchmarks.html`;
    });
    if(location.protocol==='file:'&&window.RPENT_ASSETS){
      // The standalone file is self-contained; source tables are available in-page.
      document.querySelectorAll('a[href^="docs-preview/"]').forEach(a=>{a.href='#libero-pro';a.textContent=lang==='en'?'Results & task evidence':'结果与任务证据';a.dataset.openAll='true';});
    }
  }
  function render() {
    (options.embedded?document.host:document.documentElement).lang=lang==='en'?'en':'zh-CN';
    if(!options.embedded)document.title=lang==='en'?'RPent Bench | Benchmark Results':'RPent Bench | 实验结果';
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    const language=document.getElementById('language');language.textContent=lang==='en'?'中文':'English';language.lang=lang==='en'?'zh-CN':'en';language.setAttribute('aria-label',lang==='en'?'切换为中文':'Switch to English');
    document.getElementById('leaderboards').innerHTML=d.sections.map(s=>`<section id="${s.id}" class="benchmark-band" aria-label="${h(s.name+' '+tr(s.suffix))}"></section>`).join('');
    d.sections.forEach(renderSection);renderAnalysis();renderSources();hideTooltip();
  }
  function downloadCSV(rows, name) {
    const keys=['record_id','benchmark','view','method','model','planner','reasoning','effort','success_rate_percent','successes','episodes','status','protocol_id','source_ids','sources','protocol_notes','source_caveat'];
    const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
    const body=[keys.join(','),...rows.map(r=>{
      const c=configs.get(r.configuration_id),v=views.get(r.view_id);
      return [r.id,v.benchmark_id,r.view_id,label(r),c.model,c.backend,c.reasoning,c.effort,r.rate,r.successes,r.episodes,r.status,r.protocol_id,r.source_ids.join(' | '),
        r.source_ids.map(id=>sources.get(id).url??tr(sources.get(id).label)).join(' | '),tr(protocols.get(r.protocol_id).description),tr(d.result_annotations[r.id])??''].map(quote).join(',');
    })].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type:'text/csv;charset=utf-8'}));
    const a=globalThis.document.createElement('a');a.href=url;a.download=name+'.csv';(document.body??document).append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
    document.getElementById('announcement').textContent=t('saved');
  }
  function closeMenus(focus=false) {
    document.querySelectorAll('[data-menu][aria-expanded="true"]').forEach(button=>{document.getElementById('menu-'+button.dataset.menu).hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus();});
  }
  const tip=document.getElementById('chart-tooltip');
  function hideTooltip(){tip.hidden=true;document.querySelectorAll('[aria-describedby="chart-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
  function showTooltip(row,event) {
    const r=records.get(row.dataset.record),c=configs.get(r.configuration_id);
    tip.innerHTML=`<strong>${h(label(r))}</strong><span class="tip-value">${r.rate}%</span><p>${h(detailLabel(r))}</p><p>${h(tr(views.get(r.view_id).scope))}</p><p>${h(count(r))}</p>${c.kind!=='external'&&c.effort===null&&c.reasoning!==false?`<p>${t('effortUnknown')}</p>`:''}<p class="tip-source">${r.source_ids.map(id=>h(tr(sources.get(id).label))).join(' · ')}</p>`;
    if(d.result_annotations[r.id])tip.insertAdjacentHTML('beforeend',`<p class="source-caveat">${h(tr(d.result_annotations[r.id]))}</p>`);
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
      if(action.dataset.action==='csv')downloadCSV(allRows(views.get(selection.get(action.dataset.section))),selection.get(action.dataset.section));
      if(action.dataset.action==='all-csv')downloadCSV([...d.results].sort((a,b)=>a.rate===null?b.rate===null?a.id.localeCompare(b.id):1:b.rate===null?-1:Number(b.rate)-Number(a.rate)||a.id.localeCompare(b.id)),'rpent-all-results');
      if(action.dataset.action==='print')window.print();
      if(action.dataset.action==='table'){const el=document.querySelector(`[data-details="${action.dataset.section}"]`);el.open=true;el.querySelector('summary').focus({preventScroll:true});}
      closeMenus(action.dataset.action!=='table');return;
    }
    const tab=e.target.closest('[data-analysis]');if(tab){analysisTab=tab.dataset.analysis;renderAnalysis();document.getElementById('tab-'+analysisTab).focus({preventScroll:true});return;}
    if(e.target.closest('[data-open-all]'))document.querySelectorAll('.result-details').forEach(el=>el.open=true);
    if(!e.target.closest('.chart-menu'))closeMenus();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeMenus(true);hideTooltip();}
    const tab=e.target.closest('[data-analysis]');
    if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();const ids=['invocations','attribution','usage'];let i=ids.indexOf(analysisTab);
      i=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
      analysisTab=ids[i];renderAnalysis();document.getElementById('tab-'+analysisTab).focus({preventScroll:true});
    }
    const item=e.target.closest('[role="menuitem"]');
    if(item&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault();const items=[...item.parentElement.children],i=items.indexOf(item);
      items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();
    }
  });
  document.addEventListener('pointerover',e=>{const row=e.target.closest('.chart-row');if(row&&e.pointerType!=='touch')showTooltip(row,e);});
  document.addEventListener('pointermove',e=>{const row=e.target.closest('.chart-row');if(row&&!tip.hidden)showTooltip(row,e);});
  document.addEventListener('pointerout',e=>{const row=e.target.closest('.chart-row');if(row&&!row.contains(e.relatedTarget))hideTooltip();});
  document.addEventListener('focusin',e=>{const row=e.target.closest('.chart-row');if(row)showTooltip(row);});
  document.addEventListener('focusout',e=>{if(e.target.closest('.chart-row'))hideTooltip();});
  window.addEventListener('scroll',hideTooltip,{passive:true});window.addEventListener('resize',hideTooltip);
  render();
  }
  window.RPentLeaderboard={mount};
  const data=document.getElementById('results-data');
  if(data)mount(document,JSON.parse(data.textContent));
})();
