"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useColor } from "@/components/color-provider";
import { Moon, Sun, Monitor, Check } from "lucide-react";

export default function DesignShowcase() {
  const { theme, setTheme } = useTheme();
  const { color, setColor } = useColor();

  return (
    <div className="min-h-screen bg-background p-8 text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Design System Dinâmico
            </h1>
            <p className="text-muted-foreground">
              Teste as combinações de temas e cores em tempo real.
            </p>
          </div>

          <div className="flex flex-col gap-4 items-end">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className="w-8 h-8 p-0"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="w-8 h-8 p-0"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('system')}
                className="w-8 h-8 p-0"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>

            {/* Color Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2">Cor:</span>

              <button
                onClick={() => setColor('monochrome')}
                className={`w-6 h-6 rounded-full bg-zinc-500 border-2 ${color === 'monochrome' ? 'border-foreground ring-2 ring-offset-2 ring-zinc-500' : 'border-transparent'}`}
                title="Monochrome"
              />

              <button
                onClick={() => setColor('teal')}
                className={`w-6 h-6 rounded-full bg-teal-500 border-2 ${color === 'teal' ? 'border-foreground ring-2 ring-offset-2 ring-teal-500' : 'border-transparent'}`}
                title="Teal"
              />

              <button
                onClick={() => setColor('blue')}
                className={`w-6 h-6 rounded-full bg-blue-500 border-2 ${color === 'blue' ? 'border-foreground ring-2 ring-offset-2 ring-blue-500' : 'border-transparent'}`}
                title="Blue"
              />

              <button
                onClick={() => setColor('violet')}
                className={`w-6 h-6 rounded-full bg-violet-500 border-2 ${color === 'violet' ? 'border-foreground ring-2 ring-offset-2 ring-violet-500' : 'border-transparent'}`}
                title="Violet"
              />

              <button
                onClick={() => setColor('pink')}
                className={`w-6 h-6 rounded-full bg-pink-500 border-2 ${color === 'pink' ? 'border-foreground ring-2 ring-offset-2 ring-pink-500' : 'border-transparent'}`}
                title="Pink"
              />
            </div>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Botões</h2>
            <div className="flex gap-3 flex-wrap">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </section>

          {/* Badges */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Badges</h2>
            <div className="flex gap-3 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </section>

          {/* Cards */}
          <section className="space-y-6 md:col-span-2">
            <h2 className="text-2xl font-semibold">Cards & Dashboard</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Pacientes</CardTitle>
                  <CardDescription>Ativos na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,248</div>
                </CardContent>
                <CardFooter>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                    +12% este mês
                  </Badge>
                </CardFooter>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle>Próxima Consulta</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Hoje, 14:30</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Maria Silva</div>
                  <p className="text-sm opacity-80">Reavaliação Mensal</p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Iniciar Atendimento
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Acesse sua conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="seu@email.com" />
                  </div>
                  <Button className="w-full">Entrar</Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
