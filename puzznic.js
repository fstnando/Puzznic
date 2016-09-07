// Teclas: https://github.com/q2apro/keyboard-keys-speedflips

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
    this.lx = 15;
    this.ly = 15;
    this.ftp = 1000/60;
    this.ix = 0;
    this.iy = 0;

    this.elementos = {};
    this.bloques = {};
    this.cantidades = {};
    this.mapas = [];
    this.el_x = 0;
    this.el_y = 0;
    this.el_sel = null;
    this.puntos = 0;
    
    this.key_left       = 37;
    this.key_right      = 39;
    this.key_up         = 38;
    this.key_down       = 40;
    this.key_sel        = 32;
    this.key_reiniciar  = 82;
    this.key_pausa      = 80;
    this.key_ctr_fc     = 102;
    this.key_ayuda      = 112;

    this.fs = "desktop";
    this.fonts = {
        "phone": {
            XSmall: 6,
            Small: 8,
            Medium: 10,
            Large: 12,
            XLarge: 14
        },
        "tablet":{
            XSmall: 10,
            Small: 12,
            Medium: 16,
            Large: 24,
            XLarge: 30
        },
        "desktop":{
            XSmall: 14,
            Small: 18,
            Medium: 30,
            Large: 40,
            XLarge: 80
        },
    }

    
    this.movidas = [];
    this.pantalla = function(){};

    this.keypress_func = function(ev){

    };

    window.onkeydown = function(ev){
        ev = ev || window.event;
        self.keypress_func(ev);
    }

    window.addEventListener("resize", function(){
        self.resize();
    });
    self.resize();
}

Puzznic.colores = ['#AAAAFF', '#AAFFFF', '#FFAAFF', '#FFFFAA', '#FF0000', 
    '#00FF00', '#888888', '#2288FF', '#8822FF', '#FF8822'];

Puzznic.movimientos = [[-1,0], [1,0], [0,-1], [0,1]];

Puzznic.prototype.eventos_teclas_juego = function(){
    var self = this;

    delete this.keypress_func;
    this.keypress_func = function(ev){
        var codigo = ev.which || ev.keyCode;

        if(codigo==self.key_ctr_fc && ev.ctrlKey==true){
            self.to_fullscreen();
        }else
        switch(codigo){
            case self.key_ayuda:
                self.pausar();
                self.pantalla_ayuda();
                break;
            case self.key_pausa:
                if(self.intervalo!=null){
                    self.pausar();
                    self.dibujar_pausa();
                }else{
                    self.reanudar();
                }
                break;
            case self.key_reiniciar:
                self.pausar();
                self.cargar_mapa(self.titulo);
                break;
            case self.key_sel:
                self.movidas.push(0);
                break;
            case self.key_left:
                self.movidas.push(-1);
                break;
            case self.key_right:
                self.movidas.push(1);
                break;
            case self.key_up:
                self.movidas.push(-2);
                break;
            case self.key_down:
                self.movidas.push(2);
                break;
        }
    }
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

Puzznic.prototype.dcxy = function(x, y, valor){
    var color = Puzznic.colores[valor];
    this.context.beginPath();
    this.context.rect(x, y, this.tx, this.ty);
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
        var el = this.bloques[i];
        this.dc(this.ix + el.x, this.iy + el.y, 0);
    }

    for(var i in this.elementos){
        var el = this.elementos[i];
        if(el!=null && (el.mov==null || el.mov[2]==0 || el.i%2==0))
            this.dc(this.ix + el.x, this.iy + el.y, el.valor);
    }

    var y = 2;
    for(var i in this.cantidades){
        this.dcxy(this.canvas.width - 100, y*this.ty, i);
        this.context.font = "bold 12px Arial";
        this.context.textAlign = "center";
        this.context.fillStyle = "black";
        this.context.fillText(this.cantidades[i], this.canvas.width - 100 + this.tx/2, y * this.ty + this.ty / 2 + 6);
        y++;
    }

    if(this.el_sel==null){
        this.context.beginPath();
        this.context.rect((this.ix + this.el_x)*this.tx, (this.iy + this.el_y)*this.ty, this.tx, this.ty);
        this.context.closePath();
        this.context.strokeStyle = '#FFFFFF';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect((this.ix + this.el_x)*this.tx + 1, (this.iy + this.el_y)*this.ty + 1, this.tx - 2, this.ty - 2);
        this.context.closePath();
        this.context.strokeStyle = '#FF0000';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect((this.ix + this.el_x)*this.tx + 2, (this.iy + this.el_y)*this.ty + 2, this.tx - 4, this.ty - 4);
        this.context.closePath();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.context.stroke();
    }else{
        this.context.beginPath();
        this.context.rect((this.ix + this.el_x)*this.tx, (this.iy + this.el_y)*this.ty, this.tx, this.ty);
        this.context.closePath();
        this.context.strokeStyle = '#FFFFFF';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect((this.ix + this.el_x)*this.tx + 1, (this.iy + this.el_y)*this.ty + 1, this.tx - 2, this.ty - 2);
        this.context.closePath();
        this.context.strokeStyle = '#00FF00';
        this.context.lineWidth = 1;
        this.context.stroke();
        
        this.context.beginPath();
        this.context.rect((this.ix + this.el_x)*this.tx + 2, (this.iy + this.el_y)*this.ty + 2, this.tx - 4, this.ty - 4);
        this.context.closePath();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.context.stroke();
    }

    this.context.font = "bold 12px Arial";
    this.context.textAlign = "left";
    this.context.fillStyle = "black";
    this.context.fillText("Puntos: " + this.puntos, this.canvas.width - 100, this.ty + 6);
}

