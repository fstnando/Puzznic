function coordenadas(s){
    var n = s.split(",");
    for(i in n) n[i] = parseFloat(n[i]);
    return n;
}

var Elemento = function(x, y, valor){
    this.x = x;
    this.y = y;
    this.valor = valor;
    this.mov = null;
    this.i = 0;
}

Elemento.i_max = 10;

var Puzznic = function(elemento){
    var self = this;
    this.canvas = document.getElementById(elemento);
    this.context = this.canvas.getContext("2d");
    this.tx = 30;
    this.ty = 30;
    this.ftp = 1000/10;

    this.elementos = {};
    this.bloques = {};
    this.el_x = 0;
    this.el_y = 0;
    this.el_sel = null;
    
    this.key_left   = 37;
    this.key_right  = 39;
    this.key_up     = 38;
    this.key_down   = 40;
    this.key_sel    = 32;
    
    this.press = {};
    
    window.onkeydown = function(ev){
        self.press[ev.keyCode] = true;
    }
    
    window.onkeyup = function(ev){
        self.press[ev.keyCode] = false;
    }
}

Puzznic.colores = ['#AAAAFF', '#AAFFFF', '#FFAAFF', '#FFFFAA', '#FF0000', 
    '#00FF00', '#888888', '#2288FF', '#8822FF', '#FF8822'];

Puzznic.movimientos = [[-1,0], [1,0], [0,-1], [0,1]];

Puzznic.prototype.resize = function(){
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.dibujar();
}

Puzznic.prototype.dc = function(x, y, valor){
    var color = Puzznic.colores[valor];
    this.context.beginPath();
    this.context.rect(x*this.tx, y*this.ty, this.tx, this.ty);
    this.context.closePath();
    this.context.strokeStyle = '#000000';
    this.context.lineWidth = 1;
    this.context.fillStyle = color;
    this.context.fill();
    this.context.stroke();
}


Puzznic.prototype.dibujar = function(){
    this.context.fillStyle = '#AAFFAA';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    for(var i in this.bloques){
        var c = coordenadas(i);
        this.dc(c[0], c[1], 0);
    }

    for(var i in this.elementos){
        var el = this.elementos[i];
        if(el!=null && (el.mov==null || el.mov[2]==0 || el.i%2==0))
            this.dc(el.x, el.y, el.valor);
    }

    for(var i in this.lg)
        this.dc(this.lg[i][0], this.lg[i][1], this.lg[i][2]);

    if(this.lc!==undefined && this.i%2==0)
        for(var i in this.lc)
            this.dc(this.lc[i][0], this.lc[i][1], this.lc[i][2]);

    if(this.movida && this.movida[2]){
        var x = this.movida[0]*TamX + TamX/2;
        var y = this.movida[1]*TamX + TamX/2;
        this.context.beginPath();
        this.context.moveTo(x, y);
        x += this.movida[2]*TamX;
        this.context.lineTo(x, y);
        this.context.lineTo(x - 3 * this.movida[2], y - 3);
        this.context.moveTo(x, y);
        this.context.lineTo(x - 3 * this.movida[2], y + 3);
        this.context.closePath();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.context.stroke();
    }
    
    if(this.el_sel==null){
        this.context.beginPath();
        this.context.rect(this.el_x*this.tx, this.el_y*this.ty, this.tx, this.ty);
        this.context.closePath();
        this.context.strokeStyle = '#FFFFFF';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect(this.el_x*this.tx + 1, this.el_y*this.ty + 1, this.tx - 2, this.ty - 2);
        this.context.closePath();
        this.context.strokeStyle = '#FF0000';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect(this.el_x*this.tx + 2, this.el_y*this.ty + 2, this.tx - 4, this.ty - 4);
        this.context.closePath();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.context.stroke();
    }else{
        this.context.beginPath();
        this.context.rect(this.el_x*this.tx, this.el_y*this.ty, this.tx, this.ty);
        this.context.closePath();
        this.context.strokeStyle = '#FFFFFF';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect(this.el_x*this.tx + 1, this.el_y*this.ty + 1, this.tx - 2, this.ty - 2);
        this.context.closePath();
        this.context.strokeStyle = '#00FF00';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect(this.el_x*this.tx + 2, this.el_y*this.ty + 2, this.tx - 4, this.ty - 4);
        this.context.closePath();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.context.stroke();
    }
}

Puzznic.prototype.iniciar = function(){
    var self = this;
    this.mapas = [];
    for(var i in puzznic_mapas)
        this.mapas.push(i);
    this.cargar_mapa(this.mapas.shift());
    this.resize();
    this.dibujar();
    setInterval(function(){
        self.run();
    }, this.ftp);
}

Puzznic.prototype.nuevo_elemento = function(x, y, valor){
    var el = new Elemento(x, y, valor);
    this.elementos[[x, y]] = el;
}

Puzznic.prototype.eliminar_elemento = function(x, y){
    delete this.elementos[[x, y]];
}

Puzznic.prototype.nuevo_bloque = function(x, y){
    this.bloques[[x, y]] = 0;
}

Puzznic.prototype.eliminar_bloque = function(x, y){
    delete this.bloques[[x, y]];
}

Puzznic.prototype.puede_mover = function(x, y){
    return this.elementos[[x, y]]===undefined && this.bloques[[x, y]]===undefined;
}

Puzznic.prototype.el_puede_mover = function(x, y){
    if(this.el_sel!=null)
        return this.puede_mover(x, y);
    else
        return this.bloques[[x, y]]===undefined;
}

