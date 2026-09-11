#!/usr/bin/env python3
"""Rebuild the 38 inner routes from the approved, immutable pre-rebuild backup.

This is an offline content migration, never a runtime page reconstruction.
It deliberately owns only inner HTML and the content ledger. Run from repo root.
"""
import argparse
import html
import json
import re
import struct
import hashlib
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BACKUP = Path('/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-inner-page-rebuild-2026-09-05-224256')
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.children, self.parent = tag, dict(attrs), [], parent
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node): yield from child.walk()
    def text(self):
        return ''.join(c.text() if isinstance(c,Node) else c for c in self.children)

class Parser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root=Node(); self.stack=[self.root]; self.feed(source)
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.stack[-1]); self.stack[-1].children.append(n)
        if tag not in VOID: self.stack.append(n)
    def handle_startendtag(self,tag,attrs): self.handle_starttag(tag,attrs)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag: self.stack=self.stack[:i]; break
    def handle_data(self,data): self.stack[-1].children.append(data)

def esc(s): return html.escape(str(s),quote=True)
def norm(s): return re.sub(r'\s+',' ',s).strip()
def unique(values): return list(dict.fromkeys(values))
def attrs(a): return ''.join(' '+k+(('="'+esc(v)+'"') if v is not None else '') for k,v in a.items())
def raw(n):
    if isinstance(n,str): return esc(n)
    return '<'+n.tag+attrs(n.attrs)+'>'+('' if n.tag in VOID else ''.join(raw(c) for c in n.children)+'</'+n.tag+'>')
def inside(n): return ''.join(clean(c) for c in n.children)
def clean(n):
    if isinstance(n,str): return esc(n)
    a={k:v for k,v in n.attrs.items() if k not in ['style','class']}
    tag='strong' if n.tag=='span' and '700' in n.attrs.get('style','') else n.tag
    return '<'+tag+attrs(a)+'>'+('' if tag in VOID else inside(n)+'</'+tag+'>')
def meaningful(n):
    return isinstance(n,Node) and (norm(n.text()) or n.tag in ['img','video','iframe','form'] or any(x.tag=='img' for x in n.walk()))
def title_tag(tag,text,cls=''): return f'<{tag}'+(f' class="{cls}"' if cls else '')+'>'+esc(text)+f'</{tag}>'

TITLES = {
 '1': 'Christmas Day at the Orphanage', 'about-1':'Contact Us', 'about-5':'Youth Service',
 'about-us':'About CLMI','branches':'Our Branches','children-s-ministries':'Children’s Ministry',
 'church-outreach':'Church Outreach','community-outreach':'Community Outreach',
 'convention':'22nd Annual Convention · 2023','copy-of-convention':'23rd Annual Convention · 2024',
 'copy-of-convention-2025':'25th Annual Convention · 2026','convention-2026':'Convention 2026',
 'copy-of-2023-convention-gallery':'2024 Convention Gallery','copy-of-2024-convention-gallery':'2026 Convention Gallery',
 'copy-of-christmas-day-at-orphanage':'Church Outreach · Walvis Bay',
 'copy-of-church-outreach-wavis-bay':'Community Police',
 'copy-of-community-building-gallery':'Creative Expression Gallery',
 'copy-of-community-police':'Donations to the Orphanage',
 'copy-of-donations-to-the-orphange':'Kilimanjaro Outreach',
 'copy-of-katutura-street-evangelism':'Zoo Park Outreach Gallery',
 'copy-of-kilimanjaro-outreach':'Shona Bibles in Zimbabwe',
 'copy-of-zimababwe-shona-bibles':'Katutura Street Evangelism',
 'copy-of-youth-service':'Spiritual Growth','copy-of-spiritual-growth':'Community Building',
 'copy-of-community-building':'Creative Expression','copy-of-creative-expression':'Outreach and Evangelism',
 'copy-of-outreach-and-evangelism':'Fun and Recreation','donations':'Giving',
 'events':'Events','highlights':'2023 Convention Gallery','hospital-outreach':'Hospital Outreach',
 'leadership-seminars':'Leadership Seminars','livestream':'Watch CLMI','copy-of-live-streams':'Live Streams',
 'marriage-seminars':'Marriage Seminars','prison-outreach':'Prison Outreach','publication':'Gallery','youth-movement':'Youth Movement'}
