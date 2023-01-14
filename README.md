# Minimum Spanning Tree Demonstration

This is a demonstration in Node.js of Prim's algorithm and Kruskal's algorithm
to find the minimum spanning tree of a set of vertices. Graphics use the
Paper.js library. Works great on mobile!

A [minimum spanning tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree)
is a subset of edges of a weighted undirected graph such that it connects
all vertices but with the minimum combined edge weight.

## Prim's algorithm

The main idea is to look at the least weight edge from any of the vertices
already contained in the MST to any vertex not in the MST, until the list has V
elements, that is, until we have added all vertices to the MST. (Or add edges
to the MST until the list has V-1 elements.)

Pseudocode:

```
V : list of all Vertices
MST : list of Vertices initialized to be empty (minimum spanning tree)
x[0] : least weight Vertex

MST.push(x[0])

while MST.length != Vertices.length:

  for each vertex v[i] in MST:
    minEdge : next Edge of least weight

    for each vertex v[j] in v[i]'s adjacency list:
      if the edge formed from (v[i], v[j]) has less weight than minEdge
      and v[j] is not already contained in MST:
        minEdge = edge(v[i], v[j])

  MST.push(minEdge)
```

## Kruskal's algorithm

The main idea is to look at the next least edge such that at least one of the
vertices in the edge is not already contained in the MST (to avoid duplicates),
and that adding the edge does not create a cycle, or in other words, the
two vertices comprising the edge are of different connected components. (Or add
edges to the MST until the list has V-1 elements.)

Pseudocode:

```
U : UnionFind data structure
V : list of all Vertices
E: list of all Edges
MST : list of Vertices initialized to be empty (minimum spanning tree)

initialize U
sort E in ascending order by weight
i = 0

while MST.length != Vertices.length:
  nextEdge : next Edge of least weight
  nextEdge = E[i]

  a : first Vertex in nextEdge
  b : second Vertex in nextEdge

  if a and b are not both contained in MST and U.find(a) != U.find(b):
    c = between a and b, the one that is not already in MST
    MST.push(c)
    U.union(a, b)

  i++
```

Or using a Min Heap:
```
U : UnionFind data structure
M : MinHeap data structure
V : list of all Vertices
E : list of all Edges
MST : list of Vertices initialized to be empty (minimum spanning tree)

initialize U
for each edge e[i] in E:
  insert E into M

while MST.length != V.length:
  nextEdge : next Edge of least weight
  nextEdge = M.extractMin()

  a : first Vertex in nextEdge
  b : second Vertex in nextEdge

  if a and b are not both contained in MST and U.find(a) != U.find(b):
    c = between a and b, the one that is not already in MST
    MST.push(c)
    U.union(a, b)

```

## Starting Up

In the terminal:

```
npm start
```
