import {
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Deteccion de Maras</Text>
      <Text style={styles.subtitulo}>Sistema de Vision por Computador · YOLOv8s</Text>
      <Text style={styles.autores}>
        Juan Diego Chaparro Garcia · Juan Jose Vargas · Santiago Amado
      </Text>

      <View style={styles.divider} />

      <Text style={styles.seccion}>Que son las maras?</Text>
      <Text style={styles.texto}>
        En la region de Santander (Colombia), las maras son las canicas, pequenas
        esferas de vidrio de colores. Este proyecto aplica Inteligencia Artificial
        para detectar y clasificar automaticamente 4 tipos segun su color usando YOLOv8s.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.seccion}>Clases detectadas</Text>

      <View style={styles.claseCard}>
        <Text style={styles.claseEmoji}>🟢</Text>
        <View>
          <Text style={[styles.claseNombre, { color: '#00c853' }]}>Mara Verde</Text>
          <Text style={styles.claseSub}>green marble · 124 muestras</Text>
        </View>
      </View>

      <View style={styles.claseCard}>
        <Text style={styles.claseEmoji}>🔵</Text>
        <View>
          <Text style={[styles.claseNombre, { color: '#2979ff' }]}>Mara Azul</Text>
          <Text style={styles.claseSub}>blue marble · 147 muestras</Text>
        </View>
      </View>

      <View style={styles.claseCard}>
        <Text style={styles.claseEmoji}>⚪</Text>
        <View>
          <Text style={[styles.claseNombre, { color: '#e0e0e0' }]}>Mara Blanca</Text>
          <Text style={styles.claseSub}>white marble · 144 muestras</Text>
        </View>
      </View>

      <View style={styles.claseCard}>
        <Text style={styles.claseEmoji}>⚫</Text>
        <View>
          <Text style={[styles.claseNombre, { color: '#ffd60a' }]}>Mara Negra</Text>
          <Text style={styles.claseSub}>black marble · 116 muestras</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.seccion}>Umbral de Confianza</Text>
      <Text style={styles.texto}>
        Es el porcentaje minimo de certeza que debe tener el modelo para reportar
        una deteccion. Un valor alto reduce falsos positivos pero puede perder
        detecciones reales.
      </Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoFila}>
          <Text style={styles.infoLabel}>Valor alto (0.7 – 0.9):  </Text>
          <Text style={styles.infoVal}>Menos detecciones, mas precisas</Text>
        </Text>
        <Text style={styles.infoFila}>
          <Text style={styles.infoLabel}>Valor bajo (0.2 – 0.4):  </Text>
          <Text style={styles.infoVal}>Mas detecciones, posibles falsos positivos</Text>
        </Text>
        <Text style={styles.infoRecomendado}>Recomendado: 0.50 – 0.65</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.seccion}>Umbral IoU (NMS)</Text>
      <Text style={styles.texto}>
        Controla el Non-Maximum Suppression, que elimina cajas duplicadas sobre
        el mismo objeto. Cuanto mas se solapan dos cajas, el IoU decide cual conservar.
      </Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoFila}>
          <Text style={styles.infoLabel}>Valor alto (0.6 – 0.9):  </Text>
          <Text style={styles.infoVal}>Permite mas cajas superpuestas</Text>
        </Text>
        <Text style={styles.infoFila}>
          <Text style={styles.infoLabel}>Valor bajo (0.2 – 0.4):  </Text>
          <Text style={styles.infoVal}>Elimina mas duplicados</Text>
        </Text>
        <Text style={styles.infoRecomendado}>Recomendado: 0.40 – 0.50</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { padding: 24, paddingTop: 64 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitulo: { fontSize: 13, color: '#00e5ff', textAlign: 'center', marginTop: 6, letterSpacing: 1 },
  autores: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 8 },
  divider: { height: 1, backgroundColor: '#1e2530', marginVertical: 24 },
  seccion: { fontSize: 15, fontWeight: 'bold', color: '#00e5ff', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  texto: { fontSize: 14, color: '#94a3b8', lineHeight: 22, marginBottom: 12 },
  claseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111418', borderRadius: 10, padding: 14, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: '#1e2530' },
  claseEmoji: { fontSize: 28 },
  claseNombre: { fontSize: 16, fontWeight: 'bold' },
  claseSub: { fontSize: 12, color: '#64748b', fontFamily: 'monospace', marginTop: 2 },
  infoCard: { backgroundColor: '#111418', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#1e2530', gap: 8 },
  infoFila: { fontSize: 13, color: '#94a3b8', lineHeight: 20 },
  infoLabel: { color: '#00e5ff', fontWeight: 'bold' },
  infoVal: { color: '#94a3b8' },
  infoRecomendado: { fontSize: 12, color: '#ffd60a', marginTop: 4, fontStyle: 'italic' },
});