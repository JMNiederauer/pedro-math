import { useMemo, useState } from "react"
import mikuImg from "./hatsune-miku-png.png"

const M = {
  bg:"#071015",
  panel:"#0c171c",
  panel2:"#091217",
  line:"#163038",
  border:"#1c3940",
  text:"#d8ece8",
  muted:"#789490",
  accent:"#3dd0c6",
  accent2:"#1f8a84",
  pos:"#fb923c",
  neg:"#60a5fa",
  ok:"#10b981",
  warn:"#f59e0b",
  radius:16,
}

const PHONE = "5591993922666"
const BF = "system-ui,-apple-system,sans-serif"
const TF = "'Press Start 2P', monospace"

const CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
  @keyframes pulseGlow { 0%,100% { opacity:.55 } 50% { opacity:1 } }
  @keyframes popIn { 0% { opacity:0; transform:scale(.8) } 100% { opacity:1; transform:scale(1) } }
  @keyframes floatIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
`

const cor = n => n < 0 ? M.neg : n > 0 ? M.pos : M.accent
const fmt = n => n > 0 ? `+${n}` : `${n}`
const fmtC = n => n < 0 ? `(${n})` : `(+${n})`

function Tela({children}) {
  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(circle at 20% 12%, #0c2424 0%, ${M.bg} 48%),
                  radial-gradient(circle at 80% 100%, #1a1017 0%, transparent 36%)`,
      color:M.text,
      fontFamily:BF,
      padding:"16px 14px 34px",
    }}>
      <div style={{
        maxWidth:560,
        margin:"0 auto",
        minHeight:"calc(100vh - 50px)",
        display:"flex",
        flexDirection:"column",
      }}>
        {children}
      </div>
      <style>{CSS}</style>
    </div>
  )
}

function Card({children,style={}}) {
  return (
    <div style={{
      background:M.panel,
      border:`1px solid ${M.border}`,
      borderRadius:M.radius,
      padding:14,
      ...style,
    }}>
      {children}
    </div>
  )
}

function Btn({label,onClick,disabled,ghost=false,color=M.accent}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%",
      padding:"14px 16px",
      borderRadius:M.radius,
      border:ghost ? `2px solid ${color}` : "none",
      background:disabled ? M.line : ghost ? "transparent" : color,
      color:disabled ? M.muted : ghost ? color : M.bg,
      cursor:disabled ? "not-allowed" : "pointer",
      opacity:disabled ? .48 : 1,
      fontFamily:TF,
      fontSize:10,
      letterSpacing:.5,
      textTransform:"uppercase",
    }}>
      {label}
    </button>
  )
}

function Progress({index,total}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
      <div style={{flex:1,height:5,background:M.line,borderRadius:99,overflow:"hidden"}}>
        <div style={{
          width:`${((index+1)/total)*100}%`,
          height:"100%",
          background:`linear-gradient(to right, ${M.accent2}, ${M.accent})`,
          transition:"width .25s",
        }}/>
      </div>
      <span style={{fontSize:10,fontFamily:TF,color:M.accent}}>{index+1}/{total}</span>
    </div>
  )
}

function Equation({a,b,result=null,reveal=false}) {
  return (
    <Card style={{
      background:M.panel2,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      gap:10,
    }}>
      <span style={{fontFamily:TF,fontSize:20,color:cor(a)}}>{fmtC(a)}</span>
      <span style={{fontFamily:TF,fontSize:16,color:M.accent}}>+</span>
      <span style={{fontFamily:TF,fontSize:20,color:cor(b)}}>{fmtC(b)}</span>
      <span style={{fontFamily:TF,fontSize:16,color:M.accent}}>=</span>
      <div style={{
        minWidth:62,
        textAlign:"center",
        padding:"6px 10px",
        borderRadius:10,
        border:`1.5px solid ${reveal ? `${cor(result)}66` : M.line}`,
        background:reveal ? `${cor(result)}18` : `${M.line}66`,
        color:reveal ? cor(result) : M.muted,
        fontFamily:TF,
        fontSize:20,
      }}>
        {reveal ? fmtC(result) : "?"}
      </div>
    </Card>
  )
}

