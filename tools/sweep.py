import re, json, glob
s=open('slop-mountain.html').read()
js=s[s.index('<script>',s.index('three.min.js')):]
lit=r"'((?:[^'\\]|\\.)*)'"
found=set()
def add(w,t):
    t=t.replace("\\'","'")
    if len(t.split())>=2: found.add((w,t))
# say([...]) regions
for m in re.finditer(r'say\(\[', js):
    i=m.end(); depth=1
    while depth and i<len(js):
        c=js[i]
        if c=="'":
            j=i+1
            while js[j]!="'":
                j+= 2 if js[j]=='\\' else 1
            i=j
        elif c=='[': depth+=1
        elif c==']': depth-=1
        i+=1
    seg=js[m.end():i-1]
    for mm in re.finditer(r"(kim\(|sam\(|radio\(|them\([^,]+,\s*)?"+lit, seg):
        pre=mm.group(1) or ''
        w='Kim' if pre.startswith('kim') else 'Sam, night shift' if pre.startswith('sam') else 'Car radio' if pre.startswith('radio') else None if pre.startswith('them') else ''
        if w is not None: add(w, mm.group(2))
# generate() narration dict
m=re.search(r"const lines = \{(.*?)\};", js)
for mm in re.finditer(r"\d+:\s*"+lit, m.group(1)): add('', mm.group(1))
# talks
for mm in re.finditer(r"\{ who: '([^']+)', ask: "+lit+", q: "+lit+", a: "+lit+", k: "+lit+", r: "+lit+", after: "+lit, js):
    w=mm.group(1); add(w,mm.group(2)); add('Kim',mm.group(3)); add(w,mm.group(4)); add('Kim',mm.group(5)); add(w,mm.group(6)); add('',mm.group(7))
h=set()
for f in glob.glob('lines-*.json'):
    for w,t in json.load(open(f)): h.add((w,t))
miss=sorted(found-h)
print(len(found),len(h),'missing',len(miss))
for w,t in miss: print(repr(w),t[:100])
json.dump([list(x) for x in miss],open('lines-zsweep.json','w'),ensure_ascii=False)