Puzznic.prototype.iniciar = function(){
    var self = this;
    this.to_fullscreen();
    this.agregar_mapas();
    this.pausar();

    this.pantalla = this.pantalla_inicial;
    this.pantalla_inicial();

    /*
    this.pantalla = this.dibujar;
    this.eventos_teclas_juego();
    this.mapa_siguiente();
    */
}

Puzznic.prototype.agregar_mapas = function(){
    for(var i in puzznic_mapas)
        this.mapas.push(i);
}

Puzznic.prototype.mapa_siguiente = function(){
    var mapa = this.mapas.shift();
    if(mapa){
        //this.mapas.push(mapa);
        this.cargar_mapa(mapa);
    }else{
        this.pantalla_fin_del_juego();
    }
}


Puzznic.prototype.pausar = function(){
    clearInterval(this.intervalo);
    this.intervalo = null;
}

Puzznic.prototype.reanudar = function(){
    var self = this;
    clearInterval(this.intervalo);
    this.intervalo = setInterval(function(){
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
    var el = new Elemento(x, y, 0);
    this.bloques[[x, y]] = el;
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

Puzznic.prototype.reiniciar_estado = function(mapa){
    delete this.elementos;
    delete this.bloques;
    delete this.cantidades;
    delete this.el_sel;
    this.elementos = {};
    this.bloques = {};
    this.cantidades = {};
    this.el_sel = null;
}

Puzznic.prototype.cargar_mapa = function(mapa){
    var self = this;

    this.reiniciar_estado();

    this.titulo = mapa;
    var arr_mapa = puzznic_mapas[mapa];
    for(var i=0;i<arr_mapa.length;i++){
        for(var j=0;j<arr_mapa[i].length;j++){
            var caracter = arr_mapa[i].charAt(j);
            switch(caracter){
                case "0":
                    break;
                case "1":
                    this.nuevo_bloque(j, i);
                    if(j>this.ix) this.ix = j;
                    if(i>this.iy) this.iy = i;
                    break;
                case "H":
                    this.nuevo_bloque(j, i);
                    this.bloques[[j, i]].vx = 1;
                    this.bloques[[j, i]].intervalo = 20;
                    break;
                case "V":
                    this.nuevo_bloque(j, i);
                    this.bloques[[j, i]].vy = 1;
                    this.bloques[[j, i]].intervalo = 20;
                    break;
                default:
                    caracter = parseInt(caracter);
                    this.nuevo_elemento(j, i, caracter - 1);
                    if((arr_mapa[i][j] - 1) in this.cantidades){
                        this.cantidades[caracter - 1]++;
                    }else{
                        this.cantidades[caracter - 1] = 1;
                    }
            }
        }
    }
    this.ix = parseInt((this.lx - this.ix + 1)/2);
    this.iy = parseInt((this.ly - this.iy + 1)/2);
    for(var i in this.elementos){
        var c = coordenadas(i);
        this.el_x = c[0];
        this.el_y = c[1];
        break;
    };
    this.tiempo = 5;
    this.dibujar_titulo();
    self.tiempo--;
    this.t_titulo = window.setInterval(function(){
        self.dibujar_titulo();
        self.tiempo--;
    }, 1000);
    window.setTimeout(function(){
        clearInterval(self.t_titulo);
        self.reanudar();
    }, 5000);
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
        this.pausar();
        this.mapa_siguiente();
    }
}

Puzznic.prototype.run = function(){
    this.marcar_bloques_movimientos();
    this.marcar_gravedad();
    this.marcar_combinar();
    this.teclas_mover();
    this.aplicar_movimiento();
    if(this.el_sel!=null){
        this.el_x = this.el_sel.x;
        this.el_y = this.el_sel.y;
    }
    this.dibujar();
    this.es_ganador();
}

Puzznic.prototype.mover_iz = function(){
    var movida = false;
    var el = this.el_sel;
    if(el!==undefined && el.mov == null && this.puede_mover(el.x - 1, el.y)){
        el.mov = [-1, 0, 0];
        this.elementos[[el.x - 1, el.y]] = null;
        movida = true;
    }
    return movida;
}

Puzznic.prototype.mover_de = function(){
    var movida = false;
    var el = this.el_sel;
    if(el!==undefined && el.mov == null && this.puede_mover(el.x + 1, el.y)){
        el.mov = [1, 0, 0];
        this.elementos[[el.x + 1, el.y]] = null;
        movida = true;
    }
    return movida;
}

Puzznic.prototype.teclas_mover = function(){
    if(this.movidas.length > 0){
        var m = this.movidas.shift();
        if(this.el_sel==null){
            switch(m){
                case 0:
                    if(this.elementos[[this.el_x, this.el_y]]!==undefined && this.elementos[[this.el_x, this.el_y]]!=null)
                        this.el_sel = this.elementos[[this.el_x, this.el_y]];
                    else
                    if(this.elementos[[this.el_x - 1, this.el_y]]!==undefined && this.elementos[[this.el_x - 1, this.el_y]]!=null)
                        this.el_sel = this.elementos[[this.el_x - 1, this.el_y]];
                    else
                    if(this.elementos[[this.el_x + 1, this.el_y]]!==undefined && this.elementos[[this.el_x + 1, this.el_y]]!=null)
                        this.el_sel = this.elementos[[this.el_x + 1, this.el_y]];
                    else
                    if(this.elementos[[this.el_x, this.el_y - 1]]!==undefined && this.elementos[[this.el_x, this.el_y - 1]]!=null)
                        this.el_sel = this.elementos[[this.el_x, this.el_y - 1]];
                    else
                    if(this.elementos[[this.el_x, this.el_y + 1]]!==undefined && this.elementos[[this.el_x, this.el_y + 1]]!=null)
                        this.el_sel = this.elementos[[this.el_x, this.el_y + 1]];
                    break;
                case 1:
                    this.el_x++;
                    if(this.el_x>this.lx) this.el_x = this.lx;
                    break;
                case -1:
                    this.el_x--;
                    if(this.el_x<0) this.el_x = 0;
                    break;
                case 2:
                    this.el_y++;
                    if(this.el_y>this.ly) this.el_y = this.ly;
                    break;
                case -2:
                    this.el_y--;
                    if(this.el_y<0) this.el_y = 0;
                    break;
            }
        }else{
            switch(m){
                case 0:
                    this.el_sel = null;
                    this.el_x = Math.round(this.el_x);
                    this.el_y = Math.round(this.el_y);
                    break;
                case 1:
                    this.mover_de();
                    break;
                case -1:
                    this.mover_iz();
                    break;
            }
        }
    }

}

Puzznic.prototype.marcar_bloques_movimientos = function(){
    for(var i in this.bloques){
        var c = coordenadas(i);
        var el = this.bloques[i];
        if("intervalo" in el){
            el.intervalo = el.intervalo - 1;
            if(el.intervalo < 0){
                el.intervalo = 20;
                if(el.mov == null)
                    if("vx" in el){
                        if(this.puede_mover(c[0] + el.vx, c[1])){
                            el.mov = [el.vx, 0, 0];
                            this.elementos[[c[0] + el.vx, c[1]]] = null;

                            c[1]--;

                            while(this.elementos[[c[0], c[1]]]!==undefined && 
                                    this.elementos[[c[0], c[1]]]!=null && 
                                    this.elementos[[c[0], c[1]]].mov == null && 
                                    this.puede_mover(c[0] + el.vx, c[1])){
                                this.elementos[[c[0], c[1]]].mov = [el.vx, 0, 0];
                                if(this.elementos[[c[0] + el.vx, c[1]]] === undefined)
                                    this.elementos[[c[0] + el.vx, c[1]]] = null;
                                c[1]--;
                            }
                        }else
                            el.vx = -el.vx;
                    }else{
                        var c1 = [c[0], c[1] + el.vy];
                        while(this.elementos[[c1[0], c1[1]]]!==undefined 
                            && this.elementos[[c1[0], c1[1]]]!=null 
                            && this.elementos[[c1[0], c1[1]]].mov==null)
                            c1[1]+=el.vy;

                        if(this.puede_mover(c1[0], c1[1])){
                            c1 = [c[0], c[1] - 1];
                            while(this.elementos[[c1[0], c1[1]]]!==undefined && 
                                    this.elementos[[c1[0], c1[1]]]!=null && 
                                    this.elementos[[c1[0], c1[1]]].mov == null &&
                                    (el.vy == 1
                                    || this.puede_mover(c[0], c1[1] + el.vy))){
                                this.elementos[[c1[0], c1[1]]].mov = [0, el.vy, 0];
                                if(this.elementos[[c1[0], c1[1] + el.vy]] === undefined)
                                    this.elementos[[c1[0], c1[1] + el.vy]] = null;
                                c[1]--;
                            }

                            el.mov = [0, el.vy, 0];
                            if(this.elementos[[c[0], c[1] + el.vy]]===undefined)
                                this.elementos[[c[0], c[1] + el.vy]] = null;
                        }else
                            el.vy = -el.vy;
                    }
            }
        }
    }
}

Puzznic.prototype.marcar_gravedad = function(){
    for(var i in this.elementos){
        var c = coordenadas(i);
        if(this.puede_mover(c[0], c[1] + 1)){
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
    var combinados = 0;

    for(var i in this.bloques){
        var c = coordenadas(i);
        var el = this.bloques[i];
        if(el!==undefined && el!= null && el.mov != null){
            el.x += el.mov[0] / Elemento.i_max;
            el.y += el.mov[1] / Elemento.i_max;
            el.i++;
            if(el.i>Elemento.i_max){
                el.i = 0;
                el.x = c[0] + el.mov[0];
                el.y = c[1] + el.mov[1];
                delete el.mov;
                el.mov = null;
                delete this.bloques[i];
                if(this.elementos[[el.x, el.y]]==null)
                    delete this.elementos[[el.x, el.y]];
                this.bloques[[el.x, el.y]] = el;
            }
        }
    }

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
                    this.cantidades[this.elementos[i].valor]--;
                    if(this.elementos[i] == this.el_sel) this.el_sel = null;
                    delete this.elementos[i];
                    combinados++;
                }
            }
        }
    }
    if(combinados>0)
        this.puntos += 10*(combinados - 1) + 20*(combinados - 2);
    for(var i in agregar){
        var el = agregar[i];
        this.elementos[[el.x, el.y]] = el;
    }
}

