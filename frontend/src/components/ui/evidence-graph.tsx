import { useEffect, useMemo, useRef, useState } from "react"

// ─── Data ────────────────────────────────────────────────────────────────────

type EvidenceStatus = "verified" | "pending" | "rejected"
type EvidenceRecord = Record<string, unknown>

interface EvidenceNode {
  id: string
  label: string
  sublabel: string
  type: "biometric" | "verified-record" | "human-validation" | "social"
  status: EvidenceStatus
  points: number
  active: boolean
}

interface EvidenceGraphProps {
  personName?: string
  evidence?: EvidenceRecord[]
}

const INITIAL_NODES: EvidenceNode[] = [
  {
    id: "biometric",
    label: "Biometric Match",
    sublabel: "UNHCR Database",
    type: "biometric",
    status: "verified",
    points: 30,
    active: true,
  },
  {
    id: "education",
    label: "Education Record",
    sublabel: "University Diploma",
    type: "verified-record",
    status: "pending",
    points: 10,
    active: false,
  },
  {
    id: "employment",
    label: "Employer Reference",
    sublabel: "Tech Corp, Damascus",
    type: "verified-record",
    status: "verified",
    points: 15,
    active: true,
  },
  {
    id: "ngo",
    label: "NGO Validation",
    sublabel: "Local Aid Officer",
    type: "human-validation",
    status: "verified",
    points: 20,
    active: true,
  },
  {
    id: "wife",
    label: "Family Link",
    sublabel: "Fatima K. (Wife)",
    type: "social",
    status: "verified",
    points: 15,
    active: true,
  },
]

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function mapEvidenceType(type: string, evidenceClass: string, payloadText: string) {
  const combined = `${type} ${evidenceClass} ${payloadText}`.toLowerCase()

  if (
    combined.includes("bio") ||
    combined.includes("finger") ||
    combined.includes("iris") ||
    combined.includes("face")
  ) {
    return "biometric" as const
  }

  if (
    combined.includes("family") ||
    combined.includes("social") ||
    combined.includes("community")
  ) {
    return "social" as const
  }

  if (
    combined.includes("ngo") ||
    combined.includes("officer") ||
    combined.includes("interview") ||
    combined.includes("witness")
  ) {
    return "human-validation" as const
  }

  return "verified-record" as const
}

function mapEvidenceStatus(state: string) {
  if (state === "accepted" || state === "verified") {
    return "verified" as const
  }
  if (state === "rejected" || state === "disputed") {
    return "rejected" as const
  }
  return "pending" as const
}

function buildNodes(evidence: EvidenceRecord[]) {
  if (!evidence.length) {
    return INITIAL_NODES
  }

  return evidence.map((item, index) => {
    const evidenceId = String(item.id ?? item.evidence_id ?? `evidence-${index + 1}`)
    const evidenceType = String(item.evidence_type ?? item.type ?? "evidence")
    const evidenceClass = String(item.evidence_class ?? item.class ?? "")
    const source = String(item.source ?? item.provider ?? item.issuer ?? "")
    const state = String(item.state ?? item.status ?? "pending").toLowerCase()
    const payload = (item.payload as Record<string, unknown> | undefined) ?? {}
    const payloadText = JSON.stringify(payload)
    const type = mapEvidenceType(evidenceType, evidenceClass, payloadText)
    const status = mapEvidenceStatus(state)
    const label = toTitleCase(evidenceType)
    const sublabel = source || toTitleCase(evidenceClass || "Linked record")

    return {
      id: evidenceId,
      label,
      sublabel,
      type,
      status,
      points: Math.max(5, 30 - index * 3),
      active: status === "verified",
    } satisfies EvidenceNode
  })
}

// ─── Colour scheme ────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  biometric: {
    bg: "#dbeafe",
    border: "#3b82f6",
    text: "#1d4ed8",
    dot: "#3b82f6",
    label: "Biometric",
  },
  "verified-record": {
    bg: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
    dot: "#22c55e",
    label: "Verified Record",
  },
  "human-validation": {
    bg: "#ffedd5",
    border: "#f97316",
    text: "#c2410c",
    dot: "#f97316",
    label: "Human Validation",
  },
  social: {
    bg: "#ede9fe",
    border: "#8b5cf6",
    text: "#6d28d9",
    dot: "#8b5cf6",
    label: "Social",
  },
}

