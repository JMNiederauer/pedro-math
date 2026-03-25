import { useState } from "react"
import mikuImg from "./hatsune-miku-png.png"

const M = {
  teal:"#39c5bb", teal2:"#00ddc0", tealDk:"#1a7a75",
  pink:"#ff1688",
  gray:"#5a676b",
  bg:"#060d12",
  card:"#0c1a18", card2:"#071210", brd:"#1a3530",
  text:"#d0f4f0", muted:"#5d7f80",
  neg:"#60a5fa", pos:"#fb923c",
  green:"#10b981", warn:"#f59e0b",
  r:12,
}

const cor = n => n < 0 ? M.neg : n > 0 ? M.pos : M.teal
const fmt = n => n > 0 ? `+${n}` : `${n}`
const fmtC = n => n < 0 ? `(${n})` : `(+${n})`
const TF = "'Press Start 2P', monospace"
const BF = "system-ui,-apple-system,sans-serif"
const PHONE = "5591993922666"

const CSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes pulse  { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes popIn  { 0%{transform:scale(.92);opacity:0} 100%{transform:scale(1);opacity:1} }
`

function Tela({children}) {
  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(ellipse at 20% 10%,#0a2020 0%,${M.bg} 55%),
                  radial-gradient(ellipse at 80% 90%,#1a0a15 0%,transparent 50%)`,
      color:M.text, fontFamily:BF, padding:"14px 14px 36px",
    }}>
      <div style={{
        maxWidth:500, margin:"0 auto", display:"flex",
        flexDirection:"column", minHeight:"calc(100vh - 50px)",
      }}>
        {children}
      </div>
      <style>{CSS}</style>
    </div>
  )
}

function Card({children, style={}, glow}) {
  return (
    <div style={{
      background:M.card,
      borderRadius:M.r,
      border:`1.5px solid ${glow ? `${glow}45` : M.brd}`,
      boxShadow:glow ? `0 0 18px ${glow}18` : "none",
      padding:14,
      ...style,
    }}>
      {children}
    </div>
  )
}

function Btn({label,onClick,c=M.teal,disabled,ghost}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"14px 16px",
      background:disabled ? M.brd : ghost ? "transparent" : c,
      color:disabled ? M.muted : ghost ? c : M.bg,
      border:ghost ? `2px solid ${c}` : "none",
      borderRadius:M.r,
      fontFamily:TF, fontSize:10, letterSpacing:.5,
      textTransform:"uppercase",
      cursor:disabled ? "not-allowed" : "pointer",
      opacity:disabled ? .45 : 1,
      boxShadow:disabled || ghost ? "none" : `0 0 18px ${c}35`,
    }}>
      {label}
    </button>
  )
}

function Prog({n,total}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
      <div style={{flex:1,height:4,background:M.brd,borderRadius:2,overflow:"hidden"}}>
        <div style={{
          width:`${((n+1)/total)*100}%`,
          height:"100%",
          background:`linear-gradient(to right,${M.tealDk},${M.teal})`,
          borderRadius:2,
          transition:"width .3s",
        }}/>
      </div>
      <span style={{fontSize:10,color:M.teal,fontFamily:TF}}>{n+1}/{total}</span>
    </div>
  )
}

function Conta({a,b,resultado=null,mostrarResultado=false}) {
  return (
    <div style={{
      background:M.card2,borderRadius:M.r,
      border:`1.5px solid ${M.teal}30`,padding:"12px 14px",
      display:"flex",alignItems:"center",justifyContent:"center",gap:10,
    }}>
      <span style={{fontSize:20,color:cor(a),fontFamily:TF,textShadow:`0 0 10px ${cor(a)}40`}}>{fmtC(a)}</span>
      <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>+</span>
      <span style={{fontSize:20,color:cor(b),fontFamily:TF,textShadow:`0 0 10px ${cor(b)}40`}}>{fmtC(b)}</span>
      <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>=</span>
      <div style={{
        minWidth:58,padding:"5px 10px",textAlign:"center",
        borderRadius:8,
        border:`1.5px solid ${mostrarResultado ? `${cor(resultado)}55` : M.brd}`,
        background:mostrarResultado ? `${cor(resultado)}18` : `${M.brd}55`,
        color:mostrarResultado ? cor(resultado) : M.muted,
        fontFamily:TF,fontSize:20,
      }}>
        {mostrarResultado ? fmtC(resultado) : "?"}
      </div>
    </div>
  )
}

