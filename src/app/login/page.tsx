"use client"

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Zap,
  User,
  Fingerprint,
  ChevronRight,
  Eye,
  EyeOff,
  Shield,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { SpaceBackground } from '@/components/qr-canvas/space-background';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const mapAuthError = (code: string) => {
    switch (code) {
      case 'auth/user-not-found': return "Account not found.";
      case 'auth/wrong-password': return "Incorrect password.";
      case 'auth/email-already-in-use': return "This email is already in use.";
      case 'auth/invalid-email': return "Invalid email address.";
      case 'auth/weak-password': return "Password is too weak (min 6 characters).";
      case 'auth/too-many-requests': return "Too many failed attempts. Please try later.";
      default: return "Login failed. Please try again.";
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Service temporarily unavailable.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    // Form Validation
    if (isSignUp) {
      if (!fullName.trim()) { setError("Full name is required."); setIsLoading(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); setIsLoading(false); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); setIsLoading(false); return; }
      if (!agreedToTerms) { setError("You must agree to the terms."); setIsLoading(false); return; }
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        toast({ title: "Account Created", description: "Your account is ready to use." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful", description: "Welcome back to the studio." });
      }
      router.push(redirectTo);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-[#0a0a0c]">
      <SpaceBackground />
      
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-all group">
           <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>

        <Card className="w-full glass-card border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group/card border-t border-white/10 rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none opacity-50" />
          
          <CardHeader className="p-6 sm:p-8 border-b border-white/5 bg-secondary/10 text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-[1.6rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4 shadow-2xl relative z-10 ring-1 ring-primary/20">
               {isSignUp ? <UserPlus className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div className="space-y-1 relative z-10">
              <CardTitle className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                {isSignUp ? 'Register' : 'Login'}
              </CardTitle>
              <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.4em] leading-relaxed">
                {isSignUp ? 'Create your account' : 'Sign in to continue'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] ml-1">Full Name</Label>
                    <div className="relative group/input">
                      <Input 
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="h-11 bg-secondary/40 border-white/5 rounded-xl pl-10 focus:ring-primary/20 transition-all font-bold text-xs"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/10 group-focus-within/input:text-primary transition-colors" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] ml-1">Email</Label>
                  <div className="relative group/input">
                    <Input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="h-11 bg-secondary/40 border-white/5 rounded-xl pl-10 focus:ring-primary/20 transition-all font-bold text-xs"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/10 group-focus-within/input:text-primary transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] ml-1">Password</Label>
                    <div className="relative group/input">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 bg-secondary/40 border-white/5 rounded-xl pl-10 pr-10 focus:ring-primary/20 transition-all font-bold tracking-[0.2em] text-xs"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/10 group-focus-within/input:text-primary transition-colors" />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/10 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] ml-1">Confirm Password</Label>
                      <div className="relative group/input">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={cn(
                            "h-11 bg-secondary/40 border-white/5 rounded-xl pl-10 pr-10 focus:ring-primary/20 transition-all font-bold tracking-[0.2em] text-xs",
                            password && confirmPassword && password !== confirmPassword && "border-red-500/50"
                          )}
                        />
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/10 group-focus-within/input:text-primary transition-colors" />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/10 hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="flex items-start space-x-3 pt-2 animate-in fade-in">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms} 
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      className="mt-0.5 border-white/20 data-[state=checked]:bg-primary" 
                    />
                    <Label htmlFor="terms" className="text-[9px] font-bold text-foreground/40 uppercase leading-relaxed cursor-pointer select-none">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">Terms</Link> & <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 {isLoading ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   <div className="flex items-center gap-3 relative z-10">
                     {isSignUp ? 'Register' : 'Login'}
                     <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                   </div>
                 )}
              </Button>

              <div className="text-center pt-4 border-t border-white/5">
                 <button 
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-[9px] font-black uppercase text-foreground/30 hover:text-primary transition-all tracking-[0.2em] group"
                 >
                   {isSignUp ? (
                     <>Already have an account? <span className="text-primary ml-1 group-hover:underline">Login</span></>
                   ) : (
                     <>Not registered? <span className="text-primary ml-1 group-hover:underline">Create account</span></>
                   )}
                 </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
