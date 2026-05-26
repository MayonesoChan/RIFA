'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Trash2, Edit2, Search, LogOut, Plus, Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RifaNumber {
  id: number
  number: string
  description?: string
  createdAt: string
}

export function RifaManager() {
  const router = useRouter()
  const [rifas, setRifas] = useState<RifaNumber[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newNumber, setNewNumber] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNumber, setEditNumber] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    loadRifas()
  }, [])

  const loadRifas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rifas')
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al cargar los números')
        return
      }

      setRifas(data)
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al cargar los números')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRifa = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNumber.trim()) {
      toast.error('Ingresa un número')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/rifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newNumber,
          description: description || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al agregar')
        return
      }

      toast.success('Número agregado exitosamente')
      setNewNumber('')
      setDescription('')
      await loadRifas()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al agregar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      await loadRifas()
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(`/api/rifas/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error en la búsqueda')
        return
      }

      setRifas(data)
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error en la búsqueda')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este número de rifa?')) {
      return
    }

    try {
      const response = await fetch(`/api/rifas/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al eliminar')
        return
      }

      toast.success('Número eliminado')
      await loadRifas()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al eliminar')
    }
  }

  const handleEditStart = (rifa: RifaNumber) => {
    setEditingId(rifa.id)
    setEditNumber(rifa.number)
    setEditDescription(rifa.description || '')
  }

  const handleEditSave = async () => {
    if (!editNumber.trim()) {
      toast.error('Ingresa un número')
      return
    }

    try {
      const response = await fetch(`/api/rifas/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: editNumber,
          description: editDescription || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al actualizar')
        return
      }

      toast.success('Número actualizado')
      setEditingId(null)
      await loadRifas()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al actualizar')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-accent to-accent/60 p-2">
              <Ticket className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rifa Manager</h1>
              <p className="text-xs text-muted-foreground">Sistema de gestión</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agregar número */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-accent" />
                  Agregar Número
                </CardTitle>
                <CardDescription>Registra un nuevo número de rifa</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRifa} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="number" className="text-sm font-medium">
                      Número
                    </Label>
                    <Input
                      id="number"
                      type="text"
                      placeholder="RIF-001"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc" className="text-sm font-medium">
                      Descripción <span className="text-muted-foreground">(opcional)</span>
                    </Label>
                    <Input
                      id="desc"
                      type="text"
                      placeholder="Premio especial"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Agregar
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Búsqueda */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-accent" />
                  Buscar
                </CardTitle>
                <CardDescription>Busca por número</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                    className="flex-1 bg-background border-border"
                  />
                  <Button type="submit" disabled={isSearching} size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/10 to-accent/5">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total de números</p>
                  <p className="text-3xl font-bold text-foreground">{rifas.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Números Registrados</CardTitle>
                <CardDescription>
                  {rifas.length} {rifas.length === 1 ? 'número' : 'números'} en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : rifas.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No hay números registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {rifas.map((rifa) => (
                      <div
                        key={rifa.id}
                        className="rounded-lg border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors"
                      >
                        {editingId === rifa.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editNumber}
                              onChange={(e) => setEditNumber(e.target.value)}
                              placeholder="Número"
                              className="bg-background border-border"
                            />
                            <Input
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Descripción (opcional)"
                              className="bg-background border-border"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={handleEditSave}
                                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{rifa.number}</p>
                              {rifa.description && (
                                <p className="text-sm text-muted-foreground truncate">{rifa.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(rifa.createdAt).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleEditStart(rifa)}
                                className="h-8 w-8 border-border"
                              >
                                <Edit2 className="h-4 w-4 text-accent" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleDelete(rifa.id)}
                                className="h-8 w-8 border-border hover:border-destructive"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
