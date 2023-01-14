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

var graph = null;

var canvasMinX;
var canvasMinY;

function Vertice(valor, posX, posY) {
  this.id = counterIdsVertices++;
  this.valor = this.id;
  if (valor != null) this.valor = valor;
  this.posX = posX;
  this.posY = posY;
  this.raio = 20;
  this.fill = "#06D";
  this.fillText = "white";
}

function Aresta(inicio, fim, valor) {
  this.valor = valor;
  this.inicio = inicio;
  this.fim = fim;
  this.fill = "#C5C5C5";
  this.fillText = "#2D2D2D";
}

function Grafo() {
  this.verticeSelecionado = null;
  this.arestaSelecionada = null;
  this.vertices = [];
  this.arestas = [];

  this.adicionarVertice = function (valor, posX, posY) {
    if (!this.search_porValor(valor)) {
      var vertice = new Vertice(valor, posX / scale, posY / scale);
      this.vertices.push(vertice);
      this.update();
      return vertice;
    }

    return null;
  };

  this.adicionarAresta_porValor = function (valorInicio, valorFim, valor) {
    var verticeInicio = this.search_porValor(valorInicio);
    var verticeFim = this.search_porValor(valorFim);

    if (verticeInicio == null || verticeFim == null) {
      alert("Algum dos vértices não existem");
      return;
    }

    this.adicionarAresta(verticeInicio.id, verticeFim.id, valor);
  };

  this.removerVertice = function (idVertice) {
    for (var i in this.vertices) {
      if (idVertice == this.vertices[i].id) {
        this.vertices.splice(i, 1);
        this.removerArestas(idVertice);
        break;
      }
    }
  };

  this.removerArestas = function (idVertice) {
    for (var i = 0; i < this.arestas.length; i++) {
      if (idVertice == this.arestas[i].inicio.id) {
        this.arestas.splice(i, 1);
        i = 0;
      }
    }
    for (var i = 0; i < this.arestas.length; i++) {
      if (idVertice == this.arestas[i].fim.id) {
        this.arestas.splice(i, 1);
        i = 0;
      }
    }
  };

  this.removerAresta = function (aresta) {
    for (var i in this.arestas) {
      if (aresta == this.arestas[i]) {
        this.arestas.splice(i, 1);
        arestaOposta = this.searchAresta(aresta.fim, aresta.inicio);
        if (arestaOposta != null) this.removerAresta(arestaOposta);
        break;
      }
    }
  };

  this.salvar = function () {
    var dados = '{"vertices":[';

    for (var i in this.vertices) {
      dados += '{"valor":"' + this.vertices[i].valor + '",';
      dados += '"posx":"' + this.vertices[i].posX + '",';
      dados += '"posy":"' + this.vertices[i].posY + '",';
      dados += '"raio":"' + this.vertices[i].raio + '",';
      dados += '"fill":"' + this.vertices[i].fill + '",';
      dados += '"fillText":"' + this.vertices[i].fillText + '"';

      if (i != this.vertices.length - 1) dados += "},";
    }
    dados += "}],";

    dados += '"arestas":[';

    for (var i in this.arestas) {
      valorInicio = this.arestas[i].inicio.valor;
      valorFim = this.arestas[i].fim.valor;
      peso = this.arestas[i].valor;

      dados +=
        '{"verticeInicio":"' +
        valorInicio +
        '","verticeFim":"' +
        valorFim +
        '","valor":"' +
        peso +
        '"}';

      if (i != this.arestas.length - 1) dados += ",";
    }

    dados += "]}";

    $("#textAreaNovoGrafo").val(dados);
    $("#salveForm").submit();
  };

  this.adicionarAresta = function (idInicio, idFim, valor) {
    var inicio = this.search(idInicio);
    var fim = this.search(idFim);

    if (inicio == null || fim == null) {
      alert("Algum dos vértices não existem");
      return;
    }

    var aresta = new Aresta(inicio, fim, valor);
    this.arestas.push(aresta);
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

  this.search_porValor = function (valorVertice) {
    for (var i in this.vertices) {
      if (valorVertice == this.vertices[i].valor) {
        return this.vertices[i];
      }
    }
    return null;
  };

  this.searchAresta = function (verticeInicio, verticeFim) {
    for (var i = 0; i < this.arestas.length; i++) {
      if (
        this.arestas[i].inicio == verticeInicio &&
        this.arestas[i].fim == verticeFim
      ) {
        return this.arestas[i];
      }
    }

    return null;
  };

  this.searchAresta_QueSaem = function (vertice) {
    var respostas = new Array();

    for (var i in this.arestas) {
      if (this.arestas[i].inicio == vertice) {
        respostas.push(this.arestas[i]);
      }
    }

    return respostas;
  };

  this.verticeClicado = function (posX, posY) {
    for (var i in graph.vertices) {
      var x = graph.vertices[i].posX * scale;
      var y = graph.vertices[i].posY * scale;

      if (Math.pow(posX - x, 2) + Math.pow(posY - y, 2) < 400 * scale) {
        return this.vertices[i];
      }
    }

    return null;
  };

  this.arestaClicada = function (posX, posY) {
    var resposta = null;
    var areaDoTriangulo = 999999999999999;

    for (var i in this.arestas) {
      var x1 = this.arestas[i].inicio.posX;
      var y1 = this.arestas[i].inicio.posY;
      var x2 = this.arestas[i].fim.posX;
      var y2 = this.arestas[i].fim.posY;

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
        resposta = this.arestas[i];
      }
    }

    return resposta;
  };

  this.updateAresta = function () {
    for (var i in this.arestas) {
      context.lineWidth = 1.5;
      context.beginPath();

      fromx = this.arestas[i].inicio.posX;
      fromy = this.arestas[i].inicio.posY;

      tox = this.arestas[i].fim.posX;
      toy = this.arestas[i].fim.posY;

      var headlen = 10; // length of head in pixels
      var angle = Math.atan2(toy - fromy, tox - fromx);

      //Coloca o centro na circunferência do vertice e não no centro.
      toy = toy - 20 * Math.sin(angle);
      tox = tox - 20 * Math.cos(angle);

      context.strokeStyle = this.arestas[i].fill;

      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);

      if (
        this.searchAresta(this.arestas[i].fim, this.arestas[i].inicio) == null
      ) {
        context.strokeStyle = this.arestas[i].fill;

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
      //context.fill();
      // context.stroke();
      //Desenha corretamente o valor em cima da aresta.
      //Com isso, o valor tambem se locomove conforme a movimentação da aresta
      var xMedia = (this.arestas[i].inicio.posX - this.arestas[i].fim.posX) / 2;
      var yMedia = (this.arestas[i].inicio.posY - this.arestas[i].fim.posY) / 2;

      if (
        xMedia >= 0 ||
        this.arestas[i].inicio.posX <= this.arestas[i].fim.posX
      )
        xMedia *= -1;
      if (
        yMedia >= 0 ||
        this.arestas[i].inicio.posY <= this.arestas[i].fim.posY
      )
        yMedia *= -1;

      context.font = "bold 15px Arial";
      context.fillStyle = this.arestas[i].fillText;
      context.fillText(
        this.arestas[i].valor,
        this.arestas[i].inicio.posX + xMedia,
        this.arestas[i].inicio.posY + yMedia
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
      /*Desenha o valor do nó*/

      context.font = "bold " + 14 * scale + "px Arial";

      context.fillStyle = this.vertices[i].fillText;
      context.fillText(
        this.vertices[i].valor,
        this.vertices[i].posX - 7,
        this.vertices[i].posY + 3
      );

      context.closePath();
    }
  };

  this.update = function () {
    this.clear();

    this.updateAresta();

    this.updateVertices();
  };

  this.moverVertice = function (posX, posY, event) {
    var vertice = this.verticeClicado(posX, posY);

    if (vertice != null) {
      document.onmousemove = function (e) {
        graph.setPosX(vertice, mouseX / scale);
        graph.setPosY(vertice, mouseY / scale);
        graph.update();
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

    for (var i in this.arestas) {
      matriz[this.arestas[i].inicio.id - 1][this.arestas[i].fim.id - 1] =
        this.arestas[i].valor;
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

    for (var i in this.arestas) {
      this.arestas[i].fill = "#C5C5C5";
      this.arestas[i].fillText = "#2D2D2D";
    }

    this.update();
  };

  this.empty = function () {
    return this.vertices.length == 0;
  };

  this.temArestasNegativas = function () {
    for (var i in this.arestas) {
      if (this.arestas[i].valor < 0) return true;
    }

    return false;
  };

  this.zoom = function () {
    for (var i in this.vertices) {
      //this.vertices[i].posX = this.vertices[i].posX/scale;
      //this.vertices[i].posY = this.vertices[i].posY/scale;
    }
  };
}

function onMouseDown(event) {
  this.style.cursor = "move";
  if (event.button == 0) {
    if (option == 1) {
      //var valorVertice = document.getElementById("inputTexto").value;
      graph.adicionarVertice(null, mouseX, mouseY);
    } else if (option == 2) {
      graph.moverVertice(mouseX, mouseY, event);
    } else if (option == 3 || option == 4) {
      graph.verticeSelecionado = graph.verticeClicado(mouseX, mouseY);
    }
  }
  if (event.button == 0 || event.button == 1) esconder();
}

function onMouseUp(event) {
  this.style.cursor = "default";
  document.onmousemove = null;

  if (event.button == 0) {
    if (option == 3) {
      var verticeDestino = graph.verticeClicado(mouseX, mouseY);

      if (verticeDestino == null) graph.update();
      else {
        if (graph.verticeSelecionado != verticeDestino) {
          if (
            graph.searchAresta(graph.verticeSelecionado, verticeDestino) == null
          ) {
            var jaExiste = graph.searchAresta(
              verticeDestino,
              graph.verticeSelecionado
            );
            if (jaExiste == null) {
              var valorAresta = prompt("Valor da aresta", "2");
              if (valorAresta != null)
                graph.adicionarAresta(
                  graph.verticeSelecionado.id,
                  verticeDestino.id,
                  valorAresta
                );
            } else {
              graph.adicionarAresta(
                graph.verticeSelecionado.id,
                verticeDestino.id,
                jaExiste.valor
              );
            }
          } else {
            alert("Aresta já existente");
          }
          graph.update();
        }
      }

      graph.verticeSelecionado = null;
    } else if (option == 4) {
      var verticeDestino = graph.verticeClicado(mouseX, mouseY);

      if (verticeDestino == null) graph.update();
      else {
        if (graph.verticeSelecionado != verticeDestino) {
          if (
            graph.searchAresta(graph.verticeSelecionado, verticeDestino) == null
          ) {
            var valorAresta = prompt("Valor da aresta", "2");
            if (valorAresta != null)
              graph.adicionarAresta(
                graph.verticeSelecionado.id,
                verticeDestino.id,
                valorAresta
              );
            graph.adicionarAresta(
              verticeDestino.id,
              graph.verticeSelecionado.id,
              valorAresta
            );
          }
        } else {
          alert("Aresta já existente");
        }
        graph.update();
      }
    }

    graph.verticeSelecionado = null;
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
    if (graph.verticeSelecionado != null) {
      graph.clear();
      context.beginPath();
      context.moveTo(
        graph.verticeSelecionado.posX,
        graph.verticeSelecionado.posY
      );
      context.lineTo(mouseX / scale, mouseY / scale);
      context.stroke();

      graph.updateAresta();

      graph.updateVertices();
    }
  }
}

function init() {
  canvas = document.getElementById("canvas");

  if (!canvas.getContext) {
    alert("Não foi pessível adquirir o contexto");
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

  criarGrafo();
}

function selecionarItem(elemento, opcao) {
  $("#menuAdicionarVertice").removeClass("Menu-Item-Selecionado");
  $("#menuAdicionarArco").removeClass("Menu-Item-Selecionado");
  $("#menuAdicionarAresta").removeClass("Menu-Item-Selecionado");
  $("#menuMover").removeClass("Menu-Item-Selecionado");
  $(elemento).addClass("Menu-Item-Selecionado");
  option = opcao;
}

function criarGrafo() {
  graph = new Grafo();
  counterIdsVertices = 1;
}

function zoomDaTela(event) {
  var wheel = 0;

  if (event.detail) wheel = event.detail / 40; //n or -n
  else if (event.wheelDelta)
    //Chrome
    wheel =
      event.wheelDelta > 0
        ? -(event.wheelDelta / 120 + 2) / 40
        : -(event.wheelDelta / 120 - 2) / 40;

  var zoom = 1 + wheel / 2;

  context.scale(zoom, zoom);
  scale *= zoom;

  graph.zoom();
  graph.update();
}
//Para o Opera
document.onmousewheel = zoomDaTela;

$("#canvas").bind("DOMMouseScroll", function (event) {
  zoomDaTela(event);
});

$(document).ready(function () {
  init();

  $("#menuAdicionarVertice").click(function (e) {
    selecionarItem("#menuAdicionarVertice", 1);
  });
  $("#menuAdicionarAresta").click(function (e) {
    selecionarItem("#menuAdicionarAresta", 3);
  });
  $("#menuAdicionarArco").click(function (e) {
    selecionarItem("#menuAdicionarArco", 4);
  });
  $("#menuMover").click(function (e) {
    selecionarItem("#menuMover", 2);
  });

  $("#dialog:ui-dialog").dialog("destroy");

  $("#dialog-form").dialog({
    autoOpen: false,
    height: 240,
    width: 400,
    modal: true,
    buttons: {
      Abrir: function () {
        if (!arquivoCarregado) {
          alert(
            "Por favor, selecione o arquivo, clique em 'carregar' antes de abrir."
          );
          return;
        }

        criarGrafo();
        graph.update();

        var novoGrafo = $("#textAreaNovoGrafo").val().trim();

        var objJSON = JSON.parse(novoGrafo);

        for (var i in objJSON.vertices) {
          vertice = graph.adicionarVertice(
            parseInt(objJSON.vertices[i].valor),
            parseInt(objJSON.vertices[i].posx),
            parseInt(objJSON.vertices[i].posy)
          );
          vertice.fillText = objJSON.vertices[i].fillText;
          vertice.fill = objJSON.vertices[i].fill;
          vertice.raio = objJSON.vertices[i].raio;
        }

        for (var i in objJSON.arestas) {
          graph.adicionarAresta_porValor(
            objJSON.arestas[i].verticeInicio,
            objJSON.arestas[i].verticeFim,
            objJSON.arestas[i].valor
          );
        }

        graph.update();
        $(this).dialog("close");
        arquivoCarregado = false;
      },
      Cancel: function () {
        $(this).dialog("close");
      },
    },
    close: function () {},
  });

  $("#menuAbrir").click(function () {
    $("#dialog-form").dialog("open");
  });

  $("#uploadForm").ajaxForm({
    beforeSubmit: function (a, f, o) {
      $("#textAreaNovoGrafo").html("Submitting...");
      $("#statusCarregamento").text("Submitting...");
      $("#statusCarregamento").show();

      if ($("#file").val() == "") {
        alert("Escolha antes o arquivo.");
        $("#statusCarregamento").text("Selecione antes o arquivo");
        return false;
      }
    },
    success: function (data) {
      $("#textAreaNovoGrafo").html(data);
      $("#statusCarregamento").text("Carregado com Sucesso!");
      arquivoCarregado = true;
    },
  });

  $("#executarAlgoritmo").click(function (event) {
    if (graph.empty()) {
      alert("Atenção! Nenhum graph foi criado");
      return;
    }

    executarAlgoritmo(graph, $("#selectAlgoritmos").val());
  });

  $("#resetarGrafo").click(function (event) {
    if (graph.empty()) {
      alert("Atenção! Nenhum graph foi criado");
      return;
    }
    graph.reset();
  });
});
