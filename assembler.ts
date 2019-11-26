function assemble(text:string):number[]{
    var result = []
    var rows = text.split('\n')
    var labels = new Map<string,number>()

    var memcounter = 0
    for(var row of rows){
        var splittedrow = row.split(' ')
        var left = splittedrow[0]
        var middle = splittedrow[1]
        var right = splittedrow[2]

        if(left[0] == '.'){

        }if(left[0] == '@'){
            labels.set(left,memcounter)
        }else{
            memcounter += 1
        }
    }

    for(var row of rows){

    }

    return result
}