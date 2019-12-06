class Param{
    constructor(public drefCount:number, public value:number,){

    }
}
enum OpT{noop,dref,dreg,drega,dregb,add,sub,mul,div,or,and,cmp,jmp,branch,call,ret,load,store,storereg,print,halt}

function gendrega1xn(n:number):number[]{
    var res = []
    for(var i = 0; i < n; i++){
        res.push(OpT.drega)
    }
    return res
}

function gendregb1xn(n:number):number[]{
    var res = []
    for(var i = 0; i < n; i++){
        res.push(OpT.dregb)
    }
    return res
}

function cdref3(reg:number,address:number){
    return [OpT.dref,reg,address]
}

function move6(adr:Param,value:Param){
    return [
        ...cload3(0,value.value),
        ...cstore3(0,adr.value)
    ]
}

function add10(adr:Param,val:Param):number[]{
    return [
        ...cdref3(0,adr.value),
        ...gendrega1xn(adr.drefCount),
        ...cload3(1,val.value),
        ...gendregb1xn(val.drefCount),
        ...cadd1(),
        OpT.storereg,//store what is in register 1 at adres in register 0
    ]
}

function incr10(adr:Param){
    return add10(adr,new Param(0,1))
}
function cload3(reg:number,value:number){
    return [OpT.load,reg,value]
}
function ccmp7(vala:Param,valb:Param):number[]{
    return [
        ...cload3(0,vala.value),
        ...gendrega1xn(vala.drefCount),
        ...cload3(1,valb.value),
        ...gendregb1xn(valb.drefCount),
        ...ccmp1()
    ]
}

// JE/JZ	== =0
// JNE/JNZ	!= =!0
// JG/JNLE	>  !<=
// JGE/JNL	>= !<
// JL/JNGE	<  !>=
// JLE/JNG	<= !>

//00 >
//01 ==
//10 <
//11 <=
//01 >=
function cbranch6(to:Param,negative:Param,zero:Param){
    return [
        ...cload3(1,to.value),
        ...gendregb1xn(to.drefCount),
        OpT.branch,
        negative.value,
        zero.value,
    ]
}

function cjmp4(to:Param){
    return [
        ...cload3(1,to.value),
        ...gendregb1xn(to.drefCount),
        OpT.jmp,
    ]
}
function cload3param(reg:Param,value:Param){
    return [OpT.load,reg.value,value.value]
}
function cadd1(){
    return [OpT.add]   
}
function csub(){
    return [OpT.sub]
}

function cmul(){
    return [OpT.mul]
}
function cdiv(){
    return [OpT.div]
}
function cor(){
    return [OpT.or]
}
function cand(){
    return [OpT.and]
}

function ccmp1(){
    return [OpT.cmp]
}
function ccall(to){
    return [OpT.call,to]
}

function cret(){
    return [OpT.ret]
}
function cnoop(){
    return [OpT.noop]
}
function cstore3(reg:number,adr:number){
    return [OpT.store,reg,adr]
}

function cstorereg3(reg:number,adr:number){
    return [OpT.store,reg,adr]
}

function cprint4(val:Param){
    return [
        ...cload3(1,val.value),
        ...gendregb1xn(val.drefCount),
        OpT.print
    ]
}

function cstore3param(reg:Param,adr:Param){
    return [OpT.store,reg.value,adr.value]
}


function cdregb(){
    return [
        OpT.dregb
    ]
}

function chalt1(){
    return [OpT.halt]
}

class Op2{
    constructor(public cb:() => number[], public size:number){

    }
}

