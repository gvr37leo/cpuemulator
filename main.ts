/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="assembler.ts" />

function cnoop(){
    return [OpT.noop]
}

function noop(){

}

function dref(){
    registers[memory[ic + 1]] = memory[memory[ic + 2]]
}

function dreg(){
    registers[memory[ic + 1]] = memory[registers[ic + 1]]
}

function cdref3(reg,address){
    return [OpT.dref,reg,address]
}

function load(){
    registers[memory[ic + 1]] = memory[ic + 2]
}

function cload3(reg,value){
    return [OpT.load,reg,value]
}


function store(){
    memory[ic + 2] = registers[memory[ic + 1]]
}

function cstore3(reg,adr){
    return [OpT.store,reg,adr]
}

function add(){
    registers[1] = registers[0] + registers[1]
}

function cadd1(){
    return [OpT.add]   
}

function sub(){
    registers[1] = registers[0] - registers[1]
}

function csub(){
    return [OpT.sub]
}

function mul(){
    registers[1] = registers[0] * registers[1]
}

function cmul(){
    return [OpT.mul]
}

function div(){
    registers[1] = Math.floor(registers[0] / registers[1])
}

function cdiv(){
    return [OpT.div]
}

function or(){
    registers[1] = registers[0] | registers[1]
}

function cor(){
    return [OpT.or]
}

function and(){
    registers[1] = registers[0] & registers[1]
}

function cand(){
    return [OpT.and]
}

function cmp(){
    var res = registers[0] - registers[1]
    flags[flag.zero] = res == 0
    flags[flag.negative] = res < 0
}

function ccmp1(){
    return [OpT.cmp]
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

function ccall(to){
    return [OpT.call,to]
}


function ret(){
    ic = stack.pop()
}

function cret(){
    return [OpT.ret]
}

function ccmpadrs7(a,b){
    return [
        ...cdref3(0,a),
        ...cdref3(1,b),
        ...ccmp1()
    ]
}






function caddadr10(adra,adrb){
    return [
        ...cdref3(0,adra),
        ...cdref3(1,adrb),
        ...cadd1(),
        ...cstore3(1,adrb)
    ]
}

class Op{
    constructor(public type:OpT,public cb:() => void,public size:number){

    }
}

enum OpT{noop,load,store,dref,dreg,add,sub,mul,div,or,and,cmp,jmp,jz,call,ret}


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



var ops:Op[] = []
ops[OpT.noop] = new Op(OpT.noop,noop,1)
ops[OpT.load] = new Op(OpT.load,load,3)
ops[OpT.store] = new Op(OpT.store,store,3)
ops[OpT.dref] = new Op(OpT.dref,dref,3)
ops[OpT.dreg] = new Op(OpT.dreg,dreg,2)
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
var ic = 0//instruction counter
var stack = []
var flags = [false,false]
enum flag{zero,negative}
var params = [0,0,0]
var memory:OpT[] | number[] = [
]

function exec(){
    ic = 0
    for(var i = 0; i < 1000 && ic < memory.length; i++){
        var opi = memory[ic]
        var op = ops[opi]
        op.cb()
        ic += op.size
    }
}

fetch('./test.as')
.then(res => res.text())
.then(text => {
    assemble(text)
});


fib()

function fib(){
    var fibs = [1,1]
    for(var i = 2; i < 10; i++){
        fibs.push(fibs[i - 1] + fibs[i - 2])
    }
    return fibs
}