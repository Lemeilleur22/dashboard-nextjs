"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    Clock3,
    Filter,
    Gauge,
    LayoutDashboard,
    RotateCcw,
    TrendingUp,
    Wrench,
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";


type Registro = {
    id: string;
    anio: number | null;
    mes_num: number | null;
    mes: string | null;
    area: string | null;
    sede: string | null;
    tipo_de_falla: string | null;
    descripcion: string | null;
    tecnico_nombre: string | null;
    responsable_nombre: string | null;
    tiempo_reparacion_min:
    | number
    | string
    | null;
    tiempo_total_segundos:
    | number
    | string
    | null;
};


type Correctivo = {
    id: number | string;
    created_at: string | null;
    updated_at: string | null;
    refaccion: string | null;
    piezas: number | null;
    comentario_admin: string | null;
    estatus: string | null;
};

type OrdenTrabajo = {
    id: number | string;
    numero_ot: string;
    descripcion: string | null;
    pcon_location: string | null;
    area: string | null;
    sede: string | null;
    scheduled_finish: string | null;
    worktype: string | null;
    estatus: string | null;
    mes: number | null;
    anio: number | null;
};


type Props = {
    anio: number;
    fechaCorte: string;
    registros: Registro[];
    correctivos: Correctivo[];
    ordenes: OrdenTrabajo[];
};


const MESES: Record<number, string> = {
    1: "ENE",
    2: "FEB",
    3: "MAR",
    4: "ABR",
    5: "MAY",
    6: "JUN",
    7: "JUL",
    8: "AGO",
    9: "SEP",
    10: "OCT",
    11: "NOV",
    12: "DIC",
};


function minutosRegistro(
    fila: Registro
) {
    const directo =
        fila.tiempo_reparacion_min;

    if (
        directo !== null &&
        directo !== undefined &&
        directo !== ""
    ) {
        const valor = Number(directo);

        if (Number.isFinite(valor)) {
            return valor;
        }
    }

    const segundos =
        fila.tiempo_total_segundos;

    if (
        segundos !== null &&
        segundos !== undefined &&
        segundos !== ""
    ) {
        const valor = Number(segundos);

        if (Number.isFinite(valor)) {
            return valor / 60;
        }
    }

    return 0;
}


function diasDelMes(
    anio: number,
    mes: number
) {
    return new Date(
        anio,
        mes,
        0
    ).getDate();
}


function normalizar(
    valor: string | null
) {
    const texto =
        String(valor ?? "")
            .trim()
            .toUpperCase();

    return texto || "SIN DEFINIR";
}

function extraerNumeroCM(
    comentario: string | null
) {
    const texto = String(
        comentario ?? ""
    );
    const match = texto.match(
        /Orden\s+Correctiva\s*:\s*(A\d+)/i
    );
    return match?.[1]?.toUpperCase() ?? "Sin CM";
}

function formatearEntero(valor: number) {
    return String(valor).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
    );
}

