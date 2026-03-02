import { useState } from "react";
import BinaryTreeViz from "./components/BinaryTreeViz.jsx";
import { parseBinaryTreeFile } from "./utils/binaryTreeParser.jsx";
import { findPathForString } from "./utils/containsPath.jsx";

// 👇 DEMO para probar sin archivo
const DEMO_TEXT = `a,b,c,d,e,f,g
a,1,1
b,1,1|c,1,1
d,0,0|e,0,0|f,0,0|g,0,0`;

export default function App() {
  const [treeRoot, setTreeRoot] = useState(null);
  const [alphabet, setAlphabet] = useState([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  // ✅ ESTOS VAN AQUÍ (adentro del componente)
  const [pathNodes, setPathNodes] = useState([]);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setError("");
  setResult(null);
  setQuery("");
  setPathNodes([]);
  setStep(0);

  try {
    const text = await file.text();
    const { root, alphabet } = parseBinaryTreeFile(text);

    setTreeRoot(root);
    setAlphabet(alphabet);
    setFileName(file.name);
  } catch (err) {
    setError("Error leyendo el archivo .binary_tree");
    setTreeRoot(null);
    setAlphabet([]);
    setFileName("");
  }
};

  const testString = async () => {
    setError("");
    if (!treeRoot) {
      setError("Primero carga un archivo .binary_tree.");
      return;
    }

    const s = query.trim();
    if (!s) {
      setError("Escribe un string para probar.");
      return;
    }

    for (const ch of s) {
      if (!alphabet.includes(ch)) {
        setError(`El carácter "${ch}" no está en el alfabeto permitido: {${alphabet.join(",")}}`);
        setResult(false);
        setPathNodes([]);
        setStep(0);
        return;
      }
    }

    const path = findPathForString(treeRoot, s);
    if (!path) {
      setResult(false);
      setPathNodes([]);
      setStep(0);
      return;
    }

    setResult(true);
    setPathNodes(path);
    setStep(0);
    setIsPlaying(true);

    for (let i = 1; i <= path.length; i++) {
      setStep(i);
      await sleep(350);
    }

    setIsPlaying(false);
  };

  return (
    <div style={{ padding: 18, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 10px" }}>GUI Árbol Binario (.binary_tree) — React + Vite</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <button
          onClick={() => {
            const { root, alphabet } = parseBinaryTreeFile(DEMO_TEXT);
            setTreeRoot(root);
            setAlphabet(alphabet);
            setFileName("DEMO (sin archivo)");
            setError("");
            setResult(null);
            setQuery("");
            setPathNodes([]);
            setStep(0);
          }}
        >
          Cargar demo
        </button>

        <label
  style={{
    padding: "8px 14px",
    background: "#222",
    color: "white",
    borderRadius: 8,
    cursor: "pointer",
  }}
>
  Cargar archivo
  <input
    type="file"
    accept=".binary_tree"
    onChange={handleFileChange}
    style={{ display: "none" }}
  />
</label>

        {fileName && (
          <span style={{ color: "#333" }}>
            Archivo: <b>{fileName}</b>
          </span>
        )}
      </div>

      {alphabet.length > 0 && (
        <div style={{ marginBottom: 12, color: "#333" }}>
          Alfabeto permitido: <b>{"{" + alphabet.join(", ") + "}"}</b>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ej: "abc"'
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #bbb", minWidth: 220 }}
          disabled={!treeRoot || isPlaying}
        />

        <button onClick={testString} disabled={!treeRoot || isPlaying}>
          {isPlaying ? "Recorriendo..." : "Probar contains_string(s)"}
        </button>

        {result !== null && (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #bbb",
              background: result ? "#e9ffe9" : "#ffe9e9",
            }}
          >
            Resultado: <b>{String(result)}</b>
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 10,
            background: "#ffecec",
            overflow: "auto",
            border: "1px solid #ffbcbc",
            color: "#7a0000",
          }}
        >
          {error}
        </div>
      )}

      {treeRoot ? (
        <BinaryTreeViz
          root={treeRoot}
          width={1200}
          height={600}
          highlightIds={pathNodes.slice(0, step).map((n) => n.id)}
        />
      ) : (
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            border: "1px dashed #bbb",
            background: "#fafafa",
            color: "#666",
          }}
        >
          Carga un archivo <b>.binary_tree</b> para visualizar el árbol.
        </div>
      )}
    </div>
  );
}