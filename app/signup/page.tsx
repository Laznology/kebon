"use client"
import { useFetch } from "@mantine/hooks";
import { useState, useEffect} from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
    const [isAllowRegister, setIsAllowRegister] = useState<boolean>(false);
    const { data } = useFetch('/api/settings/allow-register');

    useEffect(() => {
        if (data) {
            setIsAllowRegister(data.allowRegister);
        }
    }, [data])

    return (
        <div className="flex items-center justify-center min-h-screen">
            {isAllowRegister ? (
                <Card>
                    Form
                </Card>
            ) : (
                <Card>
                    Register is disallowed, please contact Administrator.
                </Card>
            )}
        </div>
    )
}