import { useState } from "react"
import mikuImg from "./hatsune-miku-png.png"

const M = {
  bg:"#071116",
  panel:"#0d1a1f",
  panel2:"#0a1519",
  line:"#183138",
  text:"#d6ece9",
  muted:"#7d9a97",
  accent:"#3ecfc6",
  accent2:"#24928c",
  pos:"#fb923c",
  neg:"#60a5fa",
  ok:"#10b981",
  warn:"#f59e0b",
  border:"#1a3530",
  radius:14,
}

const PHONE = "5591993922666"
const BF = "system-ui,-apple-system,sans-serif"
const TF = "'Press Start 2P', monospace"

const CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
  @keyframes pulseLine { from { opacity:.7 } to { opacity:1 } }
`

const cor = n => n < 0 ? M.neg : n > 0 ? M.pos : M.accent
const fmt = n => n > 0 ? `+${n}` : `${n}`
const fmtC = n => n < 0 ? `(${n})` : `(+${n})`

function Tela({children}) {
  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(circle at 20% 10%, #0d2626 0%, ${M.bg} 48%),
                  radial-gradient(circle at 80% 100%, #1a0f16 0%, transparent 35%)`,
      color:M.text,
      fontFamily:BF,
      padding:"16px 14px 34px",
    }}>
      <div style={{
        maxWidth:540,
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

function Card({children, style={}}) {
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
      opacity:disabled ? .5 : 1,
      fontFamily:TF,
      fontSize:10,
      letterSpacing:.5,
      textTransform:"uppercase",
    }}>
      {label}
    </button>
  )
}

function Prog({index,total}) {
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

function Conta({a,b,resultado=null,showResult=false}) {
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
        border:`1.5px solid ${showResult ? `${cor(resultado)}55` : M.line}`,
        background:showResult ? `${cor(resultado)}18` : `${M.line}55`,
        color:showResult ? cor(resultado) : M.muted,
        fontFamily:TF,
        fontSize:20,
      }}>
        {showResult ? fmtC(resultado) : "?"}
      </div>
    </Card>
  )
}

