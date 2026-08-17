
"use client"

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/html-to-url';

  const mapAuthError = (code: string) => {
    switch (code) {
      case 'auth/user-not-found': return "Identity not recognized in registry.";
      case 'auth/wrong-password': return "Incorrect security key.";
      case 'auth/email-already-in-use': return "Email already mapped to an existing identity.";
      case 'auth/invalid-email': return "Malformed email format protocol.";
      case 'auth/weak-password': return "Security key is too weak (min 6 chars).";
      case 'auth/too-many-requests': return "Access throttled due to multiple failures. Try again later.";
      case 'auth/operation-not-allowed': return "Authentication protocol is currently disabled.";
      default: return "Authentication protocol failure. Check your connection.";
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase Auth not connected. Configuration missing.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created", description: "Identity registered in studio matrix." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome Back", description: "Protocol authentication successful." });
      }
      router.push(redirectTo);
    } catch (err: any) {
      console.error("Auth Matrix Error:", err.code, err.message);
      setError(mapAuthError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 min-h-screen flex flex-col items-center justify-center">
      <Link href="/" className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all">
         <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <Card className="w-full max-w-md glass-card border-border shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <CardHeader className="pb-8 border-b border-border bg-secondary/30 text-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
             {isSignUp ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
          </div>
          <CardTitle className="text-2xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            {isSignUp ? 'Join Studio' : 'Log in to Studio'}
          </CardTitle>
          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-2">Identity Verification Matrix</p>
        </CardHeader>

        <CardContent className="pt-10">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Email Protocol</Label>
                <div className="relative group">
                  <Input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@matrix.com"
                    className="h-14 bg-secondary/50 border-border rounded-2xl pl-12"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/10 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Security Key (Password)</Label>
                <div className="relative group">
                  <Input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 bg-secondary/50 border-border rounded-2xl pl-12"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/10 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-in shake duration-500">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30">
               {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isSignUp ? 'Create Identity' : 'Authorize Login'}
            </Button>

            <div className="text-center pt-4 border-t border-white/5">
               <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-[10px] font-black uppercase text-foreground/30 hover:text-primary transition-colors tracking-widest"
               >
                 {isSignUp ? 'Already have an identity? Log in' : 'No protocol yet? Create account'}
               </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-12 flex items-center gap-6 opacity-20">
         <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Matrix
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Host
         </div>
      </div>
    </div>
  );
}
