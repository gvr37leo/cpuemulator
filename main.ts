/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="cpuemulator.ts" />
/// <reference path="assembler.ts" />



var cpu =  new CPUEmulator()
var assembly:HTMLTextAreaElement = query('#assembly') as any
var binary:HTMLTextAreaElement = query('#binary') as any
var compile = query('#compile')
var run = query('#run')
assembly.value = `print; 12`
execcompile()

function execcompile(){
    var bin = assemble(assembly.value)
    binary.value = bin.join('\n')
    cpu.memory = bin
}

compile.addEventListener('click',() => {
    execcompile()
})

run.addEventListener('click',() => {
    cpu.exec()
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