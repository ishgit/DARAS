// ── State ─────────────────────────────────────────────────────────────────────
let TOKEN = localStorage.getItem('daras_token') || '';
let ADMIN_INFO = {};
let uPage=1, aPage=1;

// ── Auth ──────────────────────────────────────────────────────────────────────
async function doLogin(){
  const u=document.getElementById('l-user').value.trim();
  const p=document.getElementById('l-pass').value;
  document.getElementById('login-err').textContent='';
  if(!u||!p){document.getElementById('login-err').textContent='Please fill both fields.';return;}
  try{
    const res=await fetch('/api/admin/auth/login',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username:u,password:p})
    });
    const d=await res.json();
    if(!res.ok){document.getElementById('login-err').textContent=d.error||'Login failed.';return;}
    TOKEN=d.token; localStorage.setItem('daras_token',TOKEN);
    ADMIN_INFO=d;
    document.getElementById('sb-uname').textContent=d.username;
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    loadDashboard();
  }catch(e){document.getElementById('login-err').textContent='Connection error. Is server running?';}
}

async function doLogout(){
  try{await api('POST','/api/admin/auth/logout');}catch(_){}
  localStorage.removeItem('daras_token'); location.reload();
}

// Check existing token on load
window.addEventListener('load',async()=>{
  if(!TOKEN)return;
  try{
    const d=await api('GET','/api/admin/auth/me');
    ADMIN_INFO=d;
    document.getElementById('sb-uname').textContent=d.username;
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    loadDashboard();
  }catch(_){localStorage.removeItem('daras_token');}
});

