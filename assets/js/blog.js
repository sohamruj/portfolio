(function(){
  const listEl = document.getElementById('blog-list');
  const postEl = document.getElementById('blog-post');

  function mdToHtml(md){
    const lines = md.split(/\r?\n/);
    let html = '';
    let inCode = false; let codeBuf = []; let codeLang = '';
    for (let line of lines){
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).toLowerCase();
        if (!inCode){ inCode = true; codeBuf = []; codeLang = lang; }
        else { inCode = false; const dl = codeLang || ''; html += `<pre class=\"code-block\" data-lang=\"${dl}\"><code class=\"lang-${dl}\">${escapeHtml(codeBuf.join('\n'))}</code></pre>`; codeLang=''; }
        continue;
      }
      if (inCode){ codeBuf.push(line); continue; }
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      if (m){ const level = m[1].length; html += `<h${level}>${inline(line.replace(/^(#{1,6})\s+/, ''))}</h${level}>`; continue; }
      if (/^\s*[-*]\s+/.test(line)){ html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`; continue; }
      if (line.trim()===''){ html += '<br/>'; continue; }
      html += `<p>${inline(line)}</p>`;
    }
    html = html.replace(/(<li>[^<]*<\/li>\s*)+/g, m=>`<ul>${m}</ul>`);
    return html;
  }
  function inline(s){
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }
  function escapeHtml(str){ return str.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  async function loadIndex(){
    try {
      const res = await fetch('assets/blog/index.json');
      const posts = await res.json();
      renderList(posts);
      if (posts[0]) loadPost(posts[0].slug);
    } catch(e){ listEl.textContent = 'No posts found.'; }
  }
  function renderList(posts){
    const frag = document.createDocumentFragment();
    posts.forEach(p => {
      const a = document.createElement('a');
      a.href = `#blog/${p.slug}`; a.textContent = `${p.title} — ${p.date}`; a.className='btn outline';
      a.addEventListener('click', (ev)=>{ ev.preventDefault(); loadPost(p.slug); });
      frag.appendChild(a);
    });
    listEl.innerHTML = ''; listEl.appendChild(frag);
  }
  async function loadPost(slug){
    try {
      const res = await fetch(`assets/blog/posts/${slug}.md`);
      const md = await res.text();
      postEl.innerHTML = mdToHtml(md);
    } catch(e){ postEl.innerHTML = '<p class="muted">Unable to load post.</p>'; }
  }
  document.addEventListener('DOMContentLoaded', loadIndex);
})();
