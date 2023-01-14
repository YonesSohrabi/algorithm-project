var width;
var height;
var context;
var canvas;

var originx = 0;
var originy = 0;
scale = 1;

option = 0;

var mouseX, mouseY;
var countVertice = 1;

var counterIdsVertices = 1;

var graphs = null;

var canvasMinX;
var canvasMinY;

function Vertice(value, posX, posY) {
  this.id = counterIdsVertices++;
  this.value = this.id;
  if (value != null) this.value = value;
  this.posX = posX;
  this.posY = posY;
  this.raio = 20;
  this.fill = "#06D";
  this.fillText = "white";
}

function Edge(start, end, value) {
  this.value = value;
  this.start = start;
  this.end = end;
  this.fill = "#C5C5C5";
  this.fillText = "#2D2D2D";
}

function Graph() {
  this.vertexSelected = null;
  this.selectedEdge = null;
  this.vertices = [];
  this.edges = [];

  this.addVertex = function (value, posX, posY) {
    if (!this.searchByValue(value)) {
      var vertice = new Vertice(value, posX / scale, posY / scale);
      this.vertices.push(vertice);
      this.update();
      return vertice;
    }

    return null;
  };

  this.addEdgePerValue = function (valueStart, valueEnd, value) {
    var verticeStart = this.searchByValue(valueStart);
    var verticeEnd = this.searchByValue(valueEnd);

    if (verticeStart == null || verticeEnd == null) {
      alert("Some of the vertices do not exist");
      return;
    }

    this.addEdge(verticeStart.id, verticeEnd.id, value);
  };

  this.removerVertice = function (idVertice) {
    for (var i in this.vertices) {
      if (idVertice == this.vertices[i].id) {
        this.vertices.splice(i, 1);
        this.removerEdges(idVertice);
        break;
      }
    }
  };

  this.removerEdges = function (idVertice) {
    for (var i = 0; i < this.edges.length; i++) {
      if (idVertice == this.edges[i].start.id) {
        this.edges.splice(i, 1);
        i = 0;
      }
    }
    for (var i = 0; i < this.edges.length; i++) {
      if (idVertice == this.edges[i].end.id) {
        this.edges.splice(i, 1);
        i = 0;
      }
    }
  };

  this.removerEdge = function (edge) {
    for (var i in this.edges) {
      if (edge == this.edges[i]) {
        this.edges.splice(i, 1);
        oppositeEdge = this.searchEdge(edge.end, edge.start);
        if (oppositeEdge != null) this.removerEdge(oppositeEdge);
        break;
      }
    }
  };

  this.addEdge = function (idStart, idEnd, value) {
    var start = this.search(idStart);
    var end = this.search(idEnd);

    if (start == null || end == null) {
      alert("Some of the vertices do not exist");
      return;
    }

    var edge = new Edge(start, end, value);
    this.edges.push(edge);
    this.update();
  };

  this.setPosX = function (vertice, posX) {
    vertice.posX = posX;
  };

  this.setPosY = function (vertice, posY) {
    vertice.posY = posY;
  };

  this.search = function (idVertice) {
    for (var i in this.vertices) {
      if (idVertice == this.vertices[i].id) {
        return this.vertices[i];
      }
    }
    return null;
  };

  this.searchByValue = function (valueVertice) {
    for (var i in this.vertices) {
      if (valueVertice == this.vertices[i].value) {
        return this.vertices[i];
      }
    }
    return null;
  };

  this.searchEdge = function (verticeStart, verticeEnd) {
    for (var i = 0; i < this.edges.length; i++) {
      if (
        this.edges[i].start == verticeStart &&
        this.edges[i].end == verticeEnd
      ) {
        return this.edges[i];
      }
    }

    return null;
  };

  this.searchEdgeThatLeave = function (vertice) {
    var respostas = new Array();

    for (var i in this.edges) {
      if (this.edges[i].start == vertice) {
        respostas.push(this.edges[i]);
      }
    }

    return respostas;
  };

  this.verticeClicked = function (posX, posY) {
    for (var i in graphs.vertices) {
      var x = graphs.vertices[i].posX * scale;
      var y = graphs.vertices[i].posY * scale;

      if (Math.pow(posX - x, 2) + Math.pow(posY - y, 2) < 400 * scale) {
        return this.vertices[i];
      }
    }

    return null;
  };

  this.edgeClicked = function (posX, posY) {
    var resposta = null;
    var areaDoTriangulo = 999999999999999;

    for (var i in this.edges) {
      var x1 = this.edges[i].start.posX;
      var y1 = this.edges[i].start.posY;
      var x2 = this.edges[i].end.posX;
      var y2 = this.edges[i].end.posY;

      var a = (y2 - y1) / (x2 - x1);
      var b = y2 - a * x2;

      var d =
        Math.abs(a * posX + -1 * posY + b) /
        Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

      //Calcula a area do triangulo pelo semiperimetro

      var aa = Math.sqrt(Math.pow(posX - x1, 2) + Math.pow(posY - y1, 2));
      var bb = Math.sqrt(Math.pow(posX - x2, 2) + Math.pow(posY - y2, 2));
      var cc = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

      var s = (aa + bb + cc) / 2;

      var area = Math.sqrt(s * (s - aa) * (s - bb) * (s - cc));

      if (d < 0.05 && area < areaDoTriangulo) {
        areaDoTriangulo = area;
        resposta = this.edges[i];
      }
    }

    return resposta;
  };

  this.updateEdge = function () {
    for (var i in this.edges) {
      context.lineWidth = 1.5;
      context.beginPath();

      fromx = this.edges[i].start.posX;
      fromy = this.edges[i].start.posY;

      tox = this.edges[i].end.posX;
      toy = this.edges[i].end.posY;

      var headlen = 10; // length of head in pixels
      var angle = Math.atan2(toy - fromy, tox - fromx);

      //Coloca o centro na circunferência do vertice e não no centro.
      toy = toy - 20 * Math.sin(angle);
      tox = tox - 20 * Math.cos(angle);

      context.strokeStyle = this.edges[i].fill;

      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);

      if (this.searchEdge(this.edges[i].end, this.edges[i].start) == null) {
        context.strokeStyle = this.edges[i].fill;

        context.lineTo(
          tox - headlen * Math.cos(angle - Math.PI / 6),
          toy - headlen * Math.sin(angle - Math.PI / 6)
        );
        context.moveTo(tox, toy);
        context.lineTo(
          tox - headlen * Math.cos(angle + Math.PI / 6),
          toy - headlen * Math.sin(angle + Math.PI / 6)
        );
      }

      //Correctly draws the value on top of the edge.
      //With that, the value also moves according to the movement of the edge
      var xMedia = (this.edges[i].start.posX - this.edges[i].end.posX) / 2;
      var yMedia = (this.edges[i].start.posY - this.edges[i].end.posY) / 2;

      if (xMedia >= 0 || this.edges[i].start.posX <= this.edges[i].end.posX)
        xMedia *= -1;
      if (yMedia >= 0 || this.edges[i].start.posY <= this.edges[i].end.posY)
        yMedia *= -1;

      context.font = "bold 15px Arial";
      context.fillStyle = this.edges[i].fillText;
      context.fillText(
        this.edges[i].value,
        this.edges[i].start.posX + xMedia,
        this.edges[i].start.posY + yMedia
      );

      context.stroke();
      context.closePath();
    }
  };

  this.updateVertices = function () {
    for (var i in this.vertices) {
      context.beginPath();
      context.fillStyle = this.vertices[i].fill;
      context.arc(
        this.vertices[i].posX,
        this.vertices[i].posY,
        this.vertices[i].raio,
        0,
        Math.PI * 2,
        true
      );
      context.fill();
      /*Desenha o value do nó*/

      context.font = "bold " + 14 * scale + "px Arial";

      context.fillStyle = this.vertices[i].fillText;
      context.fillText(
        this.vertices[i].value,
        this.vertices[i].posX - 7,
        this.vertices[i].posY + 3
      );

      context.closePath();
    }
  };

  this.update = function () {
    this.clear();

    this.updateEdge();

    this.updateVertices();
  };

  this.moverVertice = function (posX, posY, event) {
    var vertice = this.verticeClicked(posX, posY);

    if (vertice != null) {
      document.onmousemove = function (e) {
        graphs.setPosX(vertice, mouseX / scale);
        graphs.setPosY(vertice, mouseY / scale);
        graphs.update();
      };
      document.onmousemove(event);
    }
  };

  this.getMatrizAdjacencia = function () {
    var matriz = new Array(this.vertices.length);

    for (var i = 0; i < matriz.length; i++) {
      matriz[i] = new Array(this.vertices.length);
    }

    for (var i = 0; i < matriz.length; i++) {
      for (var j = 0; j < matriz.length; j++) {
        matriz[i][j] = 0;
      }
    }

    for (var i in this.edges) {
      matriz[this.edges[i].start.id - 1][this.edges[i].end.id - 1] =
        this.edges[i].value;
    }

    return matriz;
  };

  this.clear = function () {
    context.clearRect(0, 0, width, height);
  };

  this.reset = function () {
    for (var i in this.vertices) {
      this.vertices[i].fill = "#06D";
      this.vertices[i].fillText = "white";
    }

    for (var i in this.edges) {
      this.edges[i].fill = "#C5C5C5";
      this.edges[i].fillText = "#2D2D2D";
    }

    this.update();
  };

  this.empty = function () {
    return this.vertices.length == 0;
  };

  this.temEdgesNegativas = function () {
    for (var i in this.edges) {
      if (this.edges[i].value < 0) return true;
    }

    return false;
  };
}