PROGRAMS=['about-5','copy-of-youth-service','copy-of-spiritual-growth','copy-of-community-building','copy-of-creative-expression','copy-of-outreach-and-evangelism']
ARCHIVES=['1','highlights','copy-of-2023-convention-gallery','copy-of-2024-convention-gallery','copy-of-christmas-day-at-orphanage','copy-of-church-outreach-wavis-bay','copy-of-community-building-gallery','copy-of-community-police','copy-of-donations-to-the-orphange','copy-of-katutura-street-evangelism','copy-of-kilimanjaro-outreach','copy-of-zimababwe-shona-bibles','convention-2026']
SPARSE={
 'hospital-outreach':'Prayer, compassion and care matter in times of illness. For information about Hospital Outreach at CLMI, please contact the church directly.',
 'marriage-seminars':'Marriage invites a continuing commitment to love, understanding and faith. Contact CLMI for information about Marriage Seminars and any current arrangements.',
 'leadership-seminars':'Christian leadership begins with faith, service and responsibility toward others. Contact CLMI for information about Leadership Seminars and any current arrangements.',
 'donations':'Generosity is one way to express care for a church community. If you would like to ask about giving to CLMI, please contact the church for current information.'}

def family(route):
    if route in PROGRAMS:return 'youth-program'
    if route in ARCHIVES:return 'photo-story'
    if route in ['events','convention','copy-of-convention','copy-of-convention-2025']:return 'events'
    if route=='publication':return 'gallery'
    if route in ['livestream','copy-of-live-streams']:return 'watch'
    if route in ['about-us','about-1','branches']:return 'information'
    if route=='donations':return 'giving'
    return 'ministry'

def dimensions(src):
    path=ROOT/'public'/src.lstrip('/')
    try:
        with path.open('rb') as f:
            head=f.read(24)
            if head.startswith(b'\x89PNG'):return struct.unpack('>II',head[16:24])
            if head[:2]==b'\xff\xd8':
                f.seek(2)
                while True:
                    b=f.read(1)
                    if not b:break
                    if b!=b'\xff':continue
                    while b==b'\xff':b=f.read(1)
                    marker=b[0]
                    if marker in [0xd8,0xd9]:continue
                    length=struct.unpack('>H',f.read(2))[0]
                    if marker in [0xc0,0xc1,0xc2,0xc3]:
                        data=f.read(5); h,w=struct.unpack('>HH',data[1:5]);return w,h
                    f.seek(length-2,1)
    except (OSError,struct.error,IndexError):pass
    return 1200,800

def image(n,title,hero=False,index=0):
    src=n.attrs['src']; w,h=dimensions(src)
    old=n.attrs.get('alt','')
    alt=old if old and not re.search(r'\.(jpg|png|jpeg)$',old,re.I) else f'{title} — photograph {index+1}'
    if hero:alt=title+' — original CLMI artwork' if 'Pastor' not in old else 'Pastor Ken, Youth Pastor'
    return f'<img src="{esc(src)}" alt="{esc(alt)}" width="{w}" height="{h}" loading="'+('eager' if hero else 'lazy')+'" decoding="async"'+(' fetchpriority="high"' if hero else '')+'>'

def block(n,title):
    if n.tag=='img':return '<figure>'+image(n,title)+'</figure>'
    if n.tag=='a':
        if any(c.tag=='img' for c in n.walk()):
            return '<a'+attrs({k:v for k,v in n.attrs.items() if k!='style' and k!='class'})+'>'+''.join(image(c,title) for c in n.walk() if c.tag=='img')+'</a>'
        label=norm(n.text())
        if label in ['View More','Learn More','View Gallery','Gallery']:
            target=n.attrs.get('href','').strip('/'); dest=TITLES.get(target,title)
            label=('Explore ' if label in ['View More','Learn More'] else 'View ')+dest
        return '<p><a class="button-link"'+attrs({k:v for k,v in n.attrs.items() if k not in ['style','class']})+'>'+esc(label)+'</a></p>'
    if n.tag in ['iframe','video']:
        a={k:v for k,v in n.attrs.items() if k not in ['style','class','autoplay','loop','muted']}
        if n.tag=='video':
            a['controls']=None;a['preload']='none'
            if 'data-src' in a:a['src']=a.pop('data-src')
        else:a['loading']='lazy';a['title']=title+' — embedded player' if 'maps' not in a.get('src','') else 'Map: 34/36 John Simms Street, Windhoek'
        return '<div class="media-frame"><'+n.tag+attrs(a)+'>'+inside(n)+'</'+n.tag+'></div>'
    text=norm(n.text())
    heading=len(text)<95 and (text.isupper() or text in ['Meet the Team','Pastor Ken','Youth Pastor','CONTACTS','Maps'])
    return ('<h2 class="section-heading">' if heading else '<p>')+inside(n)+('</h2>' if heading else '</p>')