Puzznic.prototype.resize = function(){
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    var ptx = (this.canvas.width - 100)/this.lx;
    var pty = this.canvas.height/this.ly;
    if(ptx>=pty){
        this.tx = parseInt(pty);
        this.ty = parseInt(pty);
    }else{
        this.tx = parseInt(ptx);
        this.ty = parseInt(ptx);
    }

    if(this.canvas.width<480)
        this.fs = "phone";
    else
    if(this.canvas.width<768)
        this.fs = "tablet";
    else
        this.fs = "desktop";

    this.pantalla();
}

Puzznic.prototype.to_fullscreen = function(){
    if (
        document.fullscreenEnabled || 
        document.webkitFullscreenEnabled || 
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
    ) {
        if (this.canvas.requestFullscreen) {
            this.canvas.requestFullscreen();
        } else if (this.canvas.webkitRequestFullscreen) {
            this.canvas.webkitRequestFullscreen();
        } else if (this.canvas.mozRequestFullScreen) {
            this.canvas.mozRequestFullScreen();
        } else if (this.canvas.msRequestFullscreen) {
            this.canvas.msRequestFullscreen();
        }
    }
}

Puzznic.prototype.dibujar_pausa = function(){
    this.context.fillStyle = '#AAFFAA';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = "bold "+this.fonts[this.fs]["Medium"]+"px Arial";
    this.context.textAlign = "center";
    this.context.fillStyle = "black";
    this.context.fillText("PAUSA", this.canvas.width / 2, this.canvas.height / 2 - this.fonts[this.fs]["Medium"]/2);
}

