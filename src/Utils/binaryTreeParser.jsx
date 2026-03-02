// src/utils/binaryTreeParser.js

function cleanLine(line) {
  return line.trim().replace(/\s+/g, "");
}

function parseNodeSpec(spec) {
  // spec: "a,1,1"
  const parts = spec.split(",");
  if (parts.length !== 3) {
    throw new Error(`Nodo inválido: "${spec}". Se esperaba "char,0|1,0|1"`);
  }
  const [ch, l, r] = parts;
  if (!ch || ch.length !== 1) throw new Error(`Carácter inválido en "${spec}"`);
  if (!(l === "0" || l === "1")) throw new Error(`Indicador izquierdo inválido en "${spec}"`);
  if (!(r === "0" || r === "1")) throw new Error(`Indicador derecho inválido en "${spec}"`);

  return { ch, hasLeft: l === "1", hasRight: r === "1" };
}

let idCounter = 1;
function newNode({ ch, hasLeft, hasRight }) {
  return {
    id: String(idCounter++), // id interno para render/animación
    value: ch,               // el carácter real del árbol
    hasLeft,
    hasRight,
    left: null,
    right: null,
  };
}

export function parseBinaryTreeFile(text) {
  idCounter = 1;

  const rawLines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((l) => l.length > 0);

  if (rawLines.length < 2) {
    throw new Error("El archivo debe tener al menos 2 líneas: alfabeto y raíz.");
  }

  // Línea 1: alfabeto
  const alphabet = rawLines[0].split(",").filter(Boolean);
  if (alphabet.length === 0) throw new Error("Alfabeto vacío en la línea 1.");

  // Resto de líneas: nodos por nivel (con |)
  const specs = [];
  for (let i = 1; i < rawLines.length; i++) {
    const lineSpecs = rawLines[i].split("|").filter(Boolean);
    for (const s of lineSpecs) specs.push(s);
  }

  if (specs.length === 0) throw new Error("No hay nodo raíz.");
  const rootSpec = parseNodeSpec(specs[0]);

  if (!alphabet.includes(rootSpec.ch)) {
    throw new Error(`La raíz "${rootSpec.ch}" no está en el alfabeto.`);
  }

  const root = newNode(rootSpec);

  // Construcción por “orden de aparición” (BFS de padres con slots)
  // IMPORTANTÍSIMO: el archivo NO incluye huecos, por eso consumimos specs solo cuando hay slot.
  const parentQueue = [];
  if (root.hasLeft || root.hasRight) parentQueue.push(root);

  let idx = 1; // siguiente spec a consumir

  while (parentQueue.length > 0) {
    const parent = parentQueue.shift();

    // hijo izquierdo si existe
    if (parent.hasLeft) {
      if (idx >= specs.length) throw new Error("Faltan nodos en el archivo (hijo izquierdo).");
      const childSpec = parseNodeSpec(specs[idx++]);
      if (!alphabet.includes(childSpec.ch)) {
        throw new Error(`Nodo "${childSpec.ch}" no está en el alfabeto.`);
      }
      const left = newNode(childSpec);
      parent.left = left;
      if (left.hasLeft || left.hasRight) parentQueue.push(left);
    }

    // hijo derecho si existe
    if (parent.hasRight) {
      if (idx >= specs.length) throw new Error("Faltan nodos en el archivo (hijo derecho).");
      const childSpec = parseNodeSpec(specs[idx++]);
      if (!alphabet.includes(childSpec.ch)) {
        throw new Error(`Nodo "${childSpec.ch}" no está en el alfabeto.`);
      }
      const right = newNode(childSpec);
      parent.right = right;
      if (right.hasLeft || right.hasRight) parentQueue.push(right);
    }
  }

  // Si sobran specs, el archivo trae nodos “de más”
  if (idx < specs.length) {
    throw new Error("El archivo trae nodos extra que no pudieron asignarse (sobran bloques).");
  }

  return { root, alphabet };
}