'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Ticket } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'register'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = type === 'login'
        ? { username, password }
        : { username, email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error en la autenticación')
        return
      }

      toast.success(data.message || 'Operación exitosa')
      router.push('/dashboard')
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Error en la conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        {/* Logo y Título */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-lg bg-gradient-to-br from-accent to-accent/60 p-3">
              <Ticket className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Rifa Manager</h1>
          <p className="text-sm text-muted-foreground">Gestión moderna de números de rifa</p>
        </div>

        <Separator className="my-6" />

        {/* Card del Formulario */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">
              {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <CardDescription>
              {type === 'login'
                ? 'Accede a tu cuenta para gestionar tus rifas'
                : 'Regístrate para comenzar a usar el sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ejemplo_usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-card border-border focus:ring-2 focus:ring-accent"
                />
              </div>

              {type === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-card border-border focus:ring-2 focus:ring-accent"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-card border-border focus:ring-2 focus:ring-accent"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </Button>
            </form>

            <Separator className="my-4" />

            <div className="text-center text-sm text-muted-foreground">
              {type === 'login' ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    Crear una
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => router.push('/')}
                    className="font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
