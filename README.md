# BA-T

A fantasy console with a custom BASIC interpreter written in Javascript. Written for my high school senior project for the Programming and Web Development major at Minuteman High School.

## How to run

In the root of the repository, run whatever web server you like. I use `python3 -m http.server`.

More docs will be added shortly (message me if you want to run this for some reason)

## Screenshots

![capture-folks](https://user-images.githubusercontent.com/43593885/204925711-bb66f46c-e245-4d32-8855-1377ad05e442.gif)
![game-making-fast](https://user-images.githubusercontent.com/43593885/204925807-9b23a629-d553-4a4b-9b56-5202d2942b6e.gif)
![shape-drawing-loop](https://user-images.githubusercontent.com/43593885/204925881-0e038988-1873-403b-a64f-9fc67824f7ff.gif)

## Example code

Mangled text is special graphics characters and color codes.

```BASIC
5 sw=29:sh=23:sc=0
10 psp=0.4:px=sw/2:py=sh/2-3:ps="Bâ":pl=3:pe=1
20 exone=rndi(0,sw):extwo=rndi(0,sw):emone=0.25:emtwo=-0.25
25 plx=0:ply=0:pls=Mâ"
30 es="A":eeone=1:eetwo=0
35 by=0:be=0:bsp=0.25:bh=0
36 biy=rndi(0,sh-6):bix=sw+1:bisp=-0.25:bis="Gâ"
37 dtime=-1
40 ifpeandinp("w")thenpy=py-psp
50 ifpeandinp("s")thenpy=py+psp
60 ifpeandinp("a")thenpx=px-psp
70 ifpeandinp("d")thenpx=px+psp
71 lfire=0
75 ifpeandinpp("l")andnotbethenbe=1:by=py:bx=px:bh=0:snd"a100b16c100":lfire = 1
76 ifbethenby=flr(py):bx=flr(px):bh=bh+bsp
77 ifbeandby+flr(bh)+1>sh-2thenbe=0:snd"o1a100b100c100":ifflr(bx)=flr(exone)theneeone=0:dtime=120:snd"o3c16a16o4e16"
78 bix=bix+bisp:bisp=bisp-0.00002:ifflr(bix)=flr(px)andflr(biy)=flr(py)thenifpethenpe=0:snd"o3bed"
79 ifbix<0thenbix=sw+1:biy=rndi(-1,1)+py:snd"o2a10"
80 ifpx>swthenpx=0
90 ifpx<0thenpx=sw-1
95 plx=plx+atntwo
100 ifpy>sh-6thenpy=sh-6
110 ifpy<0thenpy=0
200 exone = exone + emone
210 ifexone>swthenexone=0
220 extwo=extwo+emtwo
230 ifextwo<0thenextwo=sw
240 dtime=dtime-1:ifdtime=0thenexone=rndi(0,sw):eeone=1:emone=emone+0.05:sc=sc+1
2100 print@0,0,"capture folks"
2101 print@0,1,str(sc)
2105 print@bix,biy,bis
2110 rect0,sh-1,sw,sh-1,"P"
2200 ifpethenprint@px,py,ps
2205 ifnotpethenprint@sw/2-2,sh/2-1,"dâeâaâdâ"
2210 ifbethenlinebx,by+1,bx,by+bh,"Râ"
2300 ifeeonethenprint@exone,sh-2,es
2310 ifeetwothenprint@extwo,sh-2,es
2320 rem iSCAPEflfirethenfrect0,0,30,30,"Pâ",4
10000 wait:cls:goto 40

```
