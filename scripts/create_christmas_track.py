#!/usr/bin/env python3
"""Generate an ORIGINAL holiday instrumental for Taxi SurfCity Lainez.

Uses the distro's system General MIDI soundfont only during rendering.
The generated MP3 is an original composition, not an existing recording.
"""
from __future__ import annotations
import ctypes as c
from pathlib import Path
import subprocess
import tempfile
import numpy as np
import pretty_midi
import soundfile as sf

BPM=112
BEAT=60/BPM
START=.28
pm=pretty_midi.PrettyMIDI(initial_tempo=BPM)
config={'piano':(0,False),'celesta':(8,False),'glock':(9,False),
        'harp':(46,False),'strings':(48,False),'choir':(52,False),
        'bass':(32,False),'jingles':(0,True)}
instruments={}
for name,(program,drum) in config.items():
    instrument=pretty_midi.Instrument(program=program,is_drum=drum,name=name)
    pm.instruments.append(instrument)
    instruments[name]=instrument

def note(track,pitch,beat,duration,volume):
    pitch=pretty_midi.note_name_to_number(pitch) if isinstance(pitch,str) else pitch
    instruments[track].notes.append(pretty_midi.Note(
        velocity=volume,pitch=pitch,start=START+beat*BEAT,end=START+(beat+duration)*BEAT))

# Standard major/minor chords support a newly composed festive melody.
chords=[
 ('C','E','G','C'),('F','A','C','F'),('G','B','D','G'),('C','E','G','C'),
 ('C','E','G','C'),('Am','C','E','A'),('F','A','C','F'),('G','B','D','G'),
 ('Em','G','B','E'),('Am','C','E','A'),('Dm','F','A','D'),('G','B','D','G'),
 ('C','E','G','C'),('F','A','C','F'),('Dm','F','A','D'),('G','B','D','G'),
 ('Am','C','E','A'),('F','A','C','F'),('C','E','G','C'),('G','B','D','G'),
 ('C','E','G','C'),('F','A','C','F'),('G','B','D','G'),('C','E','G','C')]
roots={'C':'C3','F':'F2','G':'G2','Am':'A2','Em':'E2','Dm':'D2'}
# 24 short original melodic phrases, bar-relative times (beats).
melody=[
 [(0,'E5',.7),(1,'G5',.75),(2,'A5',.75),(3,'G5',.75)],
 [(0,'A5',.65),(.75,'C6',.5),(1.5,'A5',.65),(2.25,'G5',.65),(3,'F5',.75)],
 [(0,'D5',.65),(.75,'G5',.5),(1.5,'B5',.65),(2.25,'A5',.5),(2.75,'G5',.95)],
 [(0,'E5',.55),(.75,'D5',.5),(1.5,'C5',1.5),(3.25,'G5',.45)],
 [(0,'G5',.55),(.75,'C6',.55),(1.5,'B5',.5),(2.25,'G5',.55),(3,'E5',.7)],
 [(0,'A5',.6),(.75,'C6',.5),(1.5,'E6',.65),(2.5,'C6',.55),(3.25,'A5',.45)],
 [(0,'A5',.7),(1,'G5',.65),(1.75,'F5',.55),(2.5,'E5',.5),(3.2,'F5',.55)],
 [(0,'G5',.58),(.75,'B5',.53),(1.5,'D6',.6),(2.25,'B5',.5),(3,'G5',.75)],
 [(0,'B5',.6),(.75,'G5',.5),(1.5,'E5',.6),(2.25,'G5',.45),(3,'B5',.7)],
 [(0,'C6',.6),(.75,'E6',.5),(1.5,'C6',.65),(2.25,'A5',.55),(3,'E5',.7)],
 [(0,'F5',.55),(.75,'A5',.55),(1.5,'D6',.62),(2.25,'A5',.47),(3,'F5',.75)],
 [(0,'D5',.55),(.75,'G5',.5),(1.5,'B5',.6),(2.25,'G5',.5),(3,'D6',.76)],
 [(0,'E6',.68),(1,'C6',.55),(1.75,'G5',.5),(2.5,'E5',.55),(3.15,'G5',.6)],
 [(0,'A5',.6),(.75,'C6',.53),(1.5,'A5',.66),(2.25,'G5',.5),(3,'F5',.8)],
 [(0,'A5',.53),(.75,'F5',.55),(1.5,'D5',.6),(2.25,'F5',.55),(3,'A5',.73)],
 [(0,'G5',.63),(.75,'B5',.55),(1.5,'D6',.6),(2.25,'B5',.5),(3,'G5',.8)],
 [(0,'A5',.68),(.9,'C6',.5),(1.5,'E6',.6),(2.5,'C6',.6),(3.2,'A5',.55)],
 [(0,'F5',.55),(.75,'A5',.55),(1.5,'C6',.75),(2.5,'A5',.5),(3,'G5',.7)],
 [(0,'E5',.55),(.75,'G5',.55),(1.5,'C6',.6),(2.25,'B5',.55),(3,'G5',.74)],
 [(0,'D5',.5),(.75,'G5',.55),(1.5,'B5',.68),(2.5,'A5',.55),(3.15,'G5',.5)],
 [(0,'G5',.55),(.7,'C6',.55),(1.5,'E6',.55),(2.25,'C6',.55),(3,'G5',.75)],
 [(0,'A5',.6),(.75,'C6',.5),(1.5,'F6',.6),(2.5,'C6',.5),(3,'A5',.75)],
 [(0,'G5',.65),(.75,'B5',.5),(1.5,'D6',.7),(2.5,'G5',.65),(3.25,'D5',.35)],
 [(0,'E5',.64),(.75,'D5',.51),(1.5,'C5',1.9)]
]
for bar,(harmony,third,fifth,upper) in enumerate(chords):
    start=bar*4
    pattern=[third+'4',fifth+'4',upper+'5',fifth+'4']*2
    for j,pitch in enumerate(pattern):
        note('piano',pitch,start+j*.5,.37,42 if bar<4 or bar>19 else 55)
    if 3<=bar<=22:
        note('bass',roots[harmony],start,1.1,48)
        note('bass',roots[harmony],start+2,1.0,43)
    if 2<=bar<=22:
        for pitch in [third+'4',fifth+'4',upper+'5']:
            note('strings',pitch,start+.08,3.7,40)
    if 11<=bar<21:
        note('choir',third+'4',start+.13,3.65,35)
        note('choir',upper+'5',start+.13,3.65,29)
    if 4<=bar<23:
        for offset,pitch in [(.8,third+'5'),(1.8,fifth+'5'),(2.8,upper+'5')]:
            note('harp',pitch,start+offset,.6,36)
    if bar>=2:
        for offset,pitch,duration in melody[bar]:
            note('celesta',pitch,start+offset,min(duration,.97),75 if bar<20 else 58)
            if bar>=12 and offset in (0,1.5):
                note('glock',pitch,start+offset,min(duration,.7),48)
    if 3<=bar<=22:
        for j in range(8):
            note('jingles',83,start+j*.5,.16,33 if j%2 else 40)
        note('jingles',54,start,.20,22)
        note('jingles',54,start+2,.18,19)
    if bar in (3,7,11,15,19,23):
        note('glock','C6' if bar==23 else 'G6',start+3.1,.5,54)

