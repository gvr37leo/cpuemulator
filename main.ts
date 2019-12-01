/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="cpuemulator.ts" />
/// <reference path="assembler.ts" />



var cpu =  new CPUEmulator()
var assembly:HTMLTextAreaElement = query('#assembly') as any
var binary:HTMLTextAreaElement = query('#binary') as any
var compile = query('#compile')
var run = query('#run')
var step = query('#step')

var negativeflag:HTMLInputElement = query('#negativeflag') as any
var zeroflag:HTMLInputElement = query('#zeroflag') as any
var carryflag:HTMLInputElement = query('#carryflag') as any
var registera:HTMLInputElement = query('#registera') as any
var registerb:HTMLInputElement = query('#registerb') as any
var instructioncounter:HTMLInputElement = query('#instructioncounter') as any
var currentinstruction:HTMLInputElement = query('#currentinstruction') as any
var icsetbutton:HTMLInputElement = query('#icsetbutton') as any

assembly.value = `print; 12`
execcompile()

function execcompile(){
    var res = assemble(assembly.value)
    var sourcemap = res.sourcemapString
    var bin = res.binary
    var textbin = bin.map((v,i) => i + '\t' + v.toString())
    sourcemap.forEach((v,k) => {
        textbin[k] += ' #' + v
    })
    binary.value = textbin.join('\n')
    cpu.memory = bin
}

compile.addEventListener('click',() => {
    execcompile()
})

run.addEventListener('click',() => {
    cpu.exec()
})

icsetbutton.addEventListener('click',() => {
    if(Number.isInteger(instructioncounter.valueAsNumber)){
        cpu.ic = instructioncounter.valueAsNumber
    }else{
        cpu.ic = 0
    }
    updateinput()
})

function updateinput(){
    negativeflag.checked = cpu.flags[flag.negative]
    zeroflag.checked = cpu.flags[flag.zero]
    carryflag.checked = cpu.flags[flag.carry]
    registera.value = cpu.registers[0].toString()
    registerb.value = cpu.registers[1].toString()
    instructioncounter.value = cpu.ic.toString()
    if(cpu.ic >= cpu.memory.length){
        currentinstruction.value = 'noop'
    }else{
        currentinstruction.value = cpu.ops[cpu.memory[cpu.ic]].name
    }
}
updateinput()
step.addEventListener('click', () =>{
    cpu.step()
    updateinput()
})


fetch('./test.as')
.then(res => res.text())
.then(text => {
    // cpu.memory = assemble(text)
    // cpu.exec()
});

fib()

function fib(){
    var fibs = [1,1]
    for(var i = 2; i < 10; i++){
        fibs.push(fibs[i - 1] + fibs[i - 2])
    }
    return fibs
}

function query(string:string){
    return document.querySelector(string)
}