import re

team_css = """
/* -- TEAM PORTFOLIO GRID (About page) -- */
.team-section{padding:80px 0;background:var(--surface)}
.team-intro{text-align:center;color:var(--muted);font-size:1.05rem;max-width:700px;margin:0 auto 52px;line-height:1.72}
.team-port-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.team-port-card{background:var(--card-bg);border:1px solid var(--border);border-top:3px solid var(--gold);border-radius:0 0 var(--radius-lg) var(--radius-lg);overflow:hidden;transition:transform .22s,box-shadow .22s}
.team-port-card:hover{transform:translateY(-5px);box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 0 1px var(--border-gold)}
.team-port-img{position:relative;aspect-ratio:1/1;overflow:hidden;background:#111}
.team-port-img img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;transition:transform .4s cubic-bezier(.4,0,.2,1)}
.team-port-card:hover .team-port-img img{transform:scale(1.06)}
.team-port-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 55%,rgba(0,0,0,.55) 100%);pointer-events:none}
.team-port-body{padding:18px 20px 22px;border-top:1px solid var(--border)}
.team-port-role{font-family:var(--H);font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.team-port-body h3{font-family:var(--H);font-size:1.3rem;font-weight:800;color:#fff;margin-bottom:10px;letter-spacing:.02em}
.team-port-body p{font-size:.84rem;color:var(--muted);line-height:1.65}
@media(max-width:900px){.team-port-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.team-port-grid{grid-template-columns:1fr}}
"""

content = open('public/css/site.css').read()
# Strip any old team CSS blocks
content = re.sub(r'\n/\* -- TEAM SECTION.*', '', content, flags=re.DOTALL)
content = re.sub(r'\n/\* -- TEAM PORTFOLIO GRID.*', '', content, flags=re.DOTALL)
content = content.rstrip() + team_css
open('public/css/site.css', 'w').write(content)
print('CSS updated OK, size:', len(content)//1024, 'KB')