function useLineModel(a,result) {
  return useMemo(() => {
    const min = Math.min(a, result, 0) - 2
    const max = Math.max(a, result, 0) + 2
    const count = max - min + 1
    const values = Array.from({length:count}, (_, i) => min + i)
    const pct = value => (((value - min) + 0.5) / count) * 100
    return { min, max, count, values, pct }
  }, [a, result])
}

function NumberLine({
  a,
  result,
  mode="neutral",
  selected=null,
  showResult=false,
  interactiveValues=false,
  onPickValue,
  sideChoice=null,
  onPickSide,
  pulseStart=false,
  pulseEnd=false,
}) {
  const { values, pct } = useLineModel(a, result)
  const lineTop = "60%"
  const dir = Math.sign(result - a)
  const path = []
  const steps = Math.abs(result - a)
  for (let i = 0; i < steps; i += 1) path.push(a + dir*i)

  const showPath = mode === "path" || mode === "result" || mode === "value"
  const mikuPos = mode === "start"
    ? a
    : mode === "path" || mode === "result" || mode === "explain"
      ? result
      : selected ?? a

  return (
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{
        borderBottom:`1px solid ${M.border}`,
        padding:"8px 14px",
        display:"flex",
        justifyContent:"space-between",
        fontFamily:TF,
        fontSize:8,
        background:"#ffffff03",
      }}>
        <span style={{color:M.neg}}>NEG</span>
        <span style={{color:M.accent}}>RETA</span>
        <span style={{color:M.pos}}>POS</span>
      </div>

      <div style={{position:"relative",height:116,padding:"0 8px"}}>
        <div style={{
          position:"absolute",
          top:lineTop,
          left:"1%",
          right:"1%",
          height:2,
          transform:"translateY(-50%)",
          background:`linear-gradient(to right, ${M.line}, ${M.accent}55, ${M.line})`,
        }}/>

        {showPath && (
          <div style={{
            position:"absolute",
            top:lineTop,
            left:`${pct(Math.min(a, result))}%`,
            width:`${Math.abs(pct(result) - pct(a))}%`,
            height:4,
            transform:"translateY(-50%)",
            borderRadius:99,
            background:result >= 0
              ? `linear-gradient(to right, ${M.pos}35, ${M.pos})`
              : `linear-gradient(to right, ${M.neg}, ${M.neg}35)`,
          }}/>
        )}

        {showPath && path.map((value, index)=>(
          <div key={`${value}-${index}`} style={{
            position:"absolute",
            left:`${pct(value)}%`,
            top:lineTop,
            transform:"translate(-50%, -50%)",
            width:7,
            height:7,
            borderRadius:"50%",
            background:cor(result),
            opacity:.55,
          }}/>
        ))}

        <div style={{
          position:"absolute",
          left:`${pct(a)}%`,
          top:lineTop,
          transform:"translate(-50%, -50%)",
          width:28,
          height:28,
          borderRadius:"50%",
          border:`2px dashed ${cor(a)}85`,
          boxShadow:pulseStart ? `0 0 14px ${cor(a)}55` : "none",
          animation:pulseStart ? "pulseGlow .9s infinite" : "none",
        }}/>

        {selected!==null && !showResult && (
          <div style={{
            position:"absolute",
            left:`${pct(selected)}%`,
            top:lineTop,
            transform:"translate(-50%, -50%)",
            width:30,
            height:30,
            borderRadius:"50%",
            border:`2px solid ${M.accent}`,
            background:`${M.accent}18`,
            boxShadow:`0 0 12px ${M.accent}35`,
          }}/>
        )}

        {showResult && (
          <div style={{
            position:"absolute",
            left:`${pct(result)}%`,
            top:lineTop,
            transform:"translate(-50%, -50%)",
            width:36,
            height:36,
            borderRadius:"50%",
            border:`3px solid ${M.bg}`,
            background:cor(result),
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            color:M.bg,
            fontFamily:TF,
            fontSize:Math.abs(result) >= 10 ? 10 : 13,
            boxShadow:pulseEnd ? `0 0 18px ${cor(result)}66` : "none",
            animation:pulseEnd ? "popIn .25s both, pulseGlow 1s infinite" : "popIn .25s both",
          }}>
            {fmt(result)}
          </div>
        )}

        <div style={{
          position:"absolute",
          left:`${pct(mikuPos)}%`,
          top:lineTop,
          transform:"translate(-50%, -96%)",
          zIndex:4,
          filter:`drop-shadow(0 0 8px ${M.accent}30)`,
        }}>
          <img src={mikuImg} alt="guia visual" style={{width:42,height:"auto",display:"block"}}/>
        </div>

        {onPickSide && (
          <>
            <button onClick={()=>onPickSide("left")} style={{
              position:"absolute",left:16,top:12,
              padding:"8px 12px",borderRadius:12,
              border:`1.5px solid ${sideChoice==="left"?M.neg:M.border}`,
              background:sideChoice==="left"?`${M.neg}18`:M.panel2,
              color:sideChoice==="left"?M.neg:M.text,
              fontFamily:TF,fontSize:10,cursor:"pointer",
            }}>ESQUERDA</button>
            <button onClick={()=>onPickSide("right")} style={{
              position:"absolute",right:16,top:12,
              padding:"8px 12px",borderRadius:12,
              border:`1.5px solid ${sideChoice==="right"?M.pos:M.border}`,
              background:sideChoice==="right"?`${M.pos}18`:M.panel2,
              color:sideChoice==="right"?M.pos:M.text,
              fontFamily:TF,fontSize:10,cursor:"pointer",
            }}>DIREITA</button>
          </>
        )}
      </div>

      <div style={{
        display:"flex",
        padding:"6px 8px 8px",
        borderTop:`1px solid ${M.border}`,
        background:"#00000018",
      }}>
        {values.map(value=>{
          const active = value === a || value === result || value === selected
          const color = value === a
            ? cor(a)
            : value === result && showResult
              ? cor(result)
              : value === selected
                ? M.accent
                : value === 0
                  ? M.accent
                  : M.muted
          const content = value === 0 ? "0" : fmt(value)

          if (interactiveValues) {
            return (
              <button key={value} onClick={()=>onPickValue?.(value)} style={{
                flex:1,
                background:"transparent",
                border:"none",
                padding:0,
                cursor:"pointer",
                color,
                fontFamily:TF,
                fontSize:active ? 12 : 9,
                lineHeight:2.1,
              }}>
                {content}
              </button>
            )
          }

          return (
            <div key={value} style={{
              flex:1,
              textAlign:"center",
              color,
              fontFamily:TF,
              fontSize:active ? 12 : 9,
              lineHeight:2.1,
            }}>
              {content}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Prompt({kicker,title,text}) {
  return (
    <Card style={{animation:"fadeUp .25s both"}}>
      <div style={{fontSize:11,color:M.accent,fontFamily:TF,marginBottom:10}}>
        {kicker}
      </div>
      <div style={{fontSize:15,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:8}}>
        {title}
      </div>
      <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
        {text}
      </div>
    </Card>
  )
}

function ObserveSlide({a,b,onDone}) {
  const result = a + b
  const [step,setStep] = useState(0)
  const steps = [
    {
      kicker:"PASSO 1",
      title:"Veja o ponto de partida",
      text:`A conta comeca em ${fmtC(a)}.`,
      lineMode:"start",
    },
    {
      kicker:"PASSO 2",
      title:"Veja para qual lado segue",
      text:`Como ${fmtC(b)} ${b>0?"esta no lado positivo, seguimos para a direita.":"esta no lado negativo, seguimos para a esquerda."}`,
      lineMode:"path",
    },
    {
      kicker:"PASSO 3",
      title:"Veja a chegada",
      text:`A reta termina em ${fmtC(result)}.`,
      lineMode:"result",
    },
  ]
  const current = steps[step]
  const last = step === steps.length - 1

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Equation a={a} b={b} result={result} reveal={last} />
      <Prompt kicker={current.kicker} title={current.title} text={current.text} />
      <NumberLine
        a={a}
        result={result}
        mode={current.lineMode}
        showResult={current.lineMode==="result"}
        showPath={current.lineMode==="path" || current.lineMode==="result"}
        pulseStart={current.lineMode==="start"}
        pulseEnd={current.lineMode==="result"}
      />
      <Btn
        label={last ? "Fechar demonstracao" : "Proximo passo"}
        onClick={()=>{
          if (last) onDone?.()
          else setStep(v=>v+1)
        }}
      />
    </div>
  )
}

function DirectionSlide({a,b,onCorrect,onWrong}) {
  const result = a + b
  const [choice,setChoice] = useState(null)
  const correctSide = b > 0 ? "right" : "left"

  const choose = side => {
    if (choice!==null) return
    setChoice(side)
    if (side === correctSide) onCorrect?.()
    else onWrong?.()
  }

  const correct = choice === correctSide

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Equation a={a} b={b} />
      <Prompt
        kicker="DECISAO 1"
        title="Para qual lado a reta segue?"
        text={`Olhe para o sinal de ${fmtC(b)} e escolha o lado correto antes de chegar ao resultado.`}
      />
      <NumberLine
        a={a}
        result={result}
        mode="start"
        sideChoice={choice}
        onPickSide={choose}
        pulseStart
      />
      {choice!==null&&(
        <Card>
          <div style={{fontSize:15,color:correct?M.ok:M.warn,fontFamily:BF,fontWeight:700,marginBottom:6}}>
            {correct ? "Direcao correta." : "Vamos revisar a direcao."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            {correctSide==="right" ? "O segundo numero leva a reta para a direita." : "O segundo numero leva a reta para a esquerda."}
          </div>
        </Card>
      )}
    </div>
  )
}

function ArrivalSlide({a,b,onCorrect,onWrong}) {
  const result = a + b
  const [selected,setSelected] = useState(null)
  const [done,setDone] = useState(false)
  const correct = selected === result

  const choose = value => {
    if (done) return
    setSelected(value)
    setDone(true)
    if (value === result) onCorrect?.()
    else onWrong?.()
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Equation a={a} b={b} result={result} reveal={done && correct} />
      <Prompt
        kicker="DECISAO 2"
        title="Toque na chegada"
        text={`Comece em ${fmtC(a)}. Depois acompanhe ${Math.abs(b)} ${Math.abs(b)===1?"passo":"passos"} e toque no ponto final.`}
      />
      <NumberLine
        a={a}
        result={result}
        mode="value"
        selected={selected}
        showResult={done}
        interactiveValues={!done}
        onPickValue={choose}
      />
      {done&&(
        <Card>
          <div style={{fontSize:15,color:correct?M.ok:M.warn,fontFamily:BF,fontWeight:700,marginBottom:6}}>
            {correct ? "Chegada correta." : "A chegada precisa de ajuste."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            A reta termina em {fmtC(result)}.
          </div>
        </Card>
      )}
    </div>
  )
}

function ExplainSlide({a,b,onCorrect,onWrong}) {
  const result = a + b
  const [choice,setChoice] = useState(null)
  const correctText = `Comeca em ${fmtC(a)} e anda ${Math.abs(b)} ${b>0?"para a direita":"para a esquerda"}.`
  const wrongText = `Comeca em ${fmtC(result)} e volta para ${fmtC(a)}.`
  const options = [correctText, wrongText]

  const choose = text => {
    if (choice!==null) return
    setChoice(text)
    if (text === correctText) onCorrect?.()
    else onWrong?.()
  }

  const correct = choice === correctText

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Equation a={a} b={b} result={result} reveal />
      <NumberLine a={a} result={result} mode="result" showResult />
      <Prompt
        kicker="DECISAO 3"
        title="Escolha a frase que explica a reta"
        text="A frase correta precisa acompanhar o ponto de partida, a direcao e a chegada."
      />
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {options.map(text=>(
          <button key={text} onClick={()=>choose(text)} disabled={choice!==null} style={{
            width:"100%",
            textAlign:"left",
            padding:"14px 16px",
            borderRadius:M.radius,
            border:`1.5px solid ${choice===text?(text===correctText?M.ok:M.warn):M.border}`,
            background:choice===text?(text===correctText?`${M.ok}18`:`${M.warn}18`):M.panel,
            color:choice===text?(text===correctText?M.ok:M.warn):M.text,
            fontFamily:BF,
            fontSize:14,
            lineHeight:1.5,
            cursor:choice===null?"pointer":"default",
          }}>
            {text}
          </button>
        ))}
      </div>
      {choice!==null&&(
        <Card>
          <div style={{fontSize:15,color:correct?M.ok:M.warn,fontFamily:BF,fontWeight:700,marginBottom:6}}>
            {correct ? "Explicacao correta." : "A frase nao acompanha a reta."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            A conta {fmtC(a)} + {fmtC(b)} termina em {fmtC(result)}.
          </div>
        </Card>
      )}
    </div>
  )
}

function RetryDemo({a,b,onDone}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Card>
        <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
          Vamos rever esse trecho com calma.
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
          Observe o ponto de partida, a direcao e a chegada antes de tentar de novo.
        </div>
      </Card>
      <ObserveSlide a={a} b={b} onDone={onDone}/>
    </div>
  )
}

function ExerciseBlock({mode,a,b,onLog,onUnlock}) {
  const [errors,setErrors] = useState(0)
  const [showRetry,setShowRetry] = useState(false)
  const [version,setVersion] = useState(0)

  const correct = () => {
    onLog({ok:true})
    onUnlock()
  }

  const wrong = () => {
    const next = errors + 1
    setErrors(next)
    onLog({ok:false})
    if (next >= 2) setShowRetry(true)
  }

  if (showRetry) {
    return (
      <RetryDemo
        a={a}
        b={b}
        onDone={()=>{
          setErrors(0)
          setShowRetry(false)
          setVersion(v=>v+1)
        }}
      />
    )
  }

  if (mode === "observe") return <ObserveSlide key={version} a={a} b={b} onDone={onUnlock}/>
  if (mode === "direction") return <DirectionSlide key={version} a={a} b={b} onCorrect={correct} onWrong={wrong}/>
  if (mode === "arrival") return <ArrivalSlide key={version} a={a} b={b} onCorrect={correct} onWrong={wrong}/>
  return <ExplainSlide key={version} a={a} b={b} onCorrect={correct} onWrong={wrong}/>
}

function RuleSummary() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Prompt
        kicker="REGRA VISUAL"
        title="Mesmo sinal, mesmo lado"
        text="Quando os dois numeros tem o mesmo sinal, a reta continua para o mesmo lado. O que muda e a distancia."
      />
      <Card style={{display:"flex",flexDirection:"column",gap:8}}>
        {[[2,3], [4,4], [-2,-3], [-4,-4]].map(([a,b])=>(
          <div key={`${a}-${b}`} style={{
            background:`${cor(a+b)}10`,
            border:`1px solid ${cor(a+b)}35`,
            borderRadius:12,
            padding:"10px 12px",
            textAlign:"center",
            fontFamily:TF,
            fontSize:12,
            color:cor(a+b),
          }}>
            {fmtC(a)} + {fmtC(b)} = {fmtC(a+b)}
          </div>
        ))}
      </Card>
    </div>
  )
}

export default function T7() {
  const [scene,setScene] = useState("intro")
  const [index,setIndex] = useState(0)
  const [unlocked,setUnlocked] = useState(false)
  const [log,setLog] = useState([])

  const sequences = {
    ensino: [
      {title:"Abertura do treino", kind:"introCard"},
      {title:"Observe um exemplo", kind:"observe", a:2, b:3},
      {title:"Escolha o lado", kind:"direction", a:1, b:2},
      {title:"Toque na chegada", kind:"arrival", a:2, b:2},
      {title:"Explique a reta", kind:"explain", a:3, b:4},
      {title:"Observe no lado negativo", kind:"observe", a:-2, b:-3},
      {title:"Escolha o lado negativo", kind:"direction", a:-1, b:-2},
      {title:"Toque na chegada negativa", kind:"arrival", a:-2, b:-2},
      {title:"Regra do mesmo sinal", kind:"summary"},
    ],
    pratica: [
      {title:"Pratica 1", kind:"direction", a:2, b:3},
      {title:"Pratica 2", kind:"arrival", a:3, b:3},
      {title:"Pratica 3", kind:"explain", a:4, b:4},
      {title:"Pratica 4", kind:"direction", a:-2, b:-3},
      {title:"Pratica 5", kind:"arrival", a:-3, b:-3},
      {title:"Pratica 6", kind:"explain", a:-4, b:-4},
    ],
    escola: [
      {title:"Modo escola", kind:"school"},
      {title:"Numeros maiores: lado", kind:"direction", a:6, b:7},
      {title:"Numeros maiores: chegada", kind:"arrival", a:-6, b:-7},
      {title:"Numeros maiores: explicacao", kind:"explain", a:8, b:9},
    ],
  }

  const currentList = sequences[scene] || []
  const current = currentList[index]

  const go = (nextScene, nextIndex = 0) => {
    setScene(nextScene)
    setIndex(nextIndex)
    setUnlocked(false)
  }

  const next = () => {
    setUnlocked(false)
    if (index + 1 < currentList.length) {
      setIndex(v=>v+1)
      return
    }
    if (scene === "ensino") go("pratica")
    else if (scene === "pratica") go("escola")
    else go("fim")
  }

  const desempenho = () => {
    if (!log.length) return "Treino iniciado"
    const pct = Math.round((log.filter(item=>item.ok).length / log.length) * 100)
    if (pct >= 90) return "Leitura muito consistente"
    if (pct >= 75) return "Leitura consistente"
    if (pct >= 60) return "Leitura em progresso"
    return "Treino importante"
  }

  const relatorio = () => {
    const ok = log.filter(item=>item.ok).length
    const pct = log.length ? Math.round((ok / log.length) * 100) : 100
    const now = new Date()
    return `Relatorio Pedro\n${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}\nT7: Sinais iguais na reta\n${ok}/${log.length} (${pct}%)\nDesempenho: ${desempenho()}`
  }

  if (scene === "intro") {
    return (
      <Tela>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:18}}>
          <div style={{textAlign:"center",fontFamily:TF,fontSize:11,color:M.accent,letterSpacing:2}}>
            TOPICO 7
          </div>

          <Card style={{display:"flex",alignItems:"center",gap:14}}>
            <img src={mikuImg} alt="guia visual" style={{width:58,height:"auto",flexShrink:0}}/>
            <div>
              <div style={{fontSize:15,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
                Treino visual de soma com sinais iguais
              </div>
              <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
                Hoje o treino vai mostrar o percurso, pedir pequenas decisoes e usar a reta como apoio do comeco ao fim.
              </div>
            </div>
          </Card>

          <Card>
            <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:10}}>
              Como o treino funciona:
            </div>
            {[
              "primeiro voce observa a reta",
              "depois escolhe o lado correto",
              "depois toca na chegada",
              "por fim escolhe a frase que explica a conta",
            ].map((item, idx)=>(
              <div key={item} style={{
                display:"flex",gap:10,alignItems:"center",padding:"8px 0",
                borderBottom:idx<3?`1px solid ${M.border}`:"none",
              }}>
                <span style={{color:M.accent,fontSize:16}}>▸</span>
                <span style={{fontSize:14,color:M.text,fontFamily:BF}}>{item}</span>
              </div>
            ))}
          </Card>

          <Btn label="Iniciar treino" onClick={()=>go("ensino")} />
        </div>
      </Tela>
    )
  }

  if (scene === "fim") {
    const filled = Math.max(1, Math.round((log.filter(item=>item.ok).length / Math.max(log.length,1)) * 5))
    return (
      <Tela>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:18}}>
          <Prompt
            kicker="ENCERRAMENTO"
            title="Treino concluido"
            text="A reta foi usada para mostrar o ponto de partida, a direcao, a chegada e a frase que explica a conta."
          />
          <Card>
            <div style={{fontSize:11,color:M.accent,fontFamily:TF,marginBottom:10}}>DESEMPENHO</div>
            <div style={{fontSize:16,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:10}}>
              {desempenho()}
            </div>
            <div style={{display:"flex",gap:8}}>
              {Array.from({length:5},(_,i)=>(
                <div key={i} style={{
                  flex:1,
                  height:10,
                  borderRadius:99,
                  background:i < filled ? M.accent : M.line,
                }}/>
              ))}
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Btn
              label="Compartilhar resultado"
              color="#25D366"
              onClick={()=>window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(relatorio())}`,"_blank")}
            />
            <Btn label="Treinar de novo" ghost color={M.muted} onClick={()=>{
              setLog([])
              go("intro")
            }} />
          </div>
        </div>
      </Tela>
    )
  }

  return (
    <Tela>
      <Progress index={index} total={currentList.length} />

      <div style={{fontSize:16,color:M.accent,fontFamily:BF,fontWeight:700,marginBottom:12}}>
        {current.title}
      </div>

      <div style={{flex:1}}>
        {current.kind === "introCard" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Prompt
              kicker="ESTRUTURA"
              title="Poucos passos, apoio constante"
              text="Cada bloco mostra um pedaço da conta. Primeiro voce ve. Depois responde. Se travar, a reta mostra de novo."
            />
            <Card style={{background:M.panel2}}>
              <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
                Meta deste treino: transformar a conta em percurso visivel na reta, sem depender de escrita longa e sem pressa.
              </div>
            </Card>
            <Btn label="Continuar" onClick={()=>setUnlocked(true)} />
          </div>
        )}

        {current.kind === "summary" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <RuleSummary />
            <Btn label="Continuar" onClick={()=>setUnlocked(true)} />
          </div>
        )}

        {current.kind === "school" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Prompt
              kicker="MODO ESCOLA"
              title="Quando os numeros aumentam"
              text="A estrategia continua igual: ponto de partida, direcao e chegada. O apoio visual nao muda."
            />
            <Card style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{fontFamily:TF,fontSize:12,color:M.pos,textAlign:"center"}}>(+6) + (+7) = (+13)</div>
              <div style={{fontFamily:TF,fontSize:12,color:M.neg,textAlign:"center"}}>(-6) + (-7) = (-13)</div>
            </Card>
            <Btn label="Continuar" onClick={()=>setUnlocked(true)} />
          </div>
        )}

        {["observe","direction","arrival","explain"].includes(current.kind) && (
          <ExerciseBlock
            mode={current.kind}
            a={current.a}
            b={current.b}
            onLog={entry=>setLog(items=>[...items, entry])}
            onUnlock={()=>setUnlocked(true)}
          />
        )}
      </div>

      {unlocked&&(
        <div style={{marginTop:14}}>
          <Btn
            label={index + 1 < currentList.length ? "Proximo" : scene === "ensino" ? "Ir para pratica" : scene === "pratica" ? "Ir para modo escola" : "Encerrar"}
            onClick={next}
          />
        </div>
      )}
    </Tela>
  )
}
