/* Chicago Fleet Wraps — Standalone Chat Widget (vanilla JS, no framework) */
(function(){
  var API = 'https://lniyugkiguujtxpzlapi.supabase.co/functions/v1/chat';
  var STORAGE_KEY = 'cfw-chat-history';
  var messages = [];
  var isLoading = false;

  // Load persisted messages
  try { var saved = localStorage.getItem(STORAGE_KEY); if(saved) messages = JSON.parse(saved); } catch(e){}
  function persist(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch(e){} }

  // Build DOM
  var fab = document.createElement('button');
  fab.setAttribute('aria-label','Open chat');
  fab.id = 'cfw-chat-fab';
  fab.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var panel = document.createElement('div');
  panel.id = 'cfw-chat-panel';
  panel.style.display = 'none';
  panel.innerHTML =
    '<div id="cfw-chat-hdr"><div><strong>Chicago Fleet Wraps</strong><br><small>Ask us anything about vehicle wraps</small></div><button id="cfw-chat-close" aria-label="Close chat">&times;</button></div>' +
    '<div id="cfw-chat-msgs"><div class="cfw-msg cfw-bot">👋 Hi! I\'m the Chicago Fleet Wraps assistant. Ask me about vehicle wraps, pricing, materials, or anything else!</div></div>' +
    '<form id="cfw-chat-form"><input id="cfw-chat-input" placeholder="Type a message…" autocomplete="off"><button type="submit" aria-label="Send">&#9654;</button></form>';

  // Styles
  var style = document.createElement('style');
  style.textContent =
    '#cfw-chat-fab{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:var(--gold,#F5C518);color:#000;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.4);transition:transform .2s}' +
    '#cfw-chat-fab:hover{transform:scale(1.1)}' +
    '#cfw-chat-panel{position:fixed;bottom:24px;right:24px;z-index:9999;width:380px;max-width:calc(100vw - 2rem);height:500px;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;background:var(--dark,#1C1C1C);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 32px rgba(0,0,0,.5)}' +
    '#cfw-chat-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--gold,#F5C518);color:#000}' +
    '#cfw-chat-hdr strong{font-family:var(--H,"Barlow Condensed",sans-serif);font-size:1rem}' +
    '#cfw-chat-hdr small{font-size:.75rem;opacity:.7}' +
    '#cfw-chat-close{background:none;border:none;font-size:1.4rem;cursor:pointer;color:#000;padding:4px 8px}' +
    '#cfw-chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}' +
    '.cfw-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:.9rem;line-height:1.5;word-wrap:break-word}' +
    '.cfw-user{align-self:flex-end;background:var(--gold,#F5C518);color:#000;border-bottom-right-radius:4px}' +
    '.cfw-bot{align-self:flex-start;background:var(--steel,#242424);color:rgba(255,255,255,.9);border-bottom-left-radius:4px}' +
    '.cfw-typing{align-self:flex-start;background:var(--steel,#242424);color:rgba(255,255,255,.5);font-style:italic;border-radius:16px;padding:10px 14px;font-size:.9rem}' +
    '#cfw-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.1)}' +
    '#cfw-chat-input{flex:1;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;border-radius:20px;padding:8px 16px;font-size:.9rem;outline:none}' +
    '#cfw-chat-input:focus{border-color:var(--gold,#F5C518)}' +
    '#cfw-chat-form button[type=submit]{background:var(--gold,#F5C518);color:#000;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center}' +
    '#cfw-chat-form button[type=submit]:disabled{opacity:.4;cursor:default}' +
    '@media(max-width:480px){#cfw-chat-panel{width:calc(100vw - 1rem);right:.5rem;bottom:.5rem;height:70vh}}';

  document.head.appendChild(style);
  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var msgsEl = panel.querySelector('#cfw-chat-msgs');
  var form = panel.querySelector('#cfw-chat-form');
  var input = panel.querySelector('#cfw-chat-input');
  var submitBtn = form.querySelector('button[type=submit]');

  fab.onclick = function(){ fab.style.display='none'; panel.style.display='flex'; input.focus(); };
  panel.querySelector('#cfw-chat-close').onclick = function(){ panel.style.display='none'; fab.style.display='flex'; };

  // Restore saved messages on load
  for(var i=0;i<messages.length;i++){ addMsg(messages[i].role, messages[i].content); }

  function addMsg(role, text){
    var d = document.createElement('div');
    d.className = 'cfw-msg ' + (role==='user'?'cfw-user':'cfw-bot');
    d.textContent = text;
    msgsEl.appendChild(d);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return d;
  }

  function setLoading(v){
    isLoading = v;
    submitBtn.disabled = v;
    input.disabled = v;
  }

  form.onsubmit = function(e){
    e.preventDefault();
    var text = input.value.trim();
    if(!text || isLoading) return;
    input.value = '';
    addMsg('user', text);
    messages.push({role:'user', content: text});
    persist();
    setLoading(true);

    var typing = document.createElement('div');
    typing.className = 'cfw-typing';
    typing.textContent = 'Thinking…';
    msgsEl.appendChild(typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    var botEl = null;
    var full = '';

    fetch(API, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({messages: messages})
    }).then(function(resp){
      if(!resp.ok) throw new Error('Error ' + resp.status);
      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';

      function read(){
        return reader.read().then(function(result){
          if(result.done){ finish(); return; }
          buf += decoder.decode(result.value, {stream:true});
          var idx;
          while((idx = buf.indexOf('\n')) !== -1){
            var line = buf.slice(0, idx);
            buf = buf.slice(idx+1);
            if(line.endsWith('\r')) line = line.slice(0,-1);
            if(!line.startsWith('data: ')) continue;
            var json = line.slice(6).trim();
            if(json === '[DONE]'){ finish(); return; }
            try{
              var parsed = JSON.parse(json);
              var t = parsed.type === 'content_block_delta' ? (parsed.delta && parsed.delta.text) : null;
              if(t){
                if(typing.parentNode){ typing.parentNode.removeChild(typing); }
                full += t;
                if(!botEl){ botEl = addMsg('assistant', full); }
                else { botEl.textContent = full; }
                msgsEl.scrollTop = msgsEl.scrollHeight;
              }
            }catch(ex){}
          }
          return read();
        });
      }
      return read();
    }).catch(function(err){
      if(typing.parentNode) typing.parentNode.removeChild(typing);
      addMsg('assistant', "Sorry, I'm having trouble connecting. Please try again or call (312) 597-1286!");
      setLoading(false);
    });

    function finish(){
      if(typing.parentNode) typing.parentNode.removeChild(typing);
      if(full) messages.push({role:'assistant', content: full});
      setLoading(false);
      input.focus();
    }
  };
})();