export default function DashboardClient({
    anio,
    fechaCorte,
    registros,
    correctivos,
    ordenes,
}: Props) {

    const [seccion, setSeccion] =
        useState("resumen");

    const [mes, setMes] =
        useState("TODOS");

    const [area, setArea] =
        useState("TODOS");

    const [comedor, setComedor] =
        useState("TODOS");

    const ordenesFiltradas = useMemo(() => {
        return ordenes.filter((ot) => {
            if (
                mes !== "TODOS" &&
                Number(ot.mes) !== Number(mes)
            ) {
                return false;
            }
            return true;
        });
    }, [ordenes, mes]);

    const otsTotales = ordenesFiltradas.length;

    const otsPorArea = Object.entries(
        ordenesFiltradas.reduce<Record<string, number>>(
            (acc, ot) => {
                const nombre = normalizar(ot.area);
                acc[nombre] = (acc[nombre] ?? 0) + 1;

                return acc;
            },
            {}
        )
    )
        .map(([area, total]) => ({
            area,
            total,
        }))
        .sort((a, b) => b.total - a.total);

    const mesesDisponibles = useMemo(
        () =>
            [
                ...new Set(
                    registros
                        .map((r) =>
                            Number(r.mes_num)
                        )
                        .filter(
                            (m) =>
                                Number.isFinite(m) &&
                                m >= 1 &&
                                m <= 12
                        )
                ),
            ].sort(
                (a, b) => a - b
            ),
        [registros]
    );


    const areasDisponibles =
        useMemo(
            () =>
                [
                    ...new Set(
                        registros.map((r) =>
                            normalizar(r.area)
                        )
                    ),
                ].sort(),
            [registros]
        );


    const comedoresDisponibles =
        useMemo(
            () =>
                [
                    ...new Set(
                        registros.map((r) =>
                            normalizar(r.sede)
                        )
                    ),
                ].sort(),
            [registros]
        );


    // ==========================================
    // FILTRADO
    // ==========================================

    const filtrados = useMemo(
        () =>
            registros.filter(
                (r) => {

                    if (
                        mes !== "TODOS" &&
                        Number(r.mes_num) !==
                        Number(mes)
                    ) {
                        return false;
                    }

                    if (
                        area !== "TODOS" &&
                        normalizar(r.area) !== area
                    ) {
                        return false;
                    }

                    if (
                        comedor !== "TODOS" &&
                        normalizar(r.sede) !== comedor
                    ) {
                        return false;
                    }

                    return true;
                }
            ),
        [
            registros,
            mes,
            area,
            comedor,
        ]
    );

    const filtradosGraficas = useMemo(
        () =>
            registros.filter(
                (r) => {
                    if (
                        area !== "TODOS" &&
                        normalizar(r.area) !== area
                    ) {
                        return false;
                    }
                    if (
                        comedor !== "TODOS" &&
                        normalizar(r.sede) !== comedor
                    ) {
                        return false
                    }

                    return true
                }
            ),
        [
            registros,
            area,
            comedor,
        ]
    );


    // ==========================================
    // KPIS
    // ==========================================

    const fallas = filtrados.length;

    const tiempoTotalMin =
        filtrados.reduce(
            (total, fila) =>
                total +
                minutosRegistro(fila),
            0
        );


    const mttr =
        fallas > 0
            ? tiempoTotalMin / fallas
            : 0;


    const mesesActivos = [
        ...new Set(
            filtrados
                .map((r) =>
                    Number(r.mes_num)
                )
                .filter(
                    (m) =>
                        Number.isFinite(m)
                )
        ),
    ];


    const horasOperacion =
        mesesActivos.reduce(
            (total, mesActual) =>
                total +
                diasDelMes(
                    anio,
                    mesActual
                ) *
                24,
            0
        );


    const mtbf =
        fallas > 0
            ? (
                horasOperacion /
                fallas
            ) * 60
            : 0;


    const correctivosAbiertos = useMemo(() => {

        const fechaActual =
            new Date(`${fechaCorte}T00:00:00`);

        return correctivos
            .filter(
                (c) =>
                    normalizar(c.estatus) !==
                    "REALIZADO"
            )
            .map((c) => {
                const inicio =
                    c.created_at
                        ? new Date(
                            `${c.created_at.slice(0, 10)}T00:00:00`
                        )
                        : null;
                let dias = 0;

                if (
                    inicio &&
                    !Number.isNaN(
                        inicio.getTime()
                    )
                ) {
                    dias = Math.max(
                        0,
                        Math.floor(
                            (
                                fechaActual.getTime() -
                                inicio.getTime()
                            ) /
                            86400000
                        )
                    );
                }

                let nivel:
                    | "CRITICO"
                    | "ADVERTENCIA"
                    | "RECIENTE";

                if (dias >= 30) {
                    nivel = "CRITICO";
                } else if (dias >= 15) {
                    nivel = "ADVERTENCIA";
                } else {
                    nivel = "RECIENTE";
                }

                return {
                    ...c,

                    numero_cm:
                        extraerNumeroCM(
                            c.comentario_admin
                        ),
                    dias,
                    nivel,
                };
            })
            .sort(
                (a, b) =>
                    b.dias - a.dias
            );
    }, [correctivos, fechaCorte]);

    const correctivosCriticos =
        correctivosAbiertos.filter(
            (c) => c.nivel === "CRITICO"
        ).length;

    const correctivosAdvertencia =
        correctivosAbiertos.filter(
            (c) => c.nivel === "ADVERTENCIA"
        ).length;

    const correctivosRecientes =
        correctivosAbiertos.filter(
            (c) => c.nivel === "RECIENTE"
        ).length;


    // ==========================================
    // DATOS MENSUALES
    // ==========================================

    const mensual = mesesDisponibles
        .map(
            (numeroMes) => {

                const datosMes =
                    filtradosGraficas.filter(
                        (r) =>
                            Number(
                                r.mes_num
                            ) === numeroMes
                    );

                const fallasMes =
                    datosMes.length;

                const tiempoMes =
                    datosMes.reduce(
                        (total, fila) =>
                            total +
                            minutosRegistro(
                                fila
                            ),
                        0
                    );

                const mttrMes =
                    fallasMes > 0
                        ? tiempoMes /
                        fallasMes
                        : 0;

                const horasMes =
                    diasDelMes(
                        anio,
                        numeroMes
                    ) * 24;

                const mtbfMes =
                    fallasMes > 0
                        ? (
                            horasMes /
                            fallasMes
                        ) * 60
                        : 0;

                return {
                    numeroMes,
                    mes:
                        MESES[
                        numeroMes
                        ],
                    fallas:
                        fallasMes,
                    mttr:
                        Number(
                            mttrMes.toFixed(
                                2
                            )
                        ),
                    mtbf:
                        Number(
                            mtbfMes.toFixed(
                                2
                            )
                        ),
                };
            }
        )
        .filter(
            (m) =>
                m.fallas > 0
        );


    const mensualConTendencia =
        mensual.map(
            (fila, index) => {

                const inicio =
                    Math.max(
                        0,
                        index - 2
                    );

                const ventana =
                    mensual.slice(
                        inicio,
                        index + 1
                    );

                const mttrTrend =
                    ventana.reduce(
                        (suma, x) =>
                            suma + x.mttr,
                        0
                    ) /
                    ventana.length;

                const mtbfTrend =
                    ventana.reduce(
                        (suma, x) =>
                            suma + x.mtbf,
                        0
                    ) /
                    ventana.length;

                return {
                    ...fila,

                    mttrTendencia:
                        Number(
                            mttrTrend.toFixed(
                                2
                            )
                        ),

                    mtbfTendencia:
                        Number(
                            mtbfTrend.toFixed(
                                2
                            )
                        ),
                };
            }
        );


    // ==========================================
    // FALLAS POR AREA
    // ==========================================

    const fallasArea =
        Object.entries(
            filtrados.reduce<
                Record<string, number>
            >(
                (acc, fila) => {

                    const nombre =
                        normalizar(
                            fila.area
                        );

                    acc[nombre] =
                        (
                            acc[nombre] ??
                            0
                        ) + 1;

                    return acc;
                },
                {}
            )
        )
            .map(
                ([nombre, total]) => ({
                    nombre,
                    total,
                })
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    // ==========================================
    // FALLAS POR COMEDOR
    // ==========================================

    const fallasComedor =
        Object.entries(
            filtrados.reduce<
                Record<string, number>
            >(
                (acc, fila) => {

                    const nombre =
                        normalizar(
                            fila.sede
                        );

                    acc[nombre] =
                        (
                            acc[nombre] ??
                            0
                        ) + 1;

                    return acc;
                },
                {}
            )
        )
            .map(
                ([nombre, total]) => ({
                    nombre,
                    total,
                })
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    // ==========================================
    // TOP FALLAS
    // ==========================================

    const topFallas =
        Object.entries(
            filtrados.reduce<
                Record<string, number>
            >(
                (acc, fila) => {

                    const tipo =
                        normalizar(
                            fila.tipo_de_falla
                        );

                    acc[tipo] =
                        (
                            acc[tipo] ??
                            0
                        ) + 1;

                    return acc;
                },
                {}
            )
        )
            .map(
                ([tipo, total]) => ({
                    tipo,
                    total,
                })
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    function limpiarFiltros() {
        setMes("TODOS");
        setArea("TODOS");
        setComedor("TODOS");
    }


    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* =====================================
          HEADER
      ====================================== */}

            <header className="border-b border-slate-200 bg-white">

                <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">

                    <div>

                        <p className="text-xs font-bold tracking-[0.25em] text-red-600">
                            ACCIONA IFM
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight">
                            Dashboard de Mantenimiento
                        </h1>

                    </div>

                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                        {anio}
                    </div>

                </div>

            </header>


            <div className="mx-auto flex max-w-[1600px]">

                {/* =====================================
            SIDEBAR
        ====================================== */}

                <aside className="hidden min-h-[calc(100vh-81px)] w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">

                    <div className="mb-6 flex items-center gap-2 text-sm font-semibold">

                        <Filter size={17} />

                        Filtros

                    </div>


                    <Filtro
                        titulo="Mes"
                        valor={mes}
                        onChange={setMes}
                        opciones={
                            mesesDisponibles.map(
                                (m) => ({
                                    valor:
                                        String(m),
                                    etiqueta:
                                        MESES[m],
                                })
                            )
                        }
                    />


                    <Filtro
                        titulo="Área"
                        valor={area}
                        onChange={setArea}
                        opciones={
                            areasDisponibles.map(
                                (a) => ({
                                    valor: a,
                                    etiqueta: a,
                                })
                            )
                        }
                    />


                    <Filtro
                        titulo="Comedor / Sede"
                        valor={comedor}
                        onChange={setComedor}
                        opciones={
                            comedoresDisponibles.map(
                                (c) => ({
                                    valor: c,
                                    etiqueta: c,
                                })
                            )
                        }
                    />


                    <button
                        onClick={
                            limpiarFiltros
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
                    >

                        <RotateCcw
                            size={15}
                        />

                        Restablecer filtros

                    </button>

                </aside>


                {/* =====================================
            CONTENT
        ====================================== */}

                <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">

                    {/* NAV */}

                    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-slate-200">

                        <NavButton
                            activo={
                                seccion ===
                                "resumen"
                            }
                            onClick={() =>
                                setSeccion(
                                    "resumen"
                                )
                            }
                            icono={
                                <LayoutDashboard
                                    size={16}
                                />
                            }
                        >
                            Resumen
                        </NavButton>

                        <NavButton
                            activo={
                                seccion ===
                                "correctivos"
                            }
                            onClick={() =>
                                setSeccion(
                                    "correctivos"
                                )
                            }
                            icono={
                                <AlertTriangle
                                    size={16}
                                />
                            }
                        >
                            Correctivos
                        </NavButton>

                    </nav>


                    {/* =====================================
              RESUMEN
          ====================================== */}

                    {seccion ===
                        "resumen" && (

                            <>

                                <div className="mb-7">

                                    <h2 className="text-2xl font-bold">
                                        Resumen Ejecutivo
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Indicadores generales de mantenimiento
                                    </p>

                                </div>


                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                                    <MetricCard
                                        titulo="Fallas totales"
                                        valor={
                                            formatearEntero(fallas)
                                        }
                                        icono={
                                            <Activity />
                                        }
                                        onClick={() =>
                                            setSeccion("fallas")
                                        }
                                    />

                                    <MetricCard
                                        titulo="MTTR promedio"
                                        valor={`${mttr.toFixed(
                                            2
                                        )} min`}
                                        icono={
                                            <Clock3 />
                                        }
                                        onClick={() =>
                                            setSeccion("mttr")
                                        }
                                    />

                                    <MetricCard
                                        titulo="MTBF promedio"
                                        valor={`${mtbf.toFixed(
                                            2
                                        )} min`}
                                        icono={
                                            <Gauge />
                                        }
                                    />

                                    <MetricCard
                                        titulo="OTs totales"
                                        valor={
                                            formatearEntero(otsTotales)
                                        }
                                        icono={
                                            <Wrench />
                                        }
                                        onClick={() =>
                                            setSeccion("ots")
                                        }
                                    />

                                </div>


                                <div className="mt-7 grid gap-6 xl:grid-cols-2">

                                    <ChartCard titulo="MTTR mensual">

                                        <ResponsiveContainer
                                            width="100%"
                                            height={320}
                                        >

                                            <LineChart
                                                data={
                                                    mensualConTendencia
                                                }
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={
                                                        false
                                                    }
                                                />

                                                <XAxis
                                                    dataKey="mes"
                                                />

                                                <YAxis />

                                                <Tooltip />

                                                <Legend />

                                                <Line
                                                    type="monotone"
                                                    dataKey="mttr"
                                                    name="MTTR"
                                                    stroke="#dc2626"
                                                    strokeWidth={3}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="mttrTendencia"
                                                    name="Tendencia 3M"
                                                    stroke="#64748b"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                />

                                            </LineChart>

                                        </ResponsiveContainer>

                                    </ChartCard>


                                    <ChartCard titulo="MTBF mensual">

                                        <ResponsiveContainer
                                            width="100%"
                                            height={320}
                                        >

                                            <LineChart
                                                data={
                                                    mensualConTendencia
                                                }
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={
                                                        false
                                                    }
                                                />

                                                <XAxis
                                                    dataKey="mes"
                                                />

                                                <YAxis />

                                                <Tooltip />

                                                <Legend />

                                                <Line
                                                    type="monotone"
                                                    dataKey="mtbf"
                                                    name="MTBF"
                                                    stroke="#2563eb"
                                                    strokeWidth={3}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="mtbfTendencia"
                                                    name="Tendencia 3M"
                                                    stroke="#64748b"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                />

                                            </LineChart>

                                        </ResponsiveContainer>

                                    </ChartCard>

                                </div>

                            </>
                        )}

                    {seccion === "fallas" && (

                        <div className="space-y-6">

                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Fallas registradas
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatearEntero(filtrados.length)} fallas segun los filtros seleccionados.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSeccion("resumen")
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                                >
                                    ← Volver al resumen
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-900 text-left text-xs uppercase tracking-wide text-white">
                                            <tr>
                                                <th className="px-5 py-4">
                                                    Mes
                                                </th>

                                                <th className="px-5 py-4">
                                                    Area
                                                </th>

                                                <th className="px-5 py-4">
                                                    Sede
                                                </th>

                                                <th className="px-5 py-4">
                                                    Tipo de falla
                                                </th>

                                                <th className="px-5 py-4">
                                                    Descripcion
                                                </th>

                                                <th className="px-5 py-4">
                                                    Tiempo
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {filtrados.map(
                                                (fila) => (
                                                    <tr
                                                        key={fila.id}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <td className="whitespace-nowrap px-5 py-4">
                                                            {
                                                                MESES[
                                                                Number(
                                                                    fila.mes_num
                                                                )
                                                                ] ?? "-"
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 font-medium">
                                                            {normalizar(
                                                                fila.area
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {normalizar(
                                                                fila.sede
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {normalizar(
                                                                fila.tipo_de_falla
                                                            )}
                                                        </td>

                                                        <td className="max-w-lg px-5 py-4 text-slate-600">
                                                            {
                                                                fila.descripcion ||
                                                                "-"
                                                            }
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                                                            {minutosRegistro(
                                                                fila
                                                            ).toFixed(1)} min
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =====================================
              MTTR / MTBF
          ====================================== */}

                    {seccion ===
                        "mttr" && (

                            <div className="space-y-6">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <h2 className="text-2xl font-bold">
                                            MTTR / MTBF
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Análisis de fallas y disponibilidad
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSeccion("resumen")
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                                    >
                                        ← Volver al resumen
                                    </button>
                                </div>


                                <div className="grid gap-6 xl:grid-cols-2">

                                    <ChartCard titulo="Fallas por área">

                                        <ResponsiveContainer
                                            width="100%"
                                            height={350}
                                        >

                                            <BarChart
                                                data={
                                                    fallasArea
                                                }
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={
                                                        false
                                                    }
                                                />

                                                <XAxis
                                                    dataKey="nombre"
                                                />

                                                <YAxis />

                                                <Tooltip />

                                                <Bar
                                                    dataKey="total"
                                                    name="Fallas"
                                                    fill="#dc2626"
                                                    radius={[
                                                        6,
                                                        6,
                                                        0,
                                                        0,
                                                    ]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </ChartCard>


                                    <ChartCard titulo="Fallas por comedor">

                                        <ResponsiveContainer
                                            width="100%"
                                            height={350}
                                        >

                                            <BarChart
                                                data={
                                                    fallasComedor
                                                }
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={
                                                        false
                                                    }
                                                />

                                                <XAxis
                                                    dataKey="nombre"
                                                />

                                                <YAxis />

                                                <Tooltip />

                                                <Bar
                                                    dataKey="total"
                                                    name="Fallas"
                                                    fill="#2563eb"
                                                    radius={[
                                                        6,
                                                        6,
                                                        0,
                                                        0,
                                                    ]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </ChartCard>

                                </div>

                                <ChartCard titulo="Principales tipos de falla">

                                    <ResponsiveContainer
                                        width="100%"
                                        height={420}
                                    >
                                        <BarChart
                                            data={
                                                topFallas.slice(
                                                    0,
                                                    10
                                                )
                                            }
                                            layout="vertical"
                                            margin={{
                                                left: 35,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                            />

                                            <XAxis
                                                type="number"
                                            />

                                            <YAxis
                                                dataKey="tipo"
                                                type="category"
                                                width={170}
                                            />

                                            <Tooltip />

                                            <Bar
                                                dataKey="total"
                                                name="Fallas"
                                                fill="#14b8a6"
                                                radius={[
                                                    0,
                                                    6,
                                                    6,
                                                    0,
                                                ]}
                                            />

                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                            </div>
                        )}


                    {/* =====================================
              ORDENES
          ====================================== */}

                    {seccion === "ots" && (

                        <div className="space-y-6">

                            {/* ENCABEZADO */}

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Órdenes de trabajo
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Distribución de órdenes de Máximo por área
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSeccion("resumen")
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                                >
                                    ← Volver al resumen
                                </button>

                            </div>


                            {/* CONTENIDO */}

                            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">

                                {/* TABLA */}

                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                    <div className="border-b border-slate-100 px-6 py-5">

                                        <h3 className="font-semibold">
                                            Órdenes por área
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Total de órdenes registradas por área
                                        </p>

                                    </div>

                                    <table className="w-full">

                                        <thead className="bg-slate-900 text-left text-sm text-white">

                                            <tr>

                                                <th className="px-6 py-4">
                                                    Área
                                                </th>

                                                <th className="px-6 py-4 text-right">
                                                    Total OT
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-slate-100">

                                            {otsPorArea.map((fila) => (

                                                <tr
                                                    key={fila.area}
                                                    className="transition hover:bg-slate-50"
                                                >

                                                    <td className="px-6 py-4 font-semibold">
                                                        {fila.area}
                                                    </td>

                                                    <td className="px-6 py-4 text-right text-lg font-bold">
                                                        {formatearEntero(
                                                            fila.total
                                                        )}
                                                    </td>

                                                </tr>

                                            ))}

                                            <tr className="bg-slate-100">

                                                <td className="px-6 py-4 font-bold">
                                                    TOTAL
                                                </td>

                                                <td className="px-6 py-4 text-right text-lg font-bold">
                                                    {formatearEntero(
                                                        otsTotales
                                                    )}
                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                </div>


                                {/* GRAFICA */}

                                <ChartCard titulo="Distribución de OTs por área">

                                    <ResponsiveContainer
                                        width="100%"
                                        height={390}
                                    >

                                        <PieChart>

                                            <Pie
                                                data={otsPorArea}
                                                dataKey="total"
                                                nameKey="area"
                                                cx="50%"
                                                cy="48%"
                                                innerRadius={85}
                                                outerRadius={135}
                                                paddingAngle={2}
                                            >

                                                {otsPorArea.map(
                                                    (_, index) => (

                                                        <Cell
                                                            key={index}
                                                            fill={[
                                                                "#2563eb",
                                                                "#60a5fa",
                                                                "#ef4444",
                                                                "#f59e0b",
                                                                "#10b981",
                                                                "#8b5cf6",
                                                            ][index % 6]}
                                                        />

                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip
                                                formatter={(value) =>
                                                    formatearEntero(
                                                        Number(value)
                                                    )
                                                }
                                            />

                                            <Legend
                                                verticalAlign="bottom"
                                                height={45}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </ChartCard>

                            </div>

                        </div>

                    )}


                    {/* =====================================
              CORRECTIVOS
          ====================================== */}

                    {seccion ===
                        "correctivos" && (

                            <div className="space-y-6">

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Correctivos abiertos
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {
                                            correctivosAbiertos.length
                                        } Correctivos actualmente abiertos
                                    </p>
                                </div>

                                {/* KPIS */}

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                                    <MetricCard
                                        titulo="Abiertos"
                                        valor={formatearEntero(
                                            correctivosAbiertos.length
                                        )}
                                        icono={<Wrench />}
                                    />

                                    <MetricCard
                                        titulo="Criticos +30 dias"
                                        valor={formatearEntero(
                                            correctivosCriticos
                                        )}
                                        icono={<AlertTriangle />}
                                    />

                                    <MetricCard
                                        titulo="Advertencia 15-29"
                                        valor={formatearEntero(
                                            correctivosAdvertencia
                                        )}
                                        icono={<Clock3 />}
                                    />

                                    <MetricCard
                                        titulo="Recientes 0-14"
                                        valor={formatearEntero(
                                            correctivosRecientes
                                        )}
                                        icono={<Activity />}
                                    />
                                </div>

                                {/* TABLA */}

                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                                                <tr>

                                                    <th className="px-5 py-4">
                                                        CM
                                                    </th>

                                                    <th className="px-5 py-4">
                                                        Refacción
                                                    </th>

                                                    <th className="px-5 py-4 text-center">
                                                        Cantidad
                                                    </th>

                                                    <th className="px-5 py-4 text-center">
                                                        Días
                                                    </th>

                                                    <th className="px-5 py-4">
                                                        Estado
                                                    </th>
                                                </tr>

                                            </thead>


                                            <tbody className="divide-y divide-slate-100">

                                                {correctivosAbiertos.map(
                                                    (fila) => (

                                                        <tr
                                                            key={
                                                                fila.id
                                                            }
                                                            className="hover:bg-slate-50"
                                                        >

                                                            <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                                                {
                                                                    fila.numero_cm
                                                                }
                                                            </td>

                                                            <td className="max-w-xl px-5 py-4">
                                                                {
                                                                    fila.refaccion
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-center font-semibold">
                                                                {
                                                                    fila.piezas ??
                                                                    "-"
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-center text-lg font-bold">
                                                                {fila.dias}
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <EstadoCorrectivo
                                                                    nivel={fila.nivel}
                                                                />

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            </div>
                        )}

                </main>

            </div>

        </div>
    );
}


function MetricCard({
    titulo,
    valor,
    icono,
    onClick,
}: {
    titulo: string;
    valor: string;
    icono: React.ReactNode;
    onClick?: () => void;
}) {

    const contenido = (
        <div
            className={`
                rounded2xl border border-slate-200 bg-white p-5 shadow-sm
                transition
                ${onClick
                    ? "cursor-pointer hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
                    : ""
                }
            `}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {titulo}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                        {valor}
                    </p>
                </div>

                <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                    {icono}
                </div>
            </div>
        </div>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left"
            >
                {contenido}
            </button>
        );
    }
    return contenido;
}

function EstadoCorrectivo({
    nivel,
}: {
    nivel:
    | "CRITICO"
    | "ADVERTENCIA"
    | "RECIENTE";
}) {

    if (nivel === "CRITICO") {
        return (
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                Critico
            </span>
        );
    }

    if (nivel === "ADVERTENCIA") {
        return (
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                Advertencia
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Reciente
        </span>
    );
}


function ChartCard({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="mb-6 font-semibold">
                {titulo}
            </h3>

            {children}

        </div>
    );
}


function NavButton({
    activo,
    onClick,
    icono,
    children,
}: {
    activo: boolean;
    onClick: () => void;
    icono: React.ReactNode;
    children: React.ReactNode;
}) {

    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-2 whitespace-nowrap
        border-b-2 px-4 py-3 text-sm font-medium
        transition
        ${activo
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }
      `}
        >
            {icono}

            {children}
        </button>
    );
}


function Filtro({
    titulo,
    valor,
    onChange,
    opciones,
}: {
    titulo: string;
    valor: string;
    onChange:
    (valor: string) => void;
    opciones: {
        valor: string;
        etiqueta: string;
    }[];
}) {

    return (
        <div className="mb-5">

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {titulo}
            </label>

            <select
                value={valor}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
            >

                <option value="TODOS">
                    Todos
                </option>

                {opciones.map(
                    (opcion) => (

                        <option
                            key={
                                opcion.valor
                            }
                            value={
                                opcion.valor
                            }
                        >
                            {
                                opcion.etiqueta
                            }
                        </option>

                    )
                )}

            </select>

        </div>
    );
}