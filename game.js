const canvas = document.getElementById('juego'); //Seleccionamos el elemento canvas para trabajar sobre él
const ctx = canvas.getContext('2d'); //Seleccionamos el contexto 2D del elemento para pintar en él
var boton_jugar = document.getElementById('miBoton'); //Declaramos las variables asignadas a los botones que usaremos
var boton_facil = document.getElementById('b1');
var boton_intermedio = document.getElementById('b2');
var boton_dificil = document.getElementById('b3');

const escala = 40; //Esta variable será la dimensión de nuestra cuadrícula
const filas = canvas.height / escala; //El número de filas (y columnas) lo obtenemos asignando a cada una el ancho de nuestra escala
const columnas = canvas.width / escala; //Las dimensiones del canvas están pensadas para que la división resulte un número entero

var snake = new snake_ctr(); //Creamos nuestras 2 funciones de objetos inicializadas a sus valores por defecto
var fresa= new fresa_ctr();
fresa.posicionarAleat(); //Llamamos a esta función para posicionar la primera fruta

//Establecemos un nivel de dificultad por defecto
var nivel="Fácil";
var ms=175; // Un ciclo para el loop
var intervalo; // Creamos una variable para el loop
document.querySelector('.dificultad').innerText = nivel; // Mostramos el nivel en un elemento de clase .dificultad

// Gestionamos los eventos onclick de los 3 niveles de dificultad
boton_facil.onclick = function() {
    ms=175;
    nivel="Fácil";
    document.querySelector('.dificultad').innerText = nivel;
};

boton_intermedio.onclick = function() {
    ms=130;
    nivel="Intermedia";
    document.querySelector('.dificultad').innerText = nivel;
};

boton_dificil.onclick = function() {
    ms=90;
    nivel="Difícil";
    document.querySelector('.dificultad').innerText = nivel;
};

var sesion=false; // Variable de control para saber si existe una sesión activa en cada momento
var usuario; //Estas variables representarán las credenciales de la sesión activa
var contra;
var max = 0; // Almacenará la puntuación máxima lograda

// Almacenamiento simple de usuarios
var usuarios = {
    'admin': '1234' //
};

// Función para añadir un usuario (para uso en el formulario de registro)
function registrarUsuario(usr, passwd) {
    usuarios[usr] = passwd;
};

boton_jugar.onclick = function() { //Gestionamos el evento onclick del botón jugar
    if (sesion) { //Ahora ejecutamos el juego sólo después de verificar el inicio de sesión con la variable de control
        clearInterval(intervalo); //Limpia el intervalo existente para evitar problemas
        intervalo = window.setInterval(dibujarTodo, ms); //Establecemos el bucle con una frecuencia determinada por el nivel de dificultad elegido (ms)
    } else {
        alert("Debes iniciar sesión para jugar.");
    }
};

function dibujarTodo() { // Ésta es la función principal que se ejecuta en bucle cuando lo iniciamos con el botón
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos el lienzo para redibujarlo
    fresa.dibujar(); // Funciones declaradas dentro de los objetos fresa y snake
    snake.actualizar();
    snake.dibujar();
    snake.zampar(fresa);

    document.querySelector('.score').innerText = snake.total; // Actualización de la puntuación
};

// Declaramos un escuchador de eventos keydown con la función pulsarTecla
window.addEventListener('keydown', pulsarTecla, false);

function pulsarTecla(e) {
    if (e.key) { //Nos aseguramos de que e.key no sea undefined
        var direccion = e.key.replace('Arrow', ''); // Variable que almacenará el substring que indica el sentido de movimiento
        if (['Up', 'Down', 'Left', 'Right'].includes(direccion)) { // Entraremos en el if sólo cuando se pulsen esas teclas
            e.preventDefault(); // Esto evita que la tecla haga scroll en la página y así podemos jugar sin mover la página
            snake.cambiarDireccion(direccion);
        }
    }
};

