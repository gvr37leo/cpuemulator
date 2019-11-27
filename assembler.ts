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

class Op2{
    constructor(public cb:() => number[], public size:number,public nparams:number){

    }
}

var opsmap = new Map<string,Op2>()
//move add incr cmp branch jmp
opsmap.set('move',new Op2(move6 as any,6,2))
opsmap.set('add',new Op2(add10 as any,10,2))
opsmap.set('incr',new Op2(incr10 as any,10,1))
opsmap.set('cmp',new Op2(ccmp1 as any,1,2))
opsmap.set('branch',new Op2(cbranch3 as any,3,2))
opsmap.set('jmp',new Op2(cjmp2 as any,2,1))

function assemble(text:string):number[]{
    var rows = text.split('\n')
    var labels = new Map<string,number>()
    var inCommentMode = false
    
    var parsedrows = rows.filter(v => v != '' && v[0] != '#').map(s => parserow(s.trim()))
    
    var memcounter = 0
    for(var row of parsedrows){//calc all the label addresses
        if(row.haslabel){
            labels.set(row.label,memcounter)
        }

        if(row.isOp){
            memcounter += row.op.size
        }else{

        }
        memcounter += row.data.length
    }

    var result:number[] = []
    for(var row of parsedrows){//build the memory and replace the labels with addresses
        if(row.isOp){

            result.push()
        }else{

        }
    }
    return result
}

function parserow(row:string){
    var haslabel = false;
    var label = '';
    var isOp = false;
    var opcode = '';
    var data = ['',''];

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

    data = splittedrow[i].split(',')
    
    return {
        haslabel,
        label,
        isOp,
        opcode,
        op:opsmap.get(opcode),
        data,
    }
}