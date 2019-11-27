function move6(adr,value){
    return [
        ...cload3(0,value),
        ...cstore3(0,adr)
    ]
}

function incr10(adr){
    return add10(adr,1)
}

function add10(adr,val){
    return [
        ...cdref3(0,adr),
        ...cload3(1,val),
        ...cadd1(),
        ...cstore3(1,adr)
    ]
}

function cbranch3(to,flag){
    return [OpT.jmp,to,flag]
}

function cjmp2(to){
    return [OpT.jmp,to]
}

function ccmpadr7(adra,adrb){
    return [
        ...cdref3(0,adra),
        ...cdref3(1,adrb),
        ...ccmp1()
    ]
}


class Op2{
    constructor(public cb:() => number[], public size:number,public nparams:number){

    }
}

var opsmap = new Map<string,Op2>()
//move add incr cmp branch jmp
opsmap.set('move',new Op2(move6 as any,6,2))
opsmap.set('add',new Op2(add10 as any,10,2))
opsmap.set('incr',new Op2(incr10 as any,10,1))
opsmap.set('cmp',new Op2(ccmpadr7 as any,1,2))
opsmap.set('branch',new Op2(cbranch3 as any,3,2))
opsmap.set('jmp',new Op2(cjmp2 as any,2,1))
opsmap.set('noop',new Op2(cnoop as any,1,0))

function assemble(text:string):number[]{
    var rows = text.split(/\r?\n/)
    var labels = new Map<string,number>()
    var inCommentMode = false
    
    var parsedrows = rows.map(r => r.trim()).filter(v => v != '' && v[0] != '#').map(s => parserow(s))
    
    var memcounter = 0
    for(var row of parsedrows){//calc all the label addresses
        if(row.haslabel){
            labels.set(row.label,memcounter)
        }

        if(row.isOp){
            memcounter += row.op.size
        }
        memcounter += row.data.split(',').length//add params with data and with opcodes
    }

    var result:number[] = []
    for(var row of parsedrows){//build the memory and replace the labels with addresses
        var dataparams = parseParameters(row.data,labels)
        
        if(row.isOp){
            var code = row.op.cb.call(null,...dataparams.map(dp => dp.value))//parse data
            result.push(code)
        }else{
            result.push(...dataparams.map(dp => dp.value))
        }
    }
    return result
}

class Param{
    constructor(public drefCount:number, public value:number,){

    }
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
        haslabel,
        label,
        isOp,
        opcode,
        op:opsmap.get(opcode),
        data,
    }
}

function strcmp(a:string,b:string){
    if(a.length != b.length){
        return false
    }

    for(var i = 0; i < a.length;i++){
        if(a[i] != b[i]){
            return false
        }
    }
    return true
}