function init() {
  canvas = document.getElementById("canvas");

  if (!canvas.getContext) {
    alert("Could not acquire context");
    return;
  }

  context = canvas.getContext("2d");

  canvasMinX = $("#canvas").offset().left;
  canvasMinY = $("#canvas").offset().top;

  canvas.onmousedown = onMouseDown;
  canvas.onmouseup = onMouseUp;

  context.canvas.height = window.innerHeight;
  context.canvas.width = window.innerWidth - canvasMinX;

  width = canvas.width;
  height = canvas.height;

  createGraph();
}

function onMouseDown(event) {
  this.style.cursor = "move";

  if (event.button == 0) {
    if (option == 1) {
      graphs.addVertex(null, mouseX, mouseY);
    } else if (option == 2) {
      graphs.moverVertice(mouseX, mouseY, event);
    } else if (option == 3 || option == 4) {
      graphs.vertexSelected = graphs.verticeClicked(mouseX, mouseY);
    }
  } else if (event.button == 2) {
    var menu = document.getElementById("context_menu");

    graphs.vertexSelected = graphs.verticeClicked(mouseX, mouseY);

    if (graphs.vertexSelected != null) {
      mostrar(event);
      menu.onmouseout = function (e) {
        var mouseEvent = e;
        var element = mouseEvent.relatedTarget || mouseEvent.toElement;
        if (element.nodeName != "LI") esconder();
      };
    } else {
      //Usuario possivelmente clicou em uma edge
      graphs.selectedEdge = graphs.edgeClicked(mouseX, mouseY);

      if (graphs.selectedEdge != null) {
        mostrar(event);
        menu.onmouseout = function (e) {
          var mouseEvent = e;
          var element = mouseEvent.relatedTarget || mouseEvent.toElement;
          if (element.nodeName != "LI") esconder();
        };
      }
    }
  }
}