Puzznic.prototype.cargar_mapa = function(mapa){
    var arr_mapa = puzznic_mapas[mapa];
    for(var i=0;i<arr_mapa.length;i++){
        for(var j=0;j<arr_mapa[i].length;j++){
            if(arr_mapa[i][j] == 1){
                this.nuevo_bloque(j, i);
            }else
            if(arr_mapa[i][j] > 1){
                this.nuevo_elemento(j, i, arr_mapa[i][j] - 1);
            }
        }
    }
    
    for(var i in this.elementos){
        var c = coordenadas(i);
        this.el_x = c[0];
        this.el_y = c[1];
    };
}

Puzznic.prototype.es_ganador = function(mapa){
    var aux = true;
    for(var i in this.elementos){
        if(this.elementos[i]!=null){
            aux = false;
            break
        }
    }
    if(aux){
        delete this.elementos;
        delete this.bloques;
        this.elementos = {};
        this.bloques = {};
        
        this.cargar_mapa(this.mapas.shift());
    }
}

Puzznic.prototype.run = function(){
    this.marcar_gravedad();
    this.marcar_combinar();
    this.teclas_mover();
    this.aplicar_movimiento();
    if(this.el_sel!=null){
        this.el_x = this.el_sel.x;
        this.el_y = this.el_sel.y;
    }
    this.es_ganador();
    this.dibujar();
}

Puzznic.prototype.mover_iz = function(){
    if(this.el_sel!=null){
        var el = this.el_sel;
        if(el!==undefined && el.mov == null && this.puede_mover(el.x - 1, el.y)){
            el.mov = [-1, 0, 0];
            this.elementos[[el.x - 1, el.y]] = null;
        }
    }else
        this.el_x--;
}

Puzznic.prototype.mover_de = function(){
    if(this.el_sel!=null){
        var el = this.el_sel;
        if(el!==undefined && el.mov == null && this.puede_mover(el.x + 1, el.y)){
            el.mov = [1, 0, 0];
            this.elementos[[el.x + 1, el.y]] = null;
        }
    }else
        this.el_x++;
}

Puzznic.prototype.teclas_mover = function(){
    if(this.press[this.key_left]==true){
        if(this.el_puede_mover(this.el_x - 1,this.el_y))
            this.mover_iz();
    }
    if(this.press[this.key_right]==true){
        if(this.el_puede_mover(this.el_x + 1,this.el_y))
            this.mover_de();
    }
    if(this.press[this.key_up]==true && this.el_sel==null){
        if(this.el_puede_mover(this.el_x,this.el_y - 1))
            this.el_y--;
    }
    if(this.press[this.key_down]==true && this.el_sel==null){
        if(this.el_puede_mover(this.el_x,this.el_y + 1))
            this.el_y++;
    }
    if(this.press[this.key_sel]==true && this.el_sel==null && this.elementos[[this.el_x, this.el_y]]!==undefined){
        this.el_sel = this.elementos[[this.el_x, this.el_y]];
    }
    if(this.press[this.key_sel]==false && this.el_sel!=null){
        this.el_sel = null;
        this.el_x = Math.round(this.el_x);
        this.el_y = Math.round(this.el_y);
    }
}

Puzznic.prototype.marcar_gravedad = function(){
    for(var i in this.elementos){
        var c = coordenadas(i);
        if(this.mov == null && this.puede_mover(c[0], c[1] + 1)){
            while(this.elementos[[c[0], c[1]]]!==undefined && 
                    this.elementos[[c[0], c[1]]]!=null && 
                    this.elementos[[c[0], c[1]]].mov == null){
                this.elementos[[c[0], c[1]]].mov = [0, 1, 0];
                if(this.elementos[[c[0], c[1] + 1]] === undefined)
                    this.elementos[[c[0], c[1] + 1]] = null;
                c[1]--;
            }
        }
    }
}

Puzznic.prototype.marcar_combinar = function(){
    var listado = [];
    for(var i in this.elementos){
        var c = coordenadas(i);
        if(this.elementos[i]!=null && this.elementos[i].mov == null){
            var iguales = false;
            for(var j=0;j<Puzznic.movimientos.length;j++){
                var el = this.elementos[[c[0]+Puzznic.movimientos[j][0], c[1]+Puzznic.movimientos[j][1]]];
                if(el!==undefined && el!=null && el.mov == null && this.elementos[i].valor == el.valor){
                    iguales = true;
                    break;
                }
            }
            if(iguales)
                listado.push(i);
        }
    }

    for(var i = 0;i<listado.length;i++)
        this.elementos[listado[i]].mov = [0, 0, 1];

    delete listado;
}

Puzznic.prototype.aplicar_movimiento = function(){
    var agregar = [];
    for(var i in this.elementos){
        var c = coordenadas(i);
        var el = this.elementos[i];
        if(el!==undefined && el!= null && el.mov != null){
            el.x += el.mov[0] / Elemento.i_max;
            el.y += el.mov[1] / Elemento.i_max;
            el.i++;
            if(el.i>Elemento.i_max){
                el.i = 0;
                if(el.mov[2]==0){
                    el.x = c[0] + el.mov[0];
                    el.y = c[1] + el.mov[1];
                    delete el.mov;
                    el.mov = null;
                    delete this.elementos[i];
                    agregar.push(el);
                }else{
                    delete this.elementos[i];
                }
            }
        }
    }
    for(var i in agregar){
        var el = agregar[i];
        this.elementos[[el.x, el.y]] = el;
    }
}
