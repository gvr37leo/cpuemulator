#.mcset; 1000
#.labelset; gfx,3000
@fibs 1,1,0,0,0,0,0,0,0,0
@i 2
@left 0
@right 0
@temp 0
cmp; i,10
branch; loop
jmp; end

@loop move; &fibs,left
    add; i,left
    add; -1,left

    move; &fibs,right
    add; *i,right
    add; -2,right

    move; &fibs,temp
    add; i,temp
    add; left,*temp
    add; right,*temp

    incr; i

@end noop;
