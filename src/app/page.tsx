import { supabase } from "@/lib/supabase";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

async function cargarTodasLasOrdenes(anio: number) {
  const TAMANO_PAGINA = 1000;

  let desde = 0;
  let todasLasOrdenes: any[] = [];

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from("maximo_ots")
      .select(`
        id,
        numero_ot,
        descripcion,
        pcon_location,
        area,
        sede,
        scheduled_finish,
        worktype,
        estatus,
        mes,
        anio
      `)
      .eq("anio", anio)
      .range(
        desde,
        desde + TAMANO_PAGINA - 1
      );

    if (error) {
      return {
        data: null,
        error,
      };
    }

    const pagina = data ?? [];

    todasLasOrdenes = [
      ...todasLasOrdenes,
      ...pagina,
    ];

    if (
      pagina.length <
      TAMANO_PAGINA
    ) {
      break;
    }

    desde += TAMANO_PAGINA;
  }

  return {
    data: todasLasOrdenes,
    error: null,
  };
}

export default async function Home() {
  const anio = new Date().getFullYear();

  const fechaCorte = new Date()
    .toISOString()
    .slice(0, 10);

  const [
    { data: registros, error: errorMttr },
    { data: correctivos, error: errorCorrectivos },
    { data: ordenes, error: errorOrdenes },
  ] = await Promise.all([
    supabase
      .from("registros_mttr_mtbf")
      .select(`
        id,
        anio,
        mes_num,
        mes,
        area,
        sede,
        tipo_de_falla,
        descripcion,
        tecnico_nombre,
        responsable_nombre,
        tiempo_reparacion_min,
        tiempo_total_segundos
      `)
      .eq("anio", anio)
      .range(0, 4999),

    supabase
      .from("solicitudes_refacciones")
      .select(`
          id,
          created_at,
          updated_at,
          refaccion,
          piezas,
          comentario_admin,
          estatus
      `)
      .eq("estatus", "SOLICITADA")
      .order("created_at", {
        ascending: true,
      })
      .range(0, 4999),

    cargarTodasLasOrdenes(anio),
  ]);

  if (errorOrdenes) {
    throw new Error(
      `Error cargando OTs de Maximo: ${errorOrdenes.message}`
    );
  }

  if (errorMttr) {
    throw new Error(
      `Error cargando MTTR/MTBF: ${errorMttr.message}`
    );
  }

  if (errorCorrectivos) {
    throw new Error(
      `Error cargando correctivos: ${errorCorrectivos.message}`
    );
  }

  return (
    <DashboardClient
      anio={anio}
      fechaCorte={fechaCorte}
      registros={registros ?? []}
      correctivos={correctivos ?? []}
      ordenes={ordenes ?? []}
    />
  );
}