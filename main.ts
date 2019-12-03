/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="cpuemulator.ts" />
/// <reference path="assembler.ts" />
/// <reference path="explanation.ts" />
/// <reference path="projectutils.ts" />


//update bin/memory after run/step
//maybe somehow separate linenumber and comments from binary/memory
//add linenumber opname instruction pointer

var cpu =  new CPUEmulator()
var assemblyArea:HTMLTextAreaElement = query('#assembly') as any
var linenumberArea:HTMLTextAreaElement = query('#linenumber') as any
var opnameArea:HTMLTextAreaElement = query('#opname') as any
var srcassemblyArea:HTMLTextAreaElement = query('#srcassembly') as any
var instructionpointerArea:HTMLTextAreaElement = query('#instructionpointer') as any
var binaryArea:HTMLTextAreaElement = query('#binary') as any

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
var assemblytablecontainer:HTMLElement = query('#assemblytablecontainer') as any
var machinecodetablecontainer:HTMLElement = query('#machinecodetablecontainer') as any
var setmembtn = query('#setmembtn')
var assemblyret:AssemblyRet = null



assemblyArea.value = `print; 12`
execcompile()
syncscrollbars(binaryArea,[linenumberArea,opnameArea,instructionpointerArea,srcassemblyArea,])
updateinput()

document.addEventListener('keydown',e => {

    if(e.code == 'F10'){
        e.preventDefault()
        cpu.step()
        updateinput()    
    }
})

compile.addEventListener('click',() => {
    execcompile()
    updateinput()
})

run.addEventListener('click',() => {
    cpu.exec()
    updateinput()
})

step.addEventListener('click', () =>{
    cpu.step()
    updateinput()
})

setmembtn.addEventListener('click',() => {
    cpu.memory = binaryArea.value.split('\n').map(v => parseInt(v))
    updatememarea()
})

icsetbutton.addEventListener('click',() => {
    if(Number.isInteger(instructioncounter.valueAsNumber)){
        cpu.ic = instructioncounter.valueAsNumber
    }else{
        cpu.ic = 0
    }
    updateinput()
})
function execcompile(){
    assemblyret = assemble(assemblyArea.value)
    cpu.memory = assemblyret.binary
    cpu.reset()
}


function updateinput(){
    var bin:number[] = cpu.memory
    linenumberArea.value = bin.map((v,i) => i.toString()).join('\n')
    var textip = bin.map(() => '')
    textip[cpu.ic] = '=>'
    instructionpointerArea.value = textip.join('\n')
    updatememarea()
    var textsrcassembly = bin.map(() => '')
    assemblyret.sourcemap.forEach((v,k) => {
        textsrcassembly[k] = assemblyret.parsedRows[v].row
    })
    srcassemblyArea.value = textsrcassembly.join('\n')


    
    var textop = bin.map((v,i) => '')
    for(var i = 0; i < bin.length;){
        if(assemblyret.datamap.has(i)){
            i++;
            continue
        }
        var op = cpu.ops[bin[i]]
        textop[i] = op.name
        i += op.size
    }
    opnameArea.value = textop.join('\n')


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

function updatememarea(){
    var bin:number[] = cpu.memory
    var textbin = bin.map((v,i) => v.toString())
    binaryArea.value = textbin.join('\n')
}


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

var assemblytable = new Table<string[]>([
    new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[0]
        return el
    }),new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[1]
        return el
    }),new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[2]
        return el
    })
])
assemblytablecontainer.appendChild(assemblytable.element)
assemblytable.load(asseblycodetabledata)

var machinecodetable = new Table<string[]>([
    new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[0]
        return el
    }),new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[1]
        return el
    }),new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[2]
        return el
    }),new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[3]
        return el
    }),new Column([],(arr,i) => {
        var el = document.createElement('span') 
        el.innerText = arr[4]
        return el
    })
])
machinecodetablecontainer.appendChild(machinecodetable.element)
machinecodetable.load(machinecodetabledata)

function query(string:string){
    return document.querySelector(string)
}

function syncscrollbars(src:HTMLElement,dst:HTMLElement[]){
    src.addEventListener('scroll', e => {
        for(var d of dst){
            d.scrollTop = src.scrollTop
        }
    })
}
