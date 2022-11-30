<style>
    body{
      background-color:#444444;
      color:#dddddd;
      font-family:monospace;
      width:50rem;
      margin:2rem auto;
    }

    h1{
      font-size:1.5rem;
      margin-bottom:0;
    }

    h2{
      font-weight:bold;
    }
    h3{
      font-weight:normal;
      text-decoration:underline;
      text-transform: uppercase;
    }

    pre > code{
    
      display:block;
      margin-left:2em;
      margin-right:4em;
      padding:1rem;
    }

    code{
        background-color:#222222;
        color:#9a9a9a;
        text-transform:uppercase;
    }

    a{
        color:#aaaaaa;
    }

    a:hover{
        color:#eeeeee;
    }

    li{
        margin-bottom:0.5em;
        margin-top:0.5em;
    }

    .contents-link{
        position:fixed;
        top:25%;
        left:75%;
        padding:1rem 2rem;
        background-color:#222222;
        color:#9a9a9a;
        display:block;
    }

    .contents-link > ul{
        padding:0 !important;
        list-style-type:none;
    }

    .contents-link ul ul{
        list-style-type:none;
        padding-left: 1em !important;
    }

</style>

<nav class="contents-link">
    <ul>
        <li>
            <a href="#graphics">Graphics</a>
            <ul>
                <li><a href="#print-at">PRINT@</a></li>
                <li><a href="#line">LINE</a></li>
                <li><a href="#accent">ACCENT</a></li>
            </ul>
        </li>
        <li>
            <a href="#sound">Sound</a>
            <ul>
            </ul>
        </li>
        <li>
            <a href="#file-saving">File Saving</a>
            <ul>
                <li><a href="#print-at">PRINT@</a></li>
                <li><a href="#line">LINE</a></li>
                <li><a href="#accent">ACCENT</a></li>
            </ul>
        </li>
    </ul>
</nav>

# Specs

* Screen
    - 240x180
* Graphics
    - Text based
    - 8x8 editable font
    - 128 character ASCII with an 'accent bit' to assign color
    - 1 bit with an accent color
    - 8 accent color choices changable at any point.
* Language
    - Dialect of basic
    - Gameloop is unsynchronized. Things happen when they happen.
* Sound
    - 2 sine beepers.
    - Controlled with MML

# BASIC Quick Reference

## Graphics

<a id="print-at"></a>
### PRINT@ X,Y,STR$[,drawmode]

Prints `str$` at the given character coordinate.

`Drawmode` takes these values

<ol start="0">
    <li>Draws as normal. Spaces do not replace characters in buffer. Default behavior.</li>
    <li>Draws the same as drawmode 0, except with inverted colors.</li>
    <li>Draws the same as drawmode 0, except spaces replace characters in buffer.</li>
    <li>Draws the same as drawmode 2, except with inverted colors.</li>
    <li>Sets the accent bits of the target characters to those of str$.</li>
    <li>Sets the accent bits of the target characters to the opposite of those of str$.</li>
    <li>Inverts the accent bits of the target characters where the bit is set in str$.</li>
</ol>

```
PRINT@ PX,PY,PS$ 'Prints the layer
PRINT@ EX,EY,ES$,0,1 'Clears the enemy position
PRINT@ BX,BY,MAP$(BX,BY),0,2 'Replaces the bullet with the map character underneath it.
```

<a id="line"></a>
### LINE X1,Y1,X2,Y2,STR$[,drawmode]

Prints `str$` at each point on the line between the first coordinate and the second coordinate. See <a href="#print-at">PRINT@</a> for information on how printing works.

```
LINE PX,PY,EX,EY,"*" 'DRAWS A LINE OF *S BETWEEN THE PLAYER AND ENEMY
LINE 0,0,40,0," ",0,2 'ERASES THE TOP LINE OF THE SCREEN
```

<a id="accent"></a>
### ACCENT num

Sets the accent color to `num`. The options are: [TODO: Examples of the colors]

<ol start="0">
    <li>Red</li>
    <li>Orange</li>
    <li>Yellow</li>
    <li>Green</li>
    <li>Blue</li>
    <li>Pink</li>
    <li>Purple</li>
    <li>Gray</li>
</ol>

This accent color is used to draw characters which have the color bit set to 1. (to achieve this, simply type a character when holding ALT)

```
ACCENT 0 'SETS ACCENT TO RED
ACCENT 5 'SETS ACCENT TO PINK
```

<a id="cls"></a>
### CLS [str$, drawmode]

Clears the screen by filling it with `str$`. `str$` defaults to " " and `drawmode` defaults to 2. See <a href="#print-at">PRINT@</a> for information on how printing works.

<pre><code style="font-style:normal !important;">CLS 'CLEARS THE SCREEN TO BLACK
CLS " ",1 'CLEARS THE SCREEN TO WHITE
CLS "*",0 'COVERS THE SCREEN WITH WHITE STARS ON BLACK
CLS "<span style="color:red;">*</span>",4 'TURNS ON THE ACCENT BIT OF EVERY CHARACTER ON THE SCREEN</code>
</pre>

<a id="screen"></a>
### SCREEN$(X,Y)

Returns the character on the screen at the given coordinate.

```
ls$ = SCREEN$(px,py) ' Stores the character that was underneath the player.
```

<a id="strings"></a>
## Strings

<a id="flip"></a>
### FLIP$(STR$)

Returns `STR$` with the accent bit of each character flipped.

```
M$(FX,FY) = FLIP$(M$(FX,FY)) 'FLIPS THE ACCENT BIT AT M$(FX,FY)
```

<a id="slice"></a>
### SLICE$(STR$[,START,END])

Returns the characters in `STR$` from index `START` to index `END`. If `START` or `END` are negative, it starts counting from the end of the `STR$` instead. `Start` defaults to 0 (calling it without this is possible but essentially worthless). `END` defaults to -0, the end of the string 

```
LN$ = SLICE$("10 HELLO",3) 'REMOVES THE LINE NUMBER SEGMENT OF THIS CODE
TI$ = SLICE$("|-O-|",1,3) 'GETS ONLY THE COCKPIT SECTION OF THE TIE FIGHTER
NS$ = SLICE$("HELLOO",0,-1) 'REMOVES THE LAST CHARACTER OF THE STRING
```

## Gameplay

<a id="touch"></a>
### TOUCH(X1,Y1,S1$,X2,Y2,S2$)

Returns 1 if `S1$` at the first coordinate would intersect with `S2$` at the second coordinate. Used for collision detection.

```
if touch(px,py,ps$,ex,ey,es$) then gosub "gameover" ' Gameover when player hits enemy.
```