//mult divide sub load store and or
var fakeparam = new Param(0,0)
var opsmap = new Map<string,Op2>()
opsmap.set('mul',new Op2(cmul as any,cmul().length))//mul regb = rega * regb
opsmap.set('div',new Op2(cdiv as any,cdiv().length))//div regb = rega / regb
opsmap.set('sub',new Op2(csub as any,csub().length))//sub regb = rega - regb
opsmap.set('load',new Op2(cload3param as any,cload3param(fakeparam,fakeparam).length))//reg,val load val into reg
opsmap.set('store',new Op2(cstore3param as any,cstore3param(fakeparam,fakeparam).length))//reg,adr store register at adres
opsmap.set('and',new Op2(cand as any,cand().length))//regb = rega & regb
opsmap.set('or',new Op2(cor as any,cor().length))//regb = rega | regb
opsmap.set('dregb',new Op2(cdregb as any,cdregb().length))//dreference value in register b
opsmap.set('set',new Op2(move6 as any,move6(fakeparam,fakeparam).length))//adr,value sets value at adres
opsmap.set('add',new Op2(add10 as any,add10(fakeparam,fakeparam).length))//adr,val adds val to adres
opsmap.set('incr',new Op2(incr10 as any,incr10(fakeparam).length))//adr adds 1 to adres
opsmap.set('cmp',new Op2(ccmp7 as any,ccmp7(fakeparam,fakeparam).length))//vala,valb compares 2 values and sets flags
opsmap.set('branch',new Op2(cbranch6 as any,cbranch6(fakeparam,fakeparam,fakeparam).length))//to,negative,zero go to address if flags are set
opsmap.set('jmp',new Op2(cjmp4 as any,cjmp4(fakeparam).length))//to go to addres
opsmap.set('noop',new Op2(cnoop as any,cnoop().length))//do nothing
opsmap.set('print',new Op2(cprint4 as any,cprint4(fakeparam).length))//print value
opsmap.set('halt',new Op2(chalt1 as any,chalt1().length))//stop program
class AssemblyRet{
    binary:number[] = []
    sourcemap = new Map<number,number>()
    parsedRows:ParsedRow[]
    sourcemapString = new Map<number,string>()
    datamap = new Set<number>()
}
function assemble(text:string):AssemblyRet{
    var result = new AssemblyRet()
    var rows = text.split(/\r?\n/)
    var labels = new Map<string,number>()
    var inCommentMode = false
    
    var parsedrows = rows.map(r => r.trim()).filter(v => v != '' && v[0] != '#').map(s => parserow(s))
    result.parsedRows = parsedrows
    // maps from binarylinenumber to assembly linenumber
    var memcounter = 0
    for(var i = 0; i < parsedrows.length;i++){
        var row = parsedrows[i]
        if(row.haslabel){
            labels.set(row.label,memcounter)
        }
        result.sourcemap.set(memcounter,i)
        result.sourcemapString.set(memcounter,row.row)
        if(row.isOp){
            memcounter += row.op.size
        }else{
            var splitted = row.data.split(',')
            var datasize = splitted[0] == '' ? 0 : splitted.length;
            for(var j = 0; j < datasize;j++){
                result.datamap.add(memcounter + j)    
            }
            memcounter += datasize

        }
        memcounter += (row.data.match(/\*/g) || []).length
    }

    
    for(var row of parsedrows){//build the memory and replace the labels with addresses
        var dataparams = parseParameters(row.data,labels)
        
        if(row.isOp){
            var code = row.op.cb.call(null,...dataparams)//parse data
            result.binary.push(...code)
        }
        else{
            result.binary.push(...dataparams.map(dp => dp.value))
        }
    }
    return result
}



function parseParameters(parameters:string,labels:Map<string,number>):Param[]{
    var result:Param[] = []
    for(var param of parameters.split(',')){
        var drefCount = 0
        var paramtext = ''
        for(var i = 0; i < param.length;i++){
            if(param[i] == '*'){
                drefCount++
            }else{
                paramtext = param.substr(i)
                break;
            }
        }

        if(labels.has(paramtext)){
            result.push(new Param(drefCount,labels.get(paramtext)))
        }else{
            result.push(new Param(drefCount,parseInt(paramtext)))
        }
    }
    return result
}

class ParsedRow{
    haslabel  = false
    label  = ''
    isOp  = false
    opcode  = ''
    data  = ''
    op:Op2 = null
    row:string

    constructor(
        
    ){

    }
}

function parserow(row:string){
    var res = new ParsedRow()
    res.row = row
    var splittedrow = row.split(' ')
    var  i = 0
    if(splittedrow[i][0] == '@'){
        res.haslabel = true
        res.label = splittedrow[0].substring(1)
        i++
    }

    if(/^[a-z]+;$/.test(splittedrow[i])){
        res.isOp = true
        res.opcode = splittedrow[i].substr(0,splittedrow[i].length - 1)
        i++
    }

    if(i == splittedrow.length - 1){
        res.data = splittedrow[i]
    }
    
    res.op = opsmap.get(res.opcode)
    return res
}
