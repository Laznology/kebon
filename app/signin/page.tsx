"use client";

import { Button, Card, TextInput, Text, Title, Divider, Anchor } from "@mantine/core";
import { signIn } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        notifications.show({
          title: "Error",
          message: "Please fill in all fields",
          color: "red",
        });
        setLoading(false);
        return null;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        notifications.show({
          title: "Error",
          message: "Incorrect email or password",
          color: "red",
        });
        setLoading(false);
        return null;
      }

      if (result?.ok) {
        notifications.show({
          title: "Success",
          message: "Successfully logged in",
          color: "green",
        });

        window.location.href = "/";
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Sign in failed",
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <div className={"flex items-center justify-center min-h-screen"}>
      <Card className={"w-full max-w-md"} withBorder padding="lg">
        <Title order={2} mb="xs">
          Sign In
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Enter your email and password to access your account
        </Text>

        <form onSubmit={handleSignIn} className={"space-y-4"}>
          <TextInput
            label="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            type="email"
          />

          <TextInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            type={showPassword ? "text" : "password"}
            rightSection={
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                width={20}
                height={20}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              />
            }
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            loading={loading}
            mt="md"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Divider
            label={"Or Sign In with"}
            labelPosition={"center"}
            my={"xs"}
          />
          <Button
            fullWidth
            variant={"filled"}
            color={"dark"}
            leftSection={<Icon icon={"mdi:github"} width={20} height={20} />}
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            Sign In with GitHub
          </Button>
        </form>
        
        <Text size="sm" ta="center" mt="md">
          Don&#39;t have an account?{" "}
          <Anchor href="/signup" size="sm">
            Create one here
          </Anchor>
        </Text>
      </Card>
    </div>
  );
}