def hero(route,img=None,intro=''):
    title=TITLES[route]
    parent='youth-movement' if route in PROGRAMS else ('publication' if route in ARCHIVES else None)
    crumb='<a href="/">Home</a>'+(' / <a href="/'+parent+'">'+esc(TITLES[parent])+'</a>' if parent else '')
    return '<header class="page-hero"><div class="hero-copy"><nav class="breadcrumbs" aria-label="Breadcrumb">'+crumb+'</nav><p class="eyebrow">Christ’s Love Ministries International</p><h1>'+esc(title)+'</h1>'+('<p class="page-intro">'+esc(intro)+'</p>' if intro else '')+'</div>'+('<figure class="hero-media" data-sc-act="flow">'+image(img,title,True)+'</figure>' if img else '')+'</header>'

def related(route):
    destinations=['youth-movement','publication'] if route in PROGRAMS else (['publication','events'] if route in ARCHIVES else ['about-1','about-us'])
    if route=='publication':destinations=['convention-2026','highlights','copy-of-2024-convention-gallery','copy-of-2023-convention-gallery','1','copy-of-community-building-gallery']
    return '<nav class="related-links" aria-label="Related pages">'+''.join('<a class="button-link" href="/'+r+'">'+esc(TITLES[r])+'</a>' for r in destinations if r!=route)+'</nav>'

