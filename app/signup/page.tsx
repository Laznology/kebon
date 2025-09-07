"use client";
import { useFetch } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { Button, Card, TextInput, Text, Title, Anchor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [isAllowRegister, setIsAllowRegister] = useState<boolean>(false);
  const { data, loading } = useFetch<{ allowRegister: boolean }>(
    "/api/settings/allow-register",
  );

  useEffect(() => {
    if (data) {
      setIsAllowRegister(data.allowRegister);
    }
  }, [data]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);

    try {
      if (password !== passwordConfirmation) {
        notifications.show({
          title: "Error",
          message: "Password confirmation do not match",
          color: "red",
        });
        setSignupLoading(false);
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword: passwordConfirmation,
        }),
      });
      if (!response.ok) {
        notifications.show({
          title: "Error",
          message: "Register Failed",
          color: "red",
        });
        setSignupLoading(false);
        return;
      }

      notifications.show({
        title: "Success",
        message: "Registration successful! Redirecting to sign in...",
        color: "green",
      });
      router.push("/signin");
    } catch (error) {
      console.error("Registration error:", error);
      notifications.show({
        title: "Error", 
        message: "Registration failed. Please try again.",
        color: "red",
      });
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {isAllowRegister ? (
        <Card className="w-full max-w-sm" withBorder padding="lg">
          <Title order={2} mb="xs">Create your account</Title>
          <Text size="sm" c="dimmed" mb="xs">
            Enter your details below to create your account
          </Text>
          <Anchor href="/signin" size="sm" mb="lg">
            Already have an account? Sign In
          </Anchor>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="m@example.com"
              required
            />
            
            <TextInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
            
            <TextInput
              label="Confirm Password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              type="password"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={signupLoading}
              loading={signupLoading}
              mt="md"
            >
              {signupLoading ? "Loading..." : "Register"}
            </Button>
          </form>
        </Card>
      ) : loading ? (
        <Card withBorder padding="lg">
          <Text>Loading...</Text>
        </Card>
      ) : (
        <Card withBorder padding="lg">
          <Text>Register is disallowed, please contact Administrator.</Text>
        </Card>
      )}
    </div>
  );
}
