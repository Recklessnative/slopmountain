"""Render every spoken line with Kokoro (neural TTS) into vo/NNN.mp3 and write vo/manifest.json."""
import json, glob, os, re, subprocess, sys, hashlib
import soundfile as sf
from kokoro_onnx import Kokoro

OUT = 'vo'
os.makedirs(OUT, exist_ok=True)
lines = []
for f in sorted(glob.glob('lines-*.json')):
    for who, t in json.load(open(f)):
        if [who, t] not in lines: lines.append([who, t])
lines.append(['', 'This is the narrator. Kim cannot hear me, but you can.'])

VOICES = {
    '': ('bm_george', .92, 'en-gb'),
    'Kim': ('bf_emma', 1.0, 'en-gb'),
    'Car radio': ('am_michael', 1.08, 'en-us'),
    'Sam, night shift': ('am_fenrir', .98, 'en-us'),
    'Finance': ('bf_isabella', 1.0, 'en-gb'),
    'HR': ('af_sarah', 1.0, 'en-us'),
    'Legal': ('bm_daniel', .98, 'en-gb'),
    'Sales': ('am_puck', 1.02, 'en-us'),
    'Exec office': ('am_onyx', .97, 'en-us'),
    'Team lead': ('af_nicole', 1.0, 'en-us'),
    'Jan, accounts payable': ('bm_lewis', 1.0, 'en-gb'),
    'Ana, night shift': ('af_heart', 1.0, 'en-us'),
    'Tom, new starter': ('am_liam', 1.0, 'en-us'),
    'Noor, customer service': ('bf_alice', 1.0, 'en-gb'),
    'Marco, sales': ('am_eric', 1.0, 'en-us'),
    'Lotte, team lead': ('af_kore', 1.0, 'en-us'),
}
def speakable(t):
    t = t.replace('“', '').replace('”', '').replace('‘', "'").replace('’', "'").replace('…', '... ').replace('✦', '')
    t = t.replace('CourseGen', 'Course Gen').replace('CourseCraft', 'Course Craft').replace('L&D', 'L and D')
    t = re.sub(r'\bLMS\b', 'L M S', t); t = re.sub(r'\bCFO\b', 'C F O', t); t = re.sub(r'\bCEO\b', 'C E O', t); t = re.sub(r'\bHR\b', 'H R', t)
    return re.sub(r'\s+', ' ', t).strip()

old = {}
if os.path.exists(f'{OUT}/manifest.json'): old = json.load(open(f'{OUT}/manifest.json'))
k = Kokoro('/tmp/kk/kokoro-v1.0.int8.onnx', '/tmp/kk/voices-v1.0.bin')
manifest = {}
for i, (who, t) in enumerate(lines):
    key = f'{who}|{t}'
    name = f'{OUT}/' + hashlib.md5(key.encode()).hexdigest()[:10] + '.mp3'
    if os.path.exists(name):
        manifest[key] = name; continue
    v, sp, lang = VOICES.get(who, ('af_bella', 1.0, 'en-us'))
    samples, sr = k.create(speakable(t), voice=v, speed=sp, lang=lang)
    sf.write('/tmp/kk/tmp.wav', samples, sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/kk/tmp.wav', '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.12',
                    '-ac', '1', '-ar', '24000', '-b:a', '48k', name], check=True)
    manifest[key] = name
    print(i, len(lines), who or 'narrator', t[:60], flush=True)
json.dump(manifest, open(f'{OUT}/manifest.json', 'w'), ensure_ascii=False, indent=0)
print('done', len(manifest))