function onMouseUp(event) {
  this.style.cursor = "default";
  document.onmousemove = null;

  if (event.button == 0) {
    if (option == 3) {
      var verticeDestino = graphs.verticeClicked(mouseX, mouseY);

      if (verticeDestino == null) graphs.update();
      else {
        if (graphs.vertexSelected != verticeDestino) {
          if (
            graphs.searchEdge(graphs.vertexSelected, verticeDestino) == null
          ) {
            var jaExiste = graphs.searchEdge(
              verticeDestino,
              graphs.vertexSelected
            );
            if (jaExiste == null) {
              var valueEdge = prompt("Valor da edge", "2");
              if (valueEdge != null)
                graphs.addEdge(
                  graphs.vertexSelected.id,
                  verticeDestino.id,
                  valueEdge
                );
            } else {
              graphs.addEdge(
                graphs.vertexSelected.id,
                verticeDestino.id,
                jaExiste.value
              );
            }
          } else {
            alert("Edge já existente");
          }
          graphs.update();
        }
      }

      graphs.vertexSelected = null;
    } else if (option == 4) {
      var verticeDestino = graphs.verticeClicked(mouseX, mouseY);

      if (verticeDestino == null) graphs.update();
      else {
        if (graphs.vertexSelected != verticeDestino) {
          if (
            graphs.searchEdge(graphs.vertexSelected, verticeDestino) == null
          ) {
            var valueEdge = prompt("Valor da edge", "2");
            if (valueEdge != null)
              graphs.addEdge(
                graphs.vertexSelected.id,
                verticeDestino.id,
                valueEdge
              );
            graphs.addEdge(
              verticeDestino.id,
              graphs.vertexSelected.id,
              valueEdge
            );
          }
        } else {
          alert("Edge já existente");
        }
        graphs.update();
      }
    }

    graphs.vertexSelected = null;
  }
}

