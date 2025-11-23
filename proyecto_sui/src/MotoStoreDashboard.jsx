import { useState } from 'react';
import { FUNCTIONS } from './functionsConfig';

export function MotoStoreDashboard({ ClientCall, estado, objectId, setObjectId, respuesta }) {

    return (
        <div>
            {/* Header del Dashboard */}
            <div className="hero-section">
                <h1 className="hero-title">Panel de Gestión</h1>
                <p className="hero-subtitle">
                    Gestiona clientes, motocicletas y consulta el historial completo de tu concesionaria.
                </p>
                
                <div style={{maxWidth: '600px', margin: '0 auto'}}>
                    <div className="form-group">
                        <label className="form-label">ID de la Concesionaria</label>
                        <input 
                            type="text" 
                            placeholder="Pega aquí el ID de la Concesionaria (0x...)"
                            className="form-input"
                            value={objectId}
                            onChange={(e) => setObjectId(e.target.value)}
                            style={{textAlign: 'center', fontFamily: 'monospace'}}
                        />
                    </div>
                </div>
            </div>

            {/* Panel de Resultados */}
            {respuesta !== null && (
                <div className="result-panel">
                    <h3 className="result-title">📊 Información del Cliente</h3>
                    <div className="result-content">
                        {typeof respuesta === 'string' ? respuesta : JSON.stringify(respuesta, null, 2)}
                    </div>
                </div>
            )}

            {/* Estado de carga */}
            {estado && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Procesando transacción...</span>
                </div>
            )}

            {/* Grid de Funciones */}
            <div className="functions-grid">
                {FUNCTIONS.map((config, index) => (
                    <MotoFunctionCard 
                        key={index}
                        config={config}
                        ClientCall={ClientCall}
                        estado={estado}
                        objectId={objectId}
                    />
                ))}
            </div>
        </div>
    );
}

function MotoFunctionCard({ config, ClientCall, estado, objectId }) {
    const [valores, setValores] = useState({});

    function enviar(e) {
        e.preventDefault();
        if (!objectId) {
            alert("Primero debes ingresar el ID de la concesionaria");
            return;
        }

        const argsOrdenados = [objectId, ...config.inputs.map(input => {
            const valorRaw = valores[input.name];
            if (['u8', 'u16', 'u32', 'u64'].includes(input.type)) {
                return { type: input.type, value: Number(valorRaw) };
            }
            return valorRaw;
        })];

        ClientCall({
            funcion: config.nombreFuncion,
            args: argsOrdenados,
            soloLectura: config.soloLectura
        });
    }

    const handleChange = (name, value) => {
        setValores(prev => ({ ...prev, [name]: value }));
    };

    // Iconos para funciones de concesionaria
    const getIcon = (funcName) => {
        const icons = {
            'ver_nombre': '🏢',
            'agregar_cliente': '👤', 
            'agregar_servicio': '🏍️',
            'cambiar_nivel_a_oro': '⭐',
            'aplicar_descuento': '💰',
            'ver_estado_cliente': '📊',
            'retornar_todo': '📋'
        };
        return icons[funcName] || '⚡';
    };

    return (
        <div className="function-card">
            <div className="card-header">
                <div className="card-icon">{getIcon(config.nombreFuncion)}</div>
                <h3 className="card-title">{config.titulo}</h3>
            </div>
            
            <p className="card-description">{config.descripcion}</p>

            <form style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {config.inputs.map((input, idx) => (
                    <div key={idx} className="form-group">
                        <label className="form-label">{input.label}</label>
                        <input 
                            type={input.type.includes('u') ? "number" : "text"}
                            placeholder={`Ingresa ${input.label.toLowerCase()}`}
                            className="form-input"
                            onChange={(e) => handleChange(input.name, e.target.value)}
                        />
                    </div>
                ))}

                <button 
                    className="btn-primary"
                    type="button"
                    disabled={estado}
                    onClick={enviar}
                >
                    {estado ? (
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                            <div className="loading-spinner"></div>
                            Procesando...
                        </div>
                    ) : (
                        `Ejecutar ${config.titulo}`
                    )}
                </button>
            </form>
        </div>
    );
}