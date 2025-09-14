"use client";
import { useFetch } from "@mantine/hooks";
import React, { useState } from "react";
import {
  Button,
  Card,
  TextInput,
  Text,
  Title,
  Anchor,
  Divider,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const { data, loading } = useFetch<{ allowRegister: boolean }>(
    "/api/settings/",
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (password !== passwordConfirmation) {
        notifications.show({
          title: "Error",
          message: "Password confirmation do not match",
          color: "red",
        });
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <Card withBorder padding="xl" radius="md" className="w-full max-w-sm">
          <Center>
            <Loader color="blue" />
          </Center>
        </Card>
      ) : data?.allowRegister ? (
        <Card className="w-full max-w-sm" withBorder padding="lg">
          <Title order={2} mb="xs">
            Create your account
          </Title>
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

            <Button type="submit" fullWidth mt="md">
              Register
            </Button>
          </form>

          <Divider label="Or Sign Up with" labelPosition="center" my="xs" />
          <Button
            fullWidth
            variant="filled"
            color="dark"
            leftSection={<Icon icon="mdi:github" width={20} height={20} />}
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            Sign In with GitHub
          </Button>
        </Card>
      ) : (
        <Card withBorder padding="lg">
          <Text>Register is disallowed, please contact Administrator.</Text>
        </Card>
      )}
    </div>
  );
}