Puzznic.prototype.dibujar_titulo = function(){
    this.context.fillStyle = '#AAFFAA';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = "bold "+this.fonts[this.fs]["Large"]+"px Halo3";
    this.context.textAlign = "center";
    this.context.fillStyle = "black";
    for(var i=-1;i<=1;i++)
        for(var j=-1;j<=1;j++)
            this.context.fillText(this.titulo, this.canvas.width / 2 + i, this.canvas.height / 2 - 10 + j);

    this.context.fillStyle = "white";
    this.context.fillText(this.titulo, this.canvas.width / 2, this.canvas.height / 2 - 10);

    this.context.font = "bold "+this.fonts[this.fs]["Medium"]+"px Arial";
    this.context.fillStyle = "red";
    this.context.fillText(this.tiempo, this.canvas.width / 2, this.canvas.height / 2 + 20);
}

Puzznic.prototype.pantalla_fin_del_juego = function(){
    var self = this;

    this.context.fillStyle = '#AAFFAA';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.titulo = "Fin del Juego";

    this.context.font = "bold "+this.fonts[this.fs]["Large"]+"px Halo3";
    this.context.textAlign = "center";
    this.context.fillStyle = "#228822";
    for(var i=-2;i<=2;i++)
        for(var j=-2;j<=2;j++)
            this.context.fillText(this.titulo, this.canvas.width / 2 + i, this.canvas.height / 2 - 10 + j);

    this.context.fillStyle = "white";
    this.context.fillText(this.titulo, this.canvas.width / 2, this.canvas.height / 2 - 10);

    this.context.font = "bold "+this.fonts[this.fs]["Medium"]+"px Arial";
    this.context.fillStyle = "black";
    this.context.fillText("PRESIONE UNA TECLA PARA VOLVER A JUGAR", this.canvas.width / 2, this.canvas.height / 2 + 30);

    delete this.keypress_func;
    this.keypress_func = function(ev){
        self.agregar_mapas();
        self.mapa_siguiente();
        self.eventos_teclas_juego();
    };
}

