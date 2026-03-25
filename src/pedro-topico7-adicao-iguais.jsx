import { useState, useRef, useEffect, useCallback } from "react"
import mikuImg from "./hatsune-miku-png.png"

/* ================================================================
   TOPICO 7 - ADICAO COM SINAIS IGUAIS
   Reescrito do zero — todas as decisoes alinhadas ao laudo

   LAUDO — vulnerabilidades respeitadas:
   Memoria operacional frágil  → progressao começa em [1,2]
   Aritmética vulneravel       → snap exato, reta substitui calculo
   Controle inibitório baixo   → negativos: aviso + demo antes
   Flex. cognitiva frágil      → um conceito por tela
   Praxias comprometidas       → alterna arrastar + toque + escolha
   Medo de errar               → "Quase la, eu te ensino" sem puncao
   Queda com carga alta        → 2 erros = demo repete + volta menor
   Escrita comprometida        → zero escrita, tudo visual/touch

   LAUDO — pontos fortes explorados:
   Percepcao visual preservada → reta sempre visivel e colorida
   Melhor resposta com apoio   → demo guiada com fala passo a passo
   Compreensao estruturada     → blocos previsíveis, uma ideia por vez
   Memoria semantica 91        → contexto Roblox/temperatura na intro

   PROGRESSAO:
   Ensino   [1,2][2,2][3,4] pos → demo neg → [-1,-2][-2,-3][-3,-4]
   Pratica  pos e neg crescendo ate nivel prova
   Formal   [8,9][-9,-8][12,13][-15,-8]

   BUG CORRIGIDO:
   posRef.current atualiza em tempo real durante o arraste.
   soltar() usa posRef.current, nunca o state desatualizado.
   Um unico componente de arraste — sem duplicatas.
   ================================================================ */

const M = {
  teal:"#39c5bb", teal2:"#00ddc0", tealDk:"#1a7a75",
  pink:"#ff1688",
  gray:"#5a676b",
  bg:"#060d12",
  card:"#0c1a18", card2:"#071210", brd:"#1a3530",
  text:"#d0f4f0", muted:"#3a6060",
  neg:"#60a5fa", pos:"#fb923c",
  green:"#10b981", r:12,
}
const cor  = n => n<0 ? M.neg : n>0 ? M.pos : M.teal
const fmt  = n => n>0 ? `+${n}` : `${n}`
const fmtC = n => n<0 ? `(${n})` : `(+${n})`
const PHONE = "5591993922666"
const TF = "'Press Start 2P', monospace"   /* titulo */
const BF = "system-ui,-apple-system,sans-serif" /* corpo */

const CSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes popIn  { 0%{transform:scale(.3);opacity:0} 65%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes pulse  { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes blink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes bob    { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-4px)} }
  @keyframes arrive { 0%{transform:scale(1)} 30%{transform:scale(1.2)} 65%{transform:scale(.94)} 100%{transform:scale(1)} }
`

/* ── Primitivos ─────────────────────────────────────────────── */
function Tela({children}) {
  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(ellipse at 20% 10%,#0a2020 0%,${M.bg} 55%),
                  radial-gradient(ellipse at 80% 90%,#1a0a15 0%,transparent 50%)`,
      color:M.text, fontFamily:BF, padding:"14px 14px 36px",
    }}>
      <div style={{maxWidth:480,margin:"0 auto",display:"flex",
        flexDirection:"column",minHeight:"calc(100vh - 50px)"}}>
        {children}
      </div>
      <style>{CSS}</style>
    </div>
  )
}

function Card({children,glow,style={}}) {
  return (
    <div style={{
      background:M.card, borderRadius:M.r,
      border:`1.5px solid ${glow?glow+"50":M.brd}`,
      boxShadow:glow?`0 0 20px ${glow}18`:"none",
      padding:14, ...style,
    }}>{children}</div>
  )
}

function Btn({label,onClick,c=M.teal,disabled,ghost}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"14px 16px",
      background:disabled?M.brd:ghost?"transparent":c,
      color:disabled?M.muted:ghost?c:M.bg,
      border:ghost?`2px solid ${c}`:"none",
      borderRadius:M.r, fontFamily:TF, fontSize:10,
      cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?.45:1,
      boxShadow:disabled||ghost?"none":`0 0 20px ${c}40`,
      letterSpacing:.5, textTransform:"uppercase",
    }}>{label}</button>
  )
}

function Prog({n,total}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
      <div style={{flex:1,height:4,background:M.brd,borderRadius:2,overflow:"hidden"}}>
        <div style={{
          width:`${((n+1)/total)*100}%`,height:"100%",
          background:`linear-gradient(to right,${M.tealDk},${M.teal})`,
          boxShadow:`0 0 8px ${M.teal}`,borderRadius:2,transition:"width .4s",
        }}/>
      </div>
      <span style={{fontSize:10,color:M.tealDk,fontFamily:TF}}>{n+1}/{total}</span>
    </div>
  )
}

/* ================================================================
   RETA — componente de exibicao puro
   Numeros visiveis, sem sobreposicao
   ================================================================ */
