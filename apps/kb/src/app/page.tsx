'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Article { id:string;title:string;slug:string;content:string;summary:string;tags:string[];audience:string;helpful_yes:number;helpful_no:number;views:number;featured:boolean;author:string;created_at:string;category:Category|null; }
interface Category { id:string;name:string;slug:string;description:string;icon:string;audience:string;sort_order:number;color:string;active:boolean; }

function cn(...c:(string|false|null|undefined)[]) { return c.filter(Boolean).join(' '); }

function Markdown({content}:{content:string}) {
  const html=content
    .replace(/^## (.+)$/gm,'<h2 class="text-[17px] font-bold text-gray-900 mt-6 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm,'<h3 class="text-[15px] font-bold text-gray-800 mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-green-700">$1</code>')
    .replace(/^- (.+)$/gm,'<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li class="ml-4 list-decimal text-gray-700">$1</li>')
    .replace(/\n\n/g,'<br/><br/>');
  return <div className="text-[14px] text-gray-700 leading-relaxed space-y-1" dangerouslySetInnerHTML={{__html:html}}/>;
}

export default function KBApp() {
  const [cats,setCats]=useState<Category[]>([]);
  const [articles,setArticles]=useState<Article[]>([]);
  const [selCat,setSelCat]=useState('All');
  const [selAudience,setSelAudience]=useState('All');
  const [search,setSearch]=useState('');
  const [view,setView]=useState<Article|null>(null);
  const [loading,setLoading]=useState(true);
  const [creating,setCreating]=useState(false);
  const [voted,setVoted]=useState<Set<string>>(new Set());
  const [form,setForm]=useState({title:'',summary:'',content:'',audience:'All',tags:''});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    Promise.all([
      SB.from('kb_categories').select('*').eq('active',true).order('sort_order'),
      SB.from('kb_articles').select('*,category:kb_categories(*)').eq('published',true).order('featured',{ascending:false}).order('created_at',{ascending:false}),
    ]).then(([cR,aR])=>{
      if(cR.data) setCats(cR.data as Category[]);
      if(aR.data) setArticles(aR.data as Article[]);
      setLoading(false);
    });
  },[]);

  async function openArticle(a:Article){
    await SB.from('kb_articles').update({views:a.views+1}).eq('id',a.id);
    setView({...a,views:a.views+1});
  }

  async function vote(a:Article, helpful:boolean){
    if(voted.has(a.id)) return;
    const update=helpful?{helpful_yes:a.helpful_yes+1}:{helpful_no:a.helpful_no+1};
    await SB.from('kb_articles').update(update).eq('id',a.id);
    setView({...a,...update});
    setVoted(s=>new Set([...s,a.id]));
  }

  async function createArticle(){
    if(!form.title||!form.content){return;}
    setSaving(true);
    const slug=form.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    await SB.from('kb_articles').insert({title:form.title,slug,content:form.content,summary:form.summary,audience:form.audience,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),published:true,featured:false,author:'Admin'});
    setSaving(false);
    setCreating(false);
    setForm({title:'',summary:'',content:'',audience:'All',tags:''});
    const{data}=await SB.from('kb_articles').select('*,category:kb_categories(*)').eq('published',true).order('created_at',{ascending:false});
    if(data) setArticles(data as Article[]);
  }

  const AUDIENCES=['All','Patient','Lab Partner','Enterprise','CRM Staff'];
  const filtered=articles.filter(a=>
    (selCat==='All'||a.category?.slug===selCat)&&
    (selAudience==='All'||a.audience==='All'||a.audience===selAudience)&&
    (!search||a.title.toLowerCase().includes(search.toLowerCase())||a.summary.toLowerCase().includes(search.toLowerCase())||(a.tags??[]).some(t=>t.toLowerCase().includes(search.toLowerCase())))
  );

  const featured=filtered.filter(a=>a.featured);

  if(loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><div className="w-10 h-10 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3"/><img src="/logo.png" alt="Checkupify" className="h-8 mx-auto opacity-50"/></div>
    </div>
  );

  if(view) return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0B2545] px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <button onClick={()=>setView(null)} className="text-white/70 mb-4 flex items-center gap-1 text-sm cursor-pointer hover:text-white">← Back to Help Center</button>
          <div className="text-green-400 text-xs font-bold uppercase mb-2">{view.category?.name??'Article'}</div>
          <h1 className="text-white text-[24px] font-black leading-snug">{view.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-white/50 text-xs"><span>By {view.author}</span><span>·</span><span>{view.views} views</span><span>·</span><span className="bg-white/10 px-2 py-0.5 rounded-full">{view.audience}</span></div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6"><Markdown content={view.content}/></div>
        {(view.tags??[]).length>0&&<div className="flex gap-2 flex-wrap mb-6">{(view.tags??[]).map(t=><span key={t} className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">#{t}</span>)}</div>}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="font-bold text-gray-900 mb-1">Was this helpful?</div>
          <div className="text-gray-400 text-sm mb-4">Your feedback helps us improve</div>
          {voted.has(view.id)?(
            <div className="text-green-600 font-semibold">Thanks for your feedback! ✓</div>
          ):(
            <div className="flex gap-3 justify-center">
              <button onClick={()=>vote(view,true)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-green-500 text-green-700 font-semibold cursor-pointer hover:bg-green-50 transition-all">👍 Yes ({view.helpful_yes})</button>
              <button onClick={()=>vote(view,false)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold cursor-pointer hover:bg-gray-50 transition-all">👎 No ({view.helpful_no})</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0B2545] px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/logo.png" alt="Checkupify" className="h-10 mx-auto mb-6 invert brightness-200"/>
          <h1 className="text-white text-[32px] font-black mb-2">Help Center</h1>
          <p className="text-green-300 mb-8">Find answers, guides, and SOPs</p>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 max-w-xl mx-auto shadow-lg">
            <span className="text-gray-400 text-lg">🔍</span>
            <input className="flex-1 text-gray-900 text-[15px] outline-none placeholder-gray-400" placeholder="Search articles, SOPs, guides…" value={search} onChange={e=>setSearch(e.target.value)}/>
            {search&&<button onClick={()=>setSearch('')} className="text-gray-300 hover:text-gray-500 cursor-pointer">✕</button>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['All',...cats.map(c=>({slug:c.slug,name:c.name}))].map(c=>{
              const slug=typeof c==='string'?'All':c.slug;
              const name=typeof c==='string'?'All':c.name;
              return <button key={slug} onClick={()=>setSelCat(slug)} className={cn('px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-all',selCat===slug?'bg-green-500 text-white shadow-lg shadow-green-500/20':'bg-white text-gray-600 border border-gray-200 hover:border-green-300')}>{name}</button>;
            })}
          </div>
          <div className="flex gap-2 ml-auto">
            <select className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm cursor-pointer outline-none focus:border-green-500 bg-white" value={selAudience} onChange={e=>setSelAudience(e.target.value)}>
              {AUDIENCES.map(a=><option key={a} value={a}>{a==='All'?'All Audiences':a}</option>)}
            </select>
            <button onClick={()=>setCreating(true)} className="px-4 py-1.5 rounded-xl bg-green-500 text-white text-sm font-semibold cursor-pointer hover:bg-green-600 transition-all">+ New Article</button>
          </div>
        </div>

        {/* Featured */}
        {featured.length>0&&!search&&selCat==='All'&&(
          <div className="mb-6">
            <div className="font-bold text-gray-900 mb-3 text-[13px] uppercase tracking-wider text-gray-400">📌 Featured</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              {featured.slice(0,2).map(a=>(
                <div key={a.id} onClick={()=>openArticle(a)} className="bg-white rounded-2xl border border-green-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{a.category?.icon??'📄'}</span>
                    <div><div className="font-bold text-gray-900 text-[14px] group-hover:text-green-700 transition-colors">{a.title}</div><div className="text-gray-400 text-xs mt-1 line-clamp-2">{a.summary}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories grid */}
        {!search&&selCat==='All'&&(
          <div className="mb-6">
            <div className="font-bold text-gray-400 text-[13px] uppercase tracking-wider mb-3">Browse by Category</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {cats.map(c=>(
                <button key={c.id} onClick={()=>setSelCat(c.slug)} className="bg-white rounded-2xl border border-gray-100 p-4 text-center cursor-pointer hover:shadow-md hover:border-green-200 transition-all group">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-green-700 transition-colors">{c.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{articles.filter(a=>a.category?.slug===c.slug).length} articles</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Article list */}
        <div>
          <div className="font-bold text-gray-400 text-[13px] uppercase tracking-wider mb-3">{search?`Results for "${search}"`:selCat==='All'?'All Articles':'Articles'} ({filtered.length})</div>
          {filtered.length===0?(
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-semibold">No articles found</div>
              <div className="text-sm mt-1">Try a different search or category</div>
            </div>
          ):(
            <div className="flex flex-col gap-3">
              {filtered.map(a=>(
                <div key={a.id} onClick={()=>openArticle(a)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition-all group flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-0.5">{a.category?.icon??'📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-gray-900 text-[14px] group-hover:text-green-700 transition-colors">{a.title}</div>
                      {a.featured&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Featured</span>}
                    </div>
                    <div className="text-gray-400 text-xs line-clamp-2">{a.summary}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-gray-300">{a.views} views</span>
                      <span className="text-[11px] text-green-600">👍 {a.helpful_yes}</span>
                      {a.audience!=='All'&&<span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{a.audience}</span>}
                      {(a.tags??[]).slice(0,2).map(t=><span key={t} className="text-[11px] text-gray-400">#{t}</span>)}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {creating&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setCreating(false)}/>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10"><div className="font-bold text-gray-900">New Article</div><button onClick={()=>setCreating(false)} className="cursor-pointer text-gray-400 hover:text-gray-700 text-xl">✕</button></div>
            <div className="p-6 flex flex-col gap-4">
              {[{l:'Title',f:'title',t:'text',p:'Article title'},{l:'Summary (1-2 lines)',f:'summary',t:'text',p:'Brief description'},{l:'Tags (comma separated)',f:'tags',t:'text',p:'booking, guide, refund'}].map(({l,f,t,p})=>(
                <div key={f}><label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{l}</label><input type={t} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" placeholder={p} value={(form as any)[f]} onChange={e=>setForm(fr=>({...fr,[f]:e.target.value}))}/></div>
              ))}
              <div><label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Audience</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer" value={form.audience} onChange={e=>setForm(f=>({...f,audience:e.target.value}))}>{AUDIENCES.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Content (Markdown)</label><textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 h-48 resize-none font-mono" placeholder="## Section Title&#10;&#10;Write your content here…" value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}/></div>
              <div className="flex justify-end gap-3 pt-2"><button onClick={()=>setCreating(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm cursor-pointer">Cancel</button><button onClick={createArticle} disabled={saving||!form.title||!form.content} className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50">{saving?'Publishing…':'Publish Article'}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <img src="/logo.png" alt="Checkupify" className="h-7"/>
          <div className="text-xs text-gray-400">Help Center · {articles.length} articles · <a href="mailto:ops@checkupify.com" className="text-green-600">Contact Support</a></div>
        </div>
      </div>
    </div>
  );
}