function Reta({
  a,
  resultado,
  pos,
  caminho=[],
  mostrarResultado=false,
  mostrarSelecao=false,
  selecionado=null,
  clicavel=false,
  onEscolher,
}) {
  const min = Math.min(a, resultado, 0) - 2
  const max = Math.max(a, resultado, 0) + 2
  const span = max - min
  const casas = span + 1
  const pct = v => (((v - min) + 0.5) / casas) * 100
  const nums = Array.from({length:casas},(_,i)=>min+i)
  const linhaTop = "62%"

  return (
    <div style={{
      background:M.card2,borderRadius:M.r,border:`1.5px solid ${M.teal}20`,
    }}>
      <div style={{
        borderBottom:`1px solid ${M.brd}`,background:"#ffffff04",
        padding:"5px 12px",display:"flex",justifyContent:"space-between",
        borderRadius:`${M.r}px ${M.r}px 0 0`,fontFamily:TF,fontSize:8,
      }}>
        <span style={{color:M.neg}}>NEG</span>
        <span style={{color:M.teal}}>RETA</span>
        <span style={{color:M.pos}}>POS</span>
      </div>

      <div style={{position:"relative",height:106,padding:"0 6px"}}>
        <div style={{
          position:"absolute",left:"1%",right:"1%",top:linhaTop,
          height:2,transform:"translateY(-50%)",
          background:`linear-gradient(to right,${M.brd},${M.teal}45,${M.brd})`,
        }}/>

        {caminho.map((v,i)=>(
          <div key={`${v}-${i}`} style={{
            position:"absolute",left:`${pct(v)}%`,top:linhaTop,
            transform:"translate(-50%,-50%)",
            width:7,height:7,borderRadius:"50%",
            background:cor(resultado),opacity:.5,zIndex:2,
          }}/>
        ))}

        {pos!==a&&(
          <div style={{
            position:"absolute",
            left:`${pct(Math.min(a,pos))}%`,
            width:`${Math.abs(pct(pos)-pct(a))}%`,
            top:linhaTop,height:4,transform:"translateY(-50%)",
            background:resultado>=0
              ?`linear-gradient(to right,${M.pos}40,${M.pos})`
              :`linear-gradient(to right,${M.neg},${M.neg}40)`,
            borderRadius:2,zIndex:3,
          }}/>
        )}

        {min<=0&&max>=0&&(
          <div style={{
            position:"absolute",left:`${pct(0)}%`,top:linhaTop,
            transform:"translate(-50%,-50%)",
            width:22,height:22,borderRadius:"50%",
            background:M.bg,border:`2px solid ${M.teal}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,color:M.teal,zIndex:4,fontFamily:TF,
          }}>0</div>
        )}

        <div style={{
          position:"absolute",left:`${pct(a)}%`,top:linhaTop,
          transform:"translate(-50%,-50%)",
          width:28,height:28,borderRadius:"50%",
          border:`2px dashed ${cor(a)}75`,zIndex:2,
        }}/>

        {mostrarSelecao&&selecionado!==null&&(
          <div style={{
            position:"absolute",left:`${pct(selecionado)}%`,top:linhaTop,
            transform:"translate(-50%,-50%)",
            width:28,height:28,borderRadius:"50%",
            background:`${M.teal}18`,border:`2px solid ${M.teal}`,
            boxShadow:`0 0 10px ${M.teal}30`,zIndex:4,
          }}/>
        )}

        {mostrarResultado&&(
          <div style={{
            position:"absolute",left:`${pct(resultado)}%`,top:linhaTop,
            transform:"translate(-50%,-50%)",
            width:34,height:34,borderRadius:"50%",
            background:cor(resultado),border:`3px solid ${M.bg}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:Math.abs(resultado)>=10?10:13,
            color:M.bg,fontFamily:TF,zIndex:5,
            boxShadow:`0 0 18px ${cor(resultado)}55`,
            animation:"popIn .35s both",
          }}>{fmt(resultado)}</div>
        )}

        <div style={{
          position:"absolute",left:`${pct(pos)}%`,top:linhaTop,
          transform:"translate(-50%,-98%)",
          zIndex:6,pointerEvents:"none",
          filter:`drop-shadow(0 0 6px ${M.teal}40)`,
        }}>
          <img src={mikuImg} alt="Miku" style={{width:42,height:"auto",display:"block"}}/>
        </div>
      </div>

      <div style={{
        display:"flex",padding:"3px 6px 5px",
        borderTop:`1px solid ${M.brd}`,background:"#00000018",
        borderRadius:`0 0 ${M.r}px ${M.r}px`,
      }}>
        {nums.map(n=>{
          const destaque = n===a || (mostrarResultado&&n===resultado) || (mostrarSelecao&&n===selecionado)
          const color = n===a
            ? cor(a)
            : mostrarResultado && n===resultado
              ? cor(resultado)
              : mostrarSelecao && n===selecionado
                ? M.teal
                : n===0
                  ? M.teal
                  : M.muted

          const content = n===0 ? "0" : fmt(n)

          if (clicavel) {
            return (
              <button key={n} onClick={()=>onEscolher?.(n)} style={{
                flex:1,textAlign:"center",padding:0,background:"transparent",border:"none",
                color, fontFamily:TF, fontSize:destaque?12:9, lineHeight:2.2,
                cursor:"pointer",
              }}>
                {content}
              </button>
            )
          }

          return (
            <div key={n} style={{
              flex:1,textAlign:"center",fontSize:destaque?12:9,
              color, fontFamily:TF, lineHeight:2.2,
            }}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function resumoPercurso(a,b) {
  return `${fmtC(a)} + ${fmtC(b)}`
}

function caminhoAte(a, destino) {
  const dir = Math.sign(destino - a)
  const passos = Math.abs(destino - a)
  return Array.from({length:passos},(_,i)=>a + dir*i)
}

function DemoGuiada({parcelas,onFim}) {
  const [a,b] = parcelas
  const resultado = a + b
  const [etapa,setEtapa] = useState(0)

  const passos = [
    {
      titulo:"Leia o ponto de partida.",
      texto:`A conta comeca em ${fmtC(a)}.`,
      pos:a,
      caminho:[],
    },
    {
      titulo:"Acompanhe o deslocamento.",
      texto:`Agora acompanhe ${Math.abs(b)} ${Math.abs(b)===1?"passo":"passos"} ${b>0?"para a direita":"para a esquerda"}.`,
      pos:resultado,
      caminho:caminhoAte(a, resultado),
    },
    {
      titulo:"Veja a chegada.",
      texto:`A chegada fica em ${fmtC(resultado)}.`,
      pos:resultado,
      caminho:caminhoAte(a, resultado),
      mostrarResultado:true,
    },
  ]

  const atual = passos[etapa]
  const ultimo = etapa === passos.length-1

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b} resultado={resultado} mostrarResultado={ultimo}/>
      <Card glow={M.teal}>
        <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
          {atual.titulo}
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
          {atual.texto}
        </div>
      </Card>
      <Reta
        a={a}
        resultado={resultado}
        pos={atual.pos}
        caminho={atual.caminho}
        mostrarResultado={Boolean(atual.mostrarResultado)}
      />
      <Btn
        label={ultimo ? "Fechar demonstracao" : "Proximo passo"}
        onClick={()=>{
          if (ultimo) onFim?.()
          else setEtapa(v=>v+1)
        }}
      />
    </div>
  )
}

function ConfirmacaoReta({parcelas,onAcertou,onErrou}) {
  const [a,b] = parcelas
  const resultado = a + b
  const [escolha,setEscolha] = useState(null)
  const opcoes = useState(()=>{
    const distrator = resultado + (resultado >= 0 ? -1 : 1)
    return [resultado, distrator].sort(()=>Math.random()-.5)
  })[0]
  const acertou = escolha === resultado

  const responder = valor => {
    if (escolha!==null) return
    setEscolha(valor)
    if (valor===resultado) onAcertou?.()
    else onErrou?.()
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b}/>
      <Card>
        <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
          Leia a reta antes de responder.
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
          Comece em {fmtC(a)} e acompanhe {Math.abs(b)} {Math.abs(b)===1?"passo":"passos"} {b>0?"para a direita":"para a esquerda"}.
        </div>
      </Card>
      <Reta
        a={a}
        resultado={resultado}
        pos={resultado}
        caminho={caminhoAte(a, resultado)}
        mostrarResultado
      />
      <div style={{fontSize:14,color:M.text,fontFamily:BF,textAlign:"center",fontWeight:700}}>
        Qual resposta combina com esse percurso?
      </div>
      <div style={{display:"flex",gap:10}}>
        {opcoes.map(op=>(
          <button key={op} onClick={()=>responder(op)} disabled={escolha!==null} style={{
            flex:1,padding:"18px 8px",
            background:escolha===op?(op===resultado?`${M.green}18`:`${M.teal}10`):M.card2,
            border:`2px solid ${escolha===op?(op===resultado?M.green:M.teal):`${cor(op)}55`}`,
            borderRadius:M.r,cursor:escolha===null?"pointer":"default",
            color:cor(op),fontFamily:TF,fontSize:14,
          }}>
            {fmtC(op)}
          </button>
        ))}
      </div>
      {escolha!==null&&(
        <Card glow={acertou?M.green:M.teal}>
          <div style={{fontSize:15,color:acertou?M.green:M.teal,fontFamily:BF,fontWeight:700,marginBottom:4}}>
            {acertou ? "Leitura correta da reta." : "Vamos revisar a reta."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.5}}>
            O percurso termina em {fmtC(resultado)}.
          </div>
        </Card>
      )}
    </div>
  )
}

function CompletarReta({parcelas,onAcertou,onErrou}) {
  const [a,b] = parcelas
  const resultado = a + b
  const [selecionado,setSelecionado] = useState(null)
  const [finalizado,setFinalizado] = useState(false)
  const [acertou,setAcertou] = useState(null)

  const escolher = valor => {
    if (finalizado) return
    setSelecionado(valor)
    setFinalizado(true)
    const ok = valor === resultado
    setAcertou(ok)
    if (ok) onAcertou?.()
    else onErrou?.()
  }

  const pos = finalizado ? (acertou ? resultado : selecionado) : a
  const caminho = finalizado ? caminhoAte(a, acertou ? resultado : selecionado) : []

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b} resultado={resultado} mostrarResultado={finalizado&&acertou}/>
      <Card>
        <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:8}}>
          Use a reta em 3 passos:
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>1. Comece em {fmtC(a)}.</div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
          2. Ande {Math.abs(b)} {Math.abs(b)===1?"passo":"passos"} {b>0?"para a direita.":"para a esquerda."}
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>3. Toque no ponto final da reta.</div>
      </Card>
      <Reta
        a={a}
        resultado={resultado}
        pos={finalizado && !acertou ? selecionado : pos}
        caminho={caminho}
        mostrarResultado={finalizado}
        mostrarSelecao={Boolean(finalizado && !acertou)}
        selecionado={selecionado}
        clicavel={!finalizado}
        onEscolher={escolher}
      />
      {!finalizado&&(
        <div style={{textAlign:"center",fontSize:13,color:M.teal,fontFamily:BF,fontWeight:700}}>
          Toque no ponto final da reta.
        </div>
      )}
      {finalizado&&(
        <Card glow={acertou?M.green:M.teal}>
          <div style={{fontSize:15,color:acertou?M.green:M.teal,fontFamily:BF,fontWeight:700,marginBottom:4}}>
            {acertou ? "Boa leitura da reta." : "Vamos revisar esse passo."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.5}}>
            {acertou
              ? `A chegada fica em ${fmtC(resultado)}.`
              : `A chegada correta fica em ${fmtC(resultado)}.`}
          </div>
        </Card>
      )}
    </div>
  )
}

