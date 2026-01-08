'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import api, { getBaseURL } from '@/services/api';
import axios from 'axios';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();

    // Tentar obter uid e token das query strings (novo formato)
    let uid = searchParams.get('uid');
    let token = searchParams.get('token');

    // Se não encontrar, tentar obter dos path parameters (formato antigo via resetPath slug)
    if (!uid || !token) {
        const resetPath = params.resetPath as string[];
        if (resetPath && resetPath.length >= 2) {
            uid = resetPath[0];
            token = resetPath[1];
        }
    }

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('As senhas não coincidem.');
            setStatus('error');
            return;
        }

        if (password.length < 8) {
            setErrorMessage('A senha deve ter pelo menos 8 caracteres.');
            setStatus('error');
            return;
        }

        setIsLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const axiosWithoutAuth = axios.create({
                baseURL: getBaseURL(),
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });

            await axiosWithoutAuth.post(`auth/password-reset/confirm/`, {
                password: password,
                confirm_password: confirmPassword,
                uid: uid,
                token: token,
            });
            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            if (error.response?.data?.error) {
                setErrorMessage(error.response.data.error);
            } else if (error.response?.data?.password) {
                setErrorMessage(error.response.data.password[0]);
            } else {
                setErrorMessage('Ocorreu um erro ao redefinir a senha. O link pode estar expirado ou inválido.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!uid || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                        <CardTitle>Link Inválido</CardTitle>
                        <CardDescription>
                            O link de redefinição de senha é inválido ou está incompleto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => router.push('/auth')}>
                            Voltar para Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <CardTitle>Senha Redefinida!</CardTitle>
                        <CardDescription>
                            Sua senha foi atualizada com sucesso. Agora você pode fazer login com sua nova senha.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => router.push('/auth')}>
                            Ir para Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Definir Nova Senha</CardTitle>
                    <CardDescription>
                        Crie uma senha segura para acessar sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    minLength={8}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a senha"
                                required
                            />
                        </div>

                        {status === 'error' && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                <XCircle className="h-4 w-4 flex-shrink-0" />
                                {errorMessage}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Definir Senha'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
