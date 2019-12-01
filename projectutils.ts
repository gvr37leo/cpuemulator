class Table<T>{
    columns: Column<T>[];

    element: HTMLTableElement;
    head: HTMLTableSectionElement;
    body: HTMLTableSectionElement;
    headerRows:HTMLTableRowElement[] = []
    

    constructor(columns:Column<T>[]){
        this.columns = columns
        this.element = string2html(`
            <table>
                <thead>
                </thead>
                <tbody></tbody>
            </table>`) as HTMLTableElement
        this.head = this.element.querySelector('thead')
        this.body = this.element.querySelector('tbody')
        this.addHeader()
    }

    addHeader(){
        for(var header of this.columns[0].headerRenderers){
            var row = document.createElement('tr')
            this.headerRows.push(row)
            this.head.appendChild(row)
        }

        for(var column of this.columns){
            for(let i = 0; i < column.headerRenderers.length; i++){
                var headerRenderer = column.headerRenderers[i]
                var cell = this.createTableHeadCell(this.headerRows[i])
                cell.appendChild(headerRenderer())
            }
        }
    }

    load(objects:T[]){
        this.body.innerHTML = ''
        for(let i = 0; i < objects.length; i++){
            var object = objects[i]
            var row = document.createElement('tr')
            this.body.appendChild(row)            
            for(var column of this.columns){
                var cell = document.createElement('td')
                row.appendChild(cell)
                cell.appendChild(column.renderer(object, i))
            }
        }
    }

    private createTableHeadCell(row){
        var td = document.createElement('th')
        row.appendChild(td)
        return td
    }

}

class Column<T>{
    renderer:(obj:T, i:number) => HTMLElement
    headerRenderers:(() => HTMLElement)[]

    constructor(headerRenderers:(() => HTMLElement)[], renderer:(obj:T, i:number) => HTMLElement){
        this.headerRenderers = headerRenderers
        this.renderer = renderer
    }
}