function NumberLine({
  a,
  result,
  showPath=false,
  showResult=false,
  highlight=null,
  interactive=false,
  selected=null,
  onSelect,
}) {
  const min = Math.min(a, result, 0) - 2
  const max = Math.max(a, result, 0) + 2
  const count = max - min + 1
  const values = Array.from({length:count}, (_, i) => min + i)
  const pct = value => (((value - min) + 0.5) / count) * 100

  const path = []
  if (showPath) {
    const dir = Math.sign(result - a)
    const steps = Math.abs(result - a)
    for (let i = 0; i < steps; i += 1) path.push(a + (dir * i))
  }

  return (
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{
        borderBottom:`1px solid ${M.border}`,
        padding:"8px 14px",
        display:"flex",
        justifyContent:"space-between",
        fontFamily:TF,
        fontSize:8,
        color:M.muted,
        background:"#ffffff03",
      }}>
        <span style={{color:M.neg}}>NEG</span>
        <span style={{color:M.accent}}>RETA</span>
        <span style={{color:M.pos}}>POS</span>
      </div>

      <div style={{position:"relative",height:112,padding:"0 8px"}}>
        <div style={{
          position:"absolute",
          top:"62%",
          left:"1%",
          right:"1%",
          height:2,
          transform:"translateY(-50%)",
          background:`linear-gradient(to right, ${M.line}, ${M.accent}55, ${M.line})`,
        }}/>

        {path.map((value, index) => (
          <div key={`${value}-${index}`} style={{
            position:"absolute",
            left:`${pct(value)}%`,
            top:"62%",
            transform:"translate(-50%, -50%)",
            width:7,
            height:7,
            borderRadius:"50%",
            background:cor(result),
            opacity:.55,
          }}/>
        ))}

        {showPath && (
          <div style={{
            position:"absolute",
            top:"62%",
            height:4,
            transform:"translateY(-50%)",
            left:`${pct(Math.min(a, result))}%`,
            width:`${Math.abs(pct(result) - pct(a))}%`,
            borderRadius:99,
            background:result >= 0
              ? `linear-gradient(to right, ${M.pos}40, ${M.pos})`
              : `linear-gradient(to right, ${M.neg}, ${M.neg}40)`,
            animation:"pulseLine .4s ease-in-out infinite alternate",
          }}/>
        )}

        <div style={{
          position:"absolute",
          left:`${pct(a)}%`,
          top:"62%",
          transform:"translate(-50%, -50%)",
          width:28,
          height:28,
          borderRadius:"50%",
          border:`2px dashed ${cor(a)}85`,
        }}/>

        {selected!==null && !showResult && (
          <div style={{
            position:"absolute",
            left:`${pct(selected)}%`,
            top:"62%",
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
            top:"62%",
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
          }}>
            {fmt(result)}
          </div>
        )}

        {highlight!==null && (
          <div style={{
            position:"absolute",
            left:`${pct(highlight)}%`,
            top:"31%",
            transform:"translateX(-50%)",
            color:M.accent,
            fontSize:11,
            fontFamily:TF,
          }}>
            foco
          </div>
        )}

        <div style={{
          position:"absolute",
          right:14,
          top:10,
          display:"flex",
          alignItems:"center",
          gap:8,
          padding:"6px 8px",
          border:`1px solid ${M.border}`,
          borderRadius:10,
          background:M.panel2,
        }}>
          <img src={mikuImg} alt="Miku" style={{width:22,height:"auto"}}/>
          <span style={{fontSize:11,color:M.muted,fontFamily:BF}}>guia visual</span>
        </div>
      </div>

      <div style={{
        display:"flex",
        padding:"6px 8px 8px",
        borderTop:`1px solid ${M.border}`,
        background:"#00000018",
      }}>
        {values.map(value => {
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

          if (interactive) {
            return (
              <button key={value} onClick={()=>onSelect?.(value)} style={{
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

function StepCard({step,total,title,text}) {
  return (
    <Card style={{animation:"fadeUp .25s both"}}>
      <div style={{fontSize:11,color:M.accent,fontFamily:TF,marginBottom:10}}>
        ETAPA {step}/{total}
      </div>
      <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:8}}>
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

  const content = [
    {
      title:"Comeco visivel",
      text:`A reta mostra onde a conta comeca: ${fmtC(a)}.`,
      highlight:a,
      showPath:false,
      showResult:false,
    },
    {
      title:"Deslocamento claro",
      text:`Agora acompanhe ${Math.abs(b)} ${Math.abs(b)===1?"passo":"passos"} ${b>0?"para a direita":"para a esquerda"}.`,
      highlight:null,
      showPath:true,
      showResult:false,
    },
    {
      title:"Chegada explicita",
      text:`A chegada fica em ${fmtC(result)}.`,
      highlight:null,
      showPath:true,
      showResult:true,
    },
  ]

  const current = content[step]
  const last = step === content.length - 1

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b} resultado={result} showResult={last}/>
      <StepCard step={step+1} total={content.length} title={current.title} text={current.text}/>
      <NumberLine
        a={a}
        result={result}
        highlight={current.highlight}
        showPath={current.showPath}
        showResult={current.showResult}
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

function ConfirmSlide({a,b,onCorrect,onWrong}) {
  const result = a + b
  const [choice,setChoice] = useState(null)
  const options = useState(()=>{
    const wrong = result + (result >= 0 ? -1 : 1)
    return [result, wrong].sort(()=>Math.random()-.5)
  })[0]

  const choose = value => {
    if (choice!==null) return
    setChoice(value)
    if (value === result) onCorrect?.()
    else onWrong?.()
  }

  const correct = choice === result

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b}/>
      <StepCard
        step={1}
        total={1}
        title="Leia primeiro, responda depois"
        text={`Observe a reta inteira antes de decidir onde a conta termina.`}
      />
      <NumberLine a={a} result={result} showPath showResult />
      <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,textAlign:"center"}}>
        Qual chegada combina com esse percurso?
      </div>
      <div style={{display:"flex",gap:10}}>
        {options.map(value=>(
          <button key={value} onClick={()=>choose(value)} disabled={choice!==null} style={{
            flex:1,
            padding:"18px 8px",
            background:choice===value?(value===result?`${M.ok}18`:`${M.warn}18`):M.panel,
            border:`2px solid ${choice===value?(value===result?M.ok:M.warn):`${cor(value)}55`}`,
            borderRadius:M.radius,
            color:cor(value),
            fontFamily:TF,
            fontSize:14,
            cursor:choice===null?"pointer":"default",
          }}>
            {fmtC(value)}
          </button>
        ))}
      </div>
      {choice!==null&&(
        <Card>
          <div style={{fontSize:15,color:correct?M.ok:M.warn,fontFamily:BF,fontWeight:700,marginBottom:6}}>
            {correct ? "Leitura correta da reta." : "Vamos revisar a chegada."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            A reta termina em {fmtC(result)}.
          </div>
        </Card>
      )}
    </div>
  )
}

function CompleteSlide({a,b,onCorrect,onWrong}) {
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
      <Conta a={a} b={b} resultado={result} showResult={done && correct} />
      <StepCard
        step={1}
        total={1}
        title="Complete a reta"
        text={`Comece em ${fmtC(a)}, acompanhe ${Math.abs(b)} ${Math.abs(b)===1?"passo":"passos"} e toque na chegada.`}
      />
      <NumberLine
        a={a}
        result={result}
        selected={selected}
        showPath={done}
        showResult={done}
        interactive={!done}
        onSelect={choose}
      />
      {!done&&(
        <div style={{textAlign:"center",fontSize:13,color:M.accent,fontFamily:BF,fontWeight:700}}>
          Toque no ponto final da reta.
        </div>
      )}
      {done&&(
        <Card>
          <div style={{fontSize:15,color:correct?M.ok:M.warn,fontFamily:BF,fontWeight:700,marginBottom:6}}>
            {correct ? "Boa leitura da reta." : "A chegada precisa de ajuste."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            {correct ? `A chegada fica em ${fmtC(result)}.` : `A reta correta termina em ${fmtC(result)}.`}
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

  const options = useState(()=>[correctText, wrongText].sort(()=>Math.random()-.5))[0]

  const choose = value => {
    if (choice!==null) return
    setChoice(value)
    if (value === correctText) onCorrect?.()
    else onWrong?.()
  }

  const correct = choice === correctText

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Conta a={a} b={b} resultado={result} showResult />
      <NumberLine a={a} result={result} showPath showResult />
      <StepCard
        step={1}
        total={1}
        title="Explique com apoio"
        text="Escolha a frase que descreve corretamente o percurso da reta."
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
            {correct ? "Explicacao alinhada com a reta." : "A frase precisa acompanhar o percurso."}
          </div>
          <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
            A conta {fmtC(a)} + {fmtC(b)} chega em {fmtC(result)}.
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
          Vamos revisar esse passo com calma.
        </div>
        <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
          Primeiro observe a reta. Depois tente de novo.
        </div>
      </Card>
      <ObserveSlide a={a} b={b} onDone={onDone}/>
    </div>
  )
}

function Bloco({mode,a,b,onLog,onUnlock}) {
  const [tries,setTries] = useState(0)
  const [showRetry,setShowRetry] = useState(false)
  const [version,setVersion] = useState(0)

  const correct = () => {
    onLog({ok:true})
    onUnlock()
  }

  const wrong = () => {
    const next = tries + 1
    setTries(next)
    onLog({ok:false})
    if (next >= 2) setShowRetry(true)
  }

  if (showRetry) {
    return (
      <RetryDemo
        a={a}
        b={b}
        onDone={()=>{
          setShowRetry(false)
          setTries(0)
          setVersion(v=>v+1)
        }}
      />
    )
  }

  if (mode === "observe") return <ObserveSlide key={version} a={a} b={b} onDone={onUnlock} />
  if (mode === "confirm") return <ConfirmSlide key={version} a={a} b={b} onCorrect={correct} onWrong={wrong} />
  if (mode === "complete") return <CompleteSlide key={version} a={a} b={b} onCorrect={correct} onWrong={wrong} />
  return <ExplainSlide key={version} a={a} b={b} onCorrect={correct} onWrong={wrong} />
}

function SummaryRule() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Card>
        <div style={{fontSize:11,color:M.accent,fontFamily:TF,marginBottom:10}}>REGRA VISUAL</div>
        <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7}}>
          Quando os dois numeros tem o mesmo sinal, a reta continua para o mesmo lado.
        </div>
      </Card>
      <Card style={{display:"flex",flexDirection:"column",gap:8}}>
        {[[2,3], [4,4], [-2,-3], [-4,-4]].map(([a,b])=>(
          <div key={`${a}-${b}`} style={{
            background:`${cor(a+b)}10`,
            border:`1px solid ${cor(a+b)}30`,
            borderRadius:10,
            padding:"10px 12px",
            fontFamily:TF,
            fontSize:12,
            color:cor(a+b),
            textAlign:"center",
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
      {title:"Visao geral do treino", kind:"info"},
      {title:"Observe um exemplo", kind:"observe", a:2, b:3},
      {title:"Confirme a chegada", kind:"confirm", a:1, b:2},
      {title:"Complete a reta", kind:"complete", a:2, b:2},
      {title:"Explique com apoio", kind:"explain", a:3, b:4},
      {title:"Observe no lado negativo", kind:"observe", a:-2, b:-3},
      {title:"Confirme no lado negativo", kind:"confirm", a:-1, b:-2},
      {title:"Complete no lado negativo", kind:"complete", a:-2, b:-2},
      {title:"Regra do mesmo sinal", kind:"summary"},
    ],
    pratica: [
      {title:"Pratica 1", kind:"confirm", a:2, b:3},
      {title:"Pratica 2", kind:"complete", a:3, b:3},
      {title:"Pratica 3", kind:"explain", a:4, b:4},
      {title:"Pratica 4", kind:"confirm", a:-2, b:-3},
      {title:"Pratica 5", kind:"complete", a:-3, b:-3},
      {title:"Pratica 6", kind:"explain", a:-4, b:-4},
    ],
    escola: [
      {title:"Modo escola", kind:"school"},
      {title:"Leitura com numeros maiores", kind:"confirm", a:6, b:7},
      {title:"Complete com numeros maiores", kind:"complete", a:-6, b:-7},
      {title:"Explique com numeros maiores", kind:"explain", a:8, b:9},
    ],
  }

  const currentList = sequences[scene] || []
  const current = currentList[index]

  const resetUnlock = () => setUnlocked(false)

  const go = (nextScene, nextIndex = 0) => {
    setScene(nextScene)
    setIndex(nextIndex)
    resetUnlock()
  }

  const next = () => {
    resetUnlock()
    const currentTotal = currentList.length
    if (index + 1 < currentTotal) {
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
            <img src={mikuImg} alt="Miku" style={{width:64,height:"auto",flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:6}}>
                Treino guiado de soma com sinais iguais
              </div>
              <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
                Hoje o treino vai usar reta, passos visiveis e apoio curto em cada etapa.
              </div>
            </div>
          </Card>

          <Card>
            <div style={{fontSize:13,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:10}}>
              Antes de comecar:
            </div>
            {[
              "vamos fazer um bloco por vez",
              "cada bloco tem comeco, meio e fim visiveis",
              "primeiro voce observa, depois responde",
              "se travar, a reta mostra de novo",
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

          <Card style={{background:M.panel2}}>
            <div style={{fontSize:12,color:M.muted,fontFamily:BF,lineHeight:1.7}}>
              Meta do treino: entender a reta, confirmar a chegada, completar o percurso e explicar a conta sem depender de escrita longa.
            </div>
          </Card>

          <Btn label="Iniciar treino" onClick={()=>go("ensino")} />
        </div>
      </Tela>
    )
  }

  if (scene === "fim") {
    return (
      <Tela>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:18}}>
          <Card>
            <div style={{fontSize:11,color:M.accent,fontFamily:TF,marginBottom:10}}>FECHAMENTO</div>
            <div style={{fontSize:14,color:M.text,fontFamily:BF,lineHeight:1.7}}>
              O treino terminou. A reta foi usada para organizar a conta passo a passo e tornar a resposta mais visivel.
            </div>
          </Card>

          <Card>
            <div style={{fontSize:11,color:M.accent,fontFamily:TF,marginBottom:10}}>DESEMPENHO</div>
            <div style={{fontSize:16,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:10}}>
              {desempenho()}
            </div>
            <div style={{height:10,display:"flex",gap:8}}>
              {Array.from({length:5},(_,i)=>(
                <div key={i} style={{
                  flex:1,
                  borderRadius:99,
                  background:i < Math.max(1, Math.round((log.filter(item=>item.ok).length / Math.max(log.length,1)) * 5)) ? M.accent : M.line,
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
            <Btn
              label="Treinar de novo"
              ghost
              color={M.muted}
              onClick={()=>{
                setLog([])
                go("intro")
              }}
            />
          </div>
        </div>
      </Tela>
    )
  }

  return (
    <Tela>
      <Prog index={index} total={currentList.length} />

      <div style={{fontSize:16,color:M.accent,fontFamily:BF,fontWeight:700,marginBottom:12}}>
        {current.title}
      </div>

      <div style={{flex:1}}>
        {current.kind === "info" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card>
              <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:8}}>
                Estrutura do treino
              </div>
              <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
                Primeiro voce observa a reta. Depois confirma a chegada. Em seguida completa o percurso. So depois explica a conta.
              </div>
            </Card>
            <Btn label="Continuar" onClick={()=>{
              setUnlocked(true)
            }} />
          </div>
        )}

        {current.kind === "summary" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <SummaryRule />
            <Btn label="Continuar" onClick={()=>setUnlocked(true)} />
          </div>
        )}

        {current.kind === "school" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card>
              <div style={{fontSize:14,color:M.text,fontFamily:BF,fontWeight:700,marginBottom:8}}>
                Quando os numeros aumentam
              </div>
              <div style={{fontSize:13,color:M.muted,fontFamily:BF,lineHeight:1.6}}>
                A estrategia nao muda. O apoio continua sendo o mesmo: ponto de partida, deslocamento e chegada.
              </div>
            </Card>
            <Card style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{fontFamily:TF,fontSize:12,color:M.pos,textAlign:"center"}}>(+6) + (+7) = (+13)</div>
              <div style={{fontFamily:TF,fontSize:12,color:M.neg,textAlign:"center"}}>(-6) + (-7) = (-13)</div>
            </Card>
            <Btn label="Continuar" onClick={()=>setUnlocked(true)} />
          </div>
        )}

        {["observe","confirm","complete","explain"].includes(current.kind) && (
          <Bloco
            a={current.a}
            b={current.b}
            mode={current.kind}
            onLog={entry=>setLog(items=>[...items, entry])}
            onUnlock={()=>setUnlocked(true)}
          />
        )}
      </div>

      {unlocked && (
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
