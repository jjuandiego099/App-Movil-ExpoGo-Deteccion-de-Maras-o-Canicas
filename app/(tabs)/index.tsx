import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";

const API_URL = "https://deteccion-maras-canicas.duckdns.org/api";

const CLASES: Record<string, { emoji: string; label: string; color: string }> = {
  "black marble": { emoji: "⚫", label: "Negra",  color: "#ffd60a" },
  "blue marble":  { emoji: "🔵", label: "Azul",   color: "#2979ff" },
  "green marble": { emoji: "🟢", label: "Verde",  color: "#00c853" },
  "white marble": { emoji: "⚪", label: "Blanca", color: "#e0e0e0" },
};

export default function DetectorScreen() {
  const [imagen, setImagen]                     = useState<any>(null);
  const [resultado, setResultado]               = useState<any>(null);
  const [imagenAnotadaUri, setImagenAnotadaUri] = useState<string | null>(null);
  const [cargando, setCargando]                 = useState(false);
  const [conf, setConf]                         = useState(0.5);
  const [iou, setIou]                           = useState(0.45);

  // ── Seleccionar imagen ────────────────────────────────────────────────────
  const seleccionarImagen = async (desdeCamera: boolean) => {
    if (desdeCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara");
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a la galería");
        return;
      }
    }

    const result = desdeCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled) {
      setImagen(result.assets[0]);
      setResultado(null);
      setImagenAnotadaUri(null);
    }
  };

  // ── Detectar ──────────────────────────────────────────────────────────────
  const detectar = async () => {
    if (!imagen) return;
    setCargando(true);

    try {
      // ── 1. Detecciones JSON + guardado en PostgreSQL ─────────────────────
      const formData1 = new FormData();
      formData1.append("file", {
        uri:  imagen.uri,
        type: "image/jpeg",
        name: "foto.jpg",
      } as any);

      const res1 = await fetch(
        `${API_URL}/predict?conf=${conf}&iou=${iou}&fuente=movil`,
        { method: "POST", body: formData1 }
      );

      if (!res1.ok) {
        const err = await res1.text();
        throw new Error(`Error ${res1.status}: ${err}`);
      }

      const data = await res1.json();
      setResultado(data);

      // ── 2. Imagen anotada — fetch + guardar arraybuffer en disco ─────────
      const formData2 = new FormData();
      formData2.append("file", {
        uri:  imagen.uri,
        type: "image/jpeg",
        name: "foto.jpg",
      } as any);

      const res2 = await fetch(
        `${API_URL}/predict/image?conf=${conf}&iou=${iou}`,
        { method: "POST", body: formData2 }
      );

      if (!res2.ok) throw new Error(`Error imagen anotada: ${res2.status}`);

      // Convertir respuesta a base64 sin FileReader ni enums
      const arrayBuffer = await res2.arrayBuffer();
      const bytes       = new Uint8Array(arrayBuffer);
      let binary        = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const destUri = FileSystem.cacheDirectory + `anotada_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(destUri, base64, {
        encoding: "base64",
      });

      setImagenAnotadaUri(destUri);

    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo conectar con la API");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // ── Guardar en galería ────────────────────────────────────────────────────
  const descargarImagen = async () => {
    if (!imagenAnotadaUri) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a la galería para guardar");
      return;
    }

    try {
      const saveUri = FileSystem.cacheDirectory + `maras_${Date.now()}.png`;
      await FileSystem.copyAsync({ from: imagenAnotadaUri, to: saveUri });
      await MediaLibrary.saveToLibraryAsync(saveUri);
      Alert.alert("✅ Guardado", "La imagen se guardó en tu galería");
    } catch (e: any) {
      Alert.alert("Error", "No se pudo guardar la imagen");
      console.error(e);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const contarPorClase = (detections: any[]): Record<string, number> => {
    const conteo: Record<string, number> = {};
    for (const d of detections) {
      conteo[d.class_name] = (conteo[d.class_name] ?? 0) + 1;
    }
    return conteo;
  };

  const promedioConfianza = (detections: any[]): number => {
    if (!detections.length) return 0;
    const suma = detections.reduce((acc: number, d: any) => acc + d.confidence, 0);
    return parseFloat((suma / detections.length).toFixed(4));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const detections = resultado?.detections ?? [];
  const conteos    = contarPorClase(detections);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Detector de Maras</Text>
      <Text style={styles.subtitulo}>YOLOv8s · Canicas de Santander</Text>

      {/* ── Sliders ── */}
      <View style={styles.sliderBox}>
        <View style={styles.sliderFila}>
          <Text style={styles.sliderLabel}>Confianza</Text>
          <Text style={styles.sliderVal}>{conf.toFixed(2)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0.1} maximumValue={1.0} step={0.05}
          value={conf} onValueChange={setConf}
          minimumTrackTintColor="#6C63FF"
          maximumTrackTintColor="#1e2530"
          thumbTintColor="#6C63FF"
        />
        <View style={[styles.sliderFila, { marginTop: 12 }]}>
          <Text style={styles.sliderLabel}>IoU (NMS)</Text>
          <Text style={styles.sliderVal}>{iou.toFixed(2)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0.1} maximumValue={1.0} step={0.05}
          value={iou} onValueChange={setIou}
          minimumTrackTintColor="#00c896"
          maximumTrackTintColor="#1e2530"
          thumbTintColor="#00c896"
        />
      </View>

      {/* ── Botones selección ── */}
      <View style={styles.fila}>
        <TouchableOpacity style={styles.boton} onPress={() => seleccionarImagen(true)}>
          <Text style={styles.botonTexto}>📷 Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.boton} onPress={() => seleccionarImagen(false)}>
          <Text style={styles.botonTexto}>🖼 Galería</Text>
        </TouchableOpacity>
      </View>

      {imagen && (
        <Image source={{ uri: imagen.uri }} style={styles.imagen} />
      )}

      {imagen && !cargando && (
        <TouchableOpacity style={styles.botonDetectar} onPress={detectar}>
          <Text style={styles.botonTexto}>🔍 Detectar Maras</Text>
        </TouchableOpacity>
      )}

      {cargando && (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 20 }} />
      )}

      {/* ── Imagen anotada + botón guardar ── */}
      {imagenAnotadaUri && (
        <View style={{ alignItems: "center" }}>
          <Text style={styles.seccion}>Resultado:</Text>
          <Image source={{ uri: imagenAnotadaUri }} style={styles.imagen} />
          <TouchableOpacity style={styles.botonDescargar} onPress={descargarImagen}>
            <Text style={styles.botonTexto}>💾 Guardar imagen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Conteo por categoría ── */}
      {resultado && (
        <View style={styles.resultados}>
          <Text style={styles.seccion}>
            Total detectadas: {resultado.total_detections}
          </Text>
          <Text style={styles.info}>
            Tiempo: {resultado.inference_ms?.toFixed(1)} ms
            {"   ·   "}
            Conf. prom: {(promedioConfianza(detections) * 100).toFixed(1)}%
          </Text>
          <Text style={styles.infoGuardado}>
            ✅ Guardado en base de datos (fuente: móvil)
          </Text>

          <View style={styles.filaCategorias}>
            {Object.entries(CLASES).map(([key, { emoji, label, color }]) => (
              <View key={key} style={[styles.categoria, { borderColor: color + "55" }]}>
                <Text style={styles.categoriaEmoji}>{emoji}</Text>
                <Text style={[styles.categoriaCount, { color }]}>
                  {conteos[key] ?? 0}
                </Text>
                <Text style={styles.categoriaLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0f0f1a" },
  content:        { alignItems: "center", padding: 20, paddingTop: 64 },
  titulo:         { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  subtitulo:      { fontSize: 13, color: "#00e5ff", marginBottom: 24, letterSpacing: 1 },

  sliderBox:      { width: "100%", backgroundColor: "#111418", borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e2530" },
  sliderFila:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sliderLabel:    { color: "#94a3b8", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  sliderVal:      { color: "#fff", fontSize: 14, fontWeight: "bold", fontFamily: "monospace" },
  slider:         { width: "100%", height: 36 },

  fila:           { flexDirection: "row", gap: 12, marginBottom: 20 },
  boton:          { backgroundColor: "#6C63FF", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  botonDetectar:  { backgroundColor: "#00c896", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginTop: 12 },
  botonDescargar: { backgroundColor: "#f59e0b", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, marginTop: 10 },
  botonTexto:     { color: "#fff", fontWeight: "bold", fontSize: 16 },

  imagen:         { width: 320, height: 320, borderRadius: 12, marginTop: 12, resizeMode: "contain" },
  seccion:        { fontSize: 16, fontWeight: "bold", color: "#6C63FF", marginTop: 16, marginBottom: 8 },

  resultados:     { width: "100%", backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginTop: 16 },
  info:           { color: "#aaa", fontSize: 13, marginBottom: 4 },
  infoGuardado:   { color: "#00c896", fontSize: 12, fontFamily: "monospace", marginBottom: 12 },

  filaCategorias: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4, justifyContent: "center" },
  categoria:      { backgroundColor: "#0f0f1a", borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center", minWidth: 72 },
  categoriaEmoji: { fontSize: 22, marginBottom: 4 },
  categoriaCount: { fontSize: 28, fontWeight: "bold" },
  categoriaLabel: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
});