function EscolhaFinal({parcelas,onAcertou,onErrou}) {
  const [a,b] = parcelas
  const resultado = a + b
  const [escolha,setEscolha] = useState(null)

  const opcoes = useState(()=>{
    const d1 = resultado + (resultado>=0?2:-2)
    const d2 = resultado + (resultado>=0?-2:2)
    return [resultado,d1,d2].sort(()=>Math.random()-.5)
  })[0]

  const responder = valor => {
    if (escolha!==null) return
    setEscolha(valor)
    if (valor===resultado) onAcertou?.()
    else onErrou?.()
  }

  const acertou = escolha===resultado

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b}/>
      <Reta
        a={a}
        resultado={resultado}
        pos={resultado}
        caminho={caminhoAte(a, resultado)}
        mostrarResultado
      />
      <Card>
        <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
          Use o percurso da reta para decidir.
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
          Primeiro veja onde a reta termina. Depois escolha a resposta.
        </div>
      </Card>
      <div style={{display:"flex",gap:10}}>
        {opcoes.map(op=>(
          <button key={op} onClick={()=>responder(op)} disabled={escolha!==null} style={{
            flex:1,padding:"18px 8px",
            background:escolha===op?(op===resultado?`${M.green}18`:`${M.teal}10`):M.card2,
            border:`2px solid ${escolha===op?(op===resultado?M.green:M.teal):`${cor(op)}55`}`,
            borderRadius:M.r,cursor:escolha===null?"pointer":"default",
            color:cor(op),fontFamily:TF,fontSize:14,
          }}>
            {fmtC(op)}
          </button>
        ))}
      </div>
      {escolha!==null&&(
        <Card glow={acertou?M.green:M.teal}>
          <div style={{fontSize:15,color:acertou?M.green:M.teal,fontFamily:BF,fontWeight:700,marginBottom:4}}>
            {acertou ? "Boa resposta." : "Vamos ajustar juntos."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.5}}>
            A reta termina em {fmtC(resultado)}.
          </div>
        </Card>
      )}
    </div>
  )
}

