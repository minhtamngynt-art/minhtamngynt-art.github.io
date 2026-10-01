// Edit projects-data.json, then run: node build-projects.cjs
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,projects=JSON.parse(fs.readFileSync(path.join(root,'projects-data.json'),'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>'<ul>'+items.map(s=>`<li>${esc(s)}</li>`).join('')+'</ul>';
const link=p=>`projects/${p.slug}.html`;
const stages=[['diabetic-retinopathy','Build classifiers'],['brain-mri','Audit reliability'],['amd-oct','Examine explanations'],['emd-corr','Develop methods']];
const cards=projects.map(p=>`<article class="research-card${p.latest?' research-featured':''}">
<div class="research-card-copy"><p class="research-badge">${p.latest?'Latest research · ':''}${esc(p.focus)}</p><p class="research-venue">${esc(p.venue)}</p><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><p class="research-tags">${esc(p.tags)}</p><a class="research-link" href="${link(p)}" target="_blank" rel="noopener">View project ↗<span class="sr-only"> (opens in a new tab)</span></a></div>
<div class="research-card-evidence"><strong>${esc(p.metric)}</strong><p>${esc(p.metricNote)}</p><p class="research-growth"><span>Research development</span>${esc(p.progress)}</p></div></article>`);
const fragment=`<div class="selected-research"><div class="research-intro"><h3>From predictions<br>to <em>explanations.</em></h3><p>My research has expanded from classification and class imbalance to reliability, shortcut learning, and the development of patch-based explanation methods.</p></div>
<div class="research-project-grid">${cards[0]}</div>
<ol class="research-path" aria-label="Development of my research focus">${stages.map(([slug,title],i)=>`<li${slug==='emd-corr'?' class="research-path-latest"':''}><span>0${i+1}${slug==='emd-corr'?' · Latest':''}</span><strong>${title}</strong><small>${esc(projects.find(p=>p.slug===slug).title)}</small></li>`).join('')}</ol>
<div class="research-project-grid">${cards.slice(1).join('\n')}</div></div>`;
let index=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!index.includes('<!-- SELECTED_PROJECTS_START -->'))throw Error('Missing project insertion markers in index.html');
index=index.replace(/<!-- SELECTED_PROJECTS_START -->[\s\S]*?<!-- SELECTED_PROJECTS_END -->/,`<!-- SELECTED_PROJECTS_START -->\n${fragment}\n<!-- SELECTED_PROJECTS_END -->`);
fs.writeFileSync(path.join(root,'index.html'),index);
fs.mkdirSync(path.join(root,'projects'),{recursive:true});
for(const p of projects){
const table=`<div class="results-scroll" role="region" aria-label="Results table" tabindex="0"><table><thead><tr>${p.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${p.rows.map(row=>'<tr>'+row.map((c,i)=>i?`<td>${esc(c)}</td>`:`<th scope="row">${esc(c)}</th>`).join('')+'</tr>').join('')}</tbody></table></div>`;
const blocks=[['overview','Overview',`<p>${esc(p.overview)}</p>`],['role','My role',list(p.role)],['data','Data',list(p.data)],['approach','Approach',list(p.approach)],['results','Results',table+`<p>${esc(p.results)}</p>`],['limitations','Limitations & next steps',list(p.limitations)+`<p>${esc(p.next)}</p>`]];
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(p.summary)}"><meta name="theme-color" content="#260c10"><title>${esc(p.title)} | (Thanh) Minh Tam Nguyen</title><link rel="stylesheet" href="../project.css"></head><body class="project-page">
<a class="skip-project" href="#project-content">Skip to project</a><header class="project-header"><a href="../index.html#papers">← Back to Research</a><a class="project-owner" href="../index.html">(Thanh) Minh Tam Nguyen</a></header>
<main id="project-content"><div class="project-hero"><p class="research-badge">${p.latest?'Latest research · ':''}${esc(p.focus)}</p><h1>${esc(p.title)}</h1><p class="project-paper">${esc(p.paper)}</p><p class="research-venue">${esc(p.venue)}</p><div class="project-development"><span>Research development</span><p>${esc(p.progress)}</p></div></div>
<div class="project-layout"><nav class="project-toc" aria-label="Project contents">${blocks.map(([id,title],i)=>`<a href="#${id}"><span>0${i+1}</span>${esc(title)}</a>`).join('')}</nav><div class="project-body">${blocks.map(([id,title,body],i)=>`<section id="${id}"><p class="project-number">0${i+1}</p><h2>${esc(title)}</h2>${body}</section>`).join('')}</div></div>
<aside class="project-related" aria-label="Other research projects"><h2>Continue exploring</h2>${projects.filter(q=>q.slug!==p.slug).map(q=>`<a href="${q.slug}.html">${esc(q.title)} ↗</a>`).join('')}</aside></main><footer class="project-footer"><a href="../index.html#papers">← Selected research & publications</a></footer></body></html>`;
fs.writeFileSync(path.join(root,'projects',p.slug+'.html'),html);
}
console.log(`Built ${projects.length} project pages and homepage cards.`);