Puzznic.prototype.dibujar_pantalla_ayuda = function(){
    var self = this;

    this.context.fillStyle = '#AAFFAA';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.titulo = "Teclas";

    this.context.font = "bold "+this.fonts[this.fs]["Large"]+"px Halo3";
    this.context.textAlign = "center";
    this.context.fillStyle = "#228822";
    for(var i=-2;i<=2;i++)
        for(var j=-2;j<=2;j++)
            this.context.fillText(this.titulo, this.canvas.width / 2 + i, 40 + j);

    this.context.fillStyle = "white";
    this.context.fillText(this.titulo, this.canvas.width / 2, 40);

    this.context.font = "bold "+this.fonts[this.fs]["Medium"]+"px Arial";
    this.context.fillStyle = "black";
    this.context.fillText("PRESIONE UNA TECLA PARA CONTINUAR", this.canvas.width / 2, this.canvas.height - 30);

    this.context.font = this.fonts[this.fs]["Small"]+"px Arial";
    this.context.textAlign = "left";
    var img;
    var y = 0.2 * this.canvas.height;
    var x = 0.1 * this.canvas.width;

    img = document.getElementById("key_f1");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("esta pantalla.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_left");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("Mover a la izquierda.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_right");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("Mover a la derecha.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_up");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("Mover a arriba.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_down");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("Mover a abajo.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_spacebar");
    this.context.drawImage(img, x - this.fonts[this.fs]["Medium"], y, this.fonts[this.fs]["Medium"] * 2, this.fonts[this.fs]["Medium"]);
    this.context.fillText("Seleccionar/Deselecionar pieza.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_p");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("Pausar juego.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);

    y += 1.5*this.fonts[this.fs]["Medium"];
    img = document.getElementById("key_r");
    this.context.drawImage(img, x, y, this.fonts[this.fs]["Medium"], this.fonts[this.fs]["Medium"]);
    this.context.fillText("Reiniciar pantalla.", 2*this.fonts[this.fs]["Medium"] + x, y + 0.8*this.fonts[this.fs]["Medium"]);
}

Puzznic.prototype.pantalla_inicial = function(){
    var self = this;

    this.dibujar_pantalla_ayuda();

    delete this.keypress_func;
    this.keypress_func = function(ev){
        this.eventos_teclas_juego();

        /*
        for(var i=0;i<9;i++)
            this.mapas.shift();
        */

        this.pantalla = this.dibujar;
        this.mapa_siguiente();
    };
}

Puzznic.prototype.pantalla_ayuda = function(){
    var self = this;

    this.dibujar_pantalla_ayuda();

    delete this.keypress_func;
    this.keypress_func = function(ev){
        this.reanudar();
        self.eventos_teclas_juego();
        this.pantalla = this.dibujar;
    };
}
