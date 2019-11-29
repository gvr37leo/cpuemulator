jmp; start
@a 1
@b 2
@start cmp; a,b
branch; true,1,0

jmp; false
@true print;

@false print;