lib=c.CDLL('libfluidsynth.so.3')
def bind(name,restype,argtypes):
    f=getattr(lib,name)
    f.restype=restype
    f.argtypes=argtypes
    return f
P=c.c_void_p; I=c.c_int; F=c.c_float; D=c.c_double; S=c.c_char_p
settings=bind('new_fluid_settings',P,[])()
bind('fluid_settings_setnum',I,[P,S,D])(settings,b'synth.sample-rate',44100.0)
bind('fluid_settings_setnum',I,[P,S,D])(settings,b'synth.gain',.32)
synth=bind('new_fluid_synth',P,[P])(settings)
soundfont='/usr/share/sounds/sf2/TimGM6mb.sf2'
assert Path(soundfont).is_file(),'Install package timgm6mb-soundfont'
assert bind('fluid_synth_sfload',I,[P,S,I])(synth,soundfont.encode(),1)>=0
program=bind('fluid_synth_program_change',I,[P,I,I])
noteon=bind('fluid_synth_noteon',I,[P,I,I,I])
noteoff=bind('fluid_synth_noteoff',I,[P,I,I])
write=bind('fluid_synth_write_float',I,[P,I,P,I,I,P,I,I])
channels=[0,1,2,3,4,5,6,9]
events=[]
for (name,instrument),ch in zip(instruments.items(),channels):
    if not instrument.is_drum:program(synth,ch,instrument.program)
    for n in instrument.notes:
        events.append((round(n.start*44100),1,ch,n.pitch,n.velocity))
        events.append((round(n.end*44100),0,ch,n.pitch,0))
events.sort(key=lambda x:(x[0],x[1]))
frames=int((pm.get_end_time()+2)*44100)
left=np.zeros(frames,np.float32)
right=np.zeros(frames,np.float32)
cursor=0
def render(begin,count):
    while count>0:
        size=min(2048,count)
        l=(F*size)()
        r=(F*size)()
        write(synth,size,c.cast(l,P),0,1,c.cast(r,P),0,1)
        left[begin:begin+size]=np.ctypeslib.as_array(l)
        right[begin:begin+size]=np.ctypeslib.as_array(r)
        begin+=size
        count-=size
for index,kind,ch,pitch,velocity in events:
    if index>cursor:
        render(cursor,index-cursor)
        cursor=index
    if kind:noteon(synth,ch,pitch,velocity)
    else:noteoff(synth,ch,pitch)
render(cursor,frames-cursor)
audio=np.stack([left,right],axis=1)
audio[:15435]*=np.linspace(0,1,15435)[:,None]
fade=min(int(1.7*44100),len(audio))
audio[-fade:]*=np.linspace(1,0,fade)[:,None]
peak=float(np.max(abs(audio)))
if peak>0:audio*=min(.96/peak,2.15)
output=Path('assets/audio/navidad-surfcity-original.mp3')
output.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    wav=Path(tmp)/'track.wav'
    sf.write(wav,audio,44100,subtype='PCM_16')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',
      '-i',str(wav),'-codec:a','libmp3lame','-b:a','128k','-ar','44100',str(output)],check=True)
print('Original Christmas instrumental:',output,'bytes:',output.stat().st_size)