function SlideAdaptativo({parcelas,tipo="completar",onLog,onLiberar}) {
  const [tentou,setTentou] = useState(false)
  const [errosConsec,setErrosConsec] = useState(0)
  const [mostrarDemo,setMostrarDemo] = useState(false)
  const [reinicio,setReinicio] = useState(0)

  const liberar = () => {
    if (!tentou) {
      setTentou(true)
      onLiberar()
    }
  }

  const handleAcertou = () => {
    setErrosConsec(0)
    onLog({ok:true})
    liberar()
  }

  const handleErrou = () => {
    const novos = errosConsec + 1
    setErrosConsec(novos)
    onLog({ok:false})
    if (novos >= 2) setMostrarDemo(true)
  }

  if (mostrarDemo) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card glow={M.teal}>
          <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
            Vamos rever esse passo com calma.
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            Primeiro veja a reta. Depois tente outra vez.
          </div>
        </Card>
        <DemoGuiada parcelas={parcelas} onFim={()=>{
          setMostrarDemo(false)
          setErrosConsec(0)
          setReinicio(v=>v+1)
        }}/>
      </div>
    )
  }

  const comp = tipo==="ver"
    ? <DemoGuiada key={reinicio} parcelas={parcelas} onFim={liberar}/>
    : tipo==="confirmar"
      ? <ConfirmacaoReta key={reinicio} parcelas={parcelas} onAcertou={handleAcertou} onErrou={handleErrou}/>
      : tipo==="completar"
        ? <CompletarReta key={reinicio} parcelas={parcelas} onAcertou={handleAcertou} onErrou={handleErrou}/>
        : <EscolhaFinal key={reinicio} parcelas={parcelas} onAcertou={handleAcertou} onErrou={handleErrou}/>

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {comp}
      {!tentou&&tipo!=="ver"&&(
        <div style={{textAlign:"center",fontSize:12,color:M.pink,fontFamily:BF,fontWeight:700}}>
          {tipo==="confirmar"
            ? "Primeiro leia a reta. Depois confirme."
            : tipo==="completar"
              ? "Use a reta para escolher a chegada."
              : "Use a reta antes de responder."}
        </div>
      )}
    </div>
  )
}

