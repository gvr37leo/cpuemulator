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

    @loopcode set; fibs,left
    add; *i,left
    add; -1,left

    set; fibs,right
    add; *i,right
    add; -2,right

    set; fibs,temp
    add; *i,temp
    add; left,*temp
    add; right,*temp

    incr; i
    jmp; loop

@end print; 4
