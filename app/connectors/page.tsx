'use client'

import { useState } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import HudPageLayout from '@/components/jarvis/HudPageLayout'

type ConnectorType = 'api' | 'sqlite' | 'mcp' | 'browser'
type ConnectorStatus = 'connected' | 'disconnected' | 'error'

interface Connector {
  id: string
  name: string
  type: ConnectorType
  status: ConnectorStatus
  api_url?: string
  db_path?: string
}

const typeIcons: Record<ConnectorType, string> = {
  api: '◈',
  sqlite: '◆',
  mcp: '✦',
  browser: '◇',
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([
    { id: '1', name: 'Main API', type: 'api', status: 'disconnected', api_url: '' },
    { id: '2', name: 'Local SQLite', type: 'sqlite', status: 'disconnected', db_path: '' },
    { id: '3', name: 'MCP Tools', type: 'mcp', status: 'disconnected' },
    { id: '4', name: 'Browser Control', type: 'browser', status: 'disconnected' },
  ])
  const [testingId, setTestingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newConnector, setNewConnector] = useState({ name: '', type: 'api' as ConnectorType, api_url: '', db_path: '' })
  const [connectorLogs, setConnectorLogs] = useState<Array<{ timestamp: string; message: string; status: 'success' | 'error' }>>([])
  const [error, setError] = useState('')

  const handleTestConnection = async (connector: Connector) => {
    setTestingId(connector.id)
    setError('')
    try {
      const res = await fetch('/api/erp/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connector_id: connector.id, action: 'test' }),
      })
      if (!res.ok) throw new Error('Connection test failed')
      setConnectors((prev) => prev.map((c) => c.id === connector.id ? { ...c, status: 'connected' } : c))
      const logSuccess: { timestamp: string; message: string; status: 'success' | 'error' } = { timestamp: new Date().toLocaleTimeString(), message: `Connection test passed for ${connector.name}`, status: 'success' }
      setConnectorLogs((prev) => [logSuccess, ...prev].slice(0, 50))
    } catch (err) {
      setConnectors((prev) => prev.map((c) => c.id === connector.id ? { ...c, status: 'error' } : c))
      const logError: { timestamp: string; message: string; status: 'success' | 'error' } = { timestamp: new Date().toLocaleTimeString(), message: `Connection test failed for ${connector.name}`, status: 'error' }
      setConnectorLogs((prev) => [logError, ...prev].slice(0, 50))
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleAddConnector = () => {
    if (!newConnector.name.trim()) return
    const id = `${Date.now()}`
    setConnectors((prev) => [...prev, { id, ...newConnector, name: newConnector.name.trim(), status: 'disconnected' }])
    setNewConnector({ name: '', type: 'api', api_url: '', db_path: '' })
    setShowAddForm(false)
  }

  return (
    <HudPageLayout
      title="ERP CONNECTORS"
      subtitle="integration gateway"
      headerRight={
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          {showAddForm ? 'Cancel' : 'Add Connector'}
        </Button>
      }
    >
      {error && (
        <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
          <p className="text-xs font-mono text-hud-error">{error}</p>
        </div>
      )}

      {showAddForm && (
        <GlassCard title="New Connector">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Name</label>
              <input
                type="text"
                value={newConnector.name}
                onChange={(e) => setNewConnector((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Connector name"
                className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Type</label>
              <select
                value={newConnector.type}
                onChange={(e) => setNewConnector((prev) => ({ ...prev, type: e.target.value as ConnectorType }))}
                className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
              >
                <option value="api">API</option>
                <option value="sqlite">SQLite</option>
                <option value="mcp">MCP</option>
                <option value="browser">Browser</option>
              </select>
            </div>
            {newConnector.type === 'api' && (
              <div>
                <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">API URL</label>
                <input
                  type="text"
                  value={newConnector.api_url}
                  onChange={(e) => setNewConnector((prev) => ({ ...prev, api_url: e.target.value }))}
                  placeholder="https://api.example.com"
                  className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
                />
              </div>
            )}
            {newConnector.type === 'sqlite' && (
              <div>
                <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Database Path</label>
                <input
                  type="text"
                  value={newConnector.db_path}
                  onChange={(e) => setNewConnector((prev) => ({ ...prev, db_path: e.target.value }))}
                  placeholder="/path/to/database.db"
                  className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
                />
              </div>
            )}
            <Button onClick={handleAddConnector} disabled={!newConnector.name.trim()}>
              Add
            </Button>
          </div>
        </GlassCard>
      )}

      {connectors.map((connector) => (
        <GlassCard key={connector.id} title={connector.name} icon={typeIcons[connector.type]}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <StatusBadge status={connector.status} label={connector.status.charAt(0).toUpperCase() + connector.status.slice(1)} />
              <p className="text-[10px] font-mono text-hud-muted/40 tracking-wider uppercase">{connector.type}</p>
              {connector.api_url && <p className="text-[10px] font-mono text-hud-muted/50">{connector.api_url}</p>}
              {connector.db_path && <p className="text-[10px] font-mono text-hud-muted/50">{connector.db_path}</p>}
            </div>
            <Button onClick={() => handleTestConnection(connector)} loading={testingId === connector.id} size="sm" variant="secondary">
              Test Connection
            </Button>
          </div>
        </GlassCard>
      ))}

      <GlassCard title="Connector Logs">
        <div className="max-h-60 overflow-y-auto space-y-2">
          {connectorLogs.length === 0 ? (
            <p className="text-xs font-mono text-hud-muted/30 text-center py-4">No connector activity</p>
          ) : (
            connectorLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-deep-blue/40 border border-panel-border/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-hud-success shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-hud-error shadow-[0_0_4px_rgba(251,113,133,0.6)]'}`} />
                  <span className="text-xs font-mono text-hud-text/70 truncate">{log.message}</span>
                </div>
                <span className="text-[10px] font-mono text-hud-muted/40">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </HudPageLayout>
  )
}
