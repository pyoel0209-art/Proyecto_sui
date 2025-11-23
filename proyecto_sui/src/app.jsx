import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { useNetworkVariable } from "./networkConfig";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from 'react';

import './App.css'
import StoreForm from "./StoreForm";
import { PhoneStoreDashboard } from "./PhoneStoreDashboard";

function App() {
  const suiClient = useSuiClient()
  const cuenta = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const [estado, cambiarEstado] = useState(false);
  const [respuesta, cambiarRespuesta] = useState(null);
  const [tiendaCreada, setTiendaCreada] = useState(false)
  const [objectId, setObjectId] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });
  const packageId = useNetworkVariable("PackageId");
  const modulo = "empresa"

  async function ClientCall(params) {
    cambiarEstado(true);

    try {
      cambiarRespuesta(null);

      const tx = new Transaction();

      const args = params.args.map((arg, idx) => {
        if (typeof arg === "string" && isValidSuiObjectId(arg)) {
          return tx.object(arg);
        }

        if (arg && typeof arg === "object" && "type" in arg) {
          const { type, value } = arg;
          switch (type) {
            case "u8": return tx.pure.u8(Number(value));
            case "u16": return tx.pure.u16(Number(value));
            case "u32": return tx.pure.u32(Number(value));
            case "u64": return tx.pure.u64(BigInt(value));
            case "u128": return tx.pure.u128(BigInt(value));
            case "bool": return tx.pure.bool(Boolean(value));
            case "string": return tx.pure.string(String(value));
            case "address": return tx.pure.address(value);
            default: return tx.pure(value);
          }
        }

        if (typeof arg === "boolean") return tx.pure.bool(arg);
        if (typeof arg === "number") return tx.pure.u64(BigInt(arg));
        if (typeof arg === "bigint") return tx.pure.u64(arg);
        if (typeof arg === "string") return tx.pure.string(arg);

        return tx.pure(arg);
      });

      tx.moveCall({
        target: `${packageId}::${modulo}::${params.funcion}`,
        arguments: args,
      });

      const esLectura =
        params?.soloLectura === 1 ||
        params?.soloLectura === "1" ||
        params?.soloLectura === true ||
        params?.soloLectura === "true";

      if (esLectura) {
        const result = await suiClient.devInspectTransactionBlock({
          sender: cuenta.address,
          transactionBlock: tx,
        });

        const decoded = decodeReturnValues(result);
        if (params.funcion === "retornar_todo"){
          cambiarRespuesta(`📱 Cliente: ${decoded[4]}\n📅 Año de registro: ${decoded[0]}\n⭐ Nivel del cliente: ${decoded[3]['raw'][1]}% de descuento\n🏠 Dirección: ${decoded[1]}`)
        }
        return decoded;
      }

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (txres) => {
            const result = await suiClient.waitForTransaction({
              digest: txres.digest,
              options: { showEffects: true, showEvents: true },
            });

            const decoded = decodeReturnValues(result);
            if (decoded !== null) cambiarRespuesta(decoded);

            if (params.funcion === "crear_empresa") {
              const id = result.effects?.created?.[0]?.reference?.objectId;
              if (id) {
                setObjectId(id);
                window.location.hash = id;
                setTiendaCreada(true);
              }
            }
          },
          onError: (err) => {
            alert("Error al procesar: " + err.message);
          },
        }
      );
    } catch (error) {
      alert("Error en el sistema: " + error.message);
      console.error(error);
    } finally {
      cambiarEstado(false);
    }
  }

  // Funciones de decodificación (mantener igual)
  function decodeReturnValues(result) {
    try {
      const values = result.results?.[0]?.returnValues || result.effects?.returnValues;
      if (!values || values.length === 0) return null;
      const decoded = values.map(([bytes, typeTag]) => decodeByType(bytes, typeTag));
      return decoded.length === 1 ? decoded[0] : decoded;
    } catch (err) {
      console.warn("decodeReturnValues ERROR:", err);
      return null;
    }
  }

  function decodeByType(bytes, typeTag) {
    const arr = Uint8Array.from(bytes);
    if (!typeTag) return null;
    if (typeTag === "u8") return arr[0];
    if (typeTag === "u16") return new DataView(arr.buffer).getUint16(0, true);
    if (typeTag === "u32") return new DataView(arr.buffer).getUint32(0, true);
    if (typeTag === "u64") {
      const reversed = Array.from(arr).reverse();
      const hex = reversed.map(b => b.toString(16).padStart(2, "0")).join("");
      return BigInt("0x" + hex);
    }
    if (typeTag === "bool") return arr[0] === 1;
    if (typeTag === "0x1::string::String") return decodeBCSString(bytes);
    if (typeTag.startsWith("vector<0x1::string::String>")) return decodeBCSVectorString(bytes);
    if (typeTag.includes("Nivel")) return decodeNivel(bytes);
    return "<?> Tipo no soportado: " + typeTag;
  }

  function decodeBCSString(bytes) {
    const arr = Uint8Array.from(bytes);
    let length = 0, shift = 0, offset = 0;
    while (offset < arr.length) {
      const byte = arr[offset++];
      length |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    const content = arr.slice(offset, offset + length);
    return new TextDecoder().decode(content);
  }

  function decodeBCSVectorString(bytes) {
    const arr = Uint8Array.from(bytes);
    let offset = 0, vecLen = 0, shift = 0;
    while (true) {
      const byte = arr[offset++];
      vecLen |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    const items = [];
    for (let i = 0; i < vecLen; i++) {
      let len = 0; shift = 0;
      while (true) {
        const byte = arr[offset++];
        len |= (byte & 0x7F) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
      }
      const content = arr.slice(offset, offset + len);
      offset += len;
      items.push(new TextDecoder().decode(content));
    }
    return items;
  }

  function decodeNivel(bytes) {
    return { raw: bytes };
  }
  
  return (
    <div className="app-container">
      <header className="phonestore-header">
        <div className="brand">
          <div className="brand-logo">📱</div>
          <div className="brand-text">
            <h1>PhoneStore Pro</h1>
            <div className="subtitle">Sistema de Gestión de Tienda</div>
          </div>
        </div>
        <ConnectButton />
      </header>

      <main className="main-content">
        {!cuenta ? (
          <div className="hero-section">
            <h1 className="hero-title">PhoneStore Pro</h1>
            <p className="hero-subtitle">
              Sistema completo de gestión para tu tienda de celulares. 
              Controla inventario, clientes y ventas de forma eficiente.
            </p>
            <div style={{marginTop: '2rem'}}>
              <ConnectButton />
            </div>
          </div>
        ) : tiendaCreada ? (
          <PhoneStoreDashboard 
            ClientCall={ClientCall}
            estado={estado}
            objectId={objectId}
            setObjectId={setObjectId}
            respuesta={respuesta}
          />
        ) : (
          <StoreForm 
            ClientCall={ClientCall}
            estado={estado}
            setTiendaCreada={setTiendaCreada}
          />
        )}
      </main>
    </div>
  )
}

export default App
