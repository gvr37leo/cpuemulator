/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />

function cload(register,value){
    return [OpT.load,register,value]
}

function noop(){}

function dref(){
    var add = memory[ic + 1]
    memory[add] = memory[memory[add]]
}

function load(){
    registers[memory[ic + 1]] = memory[ic + 2]
}

function store(){
    memory[ic + 2] = registers[memory[ic + 1]]
}

function add(){
    registers[1] = registers[0] + registers[1]
}

function sub(){
    registers[1] = registers[0] - registers[1]
}

function mul(){
    registers[1] = registers[0] * registers[1]
}

function div(){
    registers[1] = Math.floor(registers[0] / registers[1])
}

function or(){
    registers[1] = registers[0] | registers[1]
}

function and(){
    registers[1] = registers[0] & registers[1]
}

function cmp(){
    var res = registers[0] - registers[1]
    flags[flag.zero] = res == 0
    flags[flag.negative] = res < 0
}

function jmp(){
    ic = memory[ic + 1] - ops[OpT.jmp].size
}

function branch(){
    if(flags[memory[ic + 2]]){
        jmp()
    }
}

function call(){
    stack.push(ic)
    jmp()
}

function ret(){
    ic = stack.pop()
}

class Op{
    constructor(public type:OpT,public cb:() => void,public size:number){

    }
}

enum OpT{noop,load,store,dref,add,sub,mul,div,or,and,cmp,jmp,jz,call,ret}


// noop
// load direct a/b
// store direct a/b
// add a b
// sub a b
// mul a b
// div a b
// or and xor neg shift
// cmp a b
// jmp address/label/direct
// jz jnz jl jle jge jg, address/label/direct
// call address/label/direct


var ic = 0
var ops:Op[] = []
ops[OpT.noop] = new Op(OpT.noop,noop,1)
ops[OpT.load] = new Op(OpT.load,load,3)
ops[OpT.store] = new Op(OpT.store,store,3)
ops[OpT.dref] = new Op(OpT.dref,dref,2)
ops[OpT.add] = new Op(OpT.add,add,1)
ops[OpT.sub] = new Op(OpT.sub,sub,1)
ops[OpT.mul] = new Op(OpT.mul,mul,1)
ops[OpT.div] = new Op(OpT.div,div,1)
ops[OpT.or] = new Op(OpT.or,or,1)
ops[OpT.and] = new Op(OpT.and,and,1)
ops[OpT.cmp] = new Op(OpT.cmp,cmp,1)
ops[OpT.jmp] = new Op(OpT.jmp,jmp,2)
ops[OpT.call] = new Op(OpT.call,call,2)
ops[OpT.ret] = new Op(OpT.ret,ret,1)
var registers = [0,0]
var stack = []
var flags = [false,false]
enum flag{zero,negative}
var params = [0,0,0]
var memory:OpT[] | number[] = [
    ...cload(0,8),
    ...cload(1,9),
    OpT.cmp
]


for(var i = 0; i < 1000 && ic < memory.length; i++){
    var opi = memory[ic]
    var op = ops[opi]
    op.cb()
    ic += op.size
}