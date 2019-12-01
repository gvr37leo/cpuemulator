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


assemblyArea.value = `print; 12`
execcompile()
syncscrollbars([linenumberArea,opnameArea,instructionpointerArea,binaryArea])

function syncscrollbars(elements:HTMLElement[]){
    for(var i = 0; i < elements.length;i++){
        let el = elements[i]
        el.addEventListener('scroll', () => {
            syncscrollbar(el,elements.filter(v => v != el))
        })
    }
}

function syncscrollbar(src:HTMLElement,dstnations:HTMLElement[]){
    for(var dst of dstnations){
        dst.scrollTop = src.scrollTop
    }
}

function execcompile(){
    var res = assemble(assemblyArea.value)
    var sourcemap = res.sourcemapString
    cpu.memory = res.binary
    var bin:number[] = cpu.memory

    var textlinennumber = bin.map((v,i) => i.toString())
    var textsrcassembly = bin.map(() => '')
    var textop = ''
    var textip = bin.map(() => '')
    var textbin = bin.map((v,i) => v.toString())
    sourcemap.forEach((v,k) => {
        textsrcassembly[k] = v
    })
    textip[cpu.ic] = '=>'
    linenumberArea.value = textlinennumber.join('\n')
    srcassemblyArea.value = textsrcassembly.join('\n')
    opnameArea.value = textop
    instructionpointerArea.value = textip.join('\n')
    binaryArea.value = textbin.join('\n')
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

function gentable(table:string[][]){
    var rows = ''
    for(var row of table){

        for(var cell of row){

        }
    }
    var res = '<table>' + rows + '<table>'
    return res
}