def migrate(route,source,shell):
    parsed=Parser(source).root
    mains=[n for n in parsed.walk() if n.tag=='main']
    content=[n for m in mains for n in m.walk()]
    ledger={'route':route,'title':TITLES[route],'family':family(route),'text':[],
      'sourceSha256':hashlib.sha256(source.encode()).hexdigest(),
      'images':unique(n.attrs['src'] for n in content if n.tag=='img' and 'src' in n.attrs),
      'links':unique(n.attrs['href'] for n in parsed.walk() if n.tag=='a' and 'href' in n.attrs),
      'media':unique(n.attrs[k] for n in content if n.tag in ['video','iframe','source'] for k in ['src','data-src','poster'] if k in n.attrs),
      'excludedPresentationLabels':['View More','Learn More','View Gallery','Gallery'],
      'source':str(DEFAULT_BACKUP/'public'/route/'index.html')}
    # Store source text nodes independently: preserve unusual punctuation/spelling,
    # including text split by inline emphasis, without treating layout copies as content.
    primary=list(mains[0].walk()) if mains else []
    ledger['text']=unique(norm(c) for n in primary if n.tag not in ['script','style'] for c in n.children if isinstance(c,str) and norm(c) and norm(c) not in ledger['excludedPresentationLabels'])
    # Mobile row text sometimes concatenates several desktop cells. Remove only
    # exact desktop substrings before testing whether any mobile-only copy remains.
    for m in mains[1:]:
        for n in m.walk():
            for c in n.children:
                if not isinstance(c,str) or not norm(c):continue
                remaining=norm(c)
                for known in sorted(ledger['text']+ledger['excludedPresentationLabels'],key=len,reverse=True):remaining=remaining.replace(known,'')
                if norm(remaining):ledger['text'].append(norm(remaining))
    if route in ['children-s-ministries','publication']:
        out=source
        if route=='publication':
            # Approved slideshow is a section, not a legacy main.
            start=out.index('  <section class="gallery-showcase"')
            end=out.index('  <footer class="site-footer"',start)
            existing=out[start:end]
            out=out[:start]+'<main class="inner-main gallery-main"><h1 class="visually-hidden">Gallery</h1>'+existing+'<div class="page-content">'+related(route)+'</div></main>\n'+out[end:]
            out=out.replace("const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;", "const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('motion') === 'off';")
            gallery=Parser(existing).root
            ledger['images']=unique(n.attrs['src'] for n in gallery.walk() if n.tag=='img' and 'src' in n.attrs)
        else:
            # Keep exact approved tab markup and inline interaction identities.
            out=out.replace('<main class="children-experience">','<main class="children-experience">\n<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Children’s Ministry</nav>')
    elif route=='convention-2026':
        filenames=unique(re.findall(r'"(IMG_\d+\.JPG)"',source))
        captions=re.findall(r'\{f:"(IMG_\d+\.JPG)",\s*k:"([^"]+)",\s*t:"([^"]+)"\}',source)
        captionmap={f:k+' · '+t for f,k,t in captions}
        themes=re.findall(r'\{k:"([^"]+)",\s*t:"([^"]+)"\}',source)
        for i,f in enumerate(filenames[len(captions):]):captionmap[f]=' · '.join(themes[i%len(themes)])
        ledger['images']=['/convention-2026/images/web/'+f for f in filenames]
        ledger['text']=['Convention','2026','Recap','Relive Every Moment','Jehovah El Shaddai','God of All Possibilities','Jehovah Nissi','"Change your family trials to testimonies."']+[v for _,k,t in captions for v in [k,t]]+[v for k,t in themes for v in [k,t]]
        body=hero(route,intro='Relive Every Moment')+'<div class="page-content"><section class="prose"><h2>Convention 2026 Recap</h2><p>Jehovah El Shaddai · God of All Possibilities · Jehovah Nissi</p><p>"Change your family trials to testimonies."</p></section><div class="photo-grid">'
        for i,src in enumerate(ledger['images']):
            n=Node('img',[('src',src)])
            body+='<figure>'+image(n,TITLES[route],False,i)+('<figcaption>'+esc(captionmap[filenames[i]])+'</figcaption>' if filenames[i] in captionmap else '')+'</figure>'
        body+='</div>'+related(route)+'</div>'
        out=shell.replace('<!--INNER_BODY-->','<main class="inner-main">'+body+'</main>')
    else:
        nodes=[n for n in mains[0].children if meaningful(n)]
        title=TITLES[route]; lead=None; body=''
        if route in SPARSE:
            body='<section class="prose"><h2>Speak with CLMI</h2><p>The church can help you find the relevant information and answer your questions. Please use the contact page to get in touch.</p><a class="button-link" href="/about-1">Contact CLMI</a></section>'
        elif route=='branches':
            lead=nodes.pop(0)
            texts=[n for n in nodes if norm(n.text())]
            rows={}
            for n in texts[4:]:
                y=float(re.search(r'top:([\d.]+)px',n.attrs['style'])[1]);row=round((y-873)/81)
                rows.setdefault(row,[]).append(n)
            body='<div class="branch-grid">'
            for row in rows.values():
                body+='<article class="branch-card"><h2>'+inside(row[1])+'</h2><p><strong>Name</strong><br>'+inside(row[0])+'</p>'
                for n in row[2:]:body+='<p><strong>'+('Email' if '@' in n.text() else 'Cell Number')+'</strong><br>'+inside(n)+'</p>'
                body+='</article>'
            body+='</div>'
            ledger['text']=[t for t in ledger['text'] if t!='Branch']
        elif route in ['youth-movement','church-outreach']:
            lead=nodes.pop(0);body='<div class="program-grid">'
            for i in range(0,len(nodes),2):
                description,link=nodes[i:i+2];dest=link.attrs['href'].strip('/')
                body+='<article class="story-card"><h2>'+esc(TITLES[dest])+'</h2><p>'+inside(description)+'</p>'+block(link,title)+'</article>'
            body+='</div>'
        elif route in PROGRAMS:
            # Profile first in legacy DOM; program itself leads the rebuilt story.
            split=next(i for i,n in enumerate(nodes) if norm(n.text())==title)
            profile,program=nodes[:split],nodes[split+1:]
            body='<section class="prose" aria-label="'+esc(title)+'">'+''.join(block(n,title) for n in program)+'</section><section class="team-grid"><article class="team-card">'+''.join(block(n,title) for n in profile)+'</article></section>'
        elif route=='about-us':
            lead=nodes.pop(0);split=next(i for i,n in enumerate(nodes) if norm(n.text())=='Meet the Team')
            body='<section class="prose">'+''.join(block(n,title) for n in nodes[:split])+'</section><section><h2 class="section-heading">Meet the Team</h2><div class="team-grid">'
            groups=[]
            for n in nodes[split+1:]:
                if n.tag=='img':groups.append([])
                groups[-1].append(n)
            for group in groups:
                card=''
                for n in group:
                    text=norm(n.text())
                    if text in ['PROFESSOR','BISHOP']:card+='<p class="eyebrow">'+inside(n)+'</p>'
                    elif n.tag=='div' and text and 'District' not in text:card+='<h3>'+inside(n)+'</h3>'
                    else:card+=block(n,title)
                body+='<article class="team-card">'+card+'</article>'
            body+='</div></section>'
        elif route in ['events','community-outreach']:
            # Correct historical card destinations before deriving their labels.
            # Slugs are legacy copies; the destination content determines identity.
            if route=='community-outreach':
                fixes={'/1':'/copy-of-katutura-street-evangelism',
                    '/copy-of-katutura-street-evangelism':'/copy-of-zimababwe-shona-bibles',
                    '/copy-of-kilimanjaro-outreach':'/copy-of-donations-to-the-orphange',
                    '/copy-of-church-outreach-wavis-bay':'/copy-of-christmas-day-at-orphanage',
                    '/copy-of-donations-to-the-orphange':'/copy-of-community-police',
                    '/copy-of-christmas-day-at-orphanage':'/1',
                    '/copy-of-zimababwe-shona-bibles':'/copy-of-kilimanjaro-outreach'}
                for n in nodes:
                    if n.tag=='a' and n.attrs.get('href') in fixes:
                        n.attrs['href']=fixes[n.attrs['href']]
            groups=[]
            for n in nodes:
                if n.tag=='img':groups.append([])
                groups[-1].append(n)
            body='<div class="event-grid">'+''.join('<article class="event-card">'+''.join(block(n,title) for n in group)+'</article>' for group in groups)+'</div>'
        elif route=='about-1':
            lead=nodes.pop(0);form=next(n for n in nodes if n.tag=='form');frame=next(n for n in nodes if n.tag=='iframe')
            formhtml=clean(form).replace('<form ','<form class="contact-card" ')
            for name,label in [('email','Email *'),('subject','Subject'),('message','Your message')]:
                formhtml=formhtml.replace('<div>'+label+'</div>','<label for="contact-'+name+'">'+label+'</label>')
                formhtml=formhtml.replace('name="'+name+'"','id="contact-'+name+'" name="'+name+'"')
            details=''.join(block(n,title).replace('class="button-link"','class="contact-address"') for n in nodes if n not in [form,frame] and norm(n.text()) not in ['Maps','CONTACT US'])
            body='<div class="contact-grid"><section class="contact-card">'+details+'<p><a class="button-link" href="/branches">Our Branches</a></p></section><section><h2>CONTACT US</h2>'+formhtml+'</section></div><section><h2>Maps</h2>'+block(frame,title)+'</section>'
        elif route in ARCHIVES or route=='prison-outreach':
            seen=set();figures=[];other=[]
            for n in nodes:
                if n.tag=='img':
                    if n.attrs['src'] not in seen:figures.append('<figure>'+image(n,title,False,len(figures))+'</figure>');seen.add(n.attrs['src'])
                else:other.append(block(n,title))
            body=''.join(other)+'<div class="photo-grid">'+''.join(figures)+'</div>'
        else:
            if route=='livestream':
                actions={'/copy-of-live-streams':'Watch CLMI live streams','https://podcasters.spotify.com/pod/show/clmipod':'Listen to the CLMI podcast'}
                for n in nodes:
                    if n.tag=='a' and n.attrs.get('href') in actions:
                        for child in n.walk():
                            if child.tag=='img':child.attrs['alt']=actions[n.attrs['href']]
            if any(n.tag=='img' for n in nodes):
                lead=next(n for n in nodes if n.tag=='img');nodes.remove(lead)
            body='<section class="prose">'+''.join(block(n,title) for n in nodes)+'</section>'
        newmain='<main class="inner-main" data-page-family="'+family(route)+'">'+hero(route,lead,SPARSE.get(route,''))+'<div class="page-content">'+body+related(route)+'</div></main>'
        out=re.sub(r'<main\b[\s\S]*?</main>\s*',lambda m:newmain if m.start()==next(re.finditer(r'<main\b',source)).start() else '',source)
    out=re.sub(r'<body(?:\s[^>]*)?>','<body class="clmi-inner">',out,count=1)
    out=out.replace('<div style="width:1512px;height:193px;margin:0 auto;background:rgba(232,230,230,0.72)"></div>','')
    if route!='publication':out=re.sub(r'<title>.*?</title>','<title>'+esc(TITLES[route])+' | CLMI</title>',out,count=1)
    out=re.sub(r'<script>\s*\(function \(\) \{\s*function fit\(\)[\s\S]*?</script>','',out)
    out=out.replace('</head>','<link rel="stylesheet" href="/assets/inner-pages.css">\n<script defer src="/assets/vendor/scrollcraft/scrollcraft.js"></script>\n<script defer src="/assets/inner-pages.js"></script>\n</head>')
    out=out.replace('</head>','<noscript><style>body.clmi-inner .children-panel[hidden]{display:grid} @media(max-width:1050px){body.clmi-inner .m-nav{display:block;position:static;height:auto;max-height:none}body.clmi-inner .m-burger{display:none}}</style></noscript>\n</head>')
    if route=='publication':
        out=out.replace('</head>','<noscript><style>body.clmi-inner .gallery-track{display:grid;grid-template-columns:1fr;gap:16px;transform:none}body.clmi-inner .gallery-card{display:block;width:100%;opacity:1;visibility:visible}body.clmi-inner .gallery-card img{animation:none;transform:none;height:auto;aspect-ratio:auto;object-fit:contain}body.clmi-inner .gallery-controls,body.clmi-inner .gallery-progress{display:none}</style></noscript>\n</head>')
    # Preserve mobile-only media or destinations when layouts differ substantively.
    missing=[src for src in ledger['images'] if esc(src) not in out and src not in out]
    if missing:
        extra='<div class="page-content"><div class="photo-grid">'+''.join('<figure>'+image(Node('img',[('src',src)]),TITLES[route])+'</figure>' for src in missing)+'</div></div>'
        out=out.replace('</main>',extra+'</main>')
    ledger['preservation']='Inventory covered by tests/inner-pages.test.mjs; consult the latest test run for verification status'
    out='\n'.join(line.rstrip() for line in out.splitlines())+'\n'
    return out,ledger

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--backup',type=Path,default=DEFAULT_BACKUP);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    if not args.check:
        parser.error('Historical one-time migration: writing is disabled to protect later owner revisions. Edit current HTML directly; use sync-convention-gallery.mjs for the current gallery.')
    baseline=(args.backup/'public/youth-movement/index.html').read_text()
    shell=re.sub(r'<main\b[\s\S]*?</main>\s*','',baseline)
    shell=shell.replace('  <footer class="site-footer">','<!--INNER_BODY-->\n  <footer class="site-footer">')
    entries=[]
    for route in TITLES:
        source=(args.backup/'public'/route/'index.html').read_text()
        out,entry=migrate(route,source,shell)
        entry['source']=str(args.backup/'public'/route/'index.html')
        entries.append(entry)
        if not args.check:(ROOT/'public'/route/'index.html').write_text(out)
    if not args.check:(ROOT/'docs/inner-content-ledger.json').write_text(json.dumps({'backup':str(args.backup),'method':'Unique substantive source text nodes, content image URLs, media URLs and all anchor destinations; presentation-only repeated button labels replaced descriptively. Desktop and mobile duplicates collapsed.','routes':entries},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'routes':len(entries),'contentImages':sum(len(e['images']) for e in entries),'mode':'check' if args.check else 'generated'}))

if __name__=='__main__':main()