// ── API helper ────────────────────────────────────────────────────────────────
async function api(method,url,body){
  const opts={method,headers:{'Authorization':'Bearer '+TOKEN}};
  if(body){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(body);}
  const res=await fetch(url,opts);
  if(res.status===401){localStorage.removeItem('daras_token');location.reload();}
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(name,navId){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.getElementById('page-'+name).classList.add('on');
  document.querySelectorAll('.sbn').forEach(b=>b.classList.remove('on'));
  document.getElementById(navId).classList.add('on');
}

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt=n=>n==null?'–':'₹'+Math.round(n).toLocaleString('en-IN');
const fmtN=n=>n==null?'–':Math.round(n).toLocaleString('en-IN');
const fmtDate=s=>s?s.slice(0,16).replace('T',' '):'–';
const VOC_LABELS={'labour_skilled':'Skilled Labour','labour_unskilled':'Mazdoor',
  'thekedaar':'Thekedaar','security':'Watchman','house_maid':'House Maid',
  'driver':'Driver','business':'Business','other':'Other'};
function badge(s){
  const m={green:'✅ Green',orange:'⚠️ Orange',red:'🚨 Red'};
  return `<span class="badge ${s}">${m[s]||s}</span>`;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard(){
  try{
    const d=await api('GET','/api/admin/dashboard');
    const vis = d.visitor_count || 0;
    document.getElementById('k-visitors').textContent=fmtN(vis);
    const convRate = vis ? Math.round(d.total_users/vis*100) : 0;
    document.getElementById('k-conv-rate').textContent='Conversion: '+convRate+'%';
    document.getElementById('k-users').textContent=fmtN(d.total_users);
    document.getElementById('k-users-t').textContent='Today: '+d.users_today;
    document.getElementById('k-assess').textContent=fmtN(d.total_assessments);
    document.getElementById('k-assess-t').textContent='Today: '+d.assessments_today;
    document.getElementById('k-qualify').textContent=fmtN(d.qualify_count||0);
    const totA = d.total_assessments||1;
    document.getElementById('k-qualify-pct').textContent=Math.round((d.qualify_count||0)/totA*100)+'% of assessments';
    document.getElementById('k-notqualify').textContent=fmtN(d.not_qualify_count||0);
    document.getElementById('k-danger-lti').textContent='Avg LTI: '+d.avg_loan_to_income+'x';
    document.getElementById('k-questions').textContent=fmtN(d.open_questions_count||0);
    document.getElementById('k-avginc').textContent='Avg Inc: '+fmt(d.avg_income);

    // Status dist
    const sd=d.status_distribution||{};
    const tot=Object.values(sd).reduce((a,b)=>a+b,0)||1;
    const statEl=document.getElementById('status-dist');
    statEl.innerHTML=['green','orange','red'].map(s=>`
      <div class="status-row">
        <div class="status-dot ${s}"></div>
        <span class="status-label">${{green:'Safe ✅',orange:'Risky ⚠️',red:'Danger 🚨'}[s]}</span>
        <div class="status-bar-track">
          <div class="status-bar-fill ${s}" style="width:${Math.round((sd[s]||0)/tot*100)}%"></div>
        </div>
        <span class="status-count">${sd[s]||0}</span>
      </div>
    `).join('');

    // Trend chart
    const trend=d.trend_30d||[];
    if(trend.length){
      const max=Math.max(...trend.map(t=>t.count),1);
      const w=400; const h=100; const pad=10;
      const pts=trend.map((t,i)=>{
        const x=pad+i*(w-pad*2)/(trend.length-1||1);
        const y=h-pad-(t.count/max)*(h-pad*2);
        return `${x},${y}`;
      }).join(' ');
      const svg=`
        <polyline points="${pts}" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linejoin="round"/>
        ${trend.map((t,i)=>{
          const x=pad+i*(w-pad*2)/(trend.length-1||1);
          const y=h-pad-(t.count/max)*(h-pad*2);
          return `<circle cx="${x}" cy="${y}" r="3" fill="#2563EB"/>`;
        }).join('')}
        <text x="${pad}" y="${h-2}" font-size="9" fill="#9CA3AF">${trend[0]?.day||''}</text>
        <text x="${w-pad}" y="${h-2}" font-size="9" fill="#9CA3AF" text-anchor="end">${trend[trend.length-1]?.day||''}</text>
      `;
      document.getElementById('trend-svg').innerHTML=svg;
      document.getElementById('trend-label').textContent=
        `${trend.length} days | Peak: ${Math.max(...trend.map(t=>t.count))} registrations`;
    }

    // Recent table
    const ra=d.recent_assessments||[];
    document.getElementById('recent-tbody').innerHTML=ra.length?ra.map(r=>`
      <tr>
        <td><strong>${r.name||'–'}</strong></td>
        <td><span class="tag voc">${VOC_LABELS[r.vocation]||r.vocation}</span></td>
        <td>${fmt(r.income)}</td>
        <td>${fmt(r.loan_amount)}</td>
        <td>${badge(r.status)}</td>
        <td style="color:var(--muted)">${fmtDate(r.created_at)}</td>
      </tr>
    `).join(''):'<tr><td colspan="6" class="empty">No assessments yet</td></tr>';

  }catch(e){console.error(e);}
}

// ── Users ─────────────────────────────────────────────────────────────────────
async function loadUsers(){
  const search=document.getElementById('u-search').value.trim();
  const voc=document.getElementById('u-voc').value;
  const stat=document.getElementById('u-status').value;
  const params=new URLSearchParams({page:uPage,per_page:20,search,vocation:voc,status:stat});
  try{
    const d=await api('GET','/api/admin/users?'+params);
    document.getElementById('users-tbody').innerHTML=d.users.length?d.users.map((u,i)=>`
      <tr>
        <td style="color:var(--muted)">${(uPage-1)*20+i+1}</td>
        <td><strong>${u.name}</strong></td>
        <td>${u.age||'–'}</td>
        <td style="font-family:monospace">${u.mobile||'–'}</td>
        <td><span class="tag voc">${VOC_LABELS[u.vocation]||u.vocation}</span></td>
        <td>${fmt(u.income)}</td>
        <td>${fmt(u.loan_amount)}</td>
        <td>${u.loan_to_income!=null?u.loan_to_income+'x':'–'}</td>
        <td>${u.interest_rate!=null?u.interest_rate+'%':'–'}</td>
        <td>${u.loan_source||'–'}</td>
        <td>${u.last_status?badge(u.last_status):'<span class="badge grey">–</span>'}</td>
        <td style="color:var(--muted)">${fmtDate(u.created_at)}</td>
        <td><button class="pag-btn" onclick="viewUser(${u.id},'${u.name}')">View</button></td>
      </tr>
    `).join(''):'<tr><td colspan="13" class="empty">No users found</td></tr>';
    renderPag('u-pag',d.page,d.total_pages,p=>{uPage=p;loadUsers();});
  }catch(e){console.error(e);}
}

// ── Assessments ───────────────────────────────────────────────────────────────
async function loadAssessments(){
  const params=new URLSearchParams({
    page:aPage,per_page:25,
    status:document.getElementById('a-status').value,
    source:document.getElementById('a-source').value,
    date_from:document.getElementById('a-dfrom').value,
    date_to:document.getElementById('a-dto').value,
  });
  try{
    const d=await api('GET','/api/admin/assessments?'+params);
    document.getElementById('assess-tbody').innerHTML=d.assessments.length?d.assessments.map((a,i)=>`
      <tr>
        <td style="color:var(--muted)">${(aPage-1)*25+i+1}</td>
        <td><strong>${a.name||'–'}</strong></td>
        <td><span class="tag voc">${VOC_LABELS[a.vocation]||a.vocation||'–'}</span></td>
        <td><span class="badge grey">${a.loan_type||'–'}</span></td>
        <td>${fmt(a.income)}</td>
        <td>${fmt(a.loan_amount)}</td>
        <td>${a.interest_rate!=null?a.interest_rate+'%':'–'}</td>
        <td>${a.tenure_months?a.tenure_months+'m':'–'}</td>
        <td>${fmt(a.emi)}</td>
        <td class="${(a.monthly_savings||0)<0?'':''}"><strong>${fmt(a.monthly_savings)}</strong></td>
        <td>${a.loan_source||'–'}</td>
        <td>${a.loan_purpose||'–'}</td>
        <td>${badge(a.status)}</td>
        <td style="color:var(--muted)">${fmtDate(a.created_at)}</td>
      </tr>
    `).join(''):'<tr><td colspan="14" class="empty">No assessments found</td></tr>';
    renderPag('a-pag',d.page,d.total_pages,p=>{aPage=p;loadAssessments();});
  }catch(e){console.error(e);}
}

function exportCSV(){
  const a=document.createElement('a');
  a.href='/api/admin/export/csv';
  a.click();
}

// ── Research ──────────────────────────────────────────────────────────────────
async function loadResearch(){
  document.getElementById('research-content').innerHTML='<div class="loader">Loading research data...</div>';
  try{
    const d=await api('GET','/api/admin/research');
    const totalAssess=d.vocation_breakdown.reduce((s,v)=>s+(v.assessments||0),0)||1;

    const barRows=(arr,keyFn,countKey,labelMap)=>arr.map(r=>{
      const max=Math.max(...arr.map(x=>x[countKey]||0),1);
      const pct=Math.round(((r[countKey]||0)/max)*100);
      const label=labelMap?labelMap[r[Object.keys(r)[0]]]||r[Object.keys(r)[0]]:keyFn(r);
      const dangerPct=r.danger_cnt&&r[countKey]?Math.round(r.danger_cnt/r[countKey]*100):0;
      return `<div class="rbar-row">
        <span class="rbar-label">${label}</span>
        <div class="rbar-track"><div class="rbar-fill" style="width:${pct}%"></div></div>
        <span class="rbar-num">${r[countKey]||0}</span>
        <span class="rbar-sub">${dangerPct?`🚨 ${dangerPct}% danger`:''}</span>
      </div>`;
    }).join('');

    const vocLabels=VOC_LABELS;
    const slabLabels={'below_10k':'< ₹10k','10k_20k':'₹10k–20k','20k_35k':'₹20k–35k','35k_50k':'₹35k–50k','above_50k':'> ₹50k'};
    const eb=d.expense_burden_avg||{};

    document.getElementById('research-content').innerHTML=`
      <div class="g2">
        <div class="card">
          <div class="card-hd"><h3>Vocation Breakdown</h3></div>
          <div class="card-body">
            ${barRows(d.vocation_breakdown,r=>VOC_LABELS[r.vocation]||r.vocation,'users',null)}
            <div style="margin-top:12px">
              ${d.vocation_breakdown.map(v=>`
                <div class="rbar-row" style="font-size:12px;border-top:1px solid var(--border);padding-top:7px">
                  <span class="rbar-label">${VOC_LABELS[v.vocation]||v.vocation}</span>
                  <span class="avg-pill">Avg Inc: ${fmt(v.avg_income)}</span>
                  <span class="avg-pill" style="margin-left:4px">Avg Loan: ${fmt(v.avg_loan)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><h3>Income Slab Breakdown</h3></div>
          <div class="card-body">
            ${d.income_slab_breakdown.map(r=>{
              const max=Math.max(...d.income_slab_breakdown.map(x=>x.cnt||0),1);
              const pct=Math.round(((r.cnt||0)/max)*100);
              const dangerPct=r.danger_cnt&&r.cnt?Math.round(r.danger_cnt/r.cnt*100):0;
              return `<div class="rbar-row">
                <span class="rbar-label">${slabLabels[r.slab]||r.slab}</span>
                <div class="rbar-track"><div class="rbar-fill ${dangerPct>50?'red':dangerPct>25?'orange':''}" style="width:${pct}%"></div></div>
                <span class="rbar-num">${r.cnt||0}</span>
                <span class="rbar-sub">${dangerPct?`🚨 ${dangerPct}%`:''}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="g2">
        <div class="card">
          <div class="card-hd"><h3>Loan Source Analysis</h3><span style="font-size:12px;color:var(--muted)">Risk by source</span></div>
          <div class="card-body">
            ${d.loan_source_breakdown.map(r=>{
              const max=Math.max(...d.loan_source_breakdown.map(x=>x.cnt||0),1);
              const pct=Math.round(((r.cnt||0)/max)*100);
              const dangerPct=r.danger_cnt&&r.cnt?Math.round(r.danger_cnt/r.cnt*100):0;
              const isSahukaar=r.loan_source==='sahukaar';
              return `<div class="rbar-row">
                <span class="rbar-label">${isSahukaar?'⚠️ ':''} ${r.loan_source||'–'}</span>
                <div class="rbar-track"><div class="rbar-fill ${dangerPct>50?'red':dangerPct>30?'orange':''}" style="width:${pct}%"></div></div>
                <span class="rbar-num">${r.cnt||0}</span>
                <span class="rbar-sub">${r.avg_rate?Math.round(r.avg_rate)+'% avg':''}${dangerPct?` 🚨${dangerPct}%`:''}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><h3>Interest Rate Buckets</h3></div>
          <div class="card-body">
            ${d.interest_rate_buckets.map(r=>{
              const max=Math.max(...d.interest_rate_buckets.map(x=>x.cnt||0),1);
              const pct=Math.round(((r.cnt||0)/max)*100);
              const isHigh=r.bucket.includes('36%');
              return `<div class="rbar-row">
                <span class="rbar-label">${isHigh?'🚨 ':''} ${r.bucket}</span>
                <div class="rbar-track"><div class="rbar-fill ${isHigh?'red':''}" style="width:${pct}%"></div></div>
                <span class="rbar-num">${r.cnt||0}</span>
                <span class="rbar-sub">${r.avg_lti?'LTI: '+Math.round(r.avg_lti*100)/100+'x':''}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="g2">
        <div class="card">
          <div class="card-hd"><h3>Loan Purpose Distribution</h3></div>
          <div class="card-body">
            ${d.purpose_breakdown.map(r=>{
              const max=Math.max(...d.purpose_breakdown.map(x=>x.cnt||0),1);
              const pct=Math.round(((r.cnt||0)/max)*100);
              const icons={'shaadi':'💒','padai':'📚','property':'🏠','gaon':'🌾','medical':'🏥','vehicle':'🛵','business':'🏪','other':'📝'};
              return `<div class="rbar-row">
                <span class="rbar-label">${icons[r.loan_purpose]||'📌'} ${r.loan_purpose||'–'}</span>
                <div class="rbar-track"><div class="rbar-fill" style="width:${pct}%"></div></div>
                <span class="rbar-num">${r.cnt||0}</span>
                <span class="rbar-sub">${fmt(r.avg_loan)} avg</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-hd"><h3>Expense Burden Analysis</h3><span style="font-size:11px;color:var(--muted)">% of income on average</span></div>
          <div class="card-body">
            ${[
              ['🏠 Rent',eb.rent_pct],
              ['🛒 Grocery',eb.grocery_pct],
              ['💊 Medicine',eb.medicine_pct],
              ['📚 Education',eb.education_pct],
              ['🌾 Gaon',eb.gaon_pct],
              ['💰 Savings',eb.savings_pct],
            ].map(([label,val])=>{
              const pct=Math.min(Math.round(Math.abs(val||0)),100);
              const isSav=label.includes('Savings');
              return `<div class="rbar-row">
                <span class="rbar-label">${label}</span>
                <div class="rbar-track"><div class="rbar-fill ${isSav?'green':pct>30?'orange':''}" style="width:${pct}%"></div></div>
                <span class="rbar-num">${pct}%</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div style="margin-top:10px;display:flex;gap:10px;align-items:center">
        <button class="export-btn" onclick="exportCSV()">⬇️ Export Full Dataset (CSV)</button>
        <span style="font-size:12px;color:var(--muted)">Contains all user assessments for academic analysis</span>
      </div>

      <!-- ── LTI / Loan Exposure Ratio ── -->
      <div class="g2" style="margin-top:18px">
        <div class="card">
          <div class="card-hd"><h3>Loan Exposure Ratio (LTI Distribution)</h3><span style="font-size:12px;color:var(--muted)">Loan ÷ Monthly Income</span></div>
          <div class="card-body">
            ${(d.lti_distribution||[]).map(r=>{
              const max=Math.max(...(d.lti_distribution||[]).map(x=>x.cnt||0),1);
              const pct=Math.round((r.cnt||0)/max*100);
              const dpct=r.cnt?Math.round(r.danger_cnt/r.cnt*100):0;
              const isCrit=r.bucket.includes('5x+');
              return `<div class="rbar-row">
                <span class="rbar-label">${isCrit?'🚨 ':''}${r.bucket}</span>
                <div class="rbar-track"><div class="rbar-fill ${isCrit?'red':dpct>50?'orange':''}" style="width:${pct}%"></div></div>
                <span class="rbar-num">${r.cnt||0}</span>
                <span class="rbar-sub">${dpct?`🚨 ${dpct}%`:''}</span>
              </div>`;
            }).join('')||'<div class="empty">No data</div>'}
          </div>
        </div>

        <div class="card">
          <div class="card-hd"><h3>Qualify vs Grassroots Problem</h3></div>
          <div class="card-body">
            ${['green','orange','red'].map(s=>{
              const labels={green:'✅ Qualify (Safe)',orange:'⚠️ Borderline',red:'🚨 Grassroots Problem'};
              const cnt=(d.vocation_breakdown||[]).reduce((sum,v)=>sum+(v['danger_cnt']||0),0);
              const totalAss=(d.vocation_breakdown||[]).reduce((sum,v)=>sum+(v.assessments||0),0)||1;
              const sd={'green':0,'orange':0,'red':0};
              (d.vocation_breakdown||[]).forEach(v=>{
                sd.red+=(v.danger_cnt||0);
              });
              sd.green=Math.max(0,totalAss-sd.red);
              const val=sd[s]||0;
              const pct=Math.round(val/totalAss*100);
              return `<div class="status-row">
                <div class="status-dot ${s}"></div>
                <span class="status-label">${labels[s]}</span>
                <div class="status-bar-track"><div class="status-bar-fill ${s}" style="width:${pct}%"></div></div>
                <span class="status-count">${val}</span>
              </div>`;
            }).join('')}
            <div style="font-size:11px;color:var(--muted);margin-top:10px">Note: Grassroots = Red status (no savings / debt trap)</div>
          </div>
        </div>
      </div>

      <!-- ── Devil in Each Vocation ── -->
      <div class="card" style="margin-top:18px">
        <div class="card-hd"><h3>Source-wise Distribution — Devil Prevalent in Each Vocation</h3><span style="font-size:12px;color:var(--muted)">Which lender traps each profession</span></div>
        <div class="card-body">
          ${(()=>{
            const vocMap={};
            (d.voc_source_matrix||[]).forEach(r=>{
              if(!vocMap[r.vocation])vocMap[r.vocation]=[];
              vocMap[r.vocation].push(r);
            });
            return Object.entries(vocMap).map(([voc,rows])=>{
              const devil=rows[0];
              const devilPct=devil.cnt?Math.round(devil.danger_cnt/devil.cnt*100):0;
              return `<div style="margin-bottom:14px;border:1px solid var(--border);border-radius:var(--rs);padding:12px">
                <div style="font-weight:700;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                  <span>${VOC_LABELS[voc]||voc}</span>
                  <span style="font-size:11px;background:var(--red-lt);color:var(--red);padding:3px 8px;border-radius:8px;font-weight:700">Devil: ${devil.loan_source} (${devilPct}% danger)</span>
                </div>
                ${rows.slice(0,4).map(r=>{
                  const dpct=r.cnt?Math.round(r.danger_cnt/r.cnt*100):0;
                  const maxCnt=Math.max(...rows.map(x=>x.cnt),1);
                  return `<div class="rbar-row" style="font-size:12px">
                    <span class="rbar-label" style="min-width:110px">${r.loan_source}</span>
                    <div class="rbar-track"><div class="rbar-fill ${dpct>50?'red':dpct>25?'orange':''}" style="width:${Math.round(r.cnt/maxCnt*100)}%"></div></div>
                    <span class="rbar-num">${r.cnt}</span>
                    <span class="rbar-sub">${dpct?`🚨${dpct}%`:''} ${r.avg_rate?Math.round(r.avg_rate)+'%':''}</span>
                  </div>`;
                }).join('')}
              </div>`;
            }).join('')||'<div class="empty">No source data yet</div>';
          })()}
        </div>
      </div>

      <!-- ── Devil in Each Income Class ── -->
      <div class="card" style="margin-top:18px">
        <div class="card-hd"><h3>Source-wise Distribution — Devil in Each Income Class</h3><span style="font-size:12px;color:var(--muted)">Which lender targets each income slab</span></div>
        <div class="card-body">
          ${(()=>{
            const slabOrder=['below_10k','10k_20k','20k_35k','35k_50k','above_50k'];
            const slabLabels2={'below_10k':'< ₹10k','10k_20k':'₹10k–20k','20k_35k':'₹20k–35k','35k_50k':'₹35k–50k','above_50k':'> ₹50k'};
            const slabMap={};
            (d.slab_source_matrix||[]).forEach(r=>{
              if(!slabMap[r.slab])slabMap[r.slab]=[];
              slabMap[r.slab].push(r);
            });
            return slabOrder.filter(s=>slabMap[s]).map(slab=>{
              const rows=slabMap[slab];
              const devil=rows[0];
              const devilPct=devil.cnt?Math.round(devil.danger_cnt/devil.cnt*100):0;
              return `<div style="margin-bottom:14px;border:1px solid var(--border);border-radius:var(--rs);padding:12px">
                <div style="font-weight:700;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                  <span>${slabLabels2[slab]||slab}</span>
                  <span style="font-size:11px;background:var(--red-lt);color:var(--red);padding:3px 8px;border-radius:8px;font-weight:700">Devil: ${devil.loan_source} (${devilPct}% danger)</span>
                </div>
                ${rows.slice(0,4).map(r=>{
                  const dpct=r.cnt?Math.round(r.danger_cnt/r.cnt*100):0;
                  const maxCnt=Math.max(...rows.map(x=>x.cnt),1);
                  return `<div class="rbar-row" style="font-size:12px">
                    <span class="rbar-label" style="min-width:110px">${r.loan_source}</span>
                    <div class="rbar-track"><div class="rbar-fill ${dpct>50?'red':dpct>25?'orange':''}" style="width:${Math.round(r.cnt/maxCnt*100)}%"></div></div>
                    <span class="rbar-num">${r.cnt}</span>
                    <span class="rbar-sub">${dpct?`🚨${dpct}%`:''} ${r.avg_rate?Math.round(r.avg_rate)+'%':''}</span>
                  </div>`;
                }).join('')}
              </div>`;
            }).join('')||'<div class="empty">No source data yet</div>';
          })()}
        </div>
      </div>

      <!-- ── Vocation × Income × Source Problem Matrix ── -->
      <div class="card" style="margin-top:18px">
        <div class="card-hd"><h3>Problem Distribution — Vocation × Income × Source</h3><span style="font-size:12px;color:var(--muted)">Top 15 patterns by count</span></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>Vocation</th><th>Income Slab</th><th>Loan Source</th><th>Status</th><th>Count</th></tr></thead>
            <tbody>
              ${(d.voc_income_source_matrix||[]).slice(0,15).map(r=>`
                <tr>
                  <td><span class="tag voc">${VOC_LABELS[r.vocation]||r.vocation}</span></td>
                  <td>${{'below_10k':'< ₹10k','10k_20k':'₹10k–20k','20k_35k':'₹20k–35k','35k_50k':'₹35k–50k','above_50k':'> ₹50k'}[r.slab]||r.slab}</td>
                  <td>${r.loan_source||'–'}</td>
                  <td>${badge(r.status)}</td>
                  <td><strong>${r.cnt}</strong></td>
                </tr>
              `).join('')||'<tr><td colspan="5" class="empty">No data yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }catch(e){
    document.getElementById('research-content').innerHTML='<div class="empty">Failed to load. Check backend.</div>';
    console.error(e);
  }
}

// ── User Detail Modal ─────────────────────────────────────────────────────────
async function viewUser(uid,name){
  document.getElementById('modal-title').textContent='User: '+name;
  document.getElementById('modal-body').innerHTML='<div class="loader">Loading...</div>';
  document.getElementById('user-modal').classList.add('show');
  try{
    const d=await api('GET','/api/admin/users/'+uid);
    const u=d.user;
    const assessments=d.assessments;
    document.getElementById('modal-body').innerHTML=`
      <div class="detail-grid">
        <div class="detail-item"><div class="dl">Name</div><div class="dv">${u.name}</div></div>
        <div class="detail-item"><div class="dl">Mobile</div><div class="dv">${u.mobile||'–'}</div></div>
        <div class="detail-item"><div class="dl">Age</div><div class="dv">${u.age||'–'}</div></div>
        <div class="detail-item"><div class="dl">Vocation</div><div class="dv"><span class="tag voc">${VOC_LABELS[u.vocation]||u.vocation}</span></div></div>
        <div class="detail-item"><div class="dl">City</div><div class="dv">${u.city||'–'}</div></div>
        <div class="detail-item"><div class="dl">Registered</div><div class="dv">${fmtDate(u.created_at)}</div></div>
      </div>
      <div class="section-title">Loan Assessments (${assessments.length})</div>
      ${assessments.length?assessments.map(a=>`
        <div style="border:1px solid var(--border);border-radius:var(--rs);padding:13px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span><strong>${a.loan_type==='existing'?'📄 Existing':'✨ New'}</strong> loan</span>
            ${badge(a.status)}
          </div>
          <div class="detail-grid">
            <div class="detail-item"><div class="dl">Loan Amount</div><div class="dv">${fmt(a.loan_amount)}</div></div>
            <div class="detail-item"><div class="dl">Income</div><div class="dv">${fmt(a.income)}</div></div>
            <div class="detail-item"><div class="dl">EMI</div><div class="dv">${fmt(a.emi)}</div></div>
            <div class="detail-item"><div class="dl">Monthly Savings</div><div class="dv">${fmt(a.monthly_savings)}</div></div>
            <div class="detail-item"><div class="dl">Interest Rate</div><div class="dv">${a.interest_rate||0}%</div></div>
            <div class="detail-item"><div class="dl">Tenure</div><div class="dv">${a.tenure_months||0} months</div></div>
            <div class="detail-item"><div class="dl">Loan Source</div><div class="dv">${a.loan_source||'–'}</div></div>
            <div class="detail-item"><div class="dl">Purpose</div><div class="dv">${a.loan_purpose||'–'}</div></div>
            <div class="detail-item"><div class="dl">LTI Ratio</div><div class="dv">${a.loan_to_income||0}x</div></div>
            <div class="detail-item"><div class="dl">Total Interest</div><div class="dv">${fmt(a.total_interest)}</div></div>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:8px">Assessed: ${fmtDate(a.created_at)}</div>
        </div>
      `).join(''):'<div class="empty">No assessments yet</div>'}
    `;
  }catch(e){document.getElementById('modal-body').innerHTML='<div class="empty">Error loading data</div>';}
}
function closeModal(){document.getElementById('user-modal').classList.remove('show');}
document.getElementById('user-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});

// ── Admin Users ───────────────────────────────────────────────────────────────
async function loadAdmins(){
  try{
    const rows=await api('GET','/api/admin/admins');
    document.getElementById('admins-tbody').innerHTML=rows.map((a,i)=>`
      <tr>
        <td>${i+1}</td>
        <td><strong>${a.username}</strong></td>
        <td>${a.full_name||'–'}</td>
        <td><span class="badge ${a.role==='superadmin'?'orange':'grey'}">${a.role}</span></td>
        <td style="color:var(--muted)">${fmtDate(a.last_login)}</td>
        <td style="color:var(--muted)">${fmtDate(a.created_at)}</td>
        <td>${a.id!==ADMIN_INFO.id?`<button class="pag-btn" onclick="deleteAdmin(${a.id},'${a.username}')">Remove</button>`:'<span style="color:var(--muted);font-size:12px">You</span>'}</td>
      </tr>
    `).join('');
  }catch(e){console.error(e);}
}
async function addAdmin(){
  const u=document.getElementById('na-user').value.trim();
  const p=document.getElementById('na-pass').value.trim();
  const n=document.getElementById('na-name').value.trim();
  const r=document.getElementById('na-role').value;
  const msg=document.getElementById('admin-msg');
  if(!u||!p){msg.textContent='⚠️ Username + Password required.';msg.style.color='var(--red)';return;}
  try{
    await api('POST','/api/admin/admins',{username:u,password:p,full_name:n,role:r});
    msg.textContent='✅ Admin added!';msg.style.color='var(--green)';
    loadAdmins();
  }catch(e){msg.textContent='❌ Error: '+e.message;msg.style.color='var(--red)';}
}
async function deleteAdmin(id,uname){
  if(!confirm(`Remove admin "${uname}"? This cannot be undone.`))return;
  try{await api('DELETE','/api/admin/admins/'+id);loadAdmins();}catch(e){alert('Error: '+e.message);}
}

// ── Questions ─────────────────────────────────────────────────────────────────
async function loadQuestions(){
  try{
    const [rows,dash]=await Promise.all([
      api('GET','/api/admin/questions'),
      api('GET','/api/admin/dashboard')
    ]);
    document.getElementById('qn-total').textContent=fmtN(dash.open_questions_count||0);
    document.getElementById('qn-ppt').textContent='0';
    document.getElementById('qn-ai').textContent='0';
    document.getElementById('qns-tbody').innerHTML=rows.length?rows.map((q,i)=>`
      <tr>
        <td style="color:var(--muted)">${i+1}</td>
        <td style="max-width:320px;word-break:break-word;font-size:13px">${q.question||'–'}</td>
        <td><strong>${q.name||'–'}</strong></td>
        <td><span class="tag voc">${VOC_LABELS[q.vocation]||q.vocation||'–'}</span></td>
        <td style="color:var(--muted);font-size:12px">${fmtDate(q.created_at)}</td>
        <td><span class="badge grey">Unanswered</span></td>
      </tr>
    `).join(''):'<tr><td colspan="6" class="empty">No questions yet</td></tr>';
  }catch(e){console.error(e);}
}

// ── Pagination ────────────────────────────────────────────────────────────────
function renderPag(elId,current,total,cb){
  if(total<=1){document.getElementById(elId).innerHTML='';return;}
  const pages=[];
  if(current>1)pages.push({n:'‹ Prev',p:current-1});
  for(let i=Math.max(1,current-2);i<=Math.min(total,current+2);i++)
    pages.push({n:i,p:i,active:i===current});
  if(current<total)pages.push({n:'Next ›',p:current+1});
  document.getElementById(elId).innerHTML=
    pages.map(p=>`<button class="pag-btn${p.active?' on':''}" onclick="(${cb.toString()})(${p.p})">${p.n}</button>`).join('')+
    `<span class="pag-info">Page ${current} of ${total}</span>`;
}

// ── Debounce ──────────────────────────────────────────────────────────────────
function debounce(fn,ms){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms);};}