//Función del objeto snake. Cuenta con sus variables y con funciones aplicables sobre sus variables
function snake_ctr() {
    this.x = 0; //Posicionamiento x e y de la cabeza
    this.y = 0;
    this.xVel = escala * 1; // Velocidad inicial paralela al eje x; se moverá una unidad de cuadrícula a cada frame
    this.yVel = 0;
    this.total = 0; // Cantidad de bloques que persiguen a la cabeza
    this.cola = []; // Array para gestionar los bloques. Cada elemento será un objeto de variables x e y

    this.dibujar = function() { // Función para dibujar la serpiente, se ejecutará en dibujarTodo() una vez actualizada
        ctx.fillStyle = "#109030"; // Color de relleno

        for (let i = 0; i < this.cola.length; i++) { //Dibuja la cola
            if(this.cola[i]){
                ctx.fillRect(this.cola[i].x, this.cola[i].y, escala, escala);
            }
        }
        ctx.fillRect(this.x, this.y, escala, escala); // Dibuja la cabeza 
    };

    // En esta función actualizaremos la nueva cola, la nueva posición de la cabeza, y evaluaremos las colisiones
    this.actualizar = function() {
        for (let i = 0; i < this.cola.length - 1; i++) { // Bucle for para asignar a cada objeto su posicionamiento
            this.cola[i] = this.cola[i + 1]; // Los nuevos elementos del array se colocarán en la posición de sus respectivos anteriores
        } // Nótese que, en caso de haber comido una fresa, el nuevo elemento será el cola[0]

        // Ésta es la asignación del posicionamiento del primer elemento que sigue a la cabeza
        if (this.total!=0){
            this.cola[this.total - 1] = { x: this.x, y: this.y };
        }

        // Posicionamiento de la nueva cabeza después de moverse
        this.x += this.xVel;
        this.y += this.yVel;

        //Casos de colisión con las paredes
        if (this.x >= canvas.width || this.y >= canvas.height || this.x < 0 || this.y < 0) {
            if(this.total>max){
                max=this.total;//Almacenamos la nueva puntuación máxima
                alert("ENHORABUENA!!\nNueva PUNTUACIÓN MÁXIMA de " + max + " puntazos!");
                document.querySelector('.max').innerText = usuario + ' => ' + max + ' puntos (' + nivel + ')'; //La mostramos
            }
            else{
                alert("Vaya, has perdido...\nObtuviste una puntuación de " + this.total + " puntos.");
            } 
            //Para evitar utilizar la función document.location.reload(), interrumpimos el loop manualmente, para que no borre la información que queremos guardar
            snake = new snake_ctr();  // Reseteamos la serpiente
            clearInterval(intervalo);  // Detenemos el loop de juego activo
        }

        // Evaluamos los casos en los que la posición de la cabeza coincide con la de algún elemento de la cola
        for (var i = 0; i < this.cola.length; i++) {
            if (this.cola[i] && this.x == this.cola[i].x && this.y == this.cola[i].y) {
                if(this.total>max){
                    max=this.total;
                    alert("Vaya, te has comido tu propia cola, pero...\nENHORABUENA!!\nNueva PUNTUACIÓN MÁXIMA de " + max + " puntazos!");
                    document.querySelector('.max').innerText = usuario + ' => ' + max + ' puntos (' + nivel + ')';
                }
                else{
                    alert("Vaya, te has comido tu propia cola...\nObtuviste una puntuación de " + this.total + " puntos.");
                } 
                snake = new snake_ctr();
                clearInterval(intervalo);
                break;
            }
        }
    };

    this.cambiarDireccion = function(direccion) { //direccion está almacenando la tecla pulsada cuando ésta es de dirección.
        switch(direccion) {
            case 'Up':
                if (this.yVel == 0) { //Sólo podemos cambiar de dirección hacia arriba si no nos estamos moviendo en la dirección paralela al eje Y
                    this.xVel = 0;
                    this.yVel = -escala * 1; //Nos moveremos un recuadro por cada intervalo, en este caso, hacia arriba
                }
                break;
            case 'Down':
                if (this.yVel == 0) {
                    this.xVel = 0;
                    this.yVel = escala * 1;
                }
                break;
            case 'Left':
                if (this.xVel == 0) { //Sucede lo mismo, sólo puedo girar a la izquierda si me estoy moviendo hacia arriba o abajo.
                    this.xVel = -escala * 1;
                    this.yVel = 0;
                }
                break;
            case 'Right':
                if (this.xVel == 0) {
                    this.xVel = escala * 1;
                    this.yVel = 0;
                }
                break;
        }
    };

    this.zampar = function(fresa) { //Cuando las coordenadas de la cabeza coinciden con las de la fresa, nos la comemos y nos crece la cola!
        if (this.x == fresa.x && this.y == fresa.y) {
            this.total++;
            fresa.posicionarAleat();
            return true;
        }
        return false;
    };
};

function fresa_ctr() {
    this.x; // Posicionamiento de la fresa
    this.y;
    this.imagen = new Image();
    this.imagen.src = 'images/fresa.png';//Usaremos una imagen sin fondo para darle más realismo al juego

    //Las coordenadas aleatorias deben ocupar un recuadro, por lo que deben posicionarse en el origen del recuadro.
    //Discretizando los valores aleatorios entre 0 y columnas (o filas) - sin incluir el último para que no se salga de los márgenes - , 
    //y multiplicando por el tamaño del recuadro, obtendremos todas las posibles posiciones
    this.posicionarAleat = function() { 
        this.x = (Math.floor(Math.random() * columnas)) * escala;
        this.y = (Math.floor(Math.random() * filas)) * escala;
    };

    this.dibujar = function() {
        ctx.drawImage(this.imagen, this.x, this.y, escala, escala);
    };
};


//*************************************************
//Gestión de lo relacionado con usuarios y sesiones

//Al hacer clic en registrarse, se abre la ventana modal cambiando el valor de la propiedad display
document.getElementById("registrarse").onclick = function() {
    document.getElementById("miModal").style.display = "block";
};

//Al hacer clic en la pantalla, si estamos dentro de la ventana modal, la cerramos restableciendo el valor de la propiedad display
window.onclick = function(event) {
    if (event.target == document.getElementById("miModal")) {
        document.getElementById("miModal").style.display = "none";
    }
};

//Accedemos al formulario de registro y obtenemos los valores de interés al enviar el formulario
document.getElementById("formRegistro").onsubmit = function(event) {
    event.preventDefault();
    var user = document.querySelector('input[name="User"]').value;
    var passw = document.querySelector('input[name="Passw"]').value;
    registrarUsuario(user, passw);//Llamamos a la función que registra el usuario con su contraseña
    document.getElementById("miModal").style.display = "none";// Volvemos a ocultar la ventana modal de registro
    alert("Usuario registrado con éxito!");
};


//Para iniciar sesión haremos lo mismo, pero comprobando antes los datos del registro
document.getElementById("inicioSesion").onsubmit = function(event) {
    event.preventDefault();
    var u = document.querySelector('input[id="user_inicio"]').value;
    var c = document.querySelector('input[id="passw_inicio"]').value;
    if (usuarios[u] == c) { //Asignamos los valores de los campos del inicio de sesión en caso de tratarse de un usuario verificado
        usuario = u;
        contra = c;
        document.querySelector('.usr').innerText = usuario; // Mostramos la sesión abierta en el <span> destinado a ello
        alert("¡¡Bienvenida/o, " + usuario + "!!");
        sesion=true;
    } else {
        alert("Los datos introducidos no son correctos.\nNo se ha podido iniciar sesión");
    }
};

