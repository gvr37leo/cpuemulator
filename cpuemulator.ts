class Op{
    name:string
    constructor(public type:OpT,public cb:() => void,public size:number){
        this.name = cb.name
    }
}

enum flag{negative,zero,carry}

class CPUEmulator{
    registers = [0,0]
    ic = 0//instruction counter
    stack = []
    flags = [false,false,false]
    memory:OpT[] | number[] = []
    ops:Op[] = []

    constructor(){
        this.ops[OpT.noop] = new Op(OpT.noop,this.noop,1)
        this.ops[OpT.load] = new Op(OpT.load,this.load,3)
        this.ops[OpT.store] = new Op(OpT.store,this.store,3)
        this.ops[OpT.storereg] = new Op(OpT.storereg,this.storereg,1)
        this.ops[OpT.dref] = new Op(OpT.dref,this.dref,3)
        this.ops[OpT.dreg] = new Op(OpT.dreg,this.dreg,2)
        this.ops[OpT.drega] = new Op(OpT.drega,this.drega,1)
        this.ops[OpT.dregb] = new Op(OpT.dregb,this.dregb,1)
        this.ops[OpT.add] = new Op(OpT.add,this.add,1)
        this.ops[OpT.sub] = new Op(OpT.sub,this.sub,1)
        this.ops[OpT.mul] = new Op(OpT.mul,this.mul,1)
        this.ops[OpT.div] = new Op(OpT.div,this.div,1)
        this.ops[OpT.or] = new Op(OpT.or,this.or,1)
        this.ops[OpT.and] = new Op(OpT.and,this.and,1)
        this.ops[OpT.cmp] = new Op(OpT.cmp,this.cmp,1)
        this.ops[OpT.jmp] = new Op(OpT.jmp,this.jmp,1)
        this.ops[OpT.branch] = new Op(OpT.branch,this.branch,3)
        this.ops[OpT.call] = new Op(OpT.call,this.call,1)
        this.ops[OpT.ret] = new Op(OpT.ret,this.ret,1)
        this.ops[OpT.print] = new Op(OpT.print,this.print,1)
        this.ops[OpT.halt] = new Op(OpT.halt,this.halt,1)
    }

    reset(){
        this.registers = [0,0]
        this.ic = 0
        this.stack = []
        this.flags = [false,false,false]
    }

    exec(){
        cpu.ic = 0
        for(var i = 0; i < 1000 && this.ic < this.memory.length; i++){
            this.step()
        }
    }

    step(){
        if(this.ic < this.memory.length){
            var opi = this.memory[this.ic]
            var op = this.ops[opi]
            op.cb.call(this)
            this.ic += op.size
        }
    }

    noop(){

    }
    
    dref(){
        this.registers[this.memory[this.ic + 1]] = this.memory[this.memory[this.ic + 2]]
    }
    
    dreg(){
        this.registers[this.memory[this.ic + 1]] = this.memory[this.registers[this.ic + 1]]
    }
    
    drega(){
        this.registers[0] = this.memory[this.registers[0]]
    }
    
    dregb(){
        this.registers[1] = this.memory[this.registers[1]]
    }
    
    load(){
        this.registers[this.memory[this.ic + 1]] = this.memory[this.ic + 2]
    }
    
    
    store(){
        this.memory[this.memory[this.ic + 2]] = this.registers[this.memory[this.ic + 1]]
    }
    
    
    add(){
        this.registers[1] = this.registers[0] + this.registers[1]
    }
    
    
    sub(){
        this.registers[1] = this.registers[0] - this.registers[1]
    }
    
    
    mul(){
        this.registers[1] = this.registers[0] * this.registers[1]
    }
    
    
    div(){
        this.registers[1] = Math.floor(this.registers[0] / this.registers[1])
    }
    
    
    or(){
        this.registers[1] = this.registers[0] | this.registers[1]
    }
    
    
    and(){
        this.registers[1] = this.registers[0] & this.registers[1]
    }
    
    cmp(){
        var res = this.registers[0] - this.registers[1]
        this.flags[flag.zero] = res == 0
        this.flags[flag.negative] = res < 0
    }
    
    
    branch(){
        if((this.memory[this.ic + 1] == <unknown>this.flags[flag.negative]) && this.memory[this.ic + 2] == <unknown>(this.flags[flag.zero])){
            this.ic = this.registers[1] - this.ops[OpT.branch].size
        }
    }
    
    jmp(){
        this.ic = this.registers[1] - this.ops[OpT.jmp].size
    }
    
    je(){
        if(!this.flags[flag.negative] && this.flags[flag.zero]){
            this.jmp()
        }
    }
    
    jz(){
        this.je()
    }
    
    jne(){
        if(!this.flags[flag.negative] && !this.flags[flag.zero]){
            this.jmp()
        }
    }
    
    jnz(){
        this.jne()
    }
    
    jg(){
        if(!this.flags[flag.negative] && !this.flags[flag.zero]){
            this.jmp()
        }
    }
    
    print(){
        console.log(this.registers[1])
    }
    
    
    
    jnle(){
        this.jg()
    }
    
    jge(){
        if(!this.flags[flag.negative] && this.flags[flag.zero]){
            this.jmp()
        }
    }
    
    jnl(){
        this.jge()
    }
    
    jl(){
        if(this.flags[flag.negative] && !this.flags[flag.zero]){
            this.jmp()
        }
    }
    
    jnge(){
        this.jl()
    }
    
    jle(){
        if(this.flags[flag.negative] && this.flags[flag.zero]){
            this.jmp()
        }
    }
    
    jng(){
        this.jle()
    }
    
    call(){
        this.stack.push(this.ic)
        this.jmp()
    }
    
    ret(){
        this.ic = this.stack.pop()
    }
    
    halt(){
        this.ic = this.memory.length - 1
    }

    storereg(){//store what is in register 1 at adres in register 0
        this.memory[this.registers[0]] = this.registers[1]
    }
    
}


