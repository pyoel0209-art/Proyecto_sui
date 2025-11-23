import { useState } from "react"

function DealershipForm({ ClientCall, estado, setConcesionariaCreada }) {
    const funcion = "crear_empresa"
    const [nombre, cambiarNombre] = useState("")

    function enviar() {
        if (!nombre.trim()) {
            alert("Por favor ingresa el nombre de la concesionaria");
            return;
        }
        ClientCall({
            funcion,
            args: [nombre]
        })
    }
    
    return(
        <div className="hero-section">
            <h1 className="hero-title">Crear Nueva Concesionaria</h1>
            <p className="hero-subtitle">
                Registra tu concesionaria de motos en el sistema para comenzar a gestionar 
                clientes, inventario y ventas de forma profesional.
            </p>
            
            <div style={{maxWidth: '500px', margin: '0 auto'}}>
                <div className="form-group">
                    <label className="form-label">Nombre de la Concesionaria</label>
                    <input 
                        type="text" 
                        placeholder="Ej: MotoCenter Premium"
                        className="form-input"
                        value={nombre}
                        onChange={(e) => cambiarNombre(e.target.value)}
                    />
                </div>

                <button 
                    className="btn-primary"
                    type="button"
                    disabled={estado}
                    onClick={enviar}
                    style={{marginBottom: '1rem'}}
                >
                    {estado ? (
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                            <div className="loading-spinner"></div>
                            Creando concesionaria...
                        </div>
                    ) : (
                        "🏍️ Crear Concesionaria"
                    )}
                </button>

                <p style={{textAlign: 'center', color: '#64748b', fontSize: '0.9rem'}}>
                    ¿Ya tienes una concesionaria registrada?{' '}
                    <span 
                        style={{ color: "#dc2626", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}
                        onClick={() => setConcesionariaCreada(true)}
                    >
                        Acceder al sistema existente
                    </span>
                </p>
            </div>
        </div>
    )
}

export default DealershipForm