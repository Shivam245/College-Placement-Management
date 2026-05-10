import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { UserRole } from '../types';
import { LogIn, GraduationCap, Briefcase, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { authService } from '../services/auth';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthReady, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (!isAuthReady || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">CampusDrive</CardTitle>
            <CardDescription>
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedRole('student')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      selectedRole === 'student' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Student</span>
                  </button>
                  <button
                    onClick={() => setSelectedRole('recruiter')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      selectedRole === 'recruiter' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <Briefcase className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Recruiter</span>
                  </button>
                  <button
                    onClick={() => setSelectedRole('admin')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      selectedRole === 'admin' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Admin</span>
                  </button>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-11" 
              disabled={isRegistering}
              onClick={async () => {
                setIsRegistering(true);
                try {
                  const data = isSignUp 
                    ? await authService.signup({ email, password, role: selectedRole, displayName, profile: selectedRole === 'student' ? { cgpa: 0, branch: '', skills: [] } : { companyName: '' } })
                    : await authService.login({ email, password });
                  
                  login(data);
                  toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
                } catch (error: any) {
                  console.error("Auth error:", error);
                  toast.error(error.message || "Authentication failed");
                } finally {
                  setIsRegistering(false);
                }
              }}
            >
              {isSignUp ? (
                <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>
              ) : (
                <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className="w-full text-sm" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Custom Email/Password Authentication
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};


