class Param{
    constructor(public drefCount:number, public value:number,){

    }
}
enum OpT{noop,load,store,dref,dreg,drega,dregb,add,sub,mul,div,or,and,cmp,jmp,branch,call,ret,print,halt}

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

function cdref3(reg,address){
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
        ...cload3(1,val.value),
        ...gendrega1xn(val.drefCount),
        ...cadd1(),
        ...cstore3(1,adr.value)
    ]
}

function incr10(adr:Param){
    return add10(adr,new Param(0,1))
}

function ccmp7(a:Param,b:Param):number[]{
    return [
        ...cload3(0,a.value),
        ...gendrega1xn(a.drefCount),
        ...cload3(1,b.value),
        ...gendregb1xn(b.drefCount),
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

function cnoop(){
    return [OpT.noop]
}

function cprint4(val:Param){
    return [
        ...cload3(1,val.value),
        ...gendregb1xn(val.drefCount),
        OpT.print
    ]
}

function chalt1(){
    return [OpT.halt]
}

class Op2{
    constructor(public cb:() => number[], public size:number){

    }
}
var fakeparam = new Param(0,0)
var opsmap = new Map<string,Op2>()
opsmap.set('move',new Op2(move6 as any,move6(fakeparam,fakeparam).length))
opsmap.set('add',new Op2(add10 as any,add10(fakeparam,fakeparam).length))
opsmap.set('incr',new Op2(incr10 as any,incr10(fakeparam).length))
opsmap.set('cmp',new Op2(ccmp7 as any,ccmp7(fakeparam,fakeparam).length))
opsmap.set('branch',new Op2(cbranch6 as any,cbranch6(fakeparam,fakeparam,fakeparam).length))
opsmap.set('jmp',new Op2(cjmp4 as any,cjmp4(fakeparam).length))
opsmap.set('noop',new Op2(cnoop as any,cnoop().length))
opsmap.set('print',new Op2(cprint4 as any,cprint4(fakeparam).length))
opsmap.set('halt',new Op2(chalt1 as any,chalt1().length))

function assemble(text:string):number[]{
    var rows = text.split(/\r?\n/)
    var labels = new Map<string,number>()
    var inCommentMode = false
    
    var parsedrows = rows.map(r => r.trim()).filter(v => v != '' && v[0] != '#').map(s => parserow(s))
    var sourcemap = new Map<number,number>()
    
    var memcounter = 0
    for(var row of parsedrows){//calc all the label addresses
        if(row.haslabel){
            labels.set(row.label,memcounter)
        }

        if(row.isOp){
            memcounter += row.op.size
        }else{
            var splitted = row.data.split(',')
            memcounter += splitted[0] == '' ? 0 : splitted.length;
        }
        memcounter += (row.data.match(/\*/g) || []).length
    }

    var result:number[] = []
    for(var row of parsedrows){//build the memory and replace the labels with addresses
        var dataparams = parseParameters(row.data,labels)
        
        if(row.isOp){
            var code = row.op.cb.call(null,...dataparams)//parse data
            result.push(...code)
        }
        else{
            result.push(...dataparams.map(dp => dp.value))
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

function parserow(row:string){
    var haslabel = false;
    var label = '';
    var isOp = false;
    var opcode = '';
    var data = ''

    var splittedrow = row.split(' ')
    var  i = 0
    if(splittedrow[i][0] == '@'){
        haslabel = true
        label = splittedrow[0].substring(1)
        i++
    }

    if(/^[a-z]+;$/.test(splittedrow[i])){
        isOp = true
        opcode = splittedrow[i].substr(0,splittedrow[i].length - 1)
        i++
    }

    if(i == splittedrow.length - 1){
        data = splittedrow[i]
    }
    
    
    return {
        row,
        haslabel,
        label,
        isOp,
        opcode,
        op:opsmap.get(opcode),
        data,
    }
}
