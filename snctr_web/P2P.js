// Documentacion de la API:
// https://peerjs.com/docs.html
// https://www.toptal.com/webrtc/taming-webrtc-with-peerjs

// Ejemplos:
// https://github.com/nwah/peerjs-audio-chat
// https://github.com/peers/peerjs/issues/179

var peer = null;

var miID = "";
var otrosIDs = null;
var mostrandoID = false;

function iniciarP2P() {
  peer = new Peer(); 
  peer.on('open', function(id) {
    miID = id;
  });

  otrosIDs = new HashMap();

  peer.on('connection', function(conn) {
    conn.on('data', function(data) {
      recibirData(conn, data);
    });
  });
  peer.on('disconnected', function() {
    print("Desconectado del signalling server");
  });
  peer.on('error', function(err) {
    print("Hubo un error", err);
  });
}

function mostrarID() {
  mostrandoID = !mostrandoID;
  if (mostrandoID) {
    div = createDiv(miID);
    div.position(0, 0);
    div.size(300, 20);
  } else {
    removeElements();
  }
}

function leerID() {
  let entrada = window.prompt('Ingresar el codigo del peer');
  if (entrada) {
    // Este peer intenta conectarse a otro peer usando el id ingresado por el usuario,
    // ademas le enviara un mensaje de HOLA para generar el registro inverso.
    conectar(entrada, false, true);
  }
}

function conectar(id, compartir = false, primera = false) {
  if (!otrosIDs.containsKey(id)) {
    if (compartir) compartirNuevoPeer(id);
    let conn = peer.connect(id);
    conn.on('open', function() {
      if (compartir) compartirViejosPeers(conn);
      otrosIDs.put(id, conn);
      // print("ADD peer", conn.peer, otrosIDs.size());
      // print(otrosIDs);
      if (primera) conn.send({tipo: "HOLA"});
    });
    conn.on('close', function() {
      otrosIDs.remove(conn.peer);
      // print("REMOVE peer", conn.peer, otrosIDs.size());
      // print(otrosIDs);
    });
  } 
  // else {
  //   print(id, "is already connected");
  // }
}

function compartirNuevoPeer(nuevoID) {
  // print("Compartiendo nuevo peer");
  for (let id of otrosIDs.keys()) {
    // otrosIDs.get(id).send({x : mouseX, y : mouseY});
    otrosIDs.get(id).send({tipo: "NUEVO_PEER", id : nuevoID});
  }
}

function compartirViejosPeers(conn) {
  for (let otroID of otrosIDs.keys()) {
      conn.send({tipo: "NUEVO_PEER", id : otroID});
  }
}

function enviarMouseDragged(mx, my, press, time) {
  for (let id of otrosIDs.keys()) {
    otrosIDs.get(id).send({tipo: "PUNTERO_ARRASTRADO", x : mx, y : my, p: press, t: time});
  }
}

function recibirData(conn, data) {
  // Este peer recibe un mensaje de datos de otro peer, ademas de registrarlo, 
  // le avisa a los peers que ya tiene que tambien lo registren.
  conectar(conn.peer, true);

  // if (data["tipo"] === "HOLA") {
    // print("HOLA", conn.peer);
  // /}

  if (data["tipo"] === "NUEVO_PEER") {
    let id = data["id"]
    conectar(id);
    // print("Recibido NUEVO_PEER", id, "from", conn.peer);
  } else if (data["tipo"] === "PUNTERO_ARRASTRADO") {    
    // if (registrandoTrazo) {
    //   let x = int(data["x"])
    //   let y = int(data["y"])
    //   let p = float(data["p"])
    //   let t = int(data["t"])
    //   nuevoTrazo.agregarUnToque(crearToque(x, y, p, t, false));
    // }
    // print("Recibido MENSAJE", msg, "from", conn.peer);
  }  
}