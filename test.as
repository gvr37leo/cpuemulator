#.mcset; 1000
#.labelset; gfx,3000
jmp; loop
@fibs 1,1,0,0,0,0,0,0,0,0
@i 2
@left 0
@right 0
@temp 0
@loop cmp; *i,10
    branch; loopcode,1,0
    jmp; end

    @loopcode set; left,fibs
    add; left,*i
    add; left,-1

    set; right,fibs
    add; right,*i
    add; right,-2

    set; temp,fibs
    add; temp,*i
    add; *temp,**left
    add; *temp,**right

    incr; i
    jmp; loop

@end print; 4