// ─── Animated counter hook ───────────────────────────────────────────────────

function useAnimatedCount(target: number, duration = 700) {
  const [value, setValue] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    if (prev.current === target) return
    const start = prev.current
    const diff = target - start
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    prev.current = target
  }, [target, duration])

  return value
}

// ─── Radial position helper ───────────────────────────────────────────────────

function radialPosition(
  index: number,
  total: number,
  cx: number,
  cy: number,
  r: number
) {
  // Start from top (-90°) and spread evenly
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EvidenceGraph({
  personName = "Case Subject",
  evidence = [],
}: EvidenceGraphProps) {
  const baseNodes = useMemo(() => buildNodes(evidence), [evidence])
  const [nodes, setNodes] = useState<EvidenceNode[]>(baseNodes)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    setNodes(baseNodes)
  }, [baseNodes])

  const totalScore = nodes
    .filter((n) => n.active && n.status === "verified")
    .reduce((s, n) => s + n.points, 0)

  const animatedScore = useAnimatedCount(totalScore)

  const status =
    animatedScore >= 80
      ? { label: "High Confidence", color: "#16a34a", bg: "#f0fdf4" }
      : animatedScore >= 60
      ? { label: "Verified", color: "#2563eb", bg: "#eff6ff" }
      : animatedScore >= 40
      ? { label: "Provisional", color: "#d97706", bg: "#fffbeb" }
      : { label: "Under Review", color: "#dc2626", bg: "#fef2f2" }

  // Activate a pending node and animate score
  const activateNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, active: true, status: "verified" } : n
      )
    )
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
  }

  // Graph layout constants
  const W = 780
  const H = 480
  const CX = W / 2
  const CY = H / 2
  const RADIUS = 170
  const NODE_HALF_W = 90
  const NODE_HALF_H = 40

  return (
    <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            Identity Evidence Map
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Live case evidence linked to the subject record
          </p>
        </div>
        {/* Legend */}
        <div className="flex gap-3 flex-wrap justify-end">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: cfg.dot }}
              />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 480 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.10" />
            </filter>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Background circles (radial guide lines) */}
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Edges */}
          {nodes.map((node, i) => {
            const pos = radialPosition(i, nodes.length, CX, CY, RADIUS)
            const isActive = node.active && node.status === "verified"
            const color = isActive ? "#94a3b8" : "#e2e8f0"

            // Calculate edge endpoints (stop at node border, not center)
            const dx = pos.x - CX
            const dy = pos.y - CY
            const dist = Math.sqrt(dx * dx + dy * dy)
            const unitX = dx / dist
            const unitY = dy / dist

            // Start: edge of central node circle (r=52)
            const startX = CX + unitX * 52
            const startY = CY + unitY * 52
            // End: edge of evidence node (approximate rectangle clipping)
            const endX = pos.x - unitX * (NODE_HALF_W + 4)
            const endY = pos.y - unitY * (NODE_HALF_H + 4)

            // Midpoint for label
            const midX = (startX + endX) / 2
            const midY = (startY + endY) / 2

            return (
              <g key={`edge-${node.id}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={color}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeDasharray={isActive ? undefined : "5 4"}
                  markerEnd={
                    isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"
                  }
                  style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
                />
                {/* Points badge on edge */}
                {isActive && (
                  <g>
                    <rect
                      x={midX - 18}
                      y={midY - 10}
                      width={36}
                      height={20}
                      rx={10}
                      fill={TYPE_CONFIG[node.type].border}
                      opacity={0.9}
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      +{node.points}
                    </text>
                  </g>
                )}
                {!isActive && (
                  <text
                    x={midX}
                    y={midY - 4}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    +{node.points}
                  </text>
                )}
              </g>
            )
          })}

          {/* Evidence Nodes */}
          {nodes.map((node, i) => {
            const pos = radialPosition(i, nodes.length, CX, CY, RADIUS)
            const cfg = TYPE_CONFIG[node.type]
            const isActive = node.active && node.status === "verified"
            const isPending = !node.active || node.status === "pending"

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: isPending ? "pointer" : "default" }}
                onClick={() => isPending && activateNode(node.id)}
                filter="url(#shadow)"
              >
                {/* Node card */}
                <rect
                  x={-NODE_HALF_W}
                  y={-NODE_HALF_H}
                  width={NODE_HALF_W * 2}
                  height={NODE_HALF_H * 2}
                  rx={12}
                  fill={isActive ? cfg.bg : "#f8fafc"}
                  stroke={isActive ? cfg.border : "#e2e8f0"}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeDasharray={isPending ? "5 3" : undefined}
                  style={{ transition: "fill 0.4s, stroke 0.4s" }}
                />

                {/* Top colour accent bar */}
                {isActive && (
                  <rect
                    x={-NODE_HALF_W}
                    y={-NODE_HALF_H}
                    width={NODE_HALF_W * 2}
                    height={4}
                    rx={12}
                    fill={cfg.border}
                  />
                )}

                {/* Label */}
                <text
                  y={isPending ? -6 : -8}
                  textAnchor="middle"
                  fill={isActive ? cfg.text : "#94a3b8"}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                  style={{ transition: "fill 0.4s" }}
                >
                  {node.label}
                </text>

                {/* Sublabel */}
                <text
                  y={8}
                  textAnchor="middle"
                  fill={isActive ? "#6b7280" : "#cbd5e1"}
                  fontSize="9.5"
                  fontWeight="400"
                  fontFamily="Inter, sans-serif"
                  style={{ transition: "fill 0.4s" }}
                >
                  {node.sublabel}
                </text>

                {/* Status chip */}
                {isPending ? (
                  <g>
                    <rect
                      x={-28}
                      y={18}
                      width={56}
                      height={14}
                      rx={7}
                      fill="#f1f5f9"
                      stroke="#e2e8f0"
                      strokeWidth={1}
                    />
                    <text
                      y={29}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8"
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >
                      Click to verify
                    </text>
                  </g>
                ) : (
                  <g>
                    <rect
                      x={-24}
                      y={18}
                      width={48}
                      height={14}
                      rx={7}
                      fill={cfg.border}
                      opacity={0.15}
                    />
                    <text
                      y={29}
                      textAnchor="middle"
                      fill={cfg.text}
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      ✓ Verified
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Central Node */}
          <g filter="url(#glow)">
            {/* Outer pulse ring */}
            <circle
              cx={CX}
              cy={CY}
              r={flash ? 60 : 54}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={flash ? 3 : 0}
              opacity={flash ? 0.4 : 0}
              style={{ transition: "r 0.3s, opacity 0.3s, stroke-width 0.3s" }}
            />

            {/* Main circle */}
            <circle
              cx={CX}
              cy={CY}
              r={52}
              fill={status.bg}
              stroke={status.color}
              strokeWidth={3}
              style={{ transition: "fill 0.5s, stroke 0.5s" }}
            />

            {/* Name */}
            <text
              x={CX}
              y={CY - 14}
              textAnchor="middle"
              fill="#1e293b"
              fontSize="11"
              fontWeight="800"
              fontFamily="Inter, sans-serif"
            >
              {personName}
            </text>

            {/* Score */}
            <text
              x={CX}
              y={CY + 8}
              textAnchor="middle"
              fill={status.color}
              fontSize="22"
              fontWeight="900"
              fontFamily="Inter, sans-serif"
              style={{ transition: "fill 0.5s" }}
            >
              {animatedScore}
            </text>

            {/* Status label */}
            <text
              x={CX}
              y={CY + 24}
              textAnchor="middle"
              fill={status.color}
              fontSize="8"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
              style={{ transition: "fill 0.5s" }}
            >
              {status.label.toUpperCase()}
            </text>
          </g>
        </svg>
      </div>

      {/* Footer reset */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-xs text-gray-400">
          {nodes.filter((n) => n.active && n.status === "verified").length} of{" "}
          {nodes.length} evidence sources verified
        </p>
        <button
          onClick={() => setNodes(baseNodes)}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
        >
          Reset View
        </button>
      </div>
    </div>
  )
}
