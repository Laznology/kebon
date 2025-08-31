"use client"
import { useFetch } from "@mantine/hooks";
import { useState, useEffect} from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function SignupPage() {
    const router = useRouter()
    const [signupLoading, setSignupLoading] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("")
    const [isAllowRegister, setIsAllowRegister] = useState<boolean>(false);
    const { data, loading } = useFetch<{ allowRegister: boolean }>('/api/settings/allow-register');

    useEffect(() => {
        if (data) {
            setIsAllowRegister(data.allowRegister);
        }
    }, [data])

    const handleRegister = async (e: React.FormEvent) => { 
        e.preventDefault()
        setSignupLoading(true)
        
        try {
            if (password !== passwordConfirmation) {
                toast.error("Password confirmation do not match")
                setSignupLoading(false)
                return
            }

            const response = await fetch('/api/auth/register', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, confirmPassword: passwordConfirmation })
            })
            if (!response.ok) { 
                toast.error("Register Failed")
                setSignupLoading(false)
                return
            }
            
            toast.success("Registration successful! Redirecting to sign in...")
            router.push('/signin')
        } catch (error) {
            console.error("Registration error:", error)
            toast.error("Registration failed. Please try again.")
            setSignupLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            {isAllowRegister ? (
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                      Enter your details below to create your account
                    </CardDescription>
                    <CardAction>
                      <Button variant="link">Sign In</Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="m@example.com"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                          <a
                            href="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                        </div>
                        <Input 
                          id="passwordConfirmation" 
                          type="password" 
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          required />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <form onSubmit={handleRegister} className="w-full">
                      <Button
                        type="submit"
                        className={`w-full ${signupLoading ? "animate-pulse" : ""}`}
                        disabled={signupLoading}
                      >
                        {signupLoading ? "Loading..." : "Register"}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
            ) : loading ? (
                <Card>
                    Register is disallowed, please contact Administrator.
                </Card>
                ) : (
                    <Card>
                        Loading
                    </Card>
            )}
        </div>
    )
}