function Reta({a,resultado,pos,solto,acertou,rastros=[],moveu=false,
               arrastando=false,containerRef,onIniciar}) {
  const janMin = Math.min(a,resultado,0)-2
  const janMax = Math.max(a,resultado,0)+2
  const span   = janMax-janMin
  const pct    = v => ((v-janMin)/span)*100
  const nums   = Array.from({length:janMax-janMin+1},(_,i)=>janMin+i)
  const LINHA  = "64%"
  const MIKU_OFFSET_X = 14
  const MIKU_OFFSET_Y = 6

  /* Regua sem sobreposicao */
  const mostrar = n => {
    if (n===0||n===a||n===resultado) return true
    if (span<=10) return true
    if (span<=16) return n%2===0
    return n%3===0
  }

  return (
    <div style={{background:M.card2,borderRadius:M.r,border:`1.5px solid ${M.teal}20`}}>
      {/* Header */}
      <div style={{
        borderBottom:`1px solid ${M.brd}`,background:"#ffffff04",
        padding:"5px 12px",display:"flex",justifyContent:"space-between",
        borderRadius:`${M.r}px ${M.r}px 0 0`,fontFamily:TF,fontSize:8,
      }}>
        <span style={{color:M.neg}}>NEG</span>
        <span style={{color:M.teal}}>RETA</span>
        <span style={{color:M.pos}}>POS</span>
      </div>

      {/* Palco */}
      <div ref={containerRef}
        onMouseDown={e=>onIniciar&&onIniciar(e.clientX)}
        onTouchStart={e=>onIniciar&&onIniciar(e.touches[0].clientX)}
        style={{
          position:"relative",height:106,
          cursor:onIniciar?(solto?"default":"ew-resize"):"default",
          userSelect:"none",WebkitUserSelect:"none",padding:"0 6px",
        }}>

        {/* Trilho */}
        <div style={{
          position:"absolute",left:"1%",right:"1%",top:LINHA,
          height:2,transform:"translateY(-50%)",
          background:`linear-gradient(to right,${M.brd},${M.teal}40,${M.brd})`,
        }}/>

        {/* Rastros */}
        {rastros.map((r,i)=>(
          <div key={`r${r}${i}`} style={{
            position:"absolute",left:`${pct(r)}%`,top:LINHA,
            transform:"translate(-50%,-50%)",
            width:5,height:5,borderRadius:"50%",
            background:cor(resultado),opacity:.4,zIndex:2,
          }}/>
        ))}

        {/* Linha percurso */}
        {moveu&&(
          <div style={{
            position:"absolute",
            left:`${pct(Math.min(a,pos))}%`,
            width:`${Math.abs(pct(pos)-pct(a))}%`,
            top:LINHA,height:4,transform:"translateY(-50%)",
            background:resultado>=0
              ?`linear-gradient(to right,${M.pos}40,${M.pos})`
              :`linear-gradient(to right,${M.neg},${M.neg}40)`,
            borderRadius:2,zIndex:3,
          }}/>
        )}

        {/* Zero */}
        {janMin<=0&&janMax>=0&&a!==0&&resultado!==0&&(
          <div style={{
            position:"absolute",left:`${pct(0)}%`,top:LINHA,
            transform:"translate(-50%,-50%)",
            width:22,height:22,borderRadius:"50%",
            background:M.bg,border:`2px solid ${M.teal}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,color:M.teal,zIndex:4,fontFamily:TF,
            boxShadow:`0 0 10px ${M.teal}80`,
          }}>0</div>
        )}

        {/* Ponto de partida */}
        <div style={{
          position:"absolute",left:`${pct(a)}%`,top:LINHA,
          transform:"translate(-50%,-50%)",
          width:26,height:26,borderRadius:"50%",
          border:`2px dashed ${cor(a)}70`,zIndex:2,
        }}/>

        {/* Resultado — aparece ao soltar */}
        {solto&&(
          <div style={{
            position:"absolute",left:`${pct(resultado)}%`,top:LINHA,
            transform:"translate(-50%,-50%)",
            width:34,height:34,borderRadius:"50%",
            background:cor(resultado),border:`3px solid ${M.bg}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:Math.abs(resultado)>=10?10:13,
            color:M.bg,fontFamily:TF,zIndex:5,
            boxShadow:`0 0 18px ${cor(resultado)},0 0 36px ${cor(resultado)}50`,
            animation:"arrive .6s both",
          }}>{fmt(resultado)}</div>
        )}

        {/* MIKU */}
        <div style={{
          position:"absolute",left:`${pct(pos)}%`,top:LINHA,
          transform:`translate(calc(-50% + ${MIKU_OFFSET_X}px), calc(-100% + ${MIKU_OFFSET_Y}px))`,
          zIndex:6,pointerEvents:"none",
          transition:arrastando?"none":"left .08s ease-out",
          filter:solto&&acertou
            ?`drop-shadow(0 0 10px ${M.teal}) drop-shadow(0 0 18px ${M.pink}50)`
            :`drop-shadow(0 0 5px ${M.teal}50)`,
        }}>
          <img src={mikuImg} alt="Miku" style={{
            width:44,height:"auto",display:"block",
            transform:resultado<0?"scaleX(-1)":"scaleX(1)",
            animation:arrastando&&moveu&&!solto
              ?"bob .4s ease-in-out infinite"
              :solto&&acertou?"arrive .6s both":"none",
          }}/>
        </div>
      </div>

      {/* Regua */}
      <div style={{
        display:"flex",padding:"3px 6px 5px",
        borderTop:`1px solid ${M.brd}`,background:"#00000018",
        borderRadius:`0 0 ${M.r}px ${M.r}px`,
      }}>
        {nums.map(n=>{
          const dest = n===a||n===resultado||(solto&&n===pos)
          return (
            <div key={n} style={{
              flex:1,textAlign:"center",
              fontSize:dest?12:9,
              color:n===a?cor(a):n===resultado&&solto?cor(resultado):n===0?M.teal:M.muted,
              fontFamily:TF,lineHeight:2.2,
            }}>
              {mostrar(n)?(n===0?"0":fmt(n)):""}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================================================================
   COMPONENTE DE ARRASTAR — unico, com posRef correto
   BUG FIX: posRef.current atualiza em tempo real.
   soltar() usa posRef.current, nunca o state pos (que e assincrono).
   ================================================================ */
function Arrastar({parcelas, onAcertou, onErrou}) {
  const resultado    = parcelas.reduce((s,n)=>s+n,0)
  const a            = parcelas[0]
  const b            = parcelas[1]
  const containerRef = useRef(null)
  const estaArrastando = useRef(false)
  const posRef       = useRef(a)  /* SEMPRE ATUALIZADO — evita stale closure */

  const janMin = Math.min(a,resultado,0)-2
  const janMax = Math.max(a,resultado,0)+2
  const span   = janMax-janMin

  const [pos,    setPos]    = useState(a)
  const [solto,  setSolto]  = useState(false)
  const [acertou,setAcertou]= useState(null)
  const [moveu,  setMoveu]  = useState(false)
  const [rastros,setRastros]= useState([])
  const [arrastando, setArrastando] = useState(false)

  const calcPos = useCallback(clientX => {
    if (!containerRef.current) return posRef.current
    const {left,width} = containerRef.current.getBoundingClientRect()
    return Math.max(janMin, Math.min(janMax,
      Math.round(janMin + ((clientX-left)/width)*span)))
  }, [janMin,janMax,span])

  /* SOLTAR: usa posRef.current — sem closure stale */
  const soltar = useCallback(()=>{
    if (!estaArrastando.current) return
    estaArrastando.current = false
    setArrastando(false)
    const posicaoFinal = posRef.current
    const ok = posicaoFinal === resultado
    setSolto(true)
    setAcertou(ok)
    if (ok) onAcertou?.()
    else    onErrou?.()
  }, [resultado, onAcertou, onErrou])

  useEffect(()=>{
    const mover = clientX => {
      if (!estaArrastando.current) return
      const nova = calcPos(clientX)
      posRef.current = nova    /* atualiza ref ANTES do state */
      setPos(nova)
      setRastros(p => p.includes(nova)?p:[...p,nova])
    }
    const mm = e => mover(e.clientX)
    const tm = e => { e.preventDefault(); mover(e.touches[0].clientX) }
    const mu = () => soltar()
    const tu = () => soltar()
    window.addEventListener("mousemove",mm)
    window.addEventListener("mouseup",mu)
    window.addEventListener("touchmove",tm,{passive:false})
    window.addEventListener("touchend",tu)
    return ()=>{
      window.removeEventListener("mousemove",mm)
      window.removeEventListener("mouseup",mu)
      window.removeEventListener("touchmove",tm)
      window.removeEventListener("touchend",tu)
    }
  }, [calcPos, soltar])

  const iniciar = clientX => {
    if (solto) return
    estaArrastando.current = true
    setArrastando(true)
    setMoveu(true)
    const nova = calcPos(clientX)
    posRef.current = nova
    setPos(nova)
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{
        background:M.card2,borderRadius:M.r,
        border:`1.5px solid ${M.teal}30`,padding:"12px 14px",
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      }}>
        <span style={{fontSize:20,color:cor(a),fontFamily:TF,
          textShadow:`0 0 10px ${cor(a)}50`}}>{fmtC(a)}</span>
        <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>+</span>
        <span style={{fontSize:20,color:cor(b),fontFamily:TF,
          textShadow:`0 0 10px ${cor(b)}50`}}>{fmtC(b)}</span>
        <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>=</span>
        <div style={{
          minWidth:56,padding:"5px 10px",textAlign:"center",
          borderRadius:8,border:`1.5px solid ${solto?cor(resultado)+"50":M.brd}`,
          background:solto?cor(resultado)+"18":M.brd+"40",
          color:solto?cor(resultado):M.muted,
          fontFamily:TF,fontSize:20,
          textShadow:solto?`0 0 14px ${cor(resultado)}80`:"none",
          animation:solto&&acertou?"arrive .5s both":"none",
        }}>{solto?fmtC(resultado):"?"}</div>
      </div>

      <Reta a={a} resultado={resultado} pos={pos}
        solto={solto} acertou={acertou}
        rastros={rastros} moveu={moveu}
        arrastando={arrastando}
        containerRef={containerRef} onIniciar={iniciar}/>

      {!moveu&&!solto&&(
        <div style={{textAlign:"center",fontSize:13,color:M.teal,
          fontFamily:BF,fontWeight:600,
          animation:"blink 1.2s ease-in-out infinite"}}>
          Arrasta a Miku ate o resultado
        </div>
      )}

      {solto&&(
        <Card glow={acertou?M.green:M.teal}
          style={{animation:"fadeUp .3s both",padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={mikuImg} alt="Miku" style={{
              width:34,height:"auto",flexShrink:0,
              filter:`drop-shadow(0 0 6px ${M.teal}70)`}}/>
            {acertou ? (
              <div>
                <div style={{fontSize:15,color:M.green,fontFamily:BF,fontWeight:700,marginBottom:4}}>
                  Certo!
                </div>
                <div style={{fontSize:13,color:M.muted,fontFamily:BF}}>
                  {fmtC(a)} + {fmtC(parcelas[1])} = {fmtC(resultado)}
                </div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:15,color:M.teal,fontFamily:BF,fontWeight:700,marginBottom:4}}>
                  Quase la!
                </div>
                <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.5}}>
                  Eu te ensino, Pedro. Ve onde eu cheguei na reta.
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ================================================================
   MULTIPLA ESCOLHA — alterna com arrastar
   Reduz dependencia exclusiva de visuomotricidade
   ================================================================ */
function MultiplaEscolha({parcelas, onAcertou, onErrou}) {
  const resultado = parcelas.reduce((s,n)=>s+n,0)
  const a = parcelas[0], b = parcelas[1]
  const [tocado, setTocado] = useState(null)

  /* 3 opcoes — resultado + 2 distratores plausiveis */
  const ops = useState(()=>{
    const d1 = resultado + (resultado>=0?2:-2)
    const d2 = resultado + (resultado>=0?-2:2)
    return [resultado,d1,d2].sort(()=>Math.random()-.5)
  })[0]

  const tocar = v => {
    if (tocado!==null) return
    setTocado(v)
    if (v===resultado) onAcertou?.()
    else               onErrou?.()
  }
  const acertou = tocado===resultado

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* Pergunta */}
      <div style={{
        background:M.card2,borderRadius:M.r,
        border:`1.5px solid ${M.teal}30`,padding:"12px 14px",
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      }}>
        <span style={{fontSize:20,color:cor(a),fontFamily:TF,
          textShadow:`0 0 10px ${cor(a)}50`}}>{fmtC(a)}</span>
        <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>+</span>
        <span style={{fontSize:20,color:cor(b),fontFamily:TF,
          textShadow:`0 0 10px ${cor(b)}50`}}>{fmtC(b)}</span>
        <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>=</span>
        <div style={{
          fontSize:20,fontFamily:TF,
          color:tocado!==null?(acertou?cor(resultado):M.teal):M.muted,
          background:tocado!==null?(acertou?cor(resultado)+"18":M.teal+"10"):M.brd+"40",
          borderRadius:8,padding:"5px 10px",
          border:`1.5px solid ${tocado!==null?(acertou?cor(resultado)+"50":M.teal+"30"):M.brd}`,
          minWidth:48,textAlign:"center",transition:"all .3s",
          animation:acertou?"arrive .5s both":"none",
        }}>{tocado!==null?fmtC(tocado):"?"}</div>
      </div>

      <div style={{fontSize:14,color:M.text,fontFamily:BF,textAlign:"center",fontWeight:600}}>
        Qual e o resultado?
      </div>

      <div style={{display:"flex",gap:10}}>
        {ops.map(op=>{
          const foi=tocado===op, certa=op===resultado
          return (
            <button key={op} onClick={()=>tocar(op)}
              disabled={tocado!==null}
              style={{
                flex:1,padding:"20px 8px",
                background:foi?(certa?M.green+"20":M.teal+"10"):M.card2,
                border:`2px solid ${foi?(certa?M.green:M.teal):cor(op)+"50"}`,
                borderRadius:M.r,cursor:tocado===null?"pointer":"default",
                color:cor(op),fontFamily:TF,fontSize:14,
                boxShadow:foi&&certa?`0 0 16px ${M.green}40`:"none",
                transition:"all .2s",
                animation:foi&&certa?"arrive .5s both":"none",
              }}>{fmtC(op)}</button>
          )
        })}
      </div>

      {tocado!==null&&(
        <Card glow={acertou?M.green:M.teal}
          style={{animation:"fadeUp .3s both",padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={mikuImg} alt="Miku" style={{
              width:34,height:"auto",flexShrink:0,
              filter:`drop-shadow(0 0 6px ${M.teal}70)`}}/>
            {acertou?(
              <div>
                <div style={{fontSize:15,color:M.green,fontFamily:BF,fontWeight:700,marginBottom:4}}>Certo!</div>
                <div style={{fontSize:13,color:M.muted,fontFamily:BF}}>{fmtC(a)} + {fmtC(b)} = {fmtC(resultado)}</div>
              </div>
            ):(
              <div>
                <div style={{fontSize:15,color:M.teal,fontFamily:BF,fontWeight:700,marginBottom:4}}>Quase la!</div>
                <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.5}}>
                  Eu te ensino, Pedro. O resultado e {fmtC(resultado)}.
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ================================================================
   DEMO COM FALA GUIADA
   Frases aparecem em sequencia enquanto Miku anda.
   Mediacao externa — o laudo pede explicitamente isso.
   ================================================================ */
function Demo({parcelas, onFim}) {
  const resultado = parcelas.reduce((s,n)=>s+n,0)
  const a = parcelas[0], b = parcelas[1]

  const [pos,    setPos]    = useState(a)
  const [fase,   setFase]   = useState("aguarda")
  const [rastros,setRastros]= useState([])
  const [fala,   setFala]   = useState("")
  const tmr = useRef(null)

  const iniciar = () => {
    if (fase!=="aguarda") return
    setFase("andando")

    /* Passo 1: informa ponto de partida */
    setFala(`Começa em ${fmtC(a)}.`)
    tmr.current = setTimeout(()=>{

      /* Passo 2: informa quantos passos */
      setFala(`Anda ${Math.abs(b)} ${Math.abs(b)===1?"passo":"passos"} ${b>0?"para o lado positivo.":"para o lado negativo."}`)
      tmr.current = setTimeout(()=>{

        /* Passo 3: Miku anda */
        setFala("Miku caminha...")
        const dir = Math.sign(b), n = Math.abs(b)
        let i = 0
        const andar = () => {
          if (i>=n) {
            setFala(`Chegou em ${fmtC(resultado)}.`)
            setFase("fim")
            onFim?.()
            return
          }
          i++
          const nova = a+dir*i
          setPos(nova)
          setRastros(p=>[...p, nova-dir])
          tmr.current = setTimeout(andar, 380)
        }
        andar()
      }, 1000)
    }, 1000)
  }

  useEffect(()=>()=>{if(tmr.current)clearTimeout(tmr.current)},[])

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* Conta */}
      <div style={{
        background:M.card2,borderRadius:M.r,
        border:`1.5px solid ${M.teal}30`,padding:"10px 14px",
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      }}>
        <span style={{fontSize:20,color:cor(a),fontFamily:TF,textShadow:`0 0 10px ${cor(a)}50`}}>{fmtC(a)}</span>
        <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>+</span>
        <span style={{fontSize:20,color:cor(b),fontFamily:TF,textShadow:`0 0 10px ${cor(b)}50`}}>{fmtC(b)}</span>
        <span style={{fontSize:16,color:M.teal,fontFamily:TF}}>=</span>
        <span style={{
          fontSize:22,fontFamily:TF,
          color:fase==="fim"?cor(resultado):M.muted,
          textShadow:fase==="fim"?`0 0 14px ${cor(resultado)}80`:"none",
          animation:fase==="fim"?"popIn .5s both":fase==="andando"?"blink 1s infinite":"none",
        }}>{fase==="fim"?fmtC(resultado):"?"}</span>
      </div>

      {/* Balao de fala — mediacao guiada */}
      <div style={{
        minHeight:48,background:M.card2,borderRadius:10,
        border:`1px solid ${fala?M.teal+"40":M.brd}`,
        padding:"10px 14px",
        display:"flex",alignItems:"center",gap:10,
        transition:"border-color .3s",
      }}>
        {fala?(
          <>
            <img src={mikuImg} alt="Miku" style={{
              width:28,height:"auto",flexShrink:0,
              filter:`drop-shadow(0 0 6px ${M.teal}70)`}}/>
            <span style={{fontSize:14,color:M.text,fontFamily:BF,
              fontWeight:600,animation:"fadeUp .3s both"}}>{fala}</span>
          </>
        ):(
          <span style={{fontSize:13,color:M.muted,fontFamily:BF}}>
            Toca para ver Miku demonstrar.
          </span>
        )}
      </div>

      <Reta a={a} resultado={resultado} pos={pos}
        solto={fase==="fim"} acertou={true}
        rastros={rastros} moveu={fase!=="aguarda"}/>

      <div style={{background:M.card2,borderRadius:M.r,
        border:`1px solid ${M.brd}`,padding:"10px 12px"}}>
        {fase==="aguarda"&&(
          <button onClick={iniciar} style={{
            width:"100%",padding:"10px 0",
            background:M.teal+"20",border:`1.5px solid ${M.teal}`,
            borderRadius:10,cursor:"pointer",
            color:M.teal,fontFamily:TF,fontSize:10,letterSpacing:.5,
          }}>MIKU, MOSTRA!</button>
        )}
        {fase==="andando"&&(
          <div style={{textAlign:"center",fontSize:13,color:M.muted,
            fontFamily:BF,animation:"blink 1s infinite"}}>
            Miku esta andando...
          </div>
        )}
        {fase==="fim"&&(
          <div style={{textAlign:"center",fontSize:13,color:M.teal,fontFamily:BF,fontWeight:600}}>
            {fmtC(a)} + {fmtC(b)} = {fmtC(resultado)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   SLIDE ADAPTATIVO
   Controla erros. 2 erros consecutivos = demo repete.
   ================================================================ */
function SlideAdaptativo({parcelas,tipo="arrastar",onLog,onLiberar}) {
  const [tentou,     setTentou]     = useState(false)
  const [errosConsec,setErrosConsec]= useState(0)
  const [mostraDemo, setMostraDemo] = useState(false)
  const [demoFeita,  setDemoFeita]  = useState(false)
  const key = useRef(0) /* forca remount do componente de resposta */
  const [renderKey, setRenderKey]   = useState(0)

  const liberar = () => {
    if (!tentou) { setTentou(true); onLiberar() }
  }

  const handleAcertou = () => {
    setErrosConsec(0)
    onLog({ok:true})
    liberar()
  }

  const handleErrou = () => {
    const novos = errosConsec+1
    setErrosConsec(novos)
    onLog({ok:false})
    liberar()
    if (novos>=2) {
      setMostraDemo(true)
      setDemoFeita(false)
    }
  }

  const demoTerminou = () => {
    setDemoFeita(true)
    setMostraDemo(false)
    setErrosConsec(0)
    /* remonta o componente de resposta */
    key.current++
    setRenderKey(key.current)
  }

  if (mostraDemo&&!demoFeita) return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{
        background:M.teal+"10",borderRadius:10,
        border:`1px solid ${M.teal}30`,
        padding:"10px 14px",fontSize:14,
        color:M.teal,fontFamily:BF,lineHeight:1.5,
      }}>
        Vamos ver de novo juntos, Pedro.
      </div>
      <Demo parcelas={parcelas} onFim={demoTerminou}/>
    </div>
  )

  const comp = tipo==="arrastar"
    ? <Arrastar key={renderKey} parcelas={parcelas}
        onAcertou={handleAcertou} onErrou={handleErrou}/>
    : <MultiplaEscolha key={renderKey} parcelas={parcelas}
        onAcertou={handleAcertou} onErrou={handleErrou}/>

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {demoFeita&&(
        <div style={{
          background:M.green+"10",borderRadius:10,
          border:`1px solid ${M.green}30`,
          padding:"10px 14px",fontSize:14,
          color:M.green,fontFamily:BF,
        }}>
          Agora e sua vez de novo.
        </div>
      )}
      {comp}
      {!tentou&&(
        <div style={{textAlign:"center",fontSize:12,color:M.pink,
          fontFamily:BF,animation:"blink 1s infinite",fontWeight:600}}>
          {tipo==="arrastar"?"Arrasta a Miku para continuar":"Toca para continuar"}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   APP PRINCIPAL
   ================================================================ */
export default function T7() {
  const [cena,   setCena]  = useState("intro")
  const [idx,    setIdx]   = useState(0)
  const [log,    setLog]   = useState([])
  const [bloq,   setBloq]  = useState(true)

  const ir = (c,i=0) => { setCena(c); setIdx(i); setBloq(true) }

  const prox = () => {
    setBloq(true)
    const tot={ensino:ENSINO.length,desc:DESC.length,form:FORM.length}
    const nxt={ensino:"desc",desc:"form",form:"fim"}
    if(idx+1<tot[cena]) setIdx(i=>i+1)
    else ir(nxt[cena])
  }

  const stars = () => !log.length?5:
    Math.max(1,Math.round(log.filter(l=>l.ok).length/log.length*5))

  const rel = () => {
    const oks=log.filter(l=>l.ok).length
    const pct=log.length?Math.round(oks/log.length*100):100
    const now=new Date()
    return `Relatorio Pedro\n${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}\nT7: Adicao Sinais Iguais\n${oks}/${log.length} (${pct}%) ${"estrela ".repeat(stars())}`
  }

  /* ── ENSINO ─────────────────────────────────────────────────── */
  const ENSINO = [

    /* 0 - Demo guiada - Miku fala e anda */
    {
      titulo:"Como funciona",
      render:()=>(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:14,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            Miku começa no primeiro numero, anda os passos do segundo e para no resultado.
          </div>
          <Demo parcelas={[3,4]} onFim={()=>setBloq(false)}/>
        </div>
      ),
    },

    /* 1 - Arrastar - MUITO pequeno, isola o conceito
       Laudo: memoria operacional e aritmética frágeis
       Comeca em [1,2] — um passo de cada vez */
    {
      titulo:"Sua vez — arrasta a Miku",
      render:()=>(
        <SlideAdaptativo parcelas={[1,2]} tipo="arrastar"
          onLog={e=>setLog(p=>[...p,e])}
          onLiberar={()=>setBloq(false)}/>
      ),
    },

    /* 2 - Mais um pequeno */
    {
      titulo:"Mais um",
      render:()=>(
        <SlideAdaptativo parcelas={[2,2]} tipo="arrastar"
          onLog={e=>setLog(p=>[...p,e])}
          onLiberar={()=>setBloq(false)}/>
      ),
    },

    /* 3 - Multipla escolha — muda tipo de resposta
       Laudo: nao depender exclusivamente de arrastar */
    {
      titulo:"Agora toca no resultado",
      render:()=>(
        <SlideAdaptativo parcelas={[3,4]} tipo="escolha"
          onLog={e=>setLog(p=>[...p,e])}
          onLiberar={()=>setBloq(false)}/>
      ),
    },

    /* 4 - Demo negativos — aviso + mediacao ANTES
       Laudo: inibitório baixo — confronto visual antes */
    {
      titulo:"Agora com negativos",
      render:()=>(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card glow={M.neg} style={{padding:"12px 14px"}}>
            <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.6}}>
              Dois negativos juntos ficam ainda mais negativos.
              Miku vai mais fundo. Ve:
            </div>
          </Card>
          <Demo parcelas={[-2,-3]} onFim={()=>setBloq(false)}/>
        </div>
      ),
    },

    /* 5 - Arrastar negativo pequeno */
    {
      titulo:"Arrasta a Miku",
      render:()=>(
        <SlideAdaptativo parcelas={[-1,-2]} tipo="arrastar"
          onLog={e=>setLog(p=>[...p,e])}
          onLiberar={()=>setBloq(false)}/>
      ),
    },

    /* 6 - Escolha negativo */
    {
      titulo:"Toca no resultado",
      render:()=>(
        <SlideAdaptativo parcelas={[-2,-3]} tipo="escolha"
          onLog={e=>setLog(p=>[...p,e])}
          onLiberar={()=>setBloq(false)}/>
      ),
    },

    /* 7 - Padrao tem nome — DEPOIS da experiencia
       Laudo: flex. cognitiva frágil — regra vem depois do padrao */
    {
      titulo:"O padrao tem nome",
      render:()=>(
        <Card glow={M.teal} style={{padding:"16px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <img src={mikuImg} alt="Miku" style={{
              width:48,height:"auto",flexShrink:0,
              filter:`drop-shadow(0 0 8px ${M.teal}80)`}}/>
            <div>
              <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:8}}>
                ADICAO — SINAIS IGUAIS
              </div>
              <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.6}}>
                Miku anda sempre na mesma direcao.
                O resultado tem o mesmo sinal e fica mais longe do zero.
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,
            paddingTop:12,borderTop:`1px solid ${M.brd}`}}>
            {[[[2,3],M.pos],[[-2,-3],M.neg],[[4,3],M.pos],[[-4,-3],M.neg]].map(([ps,c])=>(
              <div key={ps[0]} style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                gap:8,padding:"6px 10px",
                background:c+"0d",borderRadius:8,border:`1px solid ${c}30`,
              }}>
                <span style={{fontSize:14,color:c,fontFamily:TF}}>{fmtC(ps[0])}</span>
                <span style={{fontSize:12,color:M.teal,fontFamily:TF}}>+</span>
                <span style={{fontSize:14,color:c,fontFamily:TF}}>{fmtC(ps[1])}</span>
                <span style={{fontSize:12,color:M.teal,fontFamily:TF}}>=</span>
                <span style={{fontSize:16,color:c,fontFamily:TF,
                  textShadow:`0 0 10px ${c}80`}}>{fmtC(ps[0]+ps[1])}</span>
              </div>
            ))}
          </div>
        </Card>
      ),
    },
  ]

  /* ── DESCOBERTA — progressao gradual ────────────────────────── */
  const DESC = [
    {ps:[2,3],t:"arrastar"}, {ps:[-2,-3],t:"escolha"},
    {ps:[3,4],t:"escolha"},  {ps:[-3,-4],t:"arrastar"},
    {ps:[4,5],t:"arrastar"}, {ps:[-4,-5],t:"escolha"},
    {ps:[5,4],t:"escolha"},  {ps:[-5,-4],t:"arrastar"},
  ]

  /* ── FORMALIZACAO — nivel prova ──────────────────────────────── */
  const FORM = [
    {
      tipo:"info",titulo:"Na prova",
      itens:[
        {c:M.pos,t:"(+a) + (+b)",
         d:"Resultado positivo. Fica mais longe do zero no lado positivo.",
         ex:"(+8)+(+9)=+17     (+12)+(+13)=+25"},
        {c:M.neg,t:"(-a) + (-b)",
         d:"Resultado negativo. Fica mais longe do zero no lado negativo.",
         ex:"(-9)+(-8)=-17     (-15)+(-8)=-23"},
      ],
      obs:"Usa a reta. Onde Miku para e a resposta.",
    },
    {ps:[8,9],t:"arrastar"},   {ps:[-9,-8],t:"escolha"},
    {ps:[12,13],t:"escolha"},  {ps:[-15,-8],t:"arrastar"},
  ]

  /* ── RENDERS ─────────────────────────────────────────────────── */

  if (cena==="intro") return (
    <Tela>
      <div style={{flex:1,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:18}}>

        <div style={{textAlign:"center",fontFamily:TF,fontSize:11,
          color:M.teal,letterSpacing:2,textShadow:`0 0 12px ${M.teal}`,lineHeight:2.5}}>
          TOPICO 7
        </div>

        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{
            position:"absolute",width:150,height:150,borderRadius:"50%",
            background:`radial-gradient(circle,${M.teal}18 0%,transparent 70%)`,
            animation:"pulse 2s ease-in-out infinite",
          }}/>
          <img src={mikuImg} alt="Hatsune Miku" style={{
            width:120,height:"auto",position:"relative",zIndex:1,
            filter:`drop-shadow(0 0 14px ${M.teal}90) drop-shadow(0 0 28px ${M.pink}30)`,
          }}/>
        </div>

        <Card glow={M.teal} style={{width:"100%",padding:"14px 16px"}}>
          <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:10}}>
            MIKU FALA:
          </div>
          <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7}}>
            "Oi, Pedro! Hoje voce vai aprender a somar numeros com o mesmo sinal.
            Voce me arrasta na reta e descobre onde eu chego.
            A reta e sua calculadora!"
          </div>
        </Card>

        <Card style={{width:"100%",padding:"12px 14px"}}>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,marginBottom:10,fontWeight:600}}>
            Hoje voce vai aprender:
          </div>
          {["Somar dois numeros positivos","Somar dois numeros negativos","Resolver contas de prova"].map((t,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:10,padding:"8px 0",
              borderBottom:i<2?`1px solid ${M.brd}`:"none",
            }}>
              <span style={{fontSize:16,color:M.teal}}>►</span>
              <span style={{fontSize:14,color:M.text,fontFamily:BF}}>{t}</span>
            </div>
          ))}
        </Card>

        <div style={{width:"100%"}}>
          <Btn label="Comecar com Miku" onClick={()=>ir("ensino")}/>
        </div>
      </div>
    </Tela>
  )

  if (cena==="ensino") {
    const sl=ENSINO[idx]
    const ehInfo = sl.titulo==="O padrao tem nome"
    return (
      <Tela>
        <Prog n={idx} total={ENSINO.length}/>
        <div style={{fontSize:16,color:M.teal,fontFamily:BF,marginBottom:12,fontWeight:700}}>
          {sl.titulo}
        </div>
        <div key={`ensino-${idx}`} style={{flex:1}}>{sl.render()}</div>
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
          <Btn label={idx+1<ENSINO.length?"Proximo":"Praticar"}
            onClick={prox}
            disabled={ehInfo?false:bloq}/>
          {idx>0&&(
            <button onClick={()=>{setIdx(i=>i-1);setBloq(true)}} style={{
              background:"none",border:"none",color:M.muted,
              fontSize:13,cursor:"pointer",padding:"8px 0",
              textAlign:"center",fontFamily:BF,
            }}>Voltar</button>
          )}
        </div>
      </Tela>
    )
  }

  if (cena==="desc"||cena==="form") {
    const lista=cena==="desc"?DESC:FORM
    const item=lista[idx]
    const cFase=cena==="desc"?M.teal:M.pink

    if (item.tipo==="info") return (
      <Tela>
        <Prog n={idx} total={lista.length}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:16,color:M.teal,fontFamily:BF,fontWeight:700}}>{item.titulo}</div>
          {item.itens?.map(({c,t,d,ex})=>(
            <Card key={t} glow={c}>
              <div style={{fontFamily:TF,color:c,fontSize:11,marginBottom:8}}>{t}</div>
              <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.6,marginBottom:8}}>{d}</div>
              <div style={{fontSize:12,color:c,fontFamily:TF,lineHeight:2}}>{ex}</div>
            </Card>
          ))}
          {item.obs&&(
            <div style={{fontSize:13,color:M.muted,fontFamily:BF,
              lineHeight:1.6,borderLeft:`3px solid ${M.brd}`,paddingLeft:10}}>
              {item.obs}
            </div>
          )}
        </div>
        <div style={{marginTop:14}}>
          <Btn label="Entendi" onClick={prox}/>
        </div>
      </Tela>
    )

    return (
      <Tela>
        <Prog n={idx} total={lista.length}/>
        <div style={{flex:1}}>
          <SlideAdaptativo
            key={`${item.ps.join("")}${idx}${cena}`}
            parcelas={item.ps}
            tipo={item.t}
            onLog={e=>setLog(p=>[...p,e])}
            onLiberar={()=>setBloq(false)}/>
        </div>
        {!bloq&&(
          <div style={{marginTop:14}}>
            <Btn label={idx+1<lista.length?"Proximo":cena==="desc"?"Formalizacao":"Concluido"}
              onClick={prox} c={cFase}/>
          </div>
        )}
      </Tela>
    )
  }

  if (cena==="fim") return (
    <Tela>
      <div style={{flex:1,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:18}}>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{
            position:"absolute",width:160,height:160,borderRadius:"50%",
            background:`radial-gradient(circle,${M.teal}20 0%,transparent 70%)`,
            animation:"pulse 2s ease-in-out infinite",
          }}/>
          <img src={mikuImg} alt="Hatsune Miku" style={{
            width:130,height:"auto",position:"relative",zIndex:1,
            filter:`drop-shadow(0 0 18px ${M.teal}) drop-shadow(0 0 32px ${M.pink}40)`,
            animation:"arrive .6s both",
          }}/>
        </div>

        <Card glow={M.teal} style={{width:"100%",padding:"14px 16px"}}>
          <div style={{fontSize:11,color:M.teal,fontFamily:TF,marginBottom:10}}>MIKU FALA:</div>
          <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7}}>
            "Muito bem, Pedro! Parabens por completar o bloco.
            Voce aprendeu a somar com sinais iguais usando a reta.
            Isso cai na prova!"
          </div>
        </Card>

        <div style={{fontSize:36,letterSpacing:4}}>{"⭐".repeat(stars())}</div>

        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
          <Btn label="Avisar mamae" c="#25D366"
            onClick={()=>window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(rel())}`,"_blank")}/>
          <Btn label="Fazer de novo" c={M.gray} ghost
            onClick={()=>{setLog([]);ir("intro")}}/>
        </div>
      </div>
    </Tela>
  )

  return null
}