export default function T7() {
  const [cena,setCena] = useState("intro")
  const [idx,setIdx] = useState(0)
  const [log,setLog] = useState([])
  const [bloq,setBloq] = useState(true)

  const ir = (c,i=0) => {
    setCena(c)
    setIdx(i)
    setBloq(true)
  }

  const desempenho = () => {
    if (!log.length) return "Treino iniciado"
    const pct = Math.round((log.filter(v=>v.ok).length / log.length) * 100)
    if (pct >= 90) return "Leitura muito consistente"
    if (pct >= 75) return "Leitura consistente"
    if (pct >= 60) return "Leitura em progresso"
    return "Treino importante"
  }

  const rel = () => {
    const oks = log.filter(l=>l.ok).length
    const pct = log.length ? Math.round(oks/log.length*100) : 100
    const now = new Date()
    return `Relatorio Pedro\n${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}\nT7: Adicao Sinais Iguais\n${oks}/${log.length} (${pct}%)\nDesempenho: ${desempenho()}`
  }

  const ENSINO = [
    {
      titulo:"Leitura da reta",
      render:()=>(
        <SlideAdaptativo parcelas={[2,3]} tipo="ver" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Confirme a chegada",
      render:()=>(
        <SlideAdaptativo parcelas={[1,2]} tipo="confirmar" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Complete a reta",
      render:()=>(
        <SlideAdaptativo parcelas={[2,2]} tipo="completar" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Escolha a resposta",
      render:()=>(
        <SlideAdaptativo parcelas={[3,4]} tipo="escolha" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Mesmo sinal negativo",
      render:()=>(
        <SlideAdaptativo parcelas={[-2,-3]} tipo="ver" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Confirme no lado negativo",
      render:()=>(
        <SlideAdaptativo parcelas={[-1,-2]} tipo="confirmar" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Complete no lado negativo",
      render:()=>(
        <SlideAdaptativo parcelas={[-2,-2]} tipo="completar" onLog={e=>setLog(p=>[...p,e])} onLiberar={()=>setBloq(false)}/>
      ),
    },
    {
      titulo:"Regra do sinal igual",
      render:()=>(
        <Card glow={M.teal}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <img src={mikuImg} alt="Miku" style={{width:44,height:"auto",flexShrink:0}}/>
            <div>
              <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:8}}>IDEIA CENTRAL</div>
              <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.6}}>
                Se os dois numeros tem o mesmo sinal, a reta continua para o mesmo lado.
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[[2,3],[-2,-3],[4,4],[-4,-4]].map(([a,b])=>(
              <div key={`${a}${b}`} style={{
                background:`${cor(a+b)}10`,
                border:`1px solid ${cor(a+b)}35`,
                borderRadius:10,padding:"8px 10px",
                textAlign:"center",fontFamily:TF,fontSize:12,color:cor(a+b),
              }}>
                {resumoPercurso(a,b)} = {fmtC(a+b)}
              </div>
            ))}
          </div>
        </Card>
      ),
    },
  ]

  const PRATICA = [
    {ps:[2,3],t:"confirmar"},
    {ps:[3,3],t:"completar"},
    {ps:[4,4],t:"escolha"},
    {ps:[-2,-3],t:"confirmar"},
    {ps:[-3,-3],t:"completar"},
    {ps:[-4,-4],t:"escolha"},
  ]

  const MODO_ESCOLA = [
    {
      tipo:"info",
      titulo:"Modo escola",
      render:()=>(
        <Card glow={M.teal}>
          <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7,marginBottom:10}}>
            Quando a conta ficar maior, a reta continua sendo seu apoio.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontFamily:TF,fontSize:12,color:M.pos}}>(+6) + (+7) = (+13)</div>
            <div style={{fontFamily:TF,fontSize:12,color:M.neg}}>(-6) + (-7) = (-13)</div>
          </div>
        </Card>
      ),
    },
    {ps:[6,7],t:"confirmar"},
    {ps:[8,9],t:"escolha"},
    {ps:[-6,-7],t:"completar"},
  ]

  const prox = () => {
    setBloq(true)
    const total = {ensino:ENSINO.length, pratica:PRATICA.length, escola:MODO_ESCOLA.length}
    const proxCena = {ensino:"pratica", pratica:"escola", escola:"fim"}
    if (idx+1 < total[cena]) setIdx(v=>v+1)
    else ir(proxCena[cena])
  }

  if (cena==="intro") {
    return (
      <Tela>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:18}}>
          <div style={{textAlign:"center",fontFamily:TF,fontSize:11,color:M.teal,letterSpacing:2}}>
            TOPICO 7
          </div>

          <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{
              position:"absolute",width:150,height:150,borderRadius:"50%",
              background:`radial-gradient(circle,${M.teal}18 0%,transparent 70%)`,
              animation:"pulse 2s ease-in-out infinite",
            }}/>
            <img src={mikuImg} alt="Miku" style={{
              width:120,height:"auto",position:"relative",zIndex:1,
              filter:`drop-shadow(0 0 14px ${M.teal}80)`,
            }}/>
          </div>

          <Card glow={M.teal}>
            <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:10}}>TREINO GUIADO</div>
            <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7}}>
              Hoje voce vai usar a reta para entender soma com sinais iguais.
              Primeiro voce observa. Depois confirma. Depois completa.
            </div>
          </Card>

          <Card>
            <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:10}}>
              Como vamos treinar:
            </div>
            {[
              "ver o percurso na reta",
              "confirmar a chegada",
              "completar a reta",
              "escolher a resposta",
            ].map((t,i)=>(
              <div key={t} style={{
                display:"flex",alignItems:"center",gap:10,padding:"8px 0",
                borderBottom:i<3?`1px solid ${M.brd}`:"none",
              }}>
                <span style={{fontSize:16,color:M.teal}}>▸</span>
                <span style={{fontSize:14,color:M.text,fontFamily:BF}}>{t}</span>
              </div>
            ))}
          </Card>

          <Btn label="Iniciar treino" onClick={()=>ir("ensino")} />
        </div>
      </Tela>
    )
  }

  if (cena==="ensino") {
    const slide = ENSINO[idx]
    const ehInfo = slide.titulo === "Regra do sinal igual"
    return (
      <Tela>
        <Prog n={idx} total={ENSINO.length}/>
        <div style={{fontSize:16,color:M.teal,fontFamily:BF,fontWeight:700,marginBottom:12}}>
          {slide.titulo}
        </div>
        <div style={{flex:1}}>{slide.render()}</div>
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
          <Btn
            label={idx+1<ENSINO.length ? "Proximo" : "Ir para pratica"}
            onClick={prox}
            disabled={ehInfo ? false : bloq}
          />
          {idx>0&&(
            <button onClick={()=>{setIdx(v=>v-1);setBloq(true)}} style={{
              background:"none",border:"none",color:M.muted,
              fontSize:13,cursor:"pointer",padding:"8px 0",fontFamily:BF,
            }}>Voltar</button>
          )}
        </div>
      </Tela>
    )
  }

  if (cena==="pratica"||cena==="escola") {
    const lista = cena==="pratica" ? PRATICA : MODO_ESCOLA
    const item = lista[idx]
    const corFase = cena==="pratica" ? M.teal : M.warn

    if (item.tipo==="info") {
      return (
        <Tela>
          <Prog n={idx} total={lista.length}/>
          <div style={{fontSize:16,color:M.teal,fontFamily:BF,fontWeight:700,marginBottom:12}}>
            {item.titulo}
          </div>
          <div style={{flex:1}}>{item.render()}</div>
          <div style={{marginTop:14}}>
            <Btn label="Continuar" onClick={prox}/>
          </div>
        </Tela>
      )
    }

    return (
      <Tela>
        <Prog n={idx} total={lista.length}/>
        <div style={{flex:1}}>
          <SlideAdaptativo
            key={`${cena}-${idx}-${item.ps.join("-")}-${item.t}`}
            parcelas={item.ps}
            tipo={item.t}
            onLog={e=>setLog(p=>[...p,e])}
            onLiberar={()=>setBloq(false)}
          />
        </div>
        {!bloq&&(
          <div style={{marginTop:14}}>
            <Btn
              label={idx+1<lista.length ? "Proximo" : cena==="pratica" ? "Modo escola" : "Encerrar"}
              onClick={prox}
              c={corFase}
            />
          </div>
        )}
      </Tela>
    )
  }

  if (cena==="fim") {
    return (
      <Tela>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:18}}>
          <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{
              position:"absolute",width:160,height:160,borderRadius:"50%",
              background:`radial-gradient(circle,${M.teal}20 0%,transparent 70%)`,
              animation:"pulse 2s ease-in-out infinite",
            }}/>
            <img src={mikuImg} alt="Miku" style={{
              width:130,height:"auto",position:"relative",zIndex:1,
              filter:`drop-shadow(0 0 18px ${M.teal})`,
            }}/>
          </div>

          <Card glow={M.teal}>
            <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:10}}>FECHAMENTO</div>
            <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7}}>
              Bom trabalho. Voce treinou a leitura da reta para somar numeros com o mesmo sinal.
            </div>
          </Card>

          <Card>
            <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:8}}>DESEMPENHO</div>
            <div style={{fontSize:16,color:M.text,fontFamily:BF,fontWeight:700}}>
              {desempenho()}
            </div>
          </Card>

          <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
            <Btn
              label="Compartilhar resultado"
              c="#25D366"
              onClick={()=>window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(rel())}`,"_blank")}
            />
            <Btn label="Treinar de novo" c={M.gray} ghost onClick={()=>{setLog([]);ir("intro")}} />
          </div>
        </div>
      </Tela>
    )
  }

  return null
}
