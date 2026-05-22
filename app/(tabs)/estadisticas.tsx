/**
 * app/(tabs)/estadisticas.tsx
 * Compatible con Expo Go
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const API_BASE = 'https://deteccion-maras-canicas.duckdns.org/api';
const PAGE_SIZE = 10;

const COLORS = {
  bg: '#0a0c0f',
  surface: '#111418',
  border: '#1e2530',
  accent: '#00e5ff',
  accent2: '#ff3d57',
  text: '#e8edf2',
  muted: '#64748b',
  verde: '#00c853',
  azul: '#2979ff',
  blanca: '#e0e0e0',
  negra: '#ffd60a',
};

const CLASS_CONFIG = [
  { key: 'verde', label: 'Verde', color: COLORS.verde, emoji: '🟢' },
  { key: 'azul', label: 'Azul', color: COLORS.azul, emoji: '🔵' },
  { key: 'blanca', label: 'Blanca', color: COLORS.blanca, emoji: '⚪' },
  { key: 'negra', label: 'Negra', color: COLORS.negra, emoji: '⚫' },
] as const;

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface Totales {
  verde: number;
  azul: number;
  blanca: number;
  negra: number;
}

interface Deteccion {
  id: number;
  fecha: string;
  fuente: string;
  verde: number;
  azul: number;
  blanca: number;
  negra: number;
  total: number;
}

// ─────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricVal}>{value}</Text>
      <Text style={styles.metricLbl}>{label}</Text>
    </View>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <View style={[styles.status, { borderColor: ok ? COLORS.accent : COLORS.accent2 }]}>
      <Text style={{ color: ok ? COLORS.accent : COLORS.accent2, fontWeight: '600' }}>
        {ok ? '✓ API conectada' : '✗ API desconectada'}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// PANTALLA
// ─────────────────────────────────────────────

export default function EstadisticasScreen() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [historial, setHistorial] = useState<Deteccion[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiOk, setApiOk] = useState(false);
  const [page, setPage] = useState(0);

  const SCREEN_W = Dimensions.get('window').width;
  const BAR_MAX_W = SCREEN_W - 180;

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      setApiOk(response.ok);
    } catch (error) {
      console.log('Health error:', error);
      setApiOk(false);
    }
  };

  const fetchTotales = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats/totales`);
      if (!response.ok) return;
      const data = await response.json();
      setTotales(data);
    } catch (error) {
      console.log('Totales error:', error);
    }
  };

  const fetchHistorial = async (currentPage = 0) => {
    try {
      const offset = currentPage * PAGE_SIZE;
      const response = await fetch(
        `${API_BASE}/stats/historial?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = await response.json();
      console.log('HISTORIAL:', JSON.stringify(data, null, 2));
      setHistorial(data.rows || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      console.log('Historial error:', error);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([checkHealth(), fetchTotales(), fetchHistorial(page)]);
    setLoading(false);
    setRefreshing(false);
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await loadData();
  };

  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  const goPage = async (newPage: number) => {
    setPage(newPage);
    setLoading(true);
    await fetchHistorial(newPage);
    setLoading(false);
  };

  const totalGeneral = totales
    ? totales.verde + totales.azul + totales.blanca + totales.negra
    : 0;

  const maxValue = totales
    ? Math.max(totales.verde, totales.azul, totales.blanca, totales.negra, 1)
    : 1;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ color: COLORS.text, marginTop: 10 }}>
          Cargando estadísticas...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
      }
    >
      <Text style={styles.title}>🔮 Estadísticas</Text>
      <Text style={styles.subtitle}>Sistema YOLOv8</Text>

      <StatusPill ok={apiOk} />

      {/* RESUMEN */}
      <Text style={styles.section}>Resumen</Text>
      <View style={styles.row}>
        <MetricCard value={String(totalGeneral)} label="Detectadas" />
      </View>

      {/* DISTRIBUCIÓN */}
      {totales && (
        <>
          <Text style={styles.section}>Distribución</Text>
          <View style={styles.card}>
            {CLASS_CONFIG.map((item) => {
              const value = totales[item.key];
              const width = (value / maxValue) * BAR_MAX_W;
              return (
                <View key={item.key} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {item.emoji} {item.label}
                  </Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width, backgroundColor: item.color }]} />
                  </View>
                  <Text style={{ color: item.color, width: 30, textAlign: 'right', fontWeight: '700' }}>
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* HISTORIAL */}
      <Text style={styles.section}>Historial</Text>

      <View style={styles.card}>
        {/* Cabecera */}
        <View style={[styles.hRow, styles.historialHeader]}>
          <Text style={[styles.hHeadText, styles.cId]}>N°</Text>
          <Text style={[styles.hHeadText, styles.cTotal]}>Total</Text>
          <Text style={[styles.hHeadText, styles.cColor]}>🟢</Text>
          <Text style={[styles.hHeadText, styles.cColor]}>🔵</Text>
          <Text style={[styles.hHeadText, styles.cColor]}>⚪</Text>
          <Text style={[styles.hHeadText, styles.cColor]}>⚫</Text>
        </View>

        {/* Filas */}
        {historial.map((item) => (
          <View key={item.id} style={styles.hRow}>
            <Text style={[styles.hText, styles.cId]}>#{item.id}</Text>
            <Text style={[styles.hText, styles.cTotal]}>{item.total}</Text>
            <Text style={[styles.hText, styles.cColor]}>{item.verde}</Text>
            <Text style={[styles.hText, styles.cColor]}>{item.azul}</Text>
            <Text style={[styles.hText, styles.cColor]}>{item.blanca}</Text>
            <Text style={[styles.hText, styles.cColor]}>{item.negra}</Text>
          </View>
        ))}
      </View>

      {/* PAGINACIÓN */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={page === 0}
          onPress={() => goPage(page - 1)}
          style={styles.pageBtn}
        >
          <Text style={styles.pageText}>←</Text>
        </TouchableOpacity>

        <Text style={{ color: COLORS.text }}>
          {page + 1} / {totalPages}
        </Text>

        <TouchableOpacity
          disabled={page >= totalPages - 1}
          onPress={() => goPage(page + 1)}
          style={styles.pageBtn}
        >
          <Text style={styles.pageText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },

  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 60,
  },

  subtitle: {
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 20,
  },

  section: {
    color: COLORS.muted,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  status: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },

  metricVal: {
    color: COLORS.accent,
    fontSize: 30,
    fontWeight: '800',
  },

  metricLbl: {
    color: COLORS.muted,
    marginTop: 5,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  barLabel: {
    color: COLORS.text,
    width: 80,
  },

  track: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
  },

  fill: {
    height: 10,
    borderRadius: 10,
  },

  // ── Historial tabla ──────────────────────────
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  historialHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
    marginBottom: 6,
  },

  hHeadText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  hText: {
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'center',
  },

  // Anchos fijos de columna
  cId: {
    width: 36,
    textAlign: 'left',
  },

  cTotal: {
    width: 45,
    textAlign: 'center',
  },

  cColor: {
    flex: 1,
    textAlign: 'center',
  },

  // ── Paginación ──────────────────────────────
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },

  pageBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  pageText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },
});