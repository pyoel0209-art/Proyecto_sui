export const FUNCTIONS = [
    {
        titulo: "Ver Nombre de la Tienda",
        descripcion: "Consultar el nombre registrado de la tienda de celulares",
        nombreFuncion: "ver_nombre",
        soloLectura: "1",
        inputs: []
    },

    {
        titulo: "Registrar Nuevo Cliente",
        descripcion: "Agregar un nuevo cliente al sistema con nivel inicial Básico.",
        nombreFuncion: "agregar_cliente",
        soloLectura: "0",
        inputs: [
            { name: "nombre_cliente", type: "string", label: "Nombre del Cliente" },
            { name: "direccion_facturacion", type: "string", label: "Dirección del Cliente" },
            { name: "ano_de_registro", type: "u8", label: "Año de Registro (ej. 24)" },
            { name: "id_cliente", type: "u16", label: "ID Único de Cliente" }
        ]
    },
    {
        titulo: "Agregar Dispositivo",
        descripcion: "Registrar un nuevo dispositivo al inventario del cliente.",
        nombreFuncion: "agregar_servicio",
        soloLectura: "0",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" },
            { name: "servicio", type: "string", label: "Modelo del Dispositivo" }
        ]
    },
    {
        titulo: "Ascender a Cliente Premium",
        descripcion: "Promover cliente a nivel Premium (descuentos especiales).",
        nombreFuncion: "cambiar_nivel_a_oro",
        soloLectura: "0",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" }
        ]
    },
    {
        titulo: "Consultar Descuentos",
        descripcion: "Ver descuentos disponibles según el nivel del cliente",
        nombreFuncion: "aplicar_descuento",
        soloLectura: "1",
        inputs: [
            {name: "id_cliente", type:"u16", label: "ID del Cliente"}
        ]
    },
    {
        titulo: "Perfil del Cliente",
        descripcion: "Ver perfil completo y historial del cliente",
        nombreFuncion: "ver_estado_cliente",
        soloLectura: "1",
        inputs: [
            {name: "id_cliente", type:"u16", label: "ID del Cliente"}
        ]
    },
    {
        titulo: "Expediente Completo",
        descripcion: "Consultar toda la información del cliente",
        nombreFuncion: "retornar_todo",
        soloLectura: "1",
        inputs: [
            {name: "id_cliente", type:"u16", label: "ID del Cliente"}
        ]
    }
];