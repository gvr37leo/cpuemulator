function assemble(text:string):number[]{
    var result = []
    var rows = text.split('\n')
    var labels = new Map<string,number>()
    var regex = new RegExp('(@[a-z]+)? [a-z]+')
    var inCommentMode = false
    var memcounter = 0
    for(var row of rows.filter(v => v != '' && v[0] != '#')){

        var splittedrow = row.split(' ')
        
        if(row[0] == '.'){
            //assembler statement
        }else{

            var i = 0
            if(splittedrow[i][0] == '@'){
                labels.set(splittedrow[i].substr(1),memcounter)
                i++
            }

            if(/[a-z]/.test(splittedrow[i])){
                result.push(splittedrow)
                i++
            }

            var parameters = splittedrow.slice(i)
            
            memcounter += 1
        }




        
    }

    for(var row of rows){

    }

    return result
}