function onMouseMove(event) {
  //Chrome
  if (event.offsetX) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
  } else if (event.layerX) {
    mouseX = event.layerX - canvasMinX;
    mouseY = event.layerY;
  }
  //document.getElementById("coordenadas").innerHTML="Coordinates: (" + mouseX + "," + mouseY + ")";

  if (option == 3 || option == 4) {
    if (graphs.vertexSelected != null) {
      graphs.clear();
      context.beginPath();
      context.moveTo(graphs.vertexSelected.posX, graphs.vertexSelected.posY);
      context.lineTo(mouseX / scale, mouseY / scale);
      context.stroke();

      graphs.updateEdge();

      graphs.updateVertices();
    }
  }
}

function selecionarItem(element, option) {
  $("#menuAdicionarVertice").removeClass("Menu-Item-Selecionado");
  $("#menuAdicionarArco").removeClass("Menu-Item-Selecionado");
  $("#menuAdicionarEdge").removeClass("Menu-Item-Selecionado");
  $("#menuMover").removeClass("Menu-Item-Selecionado");
  $(element).addClass("Menu-Item-Selecionado");
  option = option;
}

function createGraph() {
  graphs = new Graph();
  counterIdsVertices = 1;
}

$(document).ready(function () {
  init();

  $("#menuAdicionarVertice").click(function (e) {
    selecionarItem("#menuAdicionarVertice", 1);
  });
  $("#menuAdicionarEdge").click(function (e) {
    selecionarItem("#menuAdicionarEdge", 3);
  });
  $("#menuAdicionarArco").click(function (e) {
    selecionarItem("#menuAdicionarArco", 4);
  });
  $("#menuMover").click(function (e) {
    selecionarItem("#menuMover", 2);
  });

  $("#executeAlgorithm").click(function (event) {
    if (graphs.empty()) {
      alert("Attention! No graphs were created");
      return;
    }

    executeAlgorithm(graphs, $("#selectAlgoritmos").val());
  });

  $("#resetarGraph").click(function (event) {
    if (graphs.empty()) {
      alert("Attention! No graphs were created");
      return;
    }
    graphs.reset();
  });
});
